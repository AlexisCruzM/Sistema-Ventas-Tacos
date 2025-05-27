import React, { useState } from 'react';
import { useStore } from './store';
import { Producto, ProductoVendido, Venta } from './types';
import { formatCurrency } from './utils';

const RegistrarVenta = () => {
  const { productos, ventas, registrarVenta, actualizarVenta, eliminarVenta } = useStore();
  
  const [carrito, setCarrito] = useState<ProductoVendido[]>([]);
  const [total, setTotal] = useState(0);
  const [costoTotal, setCostoTotal] = useState(0);
  
  // Estado para editar venta
  const [editingSale, setEditingSale] = useState<Venta | null>(null);

  const agregarAlCarrito = (producto: Producto) => {
    // Verificar si el producto ya está en el carrito
    const productoEnCarrito = carrito.find(p => p.productoId === producto.id);
    
    if (productoEnCarrito) {
      // Incrementar cantidad si ya existe
      const nuevoCarrito = carrito.map(p => 
        p.productoId === producto.id 
          ? { 
              ...p, 
              cantidad: p.cantidad + 1,
              total: (p.cantidad + 1) * p.precioUnitario,
              costoTotal: (p.cantidad + 1) * p.costoUnitario
            } 
          : p
      );
      setCarrito(nuevoCarrito);
    } else {
      // Agregar nuevo producto al carrito
      const nuevoProducto: ProductoVendido = {
        productoId: producto.id,
        nombre: producto.nombre,
        cantidad: 1,
        precioUnitario: producto.precio,
        total: producto.precio,
        costoUnitario: producto.costoTotal,
        costoTotal: producto.costoTotal
      };
      setCarrito([...carrito, nuevoProducto]);
    }
    
    // Actualizar totales
    setTotal(prevTotal => prevTotal + producto.precio);
    setCostoTotal(prevCosto => prevCosto + producto.costoTotal);
  };
  
  const eliminarDelCarrito = (productoId: string) => {
    const productoEnCarrito = carrito.find(p => p.productoId === productoId);
    if (!productoEnCarrito) return;

    const nuevoCarrito = carrito.filter(p => p.productoId !== productoId);
    setCarrito(nuevoCarrito);

    // Actualizar totales
    setTotal(prevTotal => prevTotal - productoEnCarrito.total);
    setCostoTotal(prevCosto => prevCosto - productoEnCarrito.costoTotal);
  };
  
  const decrementarCantidad = (productoId: string) => {
    const productoEnCarrito = carrito.find(p => p.productoId === productoId);
    if (!productoEnCarrito) return;

    if (productoEnCarrito.cantidad > 1) {
      const nuevoCarrito = carrito.map(p =>
        p.productoId === productoId
          ? {
              ...p,
              cantidad: p.cantidad - 1,
              total: (p.cantidad - 1) * p.precioUnitario,
              costoTotal: (p.cantidad - 1) * p.costoUnitario,
            }
          : p
      );
      setCarrito(nuevoCarrito);
       // Actualizar totales
      setTotal(prevTotal => prevTotal - productoEnCarrito.precioUnitario);
      setCostoTotal(prevCosto => prevCosto - productoEnCarrito.costoUnitario);
    } else {
      eliminarDelCarrito(productoId);
    }
  };
  
  const handleRegistrarVenta = (e: React.FormEvent) => {
    e.preventDefault();
    if (carrito.length === 0) {
      alert('El carrito está vacío.');
      return;
    }

    const nuevaVenta: Omit<Venta, 'id' | 'fecha' | 'hora'> = {
      productos: carrito,
      total,
      costoTotal,
      ganancia: total - costoTotal,
    };

    if (editingSale) {
        // Lógica para actualizar venta, si implementas edición de ventas
         const updatedSale = {
            ...editingSale,
            productos: carrito,
            total,
            costoTotal,
            ganancia: total - costoTotal,
         };
         actualizarVenta(editingSale.id, updatedSale);
         alert('Venta actualizada con éxito!');
         setEditingSale(null);
    } else {
        registrarVenta(nuevaVenta);
        alert('Venta registrada con éxito!');
    }

    // Limpiar carrito y totales
    setCarrito([]);
    setTotal(0);
    setCostoTotal(0);
  };
  
   // Iniciar modo edición de venta
   const startEditingSale = (venta: Venta) => {
       setEditingSale(venta);
       // Cargar los productos de la venta en el carrito para edición
       setCarrito(venta.productos);
       setTotal(venta.total);
       setCostoTotal(venta.costoTotal);
   };

   // Cancelar edición
   const cancelEditingSale = () => {
       setEditingSale(null);
       // Limpiar carrito y totales si se cancela la edición
        setCarrito([]);
        setTotal(0);
        setCostoTotal(0);
   };

   // Eliminar venta
   const handleDeleteSale = (id: string) => {
       if (confirm('¿Estás seguro de que quieres eliminar esta venta?')) {
           eliminarVenta(id);
           if (editingSale?.id === id) {
               setEditingSale(null); // Si se elimina la que se estaba editando
               setCarrito([]); // Limpiar carrito si se elimina la venta editada
               setTotal(0);
               setCostoTotal(0);
           }
           alert('Venta eliminada con éxito!');
       }
   };

  return (
    <div className="register-sale">
      <h2>{editingSale ? 'Editar Venta' : 'Registrar Venta'}</h2>
      
      <div className="sale-container">
        <div className="available-products">
          <h3>Productos Disponibles</h3>
          
          <div className="filter-controls">
            <input type="text" placeholder="Buscar producto..." />
            <select>
              <option value="">Todas las categorías</option>
              <option value="taco">Taco</option>
              <option value="arepa">Arepa</option>
              <option value="bebida">Bebida</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          {productos.length === 0 ? (
            <p className="no-data">No hay productos registrados.</p>
          ) : (
            <div className="products-grid">
              {productos.map(producto => (
                <div key={producto.id} className="product-card">
                  <h4>{producto.nombre}</h4>
                  <p className="product-price">{formatCurrency(producto.precio)}</p>
                  <button 
                    className="add-button" 
                    onClick={() => agregarAlCarrito(producto)}
                    type="button"
                  >
                    Agregar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="cart-summary">
          <h3>Carrito de Venta</h3>
          {carrito.length === 0 ? (
            <p className="empty-cart">No hay productos en el carrito</p>
          ) : (
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Total</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {carrito.map(item => (
                  <tr key={item.productoId}>
                    <td>{item.nombre}</td>
                    <td>
                      <div className="quantity-control">
                         <button type="button" onClick={() => decrementarCantidad(item.productoId)}>-</button>
                         <span>{item.cantidad}</span>
                         <button type="button" onClick={() => agregarAlCarrito(productos.find(p => p.id === item.productoId)!)}>+</button>
                      </div>
                    </td>
                    <td>{formatCurrency(item.total)}</td>
                    <td>
                       <button type="button" className="remove-button" onClick={() => eliminarDelCarrito(item.productoId)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="cart-summary">
            <div className="cart-total">
              Total: <span>{formatCurrency(total)}</span>
            </div>
            <div className="form-buttons">
                <button type="submit" className="finalize-button" onClick={handleRegistrarVenta}>{editingSale ? 'Actualizar Venta' : 'Registrar Venta'}</button>
                 {editingSale && (
                   <button type="button" className="cancel-button" onClick={cancelEditingSale}>Cancelar</button>
                 )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="registered-sales">
           <h3>Ventas Registradas</h3>
            {ventas.length === 0 ? (
             <p className="no-data">No hay ventas registradas.</p>
           ) : (
               <table className="data-table">
                   <thead>
                       <tr>
                           <th>Fecha</th>
                           <th>Hora</th>
                           <th>Productos</th>
                           <th>Total</th>
                           <th>Ganancia</th>
                           <th>Acciones</th>
                       </tr>
                   </thead>
                   <tbody>
                       {ventas.map(venta => (
                           <tr key={venta.id}>
                               <td>{venta.fecha}</td>
                               <td>{venta.hora}</td>
                               <td>
                                   <ul>
                                       {venta.productos.map(item => (
                                           <li key={item.productoId}>{item.cantidad}x {item.nombre}</li>
                                       ))}
                                   </ul>
                               </td>
                               <td>{formatCurrency(venta.total)}</td>
                               <td>{formatCurrency(venta.ganancia)}</td>
                               <td>
                                    <button 
                                        type="button" 
                                        className="remove-button"
                                        onClick={() => startEditingSale(venta)}
                                        style={{ marginRight: '10px' }}
                                    >
                                        Editar
                                    </button>
                                   <button 
                                       type="button" 
                                       className="remove-button" 
                                       onClick={() => handleDeleteSale(venta.id)}
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

    </div>
  );
};

export default RegistrarVenta;
