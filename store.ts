import { create } from 'zustand';
// import { persist } from 'zustand/middleware'; // No longer needed with Firebase
import { AppState, AppStateData, Producto, Ingrediente, Venta, Gasto } from './types';
// import { v4 as uuidv4 } from 'uuid'; // No longer needed, Firebase generates keys
import { database } from './firebase-config';
import { ref, onValue, set as firebaseSet, push as firebasePush, remove as firebaseRemove, DatabaseReference } from "firebase/database";

// Obtener la fecha actual en formato YYYY-MM-DD
const getCurrentDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Estado inicial vacío (los datos vendrán de Firebase)
const initialFirebaseState: AppStateData = {
  productos: [],
  ingredientes: [],
  ventas: [],
  gastos: [],
  resumenDiario: {
    fecha: getCurrentDate(),
    dineroInicial: 0,
    ventasTotales: 0,
    gastosTotales: 0,
    gananciaNeta: 0,
    margenGanancia: 0,
    costoPromedioProducto: 0,
    ventas: [],
    gastos: [],
    alertasInventario: []
  },
  fechaSeleccionada: getCurrentDate(),
  dineroInicial: 0,
  vistaActual: 'resumen'
};

// Helper to convert Firebase object of objects to array
const snapshotToArray = <T>(snapshot: any): T[] => {
  const returnArr: T[] = [];
  snapshot.forEach((childSnapshot: any) => {
    const item = childSnapshot.val();
    item.id = childSnapshot.key; // Add Firebase key as id
    returnArr.push(item);
  });
  return returnArr;
};

// Extend the AppState type to include the initFirebaseListeners method
interface AppStateWithFirebase extends AppState {
  initFirebaseListeners: () => void;
}

