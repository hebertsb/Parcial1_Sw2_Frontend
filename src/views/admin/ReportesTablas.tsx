import { useMemo, useState } from 'react';
import type { ReportePorPelicula, ReportePorFuncion, ReportePorProducto } from '../../core/types/reporte.types';
import { calcularShare, exportarCSV, toIntOrZero, type CabeceraExport } from '../../core/reportes.utils';

const THEAD = 'py-space-sm px-space-md text-left font-label-code text-label-code uppercase text-outline';
const TD = 'py-space-sm px-space-md font-body-sm text-body-sm text-on-surface';
const COLORES_SERIE = ['bg-primary', 'bg-secondary', 'bg-tertiary', 'bg-quaternary', 'bg-outline'] as const;

const BotonExportar = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="h-8 px-space-sm rounded-lg bg-surface-container text-on-surface font-body-sm text-body-sm outline-none shadow-inner hover:bg-surface-container-high transition-colors flex items-center gap-space-xs"
    title="Exportar a CSV"
  >
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
    Exportar
  </button>
);

/** No genérico a propósito: la inferencia de `T` desde un solo objeto de props
 * JSX con 3 sitios de uso de `T` resultaba en `string` en vez del literal
 * union esperado. El caller castea el id de vuelta a su propio tipo. */
const TogglePill = ({
  opciones,
  activo,
  onChange,
}: {
  opciones: readonly { id: string; label: string }[];
  activo: string;
  onChange: (id: string) => void;
}) => (
  <div className="flex rounded-lg overflow-hidden shadow-inner w-fit">
    {opciones.map((op) => (
      <button
        key={op.id}
        type="button"
        onClick={() => onChange(op.id)}
        aria-pressed={activo === op.id}
        className={`h-8 px-space-sm font-label-md text-label-md outline-none transition-colors whitespace-nowrap ${
          activo === op.id
            ? 'bg-primary text-on-primary'
            : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
        }`}
      >
        {op.label}
      </button>
    ))}
  </div>
);

const BarraShare = ({ share, color }: { share: number; color: string }) => (
  <div className="flex items-center gap-space-xs min-w-[96px]">
    <div className="h-2 flex-1 rounded-full bg-surface-container overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, Math.max(0, share))}%` }} />
    </div>
    <span className="font-label-code text-label-code text-on-surface-variant w-10 text-right">{share.toFixed(1)}%</span>
  </div>
);

type OrdenPelicula = 'monto' | 'entradas' | 'ventas';

const OPCIONES_ORDEN_PELICULA: { id: OrdenPelicula; label: string }[] = [
  { id: 'monto', label: 'Mayor recaudación' },
  { id: 'entradas', label: 'Más entradas' },
  { id: 'ventas', label: 'Más ventas' },
];

const CABECERAS_PELICULA_CSV: CabeceraExport<ReportePorPelicula>[] = [
  { clave: 'titulo', etiqueta: 'Película' },
  { clave: 'totalVentas', etiqueta: 'Ventas' },
  { clave: 'cantidadEntradas', etiqueta: 'Entradas' },
  { clave: 'montoTotal', etiqueta: 'Monto', formato: (v) => `${v} Bs` },
];

/** CU05/RF08 — "Ventas por película" con % del total recaudado, orden client-side
 * de la página actual y acción "Detalle" que filtra la tabla de funciones. */
