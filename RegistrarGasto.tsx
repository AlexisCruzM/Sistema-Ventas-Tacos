import React, { useState, useEffect } from 'react';
import { useStore } from './store';
import { Gasto } from './types';
import { formatCurrency } from './utils'; // Importar la función de formato de moneda

const RegistrarGasto = () => {
  const { ingredientes, registrarGasto, actualizarGasto, eliminarGasto, gastos, fechaSeleccionada } = useStore();
  
  const [descripcion, setDescripcion] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [costoTotal, setCostoTotal] = useState('');
  const [tipo, setTipo] = useState<'ingrediente' | 'operativo'>('operativo');
  const [ingredienteId, setIngredienteId] = useState('');
  const [unidadMedida, setUnidadMedida] = useState('');
  
  // Estado para editar gasto
  const [editingExpense, setEditingExpense] = useState<Gasto | null>(null);

  // Efecto para cargar datos si se está editando
  useEffect(() => {
    if (editingExpense) {
      setDescripcion(editingExpense.descripcion);
      setCantidad(editingExpense.cantidad.toString());
      setCostoTotal(editingExpense.costoTotal.toString());
      setTipo(editingExpense.tipo);
      setIngredienteId(editingExpense.ingredienteId || '');
      // Si es ingrediente, encontrar la unidad de medida
      if (editingExpense.tipo === 'ingrediente' && editingExpense.ingredienteId) {
          const ingrediente = ingredientes.find(i => i.id === editingExpense.ingredienteId);
          if(ingrediente) setUnidadMedida(ingrediente.unidadMedida);
          else setUnidadMedida(''); // Fallback
      } else {
          setUnidadMedida('');
      }
    } else {
      // Limpiar formulario si no se está editando
      setDescripcion('');
      setCantidad('');
      setCostoTotal('');
      setTipo('operativo');
      setIngredienteId('');
      setUnidadMedida('');
    }
  }, [editingExpense, ingredientes]); // Dependencias del efecto

  const handleTipoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTipo(e.target.value as 'ingrediente' | 'operativo');
    if (e.target.value === 'operativo') {
      setIngredienteId('');
      setUnidadMedida('');
    }
  };
  
  const handleIngredienteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setIngredienteId(id);
    
    // Actualizar unidad de medida según el ingrediente seleccionado
    const ingrediente = ingredientes.find(i => i.id === id);
    if (ingrediente) {
      setUnidadMedida(ingrediente.unidadMedida);
    } else {
        setUnidadMedida('');
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!descripcion || !costoTotal) {
      alert('Por favor complete los campos requeridos');
      return;
    }
    
    const costoTotalNum = parseFloat(costoTotal);
    let cantidadNum = 0;
    
    if (tipo === 'ingrediente') {
      if (!ingredienteId || !cantidad) {
        alert('Por favor seleccione un ingrediente y especifique la cantidad');
        return;
      }
      cantidadNum = parseFloat(cantidad);
    }

    // Build the base expense data object
    let gastoData: Omit<Gasto, 'id' | 'fecha' | 'hora'> = {
      descripcion,
      cantidad: cantidadNum, // Always include quantity (0 for operativo)
      costoTotal: costoTotalNum,
      tipo,
    };

    // Add ingredient specific properties only if type is ingrediente
    if (tipo === 'ingrediente') {
        gastoData = {
            ...gastoData,
            unidadMedida: unidadMedida,
            ingredienteId: ingredienteId,
        };
    }

    if (editingExpense) {
        // Lógica para actualizar gasto
        const updatedGasto = {
            ...editingExpense,
            ...gastoData
        };
        actualizarGasto(editingExpense.id, updatedGasto);
        alert('Gasto actualizado con éxito!');
        setEditingExpense(null);
    } else {
        // Lógica para registrar nuevo gasto
         const newGasto: Omit<Gasto, 'id' | 'fecha' | 'hora'> = {
           ...gastoData,
           // La fecha y hora se asignarán en el store
         };
        registrarGasto(newGasto as Gasto); // Cast temporal, la fecha/hora se añaden en el store
        alert('¡Gasto registrado con éxito!');
    }
    
    // Limpiar formulario
    setDescripcion('');
    setCantidad('');
    setCostoTotal('');
    setTipo('operativo');
    setIngredienteId('');
    setUnidadMedida('');
  };

  // Filtrar gastos por la fecha seleccionada
  const gastosDelDia = gastos.filter(gasto => gasto.fecha === fechaSeleccionada);

  // Función para manejar la eliminación de un gasto
  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
      eliminarGasto(id);
    }
  };

  // Función para manejar la edición de un gasto
  const handleEdit = (gasto: Gasto) => {
    setEditingExpense(gasto);
  };

  return (
    <div className="register-expense">
      <h2>{editingExpense ? 'Editar Gasto' : 'Registrar Gasto'}</h2>
      
      <form className="expense-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="tipo">Tipo de Gasto:</label>
          <select 
            id="tipo" 
            value={tipo} 
            onChange={handleTipoChange}
            required
          >
            <option value="operativo">Gasto Operativo</option>
            <option value="ingrediente">Compra de Ingrediente</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="descripcion">Descripción:</label>
          <input 
            type="text" 
            id="descripcion" 
            value={descripcion} 
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder={tipo === 'operativo' ? "Ej: Gas, servilletas, arriendo..." : "Descripción de la compra"}
            required
          />
        </div>
        
        {tipo === 'ingrediente' && (
          <>
            <div className="form-group">
              <label htmlFor="ingrediente">Ingrediente:</label>
              <select 
                id="ingrediente" 
                value={ingredienteId} 
                onChange={handleIngredienteChange}
                required
              >
                <option value="">Seleccione un ingrediente</option>
                {ingredientes.map(ingrediente => (
                  <option key={ingrediente.id} value={ingrediente.id}>
                    {ingrediente.nombre}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="cantidad">Cantidad:</label>
              <div className="input-with-unit">
                <input 
                  type="number" 
                  id="cantidad" 
                  value={cantidad} 
                  onChange={(e) => setCantidad(e.target.value)}
                  step="0.01"
                  min="0"
                  required
                />
                <span className="unit">{unidadMedida}</span>
              </div>
            </div>
          </>
        )}
        
        <div className="form-group">
          <label htmlFor="costoTotal">Costo Total (COP):</label>
          <input 
            type="number" 
            id="costoTotal" 
            value={costoTotal} 
            onChange={(e) => setCostoTotal(e.target.value)}
            step="100"
            min="0"
            required
          />
        </div>
        
        <button type="submit" className="submit-button">
          {editingExpense ? 'Actualizar Gasto' : 'Registrar Gasto'}
        </button>
      </form>

      {/* Sección para mostrar gastos registrados */}
      <div className="expense-list">
        <h3>Gastos Registrados ({fechaSeleccionada})</h3>
        {gastosDelDia.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Hora</th>
                <th>Descripción</th>
                <th>Tipo</th>
                {/* <th>Cantidad</th> */}
                {/* <th>Unidad</th> */}
                <th>Costo Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {gastosDelDia.map(gasto => (
                <tr key={gasto.id}>
                  <td>{gasto.hora}</td>
                  <td>{gasto.descripcion}</td>
                  <td>{gasto.tipo === 'ingrediente' ? 'Ingrediente' : 'Operativo'}</td>
                  {/* <td>{gasto.cantidad}</td> */}
                  {/* <td>{gasto.unidadMedida}</td> */}
                  <td>{formatCurrency(gasto.costoTotal)}</td>
                  <td>
                    <button onClick={() => handleEdit(gasto)} style={{ marginRight: '10px', padding: '8px 20px', borderRadius: '25px', border: '1px solid #ccc', backgroundColor: '#f5f5dc', cursor: 'pointer', color: '#333', fontSize: '14px', boxShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>Editar</button>
                    <button onClick={() => handleDelete(gasto.id)} style={{ padding: '8px 20px', borderRadius: '25px', border: '1px solid #ccc', backgroundColor: '#f5f5dc', cursor: 'pointer', color: '#333', fontSize: '14px', boxShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-data">No hay gastos registrados para esta fecha.</p>
        )}
      </div>
    </div>
  );
};

export default RegistrarGasto;