// Crear el store
export const useStore = create<AppStateWithFirebase>((set, get) => ({
  ...initialFirebaseState,
  
  // -- Firebase Integration --
  // Listeners for data changes
  initFirebaseListeners: () => {
    // Listen for products changes
    const productosRef = ref(database, 'productos');
    onValue(productosRef, (snapshot) => {
      const productos = snapshot.exists() ? snapshotToArray<Producto>(snapshot) : [];
      set({ productos });
      // Recalculate daily summary and alerts after products and ingredients are loaded
      const { fechaSeleccionada } = get(); // Get latest state after products update
      get().setFechaSeleccionada(fechaSeleccionada); // This recalculates the summary and alerts
    });

    // Listen for ingredients changes
    const ingredientesRef = ref(database, 'ingredientes');
    onValue(ingredientesRef, (snapshot) => {
      const ingredientes = snapshot.exists() ? snapshotToArray<Ingrediente>(snapshot) : [];
      set({ ingredientes });
       // Recalculate daily summary and alerts after products and ingredients are loaded
      const { fechaSeleccionada } = get(); // Get latest state after ingredients update
      get().setFechaSeleccionada(fechaSeleccionada); // This recalculates the summary and alerts
    });

    // Listen for sales changes
    const ventasRef = ref(database, 'ventas');
    onValue(ventasRef, (snapshot) => {
      const ventas = snapshot.exists() ? snapshotToArray<Venta>(snapshot) : [];
      set({ ventas });
      // Recalculate daily summary and alerts after sales are loaded
      const { fechaSeleccionada } = get(); // Get latest state after sales update
      get().setFechaSeleccionada(fechaSeleccionada); // This recalculates the summary and alerts
    });

    // Listen for expenses changes
    const gastosRef = ref(database, 'gastos');
    onValue(gastosRef, (snapshot) => {
      const gastos = snapshot.exists() ? snapshotToArray<Gasto>(snapshot) : [];
      set({ gastos });
      // Recalculate daily summary and alerts after expenses are loaded
      const { fechaSeleccionada } = get(); // Get latest state after expenses update
      get().setFechaSeleccionada(fechaSeleccionada); // This recalculates the summary and alerts
    });

     // Listen for dineroInicial
    const dineroInicialRef = ref(database, 'dineroInicial');
     onValue(dineroInicialRef, (snapshot) => {
        const dineroInicial = snapshot.exists() ? snapshot.val() : 0;
        set({ dineroInicial });
         // Recalculate daily summary after dinero inicial is loaded
        const { fechaSeleccionada } = get(); // Get latest state after dineroInicial update
        get().setFechaSeleccionada(fechaSeleccionada); // This recalculates the summary
    });

  },

  // -- Métodos para actualizar el estado (ahora escriben en Firebase) --
  setVistaActual: (vista: 'resumen' | 'venta' | 'gasto' | 'inventario' | 'productos') => {
    set({ vistaActual: vista });
  },
  
  setFechaSeleccionada: (fecha: string) => {
    set({ fechaSeleccionada: fecha });
    const state = get();
    
    // Actualizar el resumen diario para la fecha seleccionada (ahora usa datos del estado local sincronizado con Firebase)
    const ventasFecha = state.ventas.filter((v: Venta) => v.fecha === fecha);
    const gastosFecha = state.gastos.filter((g: Gasto) => g.fecha === fecha);
    
    const ventasTotales = ventasFecha.reduce((sum: number, v: Venta) => sum + v.total, 0);
    const gastosTotales = gastosFecha.reduce((sum: number, g: Gasto) => sum + g.costoTotal, 0);
    const gananciaNeta = ventasTotales - gastosTotales;
    const margenGanancia = ventasTotales > 0 ? (gananciaNeta / ventasTotales) * 100 : 0;
    
    // Recalcular costo promedio del producto basado en ventas de la fecha
    const totalProductosVendidos = ventasFecha.reduce((sum: number, v: Venta) => 
      sum + v.productos.reduce((pSum: number, p: any) => pSum + p.cantidad, 0), 0);
    
    const costoTotalVentasFecha = ventasFecha.reduce((sum: number, v: Venta) => sum + v.costoTotal, 0);

    const costoPromedioProducto = totalProductosVendidos > 0 
      ? costoTotalVentasFecha / totalProductosVendidos
      : 0;
    
    // Verificar alertas de inventario (ahora usa datos de ingredientes del estado local sincronizado con Firebase)
    const alertasInventario = state.ingredientes
      .filter((i: Ingrediente) => i.stock <= i.stockMinimo)
      .map((i: Ingrediente) => `${i.nombre} está por debajo del nivel mínimo (${i.stock} ${i.unidadMedida})`);
    
    set({
      resumenDiario: {
        fecha,
        dineroInicial: state.dineroInicial, // Use dineroInicial from state
        ventasTotales,
        gastosTotales,
        gananciaNeta,
        margenGanancia,
        costoPromedioProducto,
        ventas: ventasFecha,
        gastos: gastosFecha,
        alertasInventario
      }
    });
  },
  
  setDineroInicial: (monto: number) => {
    // Write to Firebase. onValue listener will update local state.
    firebaseSet(ref(database, 'dineroInicial'), monto).catch(console.error);
  },
  
  // Métodos para productos (escriben en Firebase)
  agregarProducto: (producto: Omit<Producto, 'id'>) => {
    // Push to Firebase. onValue listener will update local state with generated ID.
    firebasePush(ref(database, 'productos'), producto).catch(console.error);
  },
  
  actualizarProducto: (id: string, producto: Partial<Omit<Producto, 'id'>>) => {
    // Update specific product in Firebase. onValue listener will update local state.
    firebaseSet(ref(database, 'productos/' + id), producto).catch(console.error);
  },
  
  eliminarProducto: (id: string) => {
    // Remove from Firebase. onValue listener will update local state.
    firebaseRemove(ref(database, 'productos/' + id)).catch(console.error);
  },
  
  // Métodos para ingredientes (escriben en Firebase)
  agregarIngrediente: (ingrediente: Omit<Ingrediente, 'id'>) => {
    // Push to Firebase. onValue listener will update local state with generated ID.
    firebasePush(ref(database, 'ingredientes'), ingrediente).catch(console.error);
  },
  
  actualizarIngrediente: (id: string, ingrediente: Partial<Omit<Ingrediente, 'id'>>) => {
    // Update specific ingredient in Firebase. onValue listener will update local state.
    firebaseSet(ref(database, 'ingredientes/' + id), ingrediente).catch(console.error);
  },
  
  // actualizarStockIngrediente ahora escribe en Firebase
  // Reads current stock from state (synced by listener) and writes new stock to Firebase
  actualizarStockIngrediente: (id: string, cantidad: number) => {
    const state = get();
    const ingrediente = state.ingredientes.find(i => i.id === id);
    if (ingrediente) {
      const newStock = ingrediente.stock + cantidad;
      // Update stock in Firebase. onValue listener will update local state.
      firebaseSet(ref(database, 'ingredientes/' + id + '/stock'), newStock).catch(console.error);
    } else {
        console.warn("Ingredient not found in local state for stock update:", id);
    }
  },

  
  eliminarIngrediente: (id: string) => {
     // Remove from Firebase. onValue listener will update local state.
    firebaseRemove(ref(database, 'ingredientes/' + id)).catch(console.error);
  },
  
  // Métodos para ventas (escriben en Firebase)
  registrarVenta: (venta: Omit<Venta, 'id' | 'fecha' | 'hora'>) => {
    const fecha = get().fechaSeleccionada;
    const hora = new Date().toLocaleTimeString();
    
    const newVenta = {
      ...venta,
      fecha,
      hora
    };
    
     // Push to Firebase. onValue listener will update local state with generated ID.
    firebasePush(ref(database, 'ventas'), newVenta).catch(console.error);

    // Actualizar stock de ingredientes en Firebase para cada producto en la venta
    // This should happen after the sale is successfully recorded, but updating stock is critical
    // For simplicity, triggering updates directly here. Transactional updates would be more robust.
    newVenta.productos.forEach((productoVendido: any) => {
      // Find the full product definition from the current state (synced by Firebase listener)
      const productoCompleto = get().productos.find((p: Producto) => p.id === productoVendido.productoId);
      if (productoCompleto) {
        productoCompleto.ingredientes.forEach((ingredienteReceta: any) => {
          const cantidadUsada = ingredienteReceta.cantidad * productoVendido.cantidad; // quantity per product * number of products sold
          // Use the ingredienteReceta.ingredienteId (which should be the Firebase key) to update stock
          get().actualizarStockIngrediente(ingredienteReceta.ingredienteId, -cantidadUsada);
        });
      }
    });
  },

   // Métodos para ventas (continuación - actualizar y eliminar)
   actualizarVenta: (id: string, venta: Partial<Omit<Venta, 'id'>>) => {
     // Update specific sale in Firebase. onValue listener will update local state.
    firebaseSet(ref(database, 'ventas/' + id), venta).catch(console.error);
   },

   eliminarVenta: (id: string) => {
      // Remove from Firebase. onValue listener will update local state.
     firebaseRemove(ref(database, 'ventas/' + id)).catch(console.error);
   },

   // Métodos para gastos (escriben en Firebase)
   registrarGasto: (gasto: Omit<Gasto, 'id' | 'fecha'>) => {
     const fecha = get().fechaSeleccionada;

     const newGasto = {
       ...gasto,
       fecha,
     };

      // Push to Firebase. onValue listener will update local state with generated ID.
     firebasePush(ref(database, 'gastos'), newGasto).catch(console.error);
   },

   actualizarGasto: (id: string, gasto: Partial<Omit<Gasto, 'id'>>) => {
     // Update specific expense in Firebase. onValue listener will update local state.
     firebaseSet(ref(database, 'gastos/' + id), gasto).catch(console.error);
   },

    eliminarGasto: (id: string) => {
       // Remove from Firebase. onValue listener will update local state.
      firebaseRemove(ref(database, 'gastos/' + id)).catch(console.error);
    }


}));

// Call the initFirebaseListeners function once after the store is created
// This will set up the initial data load and subsequent synchronizations
useStore.getState().initFirebaseListeners();
