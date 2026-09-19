interface ReporteVentanaProps {
  datos: Record<string, unknown>;
}

/** Nombres que ve una persona (el backend manda los del codigo: `totalVentas`, `montoTotal`...). */
const ETIQUETAS: Record<string, string> = {
  totalVentas: 'Ventas',
  montoTotal: 'Monto (Bs)',
  cantidadEntradas: 'Entradas',
  titulo: 'Película',
  fecha: 'Fecha',
  horaInicio: 'Hora',
};

/** Ids internos: no le dicen nada al administrador. */
const OCULTOS = new Set(['idPelicula', 'idFuncion']);

const TITULOS: Record<string, string> = {
  resumen: 'Resumen de ventas',
  por_pelicula: 'Ventas por película',
  por_funcion: 'Ventas por función',
};

const valorLegible = (clave: string, valor: unknown): string => {
  if (Array.isArray(valor)) return valor.map((v) => valorLegible(clave, v)).join(', ');
  if (valor && typeof valor === 'object') return JSON.stringify(valor);
  const texto = String(valor ?? '—');
  if (clave === 'fecha') {
    const [anio, mes, dia] = texto.slice(0, 10).split('-');
    return anio && mes && dia ? `${dia}/${mes}/${anio}` : texto;
  }
  if (clave === 'horaInicio') return texto.slice(0, 5);
  return texto;
};

/**
 * Resultado de un reporte que pidio el administrador (RF08): una tarjeta por fila, con los nombres legibles y el
 * periodo consultado (el que se pidio hablando: "esta semana", "hoy"...).
 */
export const ReporteVentana = ({ datos }: ReporteVentanaProps) => {
  const reporte = (datos.reporte ?? datos) as unknown;
  const filas = (Array.isArray(reporte) ? reporte : [reporte]).filter((f): f is Record<string, unknown> => !!f && typeof f === 'object');
  const tipo = typeof datos.tipo_reporte === 'string' ? datos.tipo_reporte : null;
  const periodo = typeof datos.periodo === 'string' ? datos.periodo : null;

  if (filas.length === 0) {
    return <p className="font-body-md text-body-md text-on-surface-variant">No hay datos para ese reporte.</p>;
  }

  return (
    <div className="flex flex-col gap-space-md">
      <div className="flex flex-wrap items-center gap-space-xs">
        {tipo && <span className="font-label-code text-label-code text-secondary uppercase tracking-wider">{TITULOS[tipo] ?? tipo}</span>}
        {periodo && (
          <span data-testid="reporte-periodo" className="px-space-xs py-0.5 rounded-md bg-primary-container/20 text-primary font-label-code text-label-code uppercase tracking-wider">
            {periodo}
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
        {filas.map((fila, i) => (
          <div key={i} className="flex flex-col gap-space-2xs rounded-xl bg-surface-container-lowest/60 p-space-sm">
            {Object.entries(fila)
              .filter(([clave]) => !OCULTOS.has(clave))
              .map(([clave, valor]) => (
                <div key={clave} className="flex items-baseline justify-between gap-space-sm">
                  <span className="font-label-code text-label-code text-on-surface-variant uppercase truncate">{ETIQUETAS[clave] ?? clave}</span>
                  <span className="font-body-md text-body-md text-on-surface font-bold whitespace-nowrap">{valorLegible(clave, valor)}</span>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};
