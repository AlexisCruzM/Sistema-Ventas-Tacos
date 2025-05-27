import React from 'react';
import { useStore } from './store';

const Navigation = () => {
  const { vistaActual, setVistaActual } = useStore();

  const handleNavClick = (vista: 'resumen' | 'venta' | 'gasto' | 'inventario' | 'productos') => {
    console.log('Botón clickeado:', vista);
    setVistaActual(vista);
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <button 
          className={`nav-button ${vistaActual === 'resumen' ? 'active' : ''}`}
          onClick={() => handleNavClick('resumen')}
          type="button"
          role="button"
          aria-label="Ir a Resumen Diario"
          data-vista="resumen"
        >
          Resumen Diario
        </button>
        <button 
          className={`nav-button ${vistaActual === 'venta' ? 'active' : ''}`}
          onClick={() => handleNavClick('venta')}
          type="button"
          role="button"
          aria-label="Ir a Registrar Venta"
          data-vista="venta"
        >
          Registrar Venta
        </button>
        <button 
          className={`nav-button ${vistaActual === 'gasto' ? 'active' : ''}`}
          onClick={() => handleNavClick('gasto')}
          type="button"
          role="button"
          aria-label="Ir a Registrar Gasto"
          data-vista="gasto"
        >
          Registrar Gasto
        </button>
        <button 
          className={`nav-button ${vistaActual === 'inventario' ? 'active' : ''}`}
          onClick={() => handleNavClick('inventario')}
          type="button"
          role="button"
          aria-label="Ir a Gestión de Inventario"
          data-vista="inventario"
        >
          Gestión de Inventario
        </button>
        <button 
          className={`nav-button ${vistaActual === 'productos' ? 'active' : ''}`}
          onClick={() => handleNavClick('productos')}
          type="button"
          role="button"
          aria-label="Ir a Gestión de Productos"
          data-vista="productos"
        >
          Gestión de Productos
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