export const ReportesTablaPelicula = ({
  filas,
  peliculaSeleccionada,
  onDetalle,
}: {
  filas: readonly ReportePorPelicula[];
  peliculaSeleccionada: string | null;
  onDetalle: (titulo: string) => void;
}) => {
  const [orden, setOrden] = useState<OrdenPelicula>('monto');

  const conShare = useMemo(() => calcularShare(filas, (f) => toIntOrZero(f.montoTotal)), [filas]);
  const ordenadas = useMemo(() => {
    const copia = [...conShare];
    copia.sort((a, b) => {
      if (orden === 'entradas') return b.cantidadEntradas - a.cantidadEntradas;
      if (orden === 'ventas') return b.totalVentas - a.totalVentas;
      return toIntOrZero(b.montoTotal) - toIntOrZero(a.montoTotal);
    });
    return copia;
  }, [conShare, orden]);

  return (
    <div className="rounded-2xl bg-surface-container-low shadow-lg h-full flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-space-sm p-space-md pb-0">
        <h2 className="font-headline-sm text-headline-sm text-on-surface">Ventas por película</h2>
        <div className="flex items-center gap-space-sm">
          <TogglePill
            opciones={OPCIONES_ORDEN_PELICULA}
            activo={orden}
            onChange={(id) => setOrden(id as OrdenPelicula)}
          />
          {filas.length > 0 && (
            <BotonExportar onClick={() => exportarCSV(filas, 'ventas-por-pelicula', CABECERAS_PELICULA_CSV)} />
          )}
        </div>
      </div>
      <div className="overflow-x-auto p-space-md">
        <table className="w-full min-w-[560px]">
          <thead>
            <tr>
              <th scope="col" className={THEAD}>Película</th>
              <th scope="col" className={THEAD}>Ventas</th>
              <th scope="col" className={THEAD}>Entradas</th>
              <th scope="col" className={THEAD}>Monto</th>
              <th scope="col" className={THEAD}>% del total</th>
              <th scope="col" className={THEAD}>Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {ordenadas.length === 0 ? (
              <tr><td className={TD} colSpan={6}>Sin ventas en el rango seleccionado.</td></tr>
            ) : (
              ordenadas.map((fila, index) => (
                <tr key={fila.idPelicula} className={peliculaSeleccionada === fila.titulo ? 'bg-primary/5' : undefined}>
                  <td className={TD}>
                    <span className={`inline-block w-2 h-2 rounded-full mr-space-xs ${COLORES_SERIE[index % COLORES_SERIE.length]}`} />
                    {fila.titulo}
                  </td>
                  <td className={TD}>{fila.totalVentas}</td>
                  <td className={TD}>{fila.cantidadEntradas}</td>
                  <td className={TD}>{fila.montoTotal} Bs</td>
                  <td className={TD}>
                    <BarraShare share={fila.share} color={COLORES_SERIE[index % COLORES_SERIE.length]} />
                  </td>
                  <td className={TD}>
                    <button
                      type="button"
                      onClick={() => onDetalle(fila.titulo)}
                      aria-pressed={peliculaSeleccionada === fila.titulo}
                      className={`h-7 px-space-sm rounded-lg font-label-md text-label-md outline-none shadow-inner transition-colors ${
                        peliculaSeleccionada === fila.titulo
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                      }`}
                    >
                      {peliculaSeleccionada === fila.titulo ? 'Viendo' : 'Detalle'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

type OrdenProducto = 'monto' | 'cantidad';

const OPCIONES_ORDEN_PRODUCTO: { id: OrdenProducto; label: string }[] = [
  { id: 'monto', label: 'Mayor recaudación' },
  { id: 'cantidad', label: 'Mayor cantidad' },
];

const CABECERAS_PRODUCTO_CSV: CabeceraExport<ReportePorProducto>[] = [
  { clave: 'nombre', etiqueta: 'Producto' },
  { clave: 'cantidadVendida', etiqueta: 'Cantidad vendida' },
  { clave: 'montoTotal', etiqueta: 'Monto total', formato: (v) => `${v} Bs` },
];

/** CU05/RF20 — "Rendimiento de dulcería" con % de participación y subtotal.
 * El mockup agrega una columna "Categoría" que no existe en `ReportePorProducto`
 * (el backend no la expone por producto) — se omite en vez de inventarla. */
export const ReportesTablaProducto = ({ filas }: { filas: readonly ReportePorProducto[] }) => {
  const [orden, setOrden] = useState<OrdenProducto>('monto');

  const conShare = useMemo(() => calcularShare(filas, (f) => toIntOrZero(f.montoTotal)), [filas]);
  const ordenadas = useMemo(() => {
    const copia = [...conShare];
    copia.sort((a, b) =>
      orden === 'cantidad' ? b.cantidadVendida - a.cantidadVendida : toIntOrZero(b.montoTotal) - toIntOrZero(a.montoTotal),
    );
    return copia;
  }, [conShare, orden]);

  const totalUnidades = filas.reduce((acc, f) => acc + f.cantidadVendida, 0);
  const totalMonto = filas.reduce((acc, f) => acc + toIntOrZero(f.montoTotal), 0);

  return (
    <div className="rounded-2xl bg-surface-container-low shadow-lg h-full flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-space-sm p-space-md pb-0">
        <h2 className="font-headline-sm text-headline-sm text-on-surface">Rendimiento de dulcería</h2>
        <div className="flex items-center gap-space-sm">
          <TogglePill
            opciones={OPCIONES_ORDEN_PRODUCTO}
            activo={orden}
            onChange={(id) => setOrden(id as OrdenProducto)}
          />
          {filas.length > 0 && (
            <BotonExportar onClick={() => exportarCSV(filas, 'rendimiento-dulceria', CABECERAS_PRODUCTO_CSV)} />
          )}
        </div>
      </div>
      <div className="overflow-x-auto p-space-md flex-1">
        <table className="w-full min-w-[420px]">
          <thead>
            <tr>
              <th scope="col" className={THEAD}>Producto</th>
              <th scope="col" className={THEAD}>Cantidad</th>
              <th scope="col" className={THEAD}>Total</th>
              <th scope="col" className={THEAD}>% part.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {ordenadas.length === 0 ? (
              <tr><td className={TD} colSpan={4}>Sin ventas de dulcería en el rango seleccionado.</td></tr>
            ) : (
              ordenadas.map((fila, index) => (
                <tr key={fila.idProducto}>
                  <td className={TD}>
                    <span className={`inline-block w-2 h-2 rounded-full mr-space-xs ${COLORES_SERIE[index % COLORES_SERIE.length]}`} />
                    {fila.nombre}
                  </td>
                  <td className={TD}>{fila.cantidadVendida} uds</td>
                  <td className={TD}>{fila.montoTotal} Bs</td>
                  <td className={TD}>
                    <BarraShare share={fila.share} color={COLORES_SERIE[index % COLORES_SERIE.length]} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {filas.length > 0 && (
        <div className="flex items-center justify-between p-space-md pt-0 font-label-md text-label-md text-on-surface">
          <span>Subtotal confitería ({totalUnidades} unidades)</span>
          <span className="text-quaternary">{totalMonto.toLocaleString()} Bs</span>
        </div>
      )}
    </div>
  );
};

/** Tabla simple (sin equivalente en el mockup) — se mantiene como detalle
 * adicional por función, filtrable desde "Detalle" en `ReportesTablaPelicula`. */
const CABECERAS_FUNCION_CSV: CabeceraExport<ReportePorFuncion>[] = [
  { clave: 'titulo', etiqueta: 'Película' },
  { clave: 'fecha', etiqueta: 'Fecha', formato: (v) => String(v).slice(0, 10) },
  { clave: 'horaInicio', etiqueta: 'Hora', formato: (v) => String(v).slice(0, 5) },
  { clave: 'totalVentas', etiqueta: 'Ventas' },
  { clave: 'cantidadEntradas', etiqueta: 'Entradas' },
  { clave: 'montoTotal', etiqueta: 'Monto', formato: (v) => `${v} Bs` },
];

export const ReportesTablaFuncion = ({ filas }: { filas: readonly ReportePorFuncion[] }) => {
  const handleExport = () => {
    exportarCSV(filas, 'ventas-por-funcion', CABECERAS_FUNCION_CSV);
  };

  return (
    <div className="rounded-2xl bg-surface-container-low shadow-lg">
      <div className="flex items-center justify-between p-space-md pb-0">
        <h2 className="font-headline-sm text-headline-sm text-on-surface">Ventas por función</h2>
        {filas.length > 0 && <BotonExportar onClick={handleExport} />}
      </div>
      <div className="overflow-x-auto p-space-md">
        <table className="w-full min-w-[620px]">
          <thead>
            <tr>
              <th scope="col" className={THEAD}>Película</th>
              <th scope="col" className={THEAD}>Fecha</th>
              <th scope="col" className={THEAD}>Hora</th>
              <th scope="col" className={THEAD}>Ventas</th>
              <th scope="col" className={THEAD}>Entradas</th>
              <th scope="col" className={THEAD}>Monto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {filas.length === 0 ? (
              <tr><td className={TD} colSpan={6}>Sin ventas en el rango seleccionado.</td></tr>
            ) : (
              filas.map((fila) => (
                <tr key={fila.idFuncion}>
                  <td className={TD}>{fila.titulo}</td>
                  {/* Este endpoint arma `fecha` con QueryBuilder crudo, así que a diferencia
                      de GET /funciones (que devuelve "YYYY-MM-DD" plano) acá puede llegar
                      como timestamp ISO completo — nos quedamos solo con la fecha. */}
                  <td className={TD}>{fila.fecha.slice(0, 10)}</td>
                  <td className={TD}>{fila.horaInicio.slice(0, 5)}</td>
                  <td className={TD}>{fila.totalVentas}</td>
                  <td className={TD}>{fila.cantidadEntradas}</td>
                  <td className={TD}>{fila.montoTotal} Bs</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
