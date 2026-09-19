interface ReporteVentanaProps {
  datos: Record<string, unknown>;
}

const valorLegible = (valor: unknown): string => {
  if (Array.isArray(valor)) return valor.map(valorLegible).join(', ');
  if (valor && typeof valor === 'object') return JSON.stringify(valor);
  return String(valor ?? '—');
};

/**
 * Resultado de un reporte que pidio el administrador (RF08): una tarjeta de clave/valor por fila, sin conocer la
 * forma exacta de cada reporte (asi sirve para los que se agreguen despues).
 */
export const ReporteVentana = ({ datos }: ReporteVentanaProps) => {
  const reporte = (datos.reporte ?? datos) as unknown;
  const filas = (Array.isArray(reporte) ? reporte : [reporte]).filter((f): f is Record<string, unknown> => !!f && typeof f === 'object');
  const tipo = typeof datos.tipo_reporte === 'string' ? datos.tipo_reporte : null;

  if (filas.length === 0) {
    return <p className="font-body-md text-body-md text-on-surface-variant">No hay datos para ese reporte.</p>;
  }

  return (
    <div className="flex flex-col gap-space-md">
      {tipo && <span className="font-label-code text-label-code text-secondary uppercase tracking-wider">Reporte: {tipo}</span>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
        {filas.map((fila, i) => (
          <div key={i} className="flex flex-col gap-space-2xs rounded-xl bg-surface-container-lowest/60 p-space-sm">
            {Object.entries(fila).map(([clave, valor]) => (
              <div key={clave} className="flex items-baseline justify-between gap-space-sm">
                <span className="font-label-code text-label-code text-on-surface-variant uppercase truncate">{clave}</span>
                <span className="font-body-md text-body-md text-on-surface font-bold whitespace-nowrap">{valorLegible(valor)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
