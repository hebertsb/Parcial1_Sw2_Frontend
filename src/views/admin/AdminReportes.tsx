import { useEffect, useState } from 'react';
import { useAuth } from '../../controllers/AuthContext';
import {
  obtenerResumenVentas,
  obtenerReportePorPelicula,
  obtenerReportePorFuncion,
  obtenerReportePorProducto,
  obtenerDashboard,
} from '../../api/reportes.api';
import type {
  RangoFechas,
  ResumenVentas,
  ReportePorPelicula,
  ReportePorFuncion,
  ReportePorProducto,
  DashboardResponse,
  DashboardMetrica,
} from '../../core/types/reporte.types';
import { ReportesTablaPelicula, ReportesTablaFuncion, ReportesTablaProducto } from './ReportesTablas';

/** CU05/RF08 — reportes reales (`GET /reportes/*`), reemplaza la telemetría hardcodeada. */
export const AdminReportes = () => {
  const { token } = useAuth();
  const [filtro, setFiltro] = useState<RangoFechas>({});
  const [resumen, setResumen] = useState<ResumenVentas | null>(null);
  const [porPelicula, setPorPelicula] = useState<ReportePorPelicula[]>([]);
  const [porFuncion, setPorFuncion] = useState<ReportePorFuncion[]>([]);
  const [porProducto, setPorProducto] = useState<ReportePorProducto[]>([]);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelado = false;
    (async () => {
      setCargando(true);
      try {
        const [
          resumenVentas,
          ventasPorPelicula,
          ventasPorFuncion,
          ventasPorProducto,
          dashboardData,
        ] = await Promise.all([
          obtenerResumenVentas(filtro, token),
          obtenerReportePorPelicula(filtro, token),
          obtenerReportePorFuncion(filtro, token),
          obtenerReportePorProducto(filtro, token),
          obtenerDashboard(filtro, token),
        ]);
        if (!cancelado) {
          setResumen(resumenVentas);
          setPorPelicula(ventasPorPelicula);
          setPorFuncion(ventasPorFuncion);
          setPorProducto(ventasPorProducto);
          setDashboard(dashboardData);
        }
      } catch (error) {
        console.error('No se pudieron cargar los reportes reales.', error);
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [token, filtro]);

  const renderKPI = (
    label: string,
    valor: string,
    variacion?: DashboardMetrica,
    color: 'primary' | 'tertiary' | 'secondary' = 'primary',
  ) => (
    <div className="p-space-lg rounded-2xl bg-surface-container-low shadow-lg flex flex-col gap-space-2xs">
      <span className="font-label-code text-label-code uppercase tracking-wider text-outline">{label}</span>
      <div className="flex items-end gap-space-xs">
        <span className={`font-display-hero text-[36px] leading-tight text-${color}`}>{valor}</span>
        {variacion && (
          <span
            className={`font-label-md text-label-md ${
              variacion.variacionPorcentual.startsWith('-') ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {variacion.variacionPorcentual.startsWith('-') ? '▼' : '▲'} {variacion.variacionPorcentual}%
          </span>
        )}
      </div>
      {variacion && (
        <span className="font-body-xs text-body-xs text-on-surface-variant">
          vs periodo anterior: {variacion.anterior.toLocaleString()}
        </span>
      )}
    </div>
  );

  return (
    <div className="p-space-xl flex flex-col gap-space-xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
        <div className="flex flex-col gap-space-2xs">
          <span className="px-space-xs py-0.5 rounded bg-primary/10 text-primary font-label-code text-label-code uppercase tracking-wider w-fit">CU05 • Datos reales</span>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Reportes de Ventas</h1>
        </div>
        <div className="flex items-center gap-space-sm">
          <input
            type="date"
            value={filtro.desde ?? ''}
            onChange={(e) => setFiltro((f) => ({ ...f, desde: e.target.value || undefined }))}
            className="h-10 px-space-sm rounded-lg bg-surface-container text-on-surface font-body-sm text-body-sm outline-none shadow-inner"
          />
          <span className="text-on-surface-variant">—</span>
          <input
            type="date"
            value={filtro.hasta ?? ''}
            onChange={(e) => setFiltro((f) => ({ ...f, hasta: e.target.value || undefined }))}
            className="h-10 px-space-sm rounded-lg bg-surface-container text-on-surface font-body-sm text-body-sm outline-none shadow-inner"
          />
        </div>
      </div>

      {cargando && <p className="font-label-md text-label-md text-on-surface-variant">Cargando reportes...</p>}

      {dashboard && resumen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
          {renderKPI(
            'Ventas totales',
            String(resumen.totalVentas),
            dashboard.totalVentas,
            'primary',
          )}
          {renderKPI(
            'Monto recaudado',
            `${resumen.montoTotal} Bs`,
            dashboard.montoTotal,
            'tertiary',
          )}
          {renderKPI(
            'Entradas vendidas',
            String(resumen.cantidadEntradas),
            dashboard.cantidadEntradas,
            'secondary',
          )}
        </div>
      )}

      {resumen && !dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
          <div className="p-space-lg rounded-2xl bg-surface-container-low shadow-lg flex flex-col gap-space-2xs">
            <span className="font-label-code text-label-code uppercase tracking-wider text-outline">Ventas totales</span>
            <span className="font-display-hero text-[36px] leading-tight text-primary">{resumen.totalVentas}</span>
          </div>
          <div className="p-space-lg rounded-2xl bg-surface-container-low shadow-lg flex flex-col gap-space-2xs">
            <span className="font-label-code text-label-code uppercase tracking-wider text-outline">Monto recaudado</span>
            <span className="font-display-hero text-[36px] leading-tight text-tertiary">
              {resumen.montoTotal} <span className="font-headline-sm text-headline-sm text-on-surface-variant">Bs</span>
            </span>
          </div>
          <div className="p-space-lg rounded-2xl bg-surface-container-low shadow-lg flex flex-col gap-space-2xs">
            <span className="font-label-code text-label-code uppercase tracking-wider text-outline">Entradas vendidas</span>
            <span className="font-display-hero text-[36px] leading-tight text-secondary">{resumen.cantidadEntradas}</span>
          </div>
        </div>
      )}

      <ReportesTablaPelicula filas={porPelicula} />
      <ReportesTablaFuncion filas={porFuncion} />
      <ReportesTablaProducto filas={porProducto} />
    </div>
  );
};
