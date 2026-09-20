import { capitalizar, calcularShare, toIntOrZero } from '../../core/reportes.utils';
import type { ReportePorMetodoPago, ReportePorPromocion } from '../../core/types/reporte.types';

const COLORES_SERIE = ['bg-primary', 'bg-secondary', 'bg-tertiary', 'bg-outline'] as const;

/** Fila compartida: etiqueta, detalle, % y barra horizontal de participación. */
const FilaShare = ({
  label,
  detalle,
  share,
  color,
}: {
  label: string;
  detalle: string;
  share: number;
  color: string;
}) => (
  <li className="flex flex-col gap-space-2xs">
    <div className="flex items-center justify-between gap-space-sm">
      <span className="font-body-sm text-body-sm text-on-surface">{label}</span>
      <span className="font-label-code text-label-code text-on-surface-variant">{share.toFixed(1)}%</span>
    </div>
    <div className="h-2 rounded-full bg-surface-container overflow-hidden">
      <div
        className={`h-full rounded-full ${color}`}
        style={{ width: `${Math.min(100, Math.max(0, share))}%` }}
      />
    </div>
    <span className="font-body-xs text-body-xs text-on-surface-variant">{detalle}</span>
  </li>
);

const CardVacio = ({ texto }: { texto: string }) => (
  <div className="rounded-2xl bg-surface-container-low shadow-lg p-space-xl text-center font-body-sm text-body-sm text-on-surface-variant">
    {texto}
  </div>
);

/** CU05/RF08 — participación de cada método de pago sobre el monto cobrado del período. */
export const ReportesCardMetodoPago = ({ filas }: { filas: ReportePorMetodoPago[] }) => {
  if (filas.length === 0) {
    return <CardVacio texto="Sin cobros en el rango seleccionado." />;
  }
  const conShare = calcularShare(filas, (fila) => Number(fila.montoTotal) || 0);
  const montoTotal = filas.reduce((acc, fila) => acc + toIntOrZero(fila.montoTotal), 0);

  return (
    <div className="rounded-2xl bg-surface-container-low shadow-lg p-space-lg flex flex-col gap-space-md h-full">
      <div className="flex items-start justify-between gap-space-sm">
        <div className="flex flex-col gap-space-2xs">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Métodos de pago</h3>
          <p className="font-body-xs text-body-xs text-on-surface-variant">Volumen y recaudación por canal de liquidación</p>
        </div>
        <span className="font-label-code text-label-code text-on-surface-variant whitespace-nowrap">
          {montoTotal.toLocaleString()} Bs
        </span>
      </div>
      <ul className="flex flex-col gap-space-md">
        {conShare.map((fila, index) => (
          <FilaShare
            key={fila.metodoPago}
            label={capitalizar(fila.metodoPago)}
            detalle={`${fila.totalVentas} venta${fila.totalVentas === 1 ? '' : 's'} • ${Number(fila.montoTotal).toLocaleString()} Bs`}
            share={fila.share}
            color={COLORES_SERIE[index % COLORES_SERIE.length]}
          />
        ))}
      </ul>
    </div>
  );
};

/** CU05/RF08 — participación de cada promoción sobre las ventas que la usaron. */
export const ReportesCardPromocion = ({ filas }: { filas: ReportePorPromocion[] }) => {
  if (filas.length === 0) {
    return <CardVacio texto="Sin promociones aplicadas en el rango seleccionado." />;
  }
  const conShare = calcularShare(filas, (fila) => fila.totalVentas);
  const totalVentas = filas.reduce((acc, fila) => acc + fila.totalVentas, 0);
  const totalDescuento = filas.reduce((acc, fila) => acc + (Number(fila.montoDescuento) || 0), 0);

  return (
    <div className="rounded-2xl bg-surface-container-low shadow-lg p-space-lg flex flex-col gap-space-md h-full">
      <div className="flex items-start justify-between gap-space-sm">
        <div className="flex flex-col gap-space-2xs">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Promociones utilizadas</h3>
          <p className="font-body-xs text-body-xs text-on-surface-variant">Impacto en volumen, descuentos y recaudación asociada</p>
        </div>
        <span className="font-label-code text-label-code text-on-surface-variant whitespace-nowrap">
          {totalVentas} venta{totalVentas === 1 ? '' : 's'}
        </span>
      </div>
      <ul className="flex flex-col gap-space-md">
        {conShare.map((fila, index) => (
          <FilaShare
            key={fila.idPromocion}
            label={fila.nombre}
            detalle={`${fila.tipoDescuento} • ${fila.totalVentas} venta${fila.totalVentas === 1 ? '' : 's'} • ${Number(fila.montoDescuento).toLocaleString()} Bs de descuento`}
            share={fila.share}
            color={COLORES_SERIE[index % COLORES_SERIE.length]}
          />
        ))}
      </ul>
      <div className="flex items-center justify-between pt-space-sm border-t border-surface-container font-label-md text-label-md text-on-surface">
        <span>Total descuento otorgado</span>
        <span className="text-error">-{totalDescuento.toLocaleString()} Bs</span>
      </div>
    </div>
  );
};