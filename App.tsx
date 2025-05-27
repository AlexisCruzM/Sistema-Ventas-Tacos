import { useEffect } from 'react';
import { useStore } from './store';
import './index.css';

// Componentes
import Header from './Header';
import Navigation from './Navigation';
import ResumenDiario from './ResumenDiario';
import RegistrarVenta from './RegistrarVenta';
import RegistrarGasto from './RegistrarGasto';
import GestionInventario from './GestionInventario';
import GestionProductos from './GestionProductos';
import Footer from './Footer';

function App() {
  const { vistaActual, setFechaSeleccionada, fechaSeleccionada } = useStore();

  // Inicializar el resumen diario al cargar la aplicación
  useEffect(() => {
    setFechaSeleccionada(fechaSeleccionada);
  }, [setFechaSeleccionada, fechaSeleccionada]);

  // Renderizar la vista actual
  const renderVistaActual = () => {
    console.log('Renderizando vista:', vistaActual);
    
    switch (vistaActual) {
      case 'resumen':
        return <ResumenDiario key="resumen" />;
      case 'venta':
        return <RegistrarVenta key="venta" />;
      case 'gasto':
        return <RegistrarGasto key="gasto" />;
      case 'inventario':
        return <GestionInventario key="inventario" />;
      case 'productos':
        return <GestionProductos key="productos" />;
      default:
        return <ResumenDiario key="default" />;
    }
  };

  return (
    <div className="app">
      <Header />
      <Navigation />
      <main className="main-content">
        {renderVistaActual()}
      </main>
      <Footer />
    </div>
  );
}

export default App;
