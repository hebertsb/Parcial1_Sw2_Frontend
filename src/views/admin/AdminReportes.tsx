import { useEffect, useMemo, useState } from 'react';
import { ShoppingCart, Banknote, Ticket, Popcorn, Info } from 'lucide-react';
import { useAuth } from '../../controllers/AuthContext';
import { useToast } from '../../hooks/useToast';
import { useDebounce, useLocalStorage } from '../../hooks/useDebounce';
import { diasEnRango } from '../../core/reportes.utils';
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
  
  // Claves para localStorage
  const STORAGE_KEY_FILTRO = 'admin-reportes-filtro';
  const STORAGE_KEY_PAGINACION = 'admin-reportes-paginacion';
  
  // Cargar filtro inicial desde localStorage
  const [filtroGuardado] = useLocalStorage<RangoFechas>(STORAGE_KEY_FILTRO, {
    agrupacion: 'dia',
    limit: 50,
    offset: 0,
  });
  
  // Estado de paginación con persistencia
  const [paginacionGuardada] = useLocalStorage<{
    pelicula: { limit: number; offset: number };
    funcion: { limit: number; offset: number };
    producto: { limit: number; offset: number };
  }>(STORAGE_KEY_PAGINACION, {
    pelicula: { limit: 50, offset: 0 },
    funcion: { limit: 50, offset: 0 },
    producto: { limit: 50, offset: 0 },
  });
  
  const [filtro, setFiltro] = useState<RangoFechas>(filtroGuardado);
  const [filtroDraft, setFiltroDraft] = useState<RangoFechas>({
    agrupacion: 'dia',
    limit: 50,
    offset: 0,
  });
  
  // Debounce para filtroDraft (evita requests en cada keystroke)
  const filtroDraftDebounced = useDebounce(filtroDraft, 300);
  
  // Persistir filtro en localStorage cuando cambia
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FILTRO, JSON.stringify(filtro));
  }, [filtro]);
  
  // Persistir paginación en localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PAGINACION, JSON.stringify(paginacionGuardada));
  }, [paginacionGuardada]);
  
  // Sincronizar paginación con estado guardado
  useEffect(() => {
    if (paginacionGuardada.pelicula) {
      setFiltro(f => ({ ...f, limit: paginacionGuardada.pelicula.limit, offset: paginacionGuardada.pelicula.offset }));
    }
  }, [paginacionGuardada]);
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
  // Filtro cliente para "Detalle" en la tabla de película: no hay ruta de
  // detalle de película, así que reutilizamos `porFuncion` (mismos títulos).
  const [peliculaSeleccionada, setPeliculaSeleccionada] = useState<string | null>(null);
  const toggleDetallePelicula = (titulo: string) => {
    setPeliculaSeleccionada((actual) => (actual === titulo ? null : titulo));
  };
  const funcionesFiltradas = useMemo(
    () => (peliculaSeleccionada ? porFuncion.filter((f) => f.titulo === peliculaSeleccionada) : porFuncion),
    [porFuncion, peliculaSeleccionada],
  );

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

  // Aplicar filtro draft usando debounced value para evitar requests en cada keystroke
  useEffect(() => {
    if (filtroDraftDebounced) {
      setFiltro(filtroDraftDebounced);
    }
  }, [filtroDraftDebounced]);

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

  const aplicarFiltro = () => {
    setFiltro((f) => ({ ...f, ...filtroDraftDebounced, offset: 0 }));
  };

  const restablecerFiltro = () => {
    const defaults: RangoFechas = {
      agrupacion: 'dia',
      limit: 50,
      offset: 0,
    };
    setFiltroDraft(defaults);
    setFiltro(defaults);
  };

  type ColorKPI = 'primary' | 'tertiary' | 'secondary' | 'quaternary';
  const ICONOS_KPI: Record<ColorKPI, typeof ShoppingCart> = {
    primary: ShoppingCart,
    tertiary: Banknote,
    secondary: Ticket,
    quaternary: Popcorn,
  };
  // Clases completas y literales (no interpoladas) para que Tailwind las detecte en build.
  const TILE_KPI: Record<ColorKPI, string> = {
    primary: 'bg-primary/15 text-primary',
    tertiary: 'bg-tertiary/15 text-tertiary',
    secondary: 'bg-secondary/15 text-secondary',
    quaternary: 'bg-quaternary/15 text-quaternary',
  };

  const renderKPI = (
    label: string,
    valor: string,
    footer: string,
    variacion?: DashboardMetrica,
    color: ColorKPI = 'primary',
  ) => {
    const tooltipText = variacion
      ? variacion.variacionPorcentual !== null
        ? `${variacion.variacionPorcentual.startsWith('-') ? '▼' : '▲'} ${variacion.variacionPorcentual}% vs período anterior (${variacion.anterior.toLocaleString()})`
        : `vs período anterior: ${variacion.anterior.toLocaleString()}`
      : 'Sin datos de comparación';
    const Icono = ICONOS_KPI[color];
    const subio = variacion?.variacionPorcentual != null && !variacion.variacionPorcentual.startsWith('-');

    return (
      <div className="p-space-lg rounded-2xl bg-surface-container-low shadow-lg flex flex-col gap-space-sm relative group">
        <div className="flex items-start justify-between">
          <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${TILE_KPI[color]}`}>
            <Icono className="w-5 h-5" />
          </span>
          {variacion && variacion.variacionPorcentual !== null && (
            <span
              className={`px-space-xs py-0.5 rounded-full font-label-md text-label-md flex items-center gap-space-2xs ${
                subio ? 'bg-tertiary/15 text-tertiary' : 'bg-error/15 text-error'
              }`}
            >
              {subio ? '↑' : '↓'} {variacion.variacionPorcentual.replace('-', '')}%
            </span>
          )}
        </div>
        <div className="flex flex-col gap-space-2xs">
          <span className="font-label-code text-label-code uppercase tracking-wider text-outline">{label}</span>
          <span className={`font-display-hero text-[32px] leading-tight text-on-surface`}>{valor}</span>
          <span className="font-body-xs text-body-xs text-on-surface-variant">{footer}</span>
        </div>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-surface-container-high text-on-surface rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
          {tooltipText}
        </div>
      </div>
    );
  };

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
          <span className="px-space-xs py-0.5 rounded bg-primary/10 text-primary font-label-code text-label-code uppercase tracking-wider w-fit">Datos reales</span>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Reportes de Ventas</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Análisis del rendimiento comercial del cine y toma de decisiones
          </p>
        </div>
        <ReportesFiltros
          draft={filtroDraft}
          onDraftChange={setFiltroDraft}
          onAplicar={aplicarFiltro}
          onRestablecer={restablecerFiltro}
        />
      </div>

      {diasEnRango(filtro.desde, filtro.hasta) !== null && (
        <div className="entrada-suave rounded-lg bg-surface-container px-space-md py-space-sm font-body-sm text-body-sm text-on-surface-variant">
          Mostrando {filtro.desde} → {filtro.hasta} ({diasEnRango(filtro.desde, filtro.hasta)} días){' '}
          {serieTemporal.length > 0 && (
            <>• {serieTemporal.length} {filtro.agrupacion === 'mes' ? 'meses/mes' : filtro.agrupacion === 'semana' ? 'semanas/semana' : 'días'} con actividad</>
          )}{' '}
          • Período comparado: {diasEnRango(filtro.desde, filtro.hasta) ?? 7} días previos
        </div>
      )}

      {/* V3 del mockup: conciliación — solo `estado='pagada'` entra en estos reportes. */}
      <div className="entrada-suave rounded-lg bg-secondary/10 border border-secondary/20 px-space-md py-space-sm flex flex-wrap items-center justify-between gap-space-sm">
        <div className="flex items-start gap-space-xs">
          <Info className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
          <p className="font-body-sm text-body-sm text-on-surface">
            <span className="font-label-md text-label-md text-secondary">Información de conciliación:</span>{' '}
            Las ventas pendientes o canceladas no se computan en la recaudación real. Todos los montos corresponden
            a operaciones pagadas y liquidadas.
          </p>
        </div>
        <span className="px-space-xs py-0.5 rounded bg-secondary/15 text-secondary font-label-code text-label-code uppercase tracking-wider whitespace-nowrap">
          CU05-RF08 compliant
        </span>
      </div>

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
        <div className="entrada-suave grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md">
          {renderKPI(
            'Ventas pagadas',
            String(resumen.totalVentas),
            `${resumen.totalVentas} transacción${resumen.totalVentas === 1 ? '' : 'es'} liquidada${resumen.totalVentas === 1 ? '' : 's'}`,
            dashboard.totalVentas,
            'primary',
          )}
          {renderKPI(
            'Monto recaudado',
            `${resumen.montoTotal} Bs`,
            'Ingreso neto cobrado en caja/online',
            dashboard.montoTotal,
            'tertiary',
          )}
          {renderKPI(
            'Entradas vendidas',
            String(resumen.cantidadEntradas),
            'Ocupación de butacas registradas',
            dashboard.cantidadEntradas,
            'secondary',
          )}
          {renderKPI(
            'Productos vendidos',
            String(porProducto.reduce((acc, p) => acc + p.cantidadVendida, 0)),
            'Unidades totales de confitería',
            undefined,
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

      <div className="entrada-suave">
        <ReportesInsights
          insumos={{ resumen, dashboard, porPelicula, serieTemporal, porMetodoPago, porPromocion }}
        />
      </div>

      {/* Fila de 3 módulos (V6 del mockup): evolución + métodos de pago + promociones. */}
      <div className="entrada-suave grid grid-cols-1 xl:grid-cols-3 gap-space-md items-stretch">
        {serieTemporal.length > 0 ? (
          <ReportesChart
            data={serieTemporal}
            tipo="combinado"
            titulo="Evolución de ventas"
          />
        ) : (
          <div className="rounded-2xl bg-surface-container-low shadow-lg p-space-xl text-center text-on-surface-variant">
            Sin datos para el rango seleccionado.
          </div>
        )}
        <ReportesCardMetodoPago filas={porMetodoPago} />
        <ReportesCardPromocion filas={porPromocion} />
      </div>

      {/* Tablas principales (V7 del mockup): película 7/12 + dulcería 5/12.
          `md:` (768px) — horizontal en tablet y desktop. */}
      <div className="entrada-suave grid grid-cols-1 md:grid-cols-12 gap-space-md items-start">
        <div className="md:col-span-7 flex flex-col gap-space-sm">
          {paginacion.pelicula && (
            <div className="flex items-center justify-end gap-space-sm">
              <button
                onClick={() => handlePageChange('pelicula', 'prev')}
                disabled={paginacion.pelicula.offset === 0}
                aria-label="Ir a la página anterior de ventas por película"
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
                aria-label="Ir a la página siguiente de ventas por película"
                className="h-8 px-space-sm rounded-lg bg-surface-container text-on-surface font-body-sm text-body-sm outline-none shadow-inner disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          )}
          <ReportesTablaPelicula
            filas={porPelicula}
            peliculaSeleccionada={peliculaSeleccionada}
            onDetalle={toggleDetallePelicula}
          />
        </div>
        <div className="md:col-span-5 flex flex-col gap-space-sm">
          {paginacion.producto && (
            <div className="flex items-center justify-end gap-space-sm">
              <button
                onClick={() => handlePageChange('producto', 'prev')}
                disabled={paginacion.producto.offset === 0}
                aria-label="Ir a la página anterior de ventas de productos"
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
                aria-label="Ir a la página siguiente de ventas de productos"
                className="h-8 px-space-sm rounded-lg bg-surface-container text-on-surface font-body-sm text-body-sm outline-none shadow-inner disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          )}
          <ReportesTablaProducto filas={porProducto} />
        </div>
      </div>

      {/* Sin equivalente directo en el mockup: se deja como detalle adicional,
          filtrable desde "Detalle" en la tabla de película de arriba. */}
      <div className="entrada-suave flex flex-col gap-space-sm">
        <div className="flex items-center justify-between flex-wrap gap-space-sm">
          <div className="flex items-center gap-space-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Ventas por función</h2>
            {peliculaSeleccionada && (
              <span className="flex items-center gap-space-xs px-space-sm py-0.5 rounded-full bg-primary/10 text-primary font-label-md text-label-md">
                {peliculaSeleccionada}
                <button type="button" onClick={() => setPeliculaSeleccionada(null)} aria-label="Quitar filtro de película" className="hover:opacity-70">
                  ×
                </button>
              </span>
            )}
          </div>
          {paginacion.funcion && (
            <div className="flex items-center gap-space-sm">
              <button
                onClick={() => handlePageChange('funcion', 'prev')}
                disabled={paginacion.funcion.offset === 0}
                aria-label="Ir a la página anterior de ventas por función"
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
                aria-label="Ir a la página siguiente de ventas por función"
                className="h-8 px-space-sm rounded-lg bg-surface-container text-on-surface font-body-sm text-body-sm outline-none shadow-inner disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
        <ReportesTablaFuncion filas={funcionesFiltradas} />
      </div>
    </div>
  );
};