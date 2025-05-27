import React, { useState, useEffect } from 'react';
import { useStore } from './store';
import { Gasto, Ingrediente } from './types';
import { formatCurrency } from './utils';

const RegistrarGasto = () => {
  const { ingredientes, gastos, registrarGasto, actualizarGasto, eliminarGasto } = useStore();
  
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

    const gastoData: Omit<Gasto, 'id' | 'fecha'> = {
      descripcion,
      cantidad: cantidadNum,
      unidadMedida: tipo === 'ingrediente' ? unidadMedida : undefined,
      costoTotal: costoTotalNum,
      tipo,
      ingredienteId: tipo === 'ingrediente' ? ingredienteId : undefined
    };
    
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

    // Iniciar modo edición de gasto
   const startEditingExpense = (gasto: Gasto) => {
       setEditingExpense(gasto);
   };

   // Cancelar edición
   const cancelEditingExpense = () => {
       setEditingExpense(null);
   };

   // Eliminar gasto
   const handleDeleteExpense = (id: string) => {
       if (confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
           eliminarGasto(id);
            if (editingExpense?.id === id) {
               setEditingExpense(null); // Si se elimina el que se estaba editando
           }
           alert('Gasto eliminado con éxito!');
       }
   };
  
  return (
    <div className="register-expense">
      <h2>Registrar Gasto</h2>
      
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
          Registrar Gasto
        </button>
      </form>
    </div>
  );
};

export default RegistrarGasto;
