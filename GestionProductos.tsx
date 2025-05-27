import React, { useState } from 'react';
import { useStore } from './store';
import { Producto, Ingrediente, IngredienteEnReceta } from './types';
import { formatCurrency } from './utils';

const GestionProductos = () => {
  const { productos, ingredientes, agregarProducto, actualizarProducto, eliminarProducto } = useStore();

  // Estado para el formulario de nuevo producto
  const [newProduct, setNewProduct] = useState({
    nombre: '',
    categoria: 'taco' as Producto['categoria'],
    descripcion: '',
    precio: 0,
    ingredientes: [] as IngredienteEnReceta[],
  });

  // Estado para editar producto
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);

  // Estado para agregar ingredientes al producto nuevo/editado
  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [ingredientQuantity, setIngredientQuantity] = useState(0);

  // Calcular costo total y margen para el producto nuevo/editado
  const calculateProductCostAndMargin = (product: { precio: number; ingredientes: IngredienteEnReceta[] }) => {
    const costoTotalIngredientes = product.ingredientes.reduce((sum, ing) => sum + ing.costoTotal, 0);
    const gananciaNeta = product.precio - costoTotalIngredientes;
    const margenGanancia = product.precio > 0 ? (gananciaNeta / product.precio) * 100 : 0;
    return { costoTotal: costoTotalIngredientes, gananciaNeta, margenGanancia };
  };

  // Usar useMemo para evitar recálculos innecesarios
  const { costoTotal, gananciaNeta, margenGanancia } = React.useMemo(() => 
    calculateProductCostAndMargin(editingProduct || newProduct),
    [editingProduct, newProduct]
  );

  // Manejar cambio en los inputs del formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const parsedValue = name === 'precio' ? parseFloat(value) || 0 : value;

    if (editingProduct) {
      setEditingProduct({ ...editingProduct, [name]: parsedValue } as Producto); // Castear a Producto
    } else {
      setNewProduct({ ...newProduct, [name]: parsedValue });
    }
  };

  // Manejar selección de ingrediente para añadir
  const handleIngredientSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedIngredientId(e.target.value);
  };

  // Manejar cambio de cantidad de ingrediente para añadir
  const handleIngredientQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIngredientQuantity(parseFloat(e.target.value) || 0);
  };

  // Añadir ingrediente a la lista del producto nuevo/editado
  const addIngredientToProduct = () => {
    const ingredient = ingredientes.find(ing => ing.id === selectedIngredientId);
    if (ingredient && ingredientQuantity > 0) {
      const ingredienteEnReceta: IngredienteEnReceta = {
        ingredienteId: ingredient.id,
        nombre: ingredient.nombre,
        cantidad: ingredientQuantity,
        unidadMedida: ingredient.unidadMedida,
        costoUnitario: ingredient.costoUnitario,
        costoTotal: ingredient.costoUnitario * ingredientQuantity,
      };
      if (editingProduct) {
        setEditingProduct({ ...editingProduct, ingredientes: [...editingProduct.ingredientes, ingredienteEnReceta] });
      } else {
        setNewProduct({ ...newProduct, ingredientes: [...newProduct.ingredientes, ingredienteEnReceta] });
      }
      setSelectedIngredientId(''); // Limpiar selección
      setIngredientQuantity(0); // Limpiar cantidad
    }
  };

  // Eliminar ingrediente de la lista del producto nuevo/editado
  const removeIngredientFromProduct = (ingredienteId: string) => {
    if (editingProduct) {
      setEditingProduct({ ...editingProduct, ingredientes: editingProduct.ingredientes.filter(ing => ing.ingredienteId !== ingredienteId) });
    } else {
      setNewProduct({ ...newProduct, ingredientes: newProduct.ingredientes.filter(ing => ing.ingredienteId !== ingredienteId) });
    }
  };

  // Manejar el envío del formulario (agregar o actualizar)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const productToSave = editingProduct || newProduct;

    if (!productToSave.nombre || productToSave.precio <= 0 || productToSave.ingredientes.length === 0) {
      alert('Por favor, completa todos los campos requeridos (Nombre, Precio y al menos un Ingrediente).');
      return;
    }

    const { costoTotal: calculatedCost } = calculateProductCostAndMargin(productToSave);

    if (editingProduct) {
      const finalProduct: Producto = {
         ...editingProduct,
         costoTotal: calculatedCost,
      }; 
      actualizarProducto(editingProduct.id, finalProduct);
      setEditingProduct(null); // Salir del modo edición
    } else {
       const productToAdd = {
        ...newProduct,
        costoTotal: calculatedCost,
      }; 
      agregarProducto(productToAdd as Omit<Producto, 'id'>); // Castear a Omit<Producto, 'id'>
      // Reiniciar formulario de nuevo producto
      setNewProduct({
        nombre: '',
        categoria: 'taco',
        descripcion: '',
        precio: 0,
        ingredientes: [],
      });
    }
    setSelectedIngredientId('');
    setIngredientQuantity(0);
  };

  // Iniciar modo edición
  const startEditing = (producto: Producto) => {
    setEditingProduct({ ...producto }); // Crear una copia para editar
  };

  // Cancelar modo edición
  const cancelEditing = () => {
    setEditingProduct(null);
    // Reiniciar el formulario de nuevo producto si estaba en ese modo antes de editar
     setNewProduct({
        nombre: '',
        categoria: 'taco',
        descripcion: '',
        precio: 0,
        ingredientes: [],
      });
    setSelectedIngredientId('');
    setIngredientQuantity(0);
  };

  // Eliminar producto
  const handleDeleteProduct = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      eliminarProducto(id);
      if (editingProduct?.id === id) {
        setEditingProduct(null); // Si se elimina el que se estaba editando
      }
    }
  };

  const currentProductFormState = editingProduct || newProduct;

  return (
    <div className="inventory-management"> {/* Reutilizamos la clase principal */}
      <h2>Gestión de Productos</h2>

      <div className="inventory-container"> {/* Reutilizamos el contenedor flex */}
        {/* Sección de Productos Disponibles */}
        <div className="available-products">
          <h3>Productos Disponibles</h3>
          {productos.length === 0 ? (
            <p className="no-data">No hay productos registrados.</p>
          ) : (
            <table className="data-table"> {/* Reutilizamos la clase de tabla */}
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Costo</th>
                  <th>Margen</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map(producto => (
                  <tr key={producto.id}>
                    <td>{producto.nombre}</td>
                    <td>{producto.categoria}</td>
                    <td>{formatCurrency(producto.precio)}</td>
                    <td>{formatCurrency(producto.costoTotal)}</td>
                    <td>{(producto.precio > 0 ? ((producto.precio - producto.costoTotal) / producto.precio) * 100 : 0).toFixed(2)}%</td>
                    <td>
                      <button 
                        type="button" 
                        className="remove-button" 
                        onClick={() => startEditing(producto)}
                        style={{ marginRight: '10px' }}
                      >
                        Editar
                      </button>
                      <button 
                        type="button" 
                        className="remove-button" 
                        onClick={() => handleDeleteProduct(producto.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Sección para Agregar Nuevo Producto o Editar */}
        <div className="add-product-form">
          <h3>{editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nombre">Nombre:</label>
              <input 
                type="text" 
                id="nombre" 
                name="nombre" 
                value={currentProductFormState.nombre} 
                onChange={handleInputChange} 
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="categoria">Categoría:</label>
              <select 
                id="categoria" 
                name="categoria" 
                value={currentProductFormState.categoria} 
                onChange={handleInputChange} 
                required
              >
                <option value="taco">Taco</option>
                <option value="arepa">Arepa</option>
                <option value="bebida">Bebida</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="descripcion">Descripción:</label>
              <textarea 
                id="descripcion" 
                name="descripcion" 
                value={currentProductFormState.descripcion} 
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="precio">Precio de Venta (COP):</label>
              <input 
                type="number" 
                id="precio" 
                name="precio" 
                value={currentProductFormState.precio} 
                onChange={handleInputChange} 
                required 
                min="0"
              />
            </div>

            {/* Sección para agregar ingredientes */}
            <div className="form-group">
              <label>Ingredientes del Producto:</label>
              {currentProductFormState.ingredientes.length > 0 && (
                <table className="data-table ingredient-table"> {/* Tabla de ingredientes añadidos */}
                  <thead>
                    <tr>
                      <th>Ingrediente</th>
                      <th>Cantidad</th>
                      <th>Costo</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentProductFormState.ingredientes.map(ing => (
                      <tr key={ing.ingredienteId}>
                        <td>{ing.nombre}</td>
                        <td>{ing.cantidad} {ing.unidadMedida}</td>
                        <td>{formatCurrency(ing.costoTotal)}</td>
                        <td>
                          <button 
                            type="button" 
                            className="remove-button" 
                            onClick={() => removeIngredientFromProduct(ing.ingredienteId)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              
              <div className="input-with-unit">
                <select 
                  value={selectedIngredientId} 
                  onChange={handleIngredientSelectChange}
                >
                  <option value="">Seleccione un ingrediente</option>
                  {ingredientes.map(ing => (
                    <option key={ing.id} value={ing.id}>{ing.nombre}</option>
                  ))}
                </select>
                <input 
                  type="number" 
                  placeholder="Cantidad" 
                  value={ingredientQuantity} 
                  onChange={handleIngredientQuantityChange} 
                  min="0"
                  step="any"
                />
                {selectedIngredientId && (
                  <span className="unit">{ingredientes.find(ing => ing.id === selectedIngredientId)?.unidadMedida || ''}</span>
                )}
              </div>
              <button 
                type="button" 
                className="add-button" 
                onClick={addIngredientToProduct} 
                disabled={!selectedIngredientId || ingredientQuantity <= 0}
                style={{ marginTop: '10px' }}
              >
                Agregar Ingrediente
              </button>
            </div>

            {/* Mostrar Costo y Margen */}
            <div className="form-group">
              <label>Costo Total de Ingredientes:</label>
              <p>{formatCurrency(costoTotal)}</p>
            </div>
            <div className="form-group">
              <label>Ganancia Neta Estimada:</label>
              <p>{formatCurrency(gananciaNeta)}</p>
            </div>
             <div className="form-group">
              <label>Margen de Ganancia Estimado:</label>
              <p>{margenGanancia.toFixed(2)}%</p>
            </div>

            <div className="form-buttons">
              <button type="submit" className="submit-button">{editingProduct ? 'Actualizar Producto' : 'Guardar Producto'}</button>
              {editingProduct && (
                <button type="button" className="cancel-button" onClick={cancelEditing}>Cancelar</button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GestionProductos; 