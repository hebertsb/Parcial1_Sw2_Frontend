import { useEffect, useState } from 'react';
import { useAuth } from '../../controllers/AuthContext';
import { useToast } from '../../hooks/useToast';
import { diasEnRango, formatearFechaLegible } from '../../core/reportes.utils';
import {
  obtenerResumenVentas,
  obtenerReportePorPelicula,
  obtenerReportePorFuncion,
  obtenerReportePorProducto,
  obtenerReportePorMetodoPago,
  obtenerReportePorPromocion,
  obtenerDashboard,
  obtenerSerieTemporal,
  obtenerReportePorPeliculaPaginado,
  obtenerReportePorFuncionPaginado,
  obtenerReportePorProductoPaginado,
} from '../../api/reportes.api';
import type {
  RangoFechas,
  ResumenVentas,
  ReportePorPelicula,
  ReportePorFuncion,
  ReportePorProducto,
  ReportePorMetodoPago,
  ReportePorPromocion,
  DashboardResponse,
  DashboardMetrica,
  SerieTemporalPunto,
  PaginatedResponse,
} from '../../core/types/reporte.types';
import { ReportesTablaPelicula, ReportesTablaFuncion, ReportesTablaProducto } from './ReportesTablas';
import { ReportesCardMetodoPago, ReportesCardPromocion } from './ReportesCards';
import { ReportesFiltros } from './ReportesFiltros';
import { ReportesInsights } from './ReportesInsights';
import { ReportesChart } from './ReportesChart';
import { KPISkeleton, TablaSkeleton, ChartSkeleton, KPIsGridSkeleton } from './ReportesSkeletons';

