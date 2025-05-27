// Definición de tipos para el dashboard funcional

// Producto
export interface Producto {
  id: string;
  nombre: string;
  precio: number;
  categoria: 'taco' | 'arepa' | 'bebida' | 'otro';
  ingredientes: IngredienteEnReceta[];
  costoTotal: number;
  descripcion?: string;
}

// Ingrediente
export interface Ingrediente {
  id: string;
  nombre: string;
  unidadMedida: string;
  costoUnitario: number;
  stock: number;
  stockMinimo: number;
}

// Ingrediente en una receta
export interface IngredienteEnReceta {
  ingredienteId: string;
  nombre: string;
  cantidad: number;
  unidadMedida: string;
  costoUnitario: number;
  costoTotal: number;
}

// Venta
export interface Venta {
  id: string;
  fecha: string;
  hora: string;
  productos: ProductoVendido[];
  total: number;
  costoTotal: number;
  ganancia: number;
}

// Producto vendido
export interface ProductoVendido {
  productoId: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  costoUnitario: number;
  costoTotal: number;
}

// Gasto
export interface Gasto {
  id: string;
  fecha: string;
  descripcion: string;
  cantidad: number;
  unidadMedida?: string;
  costoTotal: number;
  tipo: 'ingrediente' | 'operativo';
  ingredienteId?: string;
}

// Resumen diario
export interface ResumenDiario {
  fecha: string;
  dineroInicial: number;
  ventasTotales: number;
  gastosTotales: number;
  gananciaNeta: number;
  margenGanancia: number;
  costoPromedioProducto: number;
  ventas: Venta[];
  gastos: Gasto[];
  alertasInventario: string[];
}

// Tipos para el estado de la aplicación (solo datos)
export interface AppStateData {
  productos: Producto[];
  ingredientes: Ingrediente[];
  ventas: Venta[];
  gastos: Gasto[];
  resumenDiario: ResumenDiario;
  fechaSeleccionada: string;
  dineroInicial: number;
  vistaActual: 'resumen' | 'venta' | 'gasto' | 'inventario' | 'productos';
}

// Estado global de la aplicación (datos + métodos)
export interface AppState extends AppStateData {
  // Métodos
  setVistaActual: (vista: 'resumen' | 'venta' | 'gasto' | 'inventario' | 'productos') => void;
  setFechaSeleccionada: (fecha: string) => void;
  setDineroInicial: (monto: number) => void;
  agregarProducto: (producto: Omit<Producto, 'id'>) => void;
  actualizarProducto: (id: string, producto: Partial<Producto>) => void;
  eliminarProducto: (id: string) => void;
  agregarIngrediente: (ingrediente: Omit<Ingrediente, 'id'>) => void;
  actualizarIngrediente: (id: string, ingrediente: Partial<Ingrediente>) => void;
  actualizarStockIngrediente: (id: string, cantidad: number) => void;
  eliminarIngrediente: (id: string) => void;
  registrarVenta: (venta: Venta) => void;
  actualizarVenta: (id: string, venta: Partial<Venta>) => void;
  eliminarVenta: (id: string) => void;
  registrarGasto: (gasto: Gasto) => void;
  eliminarGasto: (id: string) => void;
}
