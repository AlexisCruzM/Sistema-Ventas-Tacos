import React, { useState } from 'react';
import { useStore } from './store';
import { Ingrediente } from './types';
import { formatCurrency } from './utils';

const GestionInventario = () => {
  const { ingredientes, agregarIngrediente, actualizarIngrediente, eliminarIngrediente } = useStore();
  
  // Estado para el formulario (puede ser nuevo ingrediente o el que se está editando)
  const [formState, setFormState] = useState<Omit<Ingrediente, 'id'> & { id?: string | undefined }> ({
    id: undefined,
    nombre: '',
    unidadMedida: '',
    costoUnitario: 0,
    stock: 0,
    stockMinimo: 0,
  });
  
  // Manejar cambio en los inputs del formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const parsedValue = name === 'costoUnitario' || name === 'stock' || name === 'stockMinimo' ? parseFloat(value) || 0 : value;

    setFormState({ ...formState, [name]: parsedValue });
  };
  
  // Manejar el envío del formulario (agregar o actualizar)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formState.nombre || !formState.unidadMedida || formState.costoUnitario <= 0) {
      alert('Por favor, completa todos los campos requeridos (Nombre, Unidad de Medida, Costo Unitario).');
      return;
    }
    
    if (formState.id) {
      // Actualizar ingrediente existente
      actualizarIngrediente(formState.id, formState as Ingrediente);
      alert('¡Ingrediente actualizado con éxito!');
    } else {
      // Agregar nuevo ingrediente
      const ingredientToAdd = {
        nombre: formState.nombre,
        unidadMedida: formState.unidadMedida,
        costoUnitario: formState.costoUnitario,
        stock: formState.stock,
        stockMinimo: formState.stockMinimo,
      };
      agregarIngrediente(ingredientToAdd);
      alert('¡Ingrediente agregado con éxito!');
    }
    
    // Limpiar formulario después de guardar
    resetForm();
  };
  
  // Iniciar modo edición
  const startEditing = (ingrediente: Ingrediente) => {
    setFormState({ ...ingrediente }); // Cargar datos del ingrediente a editar en el formulario
  };
  
  // Cancelar edición y limpiar formulario
  const cancelEditing = () => {
    resetForm();
  };
  
  // Limpiar el estado del formulario
  const resetForm = () => {
    setFormState({
      id: undefined,
      nombre: '',
      unidadMedida: '',
      costoUnitario: 0,
      stock: 0,
      stockMinimo: 0,
    });
  };
  
  // Eliminar ingrediente
  const handleDeleteIngredient = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este ingrediente?')) {
      eliminarIngrediente(id);
      if (formState.id === id) {
        resetForm(); // Si se elimina el que se estaba editando, limpiar formulario
      }
    }
  };
  
  return (
    <section className="inventory-management">
      <h2>Gestión de Inventario</h2>
      
      <div className="inventory-container">
        <div className="available-ingredients">
          <h3>Ingredientes Disponibles</h3>
          
          {ingredientes.length === 0 ? (
            <p className="no-data">No hay ingredientes registrados.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Unidad</th>
                  <th>Costo Unitario</th>
                  <th>Stock</th>
                  <th>Stock Mínimo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ingredientes.map(ingrediente => (
                  <tr key={ingrediente.id} className={ingrediente.stock <= ingrediente.stockMinimo ? 'low-stock' : ''}>
                    <td>{ingrediente.nombre}</td>
                    <td>{ingrediente.unidadMedida}</td>
                    <td>{formatCurrency(ingrediente.costoUnitario)}</td>
                    <td>{ingrediente.stock} {ingrediente.unidadMedida}</td>
                    <td>{ingrediente.stockMinimo} {ingrediente.unidadMedida}</td>
                    <td>
                      <button 
                        type="button" 
                        className="remove-button"
                        onClick={() => startEditing(ingrediente)}
                        style={{ marginRight: '10px' }}
                      >
                        Editar
                      </button>
                      <button 
                        type="button" 
                        className="remove-button"
                        onClick={() => handleDeleteIngredient(ingrediente.id)}
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
        
        <div className="add-ingredient-form">
          <h3>{formState.id ? 'Editar Ingrediente' : 'Agregar Nuevo Ingrediente'}</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="ingrediente-nombre">Nombre:</label>
              <input 
                type="text" 
                id="ingrediente-nombre" 
                name="nombre" 
                value={formState.nombre} 
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="ingrediente-unidad">Unidad de Medida:</label>
              <input 
                type="text" 
                id="ingrediente-unidad" 
                name="unidadMedida" 
                value={formState.unidadMedida} 
                onChange={handleInputChange}
                placeholder="Ej: kg, unidad, litro..."
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="ingrediente-costo">Costo Unitario (COP):</label>
              <input 
                type="number" 
                id="ingrediente-costo" 
                name="costoUnitario" 
                value={formState.costoUnitario} 
                onChange={handleInputChange}
                step="0.01"
                min="0"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="ingrediente-stock">Stock Actual:</label>
              <input 
                type="number" 
                id="ingrediente-stock" 
                name="stock" 
                value={formState.stock} 
                onChange={handleInputChange}
                step="0.01"
                min="0"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="ingrediente-stock-minimo">Stock Mínimo:</label>
              <input 
                type="number" 
                id="ingrediente-stock-minimo" 
                name="stockMinimo" 
                value={formState.stockMinimo} 
                onChange={handleInputChange}
                step="0.01"
                min="0"
                required
              />
            </div>
            
            <div className="form-buttons">
              <button type="submit" className="submit-button">{formState.id ? 'Actualizar Ingrediente' : 'Guardar Ingrediente'}</button>
              
              {formState.id && (
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={cancelEditing}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default GestionInventario;
