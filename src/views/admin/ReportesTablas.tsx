import type { ReportePorPelicula, ReportePorFuncion, ReportePorProducto, ReportePorMetodoPago, ReportePorPromocion } from '../../core/types/reporte.types';
import { exportarCSV } from '../../core/reportes.utils';

const THEAD = 'py-space-sm px-space-md text-left font-label-code text-label-code uppercase text-outline';
const TD = 'py-space-sm px-space-md font-body-sm text-body-sm text-on-surface';

/** Wrapper responsive para tablas con botón de exportar */
export function TablaConExport<T extends Record<string, unknown>>({
  titulo,
  filas,
  cabeceras,
  exportNombre,
  vacioMensaje,
}: {
  titulo: string;
  filas: readonly T[];
  cabeceras: { clave: keyof T; etiqueta: string }[];
  exportNombre: string;
  vacioMensaje: string;
}) {
  const handleExport = () => {
    exportarCSV(filas, exportNombre, cabeceras);
  };

  const tieneDatos = filas.length > 0;

  return (
    <div className="rounded-2xl bg-surface-container-low shadow-lg">
      <div className="flex items-center justify-between p-space-md pb-0">
        <h2 className="font-headline-sm text-headline-sm text-on-surface">{titulo}</h2>
        {tieneDatos && (
          <button
            onClick={handleExport}
            className="h-8 px-space-sm rounded-lg bg-surface-container text-on-surface font-body-sm text-body-sm outline-none shadow-inner hover:bg-surface-container-high transition-colors flex items-center gap-space-xs"
            title="Exportar a CSV"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exportar
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px]">
          <thead>
            <tr>
              {cabeceras.map((c, i) => (
                <th key={i} className={THEAD}>{c.etiqueta}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {filas.length === 0 ? (
              <tr><td className={TD} colSpan={cabeceras.length}>{vacioMensaje}</td></tr>
            ) : (
              filas.map((fila, idx) => (
                <tr key={idx}>
                  {cabeceras.map((c, j) => (
                    <td key={j} className={TD}>
                      {c.formato ? c.formato(fila[c.clave]) : String(fila[c.clave] ?? '')}
                    </td>
                  ))}
                </tr>
))
          )}
        </tbody>
      </table>
    </div>
  </div>
  );
}

/** Cabeceras para cada reporte */
const CABECERAS_PELICULA = [
  { clave: 'titulo', etiqueta: 'Película' },
  { clave: 'totalVentas', etiqueta: 'Ventas' },
  { clave: 'cantidadEntradas', etiqueta: 'Entradas' },
  { clave: 'montoTotal', etiqueta: 'Monto', formato: (v) => `${v} Bs` },
] as const;

const CABECERAS_FUNCION = [
  { clave: 'titulo', etiqueta: 'Película' },
  { clave: 'fecha', etiqueta: 'Fecha', formato: (v: string) => v.slice(0, 10) },
  { clave: 'horaInicio', etiqueta: 'Hora', formato: (v: string) => v.slice(0, 5) },
  { clave: 'totalVentas', etiqueta: 'Ventas' },
  { clave: 'cantidadEntradas', etiqueta: 'Entradas' },
  { clave: 'montoTotal', etiqueta: 'Monto', formato: (v) => `${v} Bs` },
] as const;

const CABECERAS_PRODUCTO = [
  { clave: 'nombre', etiqueta: 'Producto' },
  { clave: 'cantidadVendida', etiqueta: 'Cantidad vendida' },
  { clave: 'montoTotal', etiqueta: 'Monto total', formato: (v) => `${v} Bs` },
] as const;

const CABECERAS_METODO_PAGO = [
  { clave: 'metodoPago', etiqueta: 'Método' },
  { clave: 'totalVentas', etiqueta: 'Ventas' },
  { clave: 'montoTotal', etiqueta: 'Monto', formato: (v) => `${v} Bs` },
] as const;

const CABECERAS_PROMOCION = [
  { clave: 'nombre', etiqueta: 'Promoción' },
  { clave: 'tipoDescuento', etiqueta: 'Tipo descuento' },
  { clave: 'totalVentas', etiqueta: 'Ventas' },
  { clave: 'montoDescuento', etiqueta: 'Descuento total', formato: (v) => `${v} Bs` },
] as const;

export const ReportesTablaPelicula = ({ filas }: { filas: readonly ReportePorPelicula[] }) => (
  <TablaConExport
    titulo="Ventas por película"
    filas={filas}
    cabeceras={CABECERAS_PELICULA}
    exportNombre="ventas-por-pelicula"
    vacioMensaje="Sin ventas en el rango seleccionado."
  />
);

export const ReportesTablaFuncion = ({ filas }: { filas: readonly ReportePorFuncion[] }) => (
  <TablaConExport
    titulo="Ventas por función"
    filas={filas}
    cabeceras={CABECERAS_FUNCION}
    exportNombre="ventas-por-funcion"
    vacioMensaje="Sin ventas en el rango seleccionado."
  />
);

export const ReportesTablaProducto = ({ filas }: { filas: readonly ReportePorProducto[] }) => (
  <TablaConExport
    titulo="Ventas por producto (dulcería)"
    filas={filas}
    cabeceras={CABECERAS_PRODUCTO}
    exportNombre="ventas-por-producto"
    vacioMensaje="Sin ventas de dulcería en el rango seleccionado."
  />
);

export const ReportesTablaMetodoPago = ({ filas }: { filas: readonly ReportePorMetodoPago[] }) => (
  <TablaConExport
    titulo="Ventas por método de pago"
    filas={filas}
    cabeceras={CABECERAS_METODO_PAGO}
    exportNombre="ventas-por-metodo-pago"
    vacioMensaje="Sin ventas en el rango seleccionado."
  />
);

export const ReportesTablaPromocion = ({ filas }: { filas: readonly ReportePorPromocion[] }) => (
  <TablaConExport
    titulo="Ventas por promoción"
    filas={filas}
    cabeceras={CABECERAS_PROMOCION}
    exportNombre="ventas-por-promocion"
    vacioMensaje="Sin promociones aplicadas en el rango seleccionado."
  />
);