/** CU05/RF08 — reportes reales (`GET /reportes/*`), reemplaza la telemetría hardcodeada. */
export const AdminReportes = () => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [filtro, setFiltro] = useState<RangoFechas>({
    agrupacion: 'dia',
    limit: 50,
    offset: 0,
  });
  const [filtroDraft, setFiltroDraft] = useState<RangoFechas>({
    agrupacion: 'dia',
    limit: 50,
    offset: 0,
  });
  const [resumen, setResumen] = useState<ResumenVentas | null>(null);
  const [porPelicula, setPorPelicula] = useState<ReportePorPelicula[]>([]);
  const [porFuncion, setPorFuncion] = useState<ReportePorFuncion[]>([]);
  const [porProducto, setPorProducto] = useState<ReportePorProducto[]>([]);
  const [porMetodoPago, setPorMetodoPago] = useState<ReportePorMetodoPago[]>([]);
  const [porPromocion, setPorPromocion] = useState<ReportePorPromocion[]>([]);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [serieTemporal, setSerieTemporal] = useState<SerieTemporalPunto[]>([]);
  const [paginacion, setPaginacion] = useState<{
    pelicula: PaginatedResponse<ReportePorPelicula> | null;
    funcion: PaginatedResponse<ReportePorFuncion> | null;
    producto: PaginatedResponse<ReportePorProducto> | null;
  }>({
    pelicula: null,
    funcion: null,
    producto: null,
  });
  const [cargando, setCargando] = useState(false);

  const cargarReportes = async () => {
    if (!token) return;
    let cancelado = false;
    setCargando(true);
    try {
      const [
        resumenVentas,
        ventasPorPelicula,
        ventasPorFuncion,
        ventasPorProducto,
        ventasPorMetodoPago,
        ventasPorPromocion,
        dashboardData,
        serieTemporalData,
        peliculaPaginada,
        funcionPaginada,
        productoPaginada,
      ] = await Promise.all([
        obtenerResumenVentas(filtro, token),
        obtenerReportePorPelicula(filtro, token),
        obtenerReportePorFuncion(filtro, token),
        obtenerReportePorProducto(filtro, token),
        obtenerReportePorMetodoPago(filtro, token),
        obtenerReportePorPromocion(filtro, token),
        obtenerDashboard(filtro, token),
        obtenerSerieTemporal(filtro, token),
        obtenerReportePorPeliculaPaginado(filtro, token),
        obtenerReportePorFuncionPaginado(filtro, token),
        obtenerReportePorProductoPaginado(filtro, token),
      ]);
      if (!cancelado) {
        setResumen(resumenVentas);
        setPorPelicula(ventasPorPelicula);
        setPorFuncion(ventasPorFuncion);
        setPorProducto(ventasPorProducto);
        setPorMetodoPago(ventasPorMetodoPago);
        setPorPromocion(ventasPorPromocion);
        setDashboard(dashboardData);
        setSerieTemporal(serieTemporalData);
        setPaginacion({
          pelicula: peliculaPaginada,
          funcion: funcionPaginada,
          producto: productoPaginada,
        });
      }
    } catch (error) {
      console.error('No se pudieron cargar los reportes reales.', error);
      showToast('No se pudieron cargar los reportes. Intenta de nuevo.', 'error');
    } finally {
      if (!cancelado) setCargando(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    let cancelado = false;
    (async () => {
      await cargarReportes();
      if (!cancelado) setCargando(false);
    })();
    return () => {
      cancelado = true;
    };
  }, [token, filtro]);

  const aplicarFiltro = () => {
    let { desde, hasta } = filtroDraft;
    // Validación #5: si `hasta < desde`, invertir en vez de devolver un error silencioso.
    if (desde && hasta && hasta < desde) {
      const aux = desde;
      desde = hasta;
      hasta = aux;
    }
    setFiltro({ ...filtroDraft, desde, hasta, offset: 0 });
  };

  const restablecerFiltro = () => {
    const base: RangoFechas = { agrupacion: 'dia', limit: 50, offset: 0 };
    setFiltroDraft(base);
    setFiltro(base);
  };

  // Reset offset cuando cambian los filtros principales (no paginación)
  useEffect(() => {
    setFiltro((f) => ({ ...f, offset: 0 }));
  }, [filtro.desde, filtro.hasta, filtro.agrupacion]);

  // Validación: si hasta < desde, intercambiar
  useEffect(() => {
    if (filtro.desde && filtro.hasta && filtro.hasta < filtro.desde) {
      setFiltro((f) => ({ ...f, hasta: f.desde, desde: f.hasta }));
    }
  }, [filtro.desde, filtro.hasta]);

  const renderKPI = (
    label: string,
    valor: string,
    variacion?: DashboardMetrica,
    color: 'primary' | 'tertiary' | 'secondary' | 'quaternary' = 'primary',
  ) => (
    <div className="p-space-lg rounded-2xl bg-surface-container-low shadow-lg flex flex-col gap-space-2xs">
      <span className="font-label-code text-label-code uppercase tracking-wider text-outline">{label}</span>
      <div className="flex items-end gap-space-xs">
        <span className={`font-display-hero text-[36px] leading-tight text-${color}`}>{valor}</span>
        {variacion && variacion.variacionPorcentual !== null && (
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

  const handlePageChange = (tipo: 'pelicula' | 'funcion' | 'producto', direction: 'prev' | 'next') => {
    const current = paginacion[tipo];
    if (!current) return;
    const newOffset = direction === 'next' ? current.offset + current.limit : Math.max(0, current.offset - current.limit);
    if (direction === 'prev' && current.offset === 0) return;
    if (direction === 'next' && !current.hasMore) return;
    setFiltro((f) => ({ ...f, offset: newOffset }));
  };

  return (
    <div className="p-space-xl flex flex-col gap-space-xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
        <div className="flex flex-col gap-space-2xs">
          <span className="px-space-xs py-0.5 rounded bg-primary/10 text-primary font-label-code text-label-code uppercase tracking-wider w-fit">CU05 • Datos reales</span>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Reportes de Ventas</h1>
        </div>
        <ReportesFiltros
          draft={filtroDraft}
          onDraftChange={setFiltroDraft}
          onAplicar={aplicarFiltro}
          onRestablecer={restablecerFiltro}
        />
      </div>

      {diasEnRango(filtro.desde, filtro.hasta) !== null && (
        <div className="rounded-lg bg-surface-container px-space-md py-space-sm font-body-sm text-body-sm text-on-surface-variant">
          Mostrando {filtro.desde} → {filtro.hasta} ({diasEnRango(filtro.desde, filtro.hasta)} días){' '}
          {serieTemporal.length > 0 && (
            <>• {serieTemporal.length} {filtro.agrupacion === 'mes' ? 'meses/mes' : filtro.agrupacion === 'semana' ? 'semanas/semana' : 'días'} con actividad</>
          )}{' '}
          • Período comparado: {diasEnRango(filtro.desde, filtro.hasta) ?? 7} días previos
        </div>
      )}

      {/* Skeleton loading state */}
      {cargando && (
        <>
          <KPIsGridSkeleton count={4} />
          <ChartSkeleton titulo="Tendencia de monto recaudado" />
          <ChartSkeleton titulo="Entradas vendidas por periodo" />
          <TablaSkeleton filas={5} columnas={4} />
          <TablaSkeleton filas={5} columnas={6} />
          <TablaSkeleton filas={5} columnas={3} />
          <TablaSkeleton filas={5} columnas={3} />
          <TablaSkeleton filas={5} columnas={4} />
        </>
      )}

      {!cargando && dashboard && resumen && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-space-md">
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
          {renderKPI(
            'Productos vendidos',
            String(porProducto.reduce((acc, p) => acc + p.cantidadVendida, 0)),
            {
              actual: porProducto.reduce((acc, p) => acc + p.cantidadVendida, 0),
              anterior: 0,
              variacionPorcentual: null,
            },
            'quaternary',
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

      <ReportesInsights
        insumos={{ resumen, dashboard, porPelicula, serieTemporal, porMetodoPago, porPromocion }}
      />

      {serieTemporal.length > 0 && (
        <ReportesChart
          data={serieTemporal}
          tipo="combinado"
          titulo="Evolución de Ventas: Monto (Bs) + Entradas"
        />
      )}

      <div className="flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Ventas por película</h2>
          {paginacion.pelicula && (
            <div className="flex items-center gap-space-sm">
              <button
                onClick={() => handlePageChange('pelicula', 'prev')}
                disabled={paginacion.pelicula.offset === 0}
                className="h-8 px-space-sm rounded-lg bg-surface-container text-on-surface font-body-sm text-body-sm outline-none shadow-inner disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Página {Math.floor(paginacion.pelicula.offset / paginacion.pelicula.limit) + 1} de {Math.ceil(paginacion.pelicula.total / paginacion.pelicula.limit)}
              </span>
              <button
                onClick={() => handlePageChange('pelicula', 'next')}
                disabled={!paginacion.pelicula.hasMore}
                className="h-8 px-space-sm rounded-lg bg-surface-container text-on-surface font-body-sm text-body-sm outline-none shadow-inner disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
        <ReportesTablaPelicula filas={porPelicula} />

        <div className="flex items-center justify-between">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Ventas por función</h2>
          {paginacion.funcion && (
            <div className="flex items-center gap-space-sm">
              <button
                onClick={() => handlePageChange('funcion', 'prev')}
                disabled={paginacion.funcion.offset === 0}
                className="h-8 px-space-sm rounded-lg bg-surface-container text-on-surface font-body-sm text-body-sm outline-none shadow-inner disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Página {Math.floor(paginacion.funcion.offset / paginacion.funcion.limit) + 1} de {Math.ceil(paginacion.funcion.total / paginacion.funcion.limit)}
              </span>
              <button
                onClick={() => handlePageChange('funcion', 'next')}
                disabled={!paginacion.funcion.hasMore}
                className="h-8 px-space-sm rounded-lg bg-surface-container text-on-surface font-body-sm text-body-sm outline-none shadow-inner disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
        <ReportesTablaFuncion filas={porFuncion} />

        <div className="flex items-center justify-between">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Ventas por producto (dulcería)</h2>
          {paginacion.producto && (
            <div className="flex items-center gap-space-sm">
              <button
                onClick={() => handlePageChange('producto', 'prev')}
                disabled={paginacion.producto.offset === 0}
                className="h-8 px-space-sm rounded-lg bg-surface-container text-on-surface font-body-sm text-body-sm outline-none shadow-inner disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Página {Math.floor(paginacion.producto.offset / paginacion.producto.limit) + 1} de {Math.ceil(paginacion.producto.total / paginacion.producto.limit)}
              </span>
              <button
                onClick={() => handlePageChange('producto', 'next')}
                disabled={!paginacion.producto.hasMore}
                className="h-8 px-space-sm rounded-lg bg-surface-container text-on-surface font-body-sm text-body-sm outline-none shadow-inner disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
        <ReportesTablaProducto filas={porProducto} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-md">
          <ReportesCardMetodoPago filas={porMetodoPago} />
          <ReportesCardPromocion filas={porPromocion} />
        </div>
      </div>
    </div>
  );
};