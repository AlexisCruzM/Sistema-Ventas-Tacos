import { useState, useEffect } from 'react';
import { useStore } from './store';
import { formatCurrency } from './utils';

const ResumenDiario = () => {
  const { 
    resumenDiario, 
    fechaSeleccionada, 
    setFechaSeleccionada,
    dineroInicial,
    setDineroInicial
  } = useStore();
  
  const [dineroInicialInput, setDineroInicialInput] = useState(dineroInicial.toString());

  // Actualizar el input cuando cambia el dinero inicial en el store
  useEffect(() => {
    setDineroInicialInput(dineroInicial.toString());
  }, [dineroInicial]);

  const handleFechaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFechaSeleccionada(e.target.value);
  };

  const handleDineroInicialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDineroInicialInput(e.target.value);
  };

  const handleDineroInicialBlur = () => {
    const monto = parseFloat(dineroInicialInput) || 0;
    setDineroInicial(monto);
  };

  return (
    <section className="daily-summary">
      <h2>Resumen Diario - {fechaSeleccionada}</h2>
      
      <div className="date-selector">
        <label htmlFor="date">Seleccionar Fecha:</label>
        <div className="date-input-container">
          <input 
            type="date" 
            id="date" 
            value={fechaSeleccionada}
            onChange={handleFechaChange}
          />
        </div>
      </div>

      <div className="initial-cash">
        <p>Dinero Inicial en Caja (para vueltas) (COP):</p>
        <input 
          type="number" 
          value={dineroInicialInput}
          onChange={handleDineroInicialChange}
          onBlur={handleDineroInicialBlur}
          className="cash-input"
        />
      </div>

      <div className="kpi-cards">
        <div className="kpi-card sales">
          <h3>Ventas Totales</h3>
          <p className="kpi-value">{formatCurrency(resumenDiario.ventasTotales)}</p>
        </div>
        <div className="kpi-card expenses">
          <h3>Gastos Totales</h3>
          <p className="kpi-value">{formatCurrency(resumenDiario.gastosTotales)}</p>
        </div>
        <div className="kpi-card profit">
          <h3>Ganancia Neta</h3>
          <p className="kpi-value">{formatCurrency(resumenDiario.gananciaNeta)}</p>
          {resumenDiario.gananciaNeta > 0 && <p className="profit-label">¡Rentable!</p>}
        </div>
      </div>

      <div className="kpi-cards second-row">
        <div className="kpi-card margin">
          <h3>Margen de Ganancia</h3>
          <p className="kpi-value">{resumenDiario.margenGanancia.toFixed(2)}%</p>
        </div>
        <div className="kpi-card avg-cost">
          <h3>Costo Promedio por Producto Vendido</h3>
          <p className="kpi-value">{formatCurrency(resumenDiario.costoPromedioProducto)}</p>
        </div>
      </div>

      <div className="daily-details">
        <div className="daily-sales">
          <h3>Ventas del Día</h3>
          {resumenDiario.ventas.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Productos</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {resumenDiario.ventas.map(venta => (
                  <tr key={venta.id}>
                    <td>{venta.hora}</td>
                    <td>
                      {venta.productos.map(p => 
                        `${p.cantidad}x ${p.nombre}`
                      ).join(', ')}
                    </td>
                    <td>{formatCurrency(venta.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">No hay ventas registradas para esta fecha.</p>
          )}
        </div>
        <div className="daily-expenses">
          <h3>Gastos del Día</h3>
          {resumenDiario.gastos.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th>Tipo</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {resumenDiario.gastos.map(gasto => (
                  <tr key={gasto.id}>
                    <td>{gasto.descripcion}</td>
                    <td>{gasto.tipo === 'ingrediente' ? 'Ingrediente' : 'Operativo'}</td>
                    <td>{formatCurrency(gasto.costoTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">No hay gastos registrados para esta fecha.</p>
          )}
        </div>
      </div>

      {resumenDiario.alertasInventario.length > 0 ? (
        <div className="alert inventory-alert">
          <h3>Alerta de Inventario Bajo:</h3>
          <ul>
            {resumenDiario.alertasInventario.map((alerta, index) => (
              <li key={index}>{alerta}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="alert inventory-alert">
          <h3>Alerta de Inventario Bajo:</h3>
          <p>Todo el inventario parece estar en buen nivel.</p>
        </div>
      )}
    </section>
  );
};

export default ResumenDiario;
