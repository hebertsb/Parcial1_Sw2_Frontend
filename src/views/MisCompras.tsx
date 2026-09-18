import { useEffect, useState } from 'react';
import { useAuth } from '../controllers/AuthContext';
import { listarMisCompras, obtenerVenta } from '../api/ventas.api';
import type { VentaConFuncion, VentaConDetalle, EstadoVenta } from '../core/types/venta.types';
import { posterFor } from '../core/posters';

const ESTADO_LABEL: Record<EstadoVenta, string> = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  pendiente_pago: 'Pendiente de pago',
  pagada: 'Pagada',
  anulada: 'Anulada',
  cancelada: 'Cancelada',
};

const ESTADO_COLOR: Record<EstadoVenta, string> = {
  pendiente: 'bg-surface-container-highest text-on-surface-variant',
  confirmada: 'bg-tertiary/10 text-tertiary',
  pendiente_pago: 'bg-primary/10 text-primary',
  pagada: 'bg-tertiary/10 text-tertiary',
  anulada: 'bg-error-container/40 text-on-error-container',
  cancelada: 'bg-error-container/40 text-on-error-container',
};

/**
 * RF04 / "mis compras" — historial de ventas del cliente logueado. `GET /ventas` ya
 * viene filtrado por rol (RF11, ver VentasController) y con `funcion`/`pelicula`/`sala`/
 * `promocion` resueltas (ver VentasService.listar) para no pedir nada más por fila. El
 * detalle asiento-a-asiento y de dulcería se pide recién al expandir una compra
 * (`GET /ventas/:id`), no de entrada para las N compras de la lista.
 */
export const MisCompras = () => {
  const { token } = useAuth();
  const [ventas, setVentas] = useState<VentaConFuncion[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [idExpandido, setIdExpandido] = useState<number | null>(null);
  const [detalle, setDetalle] = useState<VentaConDetalle | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelado = false;
    (async () => {
      setCargando(true);
      setError(null);
      try {
        const data = await listarMisCompras(token);
        if (!cancelado) setVentas(data);
      } catch (err) {
        console.error('No se pudieron cargar tus compras.', err);
        if (!cancelado) setError('No se pudo cargar tu historial de compras.');
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [token]);

  const toggleExpandir = async (venta: VentaConFuncion) => {
    if (idExpandido === venta.idVenta) {
      setIdExpandido(null);
      setDetalle(null);
      return;
    }
    if (!token) return;
    setIdExpandido(venta.idVenta);
    setDetalle(null);
    setCargandoDetalle(true);
    try {
      const d = await obtenerVenta(venta.idVenta, token);
      setDetalle(d);
    } catch (err) {
      console.error('No se pudo cargar el detalle de la compra.', err);
    } finally {
      setCargandoDetalle(false);
    }
  };

  return (
    <div className="w-full px-space-lg py-space-xl max-w-4xl mx-auto flex flex-col gap-space-lg">
      <div className="flex flex-col gap-space-2xs">
        <span className="px-space-xs py-0.5 rounded bg-primary/10 text-primary font-label-code text-label-code uppercase tracking-wider w-fit">Mis compras</span>
        <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Historial de compras</h1>
      </div>

      {cargando && <p className="font-label-md text-label-md text-on-surface-variant">Cargando tus compras...</p>}
      {error && <p className="font-body-sm text-body-sm text-error">{error}</p>}
      {!cargando && !error && ventas.length === 0 && (
        <p className="font-label-md text-label-md text-on-surface-variant">Todavía no compraste ninguna entrada.</p>
      )}

      <div className="flex flex-col gap-space-md">
        {ventas.map((venta) => {
          const expandido = idExpandido === venta.idVenta;
          return (
            <div key={venta.idVenta} className="rounded-2xl bg-surface-container-low shadow-lg overflow-hidden">
              <button
                onClick={() => void toggleExpandir(venta)}
                className="w-full flex items-center gap-space-md p-space-md text-left hover:bg-surface-container transition-colors"
              >
                <img
                  src={venta.funcion.pelicula.posterUrl ?? posterFor(venta.funcion.pelicula.idPelicula)}
                  alt=""
                  className="w-16 h-24 object-cover rounded-lg shadow-md shrink-0"
                />
                <div className="flex-1 flex flex-col gap-space-2xs min-w-0">
                  <span className="font-headline-sm text-headline-sm text-on-surface line-clamp-1">{venta.funcion.pelicula.titulo}</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    {venta.funcion.fecha} · {venta.funcion.horaInicio.slice(0, 5)} · {venta.funcion.sala.nombre}
                  </span>
                  <span className="font-label-code text-label-code text-on-surface-variant">
                    Compra #{venta.idVenta} · {new Date(venta.fechaHora).toLocaleDateString('es-BO')}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-space-2xs shrink-0">
                  <span className={`px-space-xs py-0.5 rounded font-label-code text-label-code ${ESTADO_COLOR[venta.estado] ?? 'bg-surface-container-highest text-on-surface-variant'}`}>
                    {ESTADO_LABEL[venta.estado] ?? venta.estado}
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">{Number(venta.total).toFixed(2)} Bs</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant">{expandido ? 'expand_less' : 'expand_more'}</span>
              </button>

              {expandido && (
                <div className="px-space-md pb-space-md border-t border-surface-container">
                  {cargandoDetalle ? (
                    <p className="font-body-sm text-body-sm text-on-surface-variant pt-space-sm">Cargando detalle...</p>
                  ) : detalle && detalle.idVenta === venta.idVenta ? (
                    <div className="pt-space-sm flex flex-col gap-space-sm">
                      <div className="flex flex-col gap-space-2xs">
                        <span className="font-label-code text-label-code uppercase text-on-surface-variant">Asientos</span>
                        <span className="font-body-sm text-body-sm text-on-surface">
                          {detalle.detalleEntradas.length > 0
                            ? detalle.detalleEntradas.map((d) => `${d.asiento.fila}${d.asiento.numero}`).join(', ')
                            : '—'}
                        </span>
                      </div>

                      {detalle.detalleDulceria.length > 0 && (
                        <div className="flex flex-col gap-space-2xs">
                          <span className="font-label-code text-label-code uppercase text-on-surface-variant">Dulcería</span>
                          {detalle.detalleDulceria.map((d) => (
                            <span key={d.idDetalle} className="font-body-sm text-body-sm text-on-surface">
                              {d.cantidad}x {d.producto.nombre} — {(Number(d.precioUnitario) * d.cantidad).toFixed(2)} Bs
                            </span>
                          ))}
                        </div>
                      )}

                      {detalle.promocion && (
                        <span className="font-body-sm text-body-sm text-tertiary">Promoción aplicada: {detalle.promocion.nombre}</span>
                      )}

                      <div className="flex items-center justify-between pt-space-2xs">
                        <span className="font-body-sm text-body-sm text-on-surface-variant">Subtotal: {Number(detalle.subtotal).toFixed(2)} Bs</span>
                        {Number(detalle.descuentoAplicado) > 0 && (
                          <span className="font-body-sm text-body-sm text-tertiary">− {Number(detalle.descuentoAplicado).toFixed(2)} Bs descuento</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="font-body-sm text-body-sm text-error pt-space-sm">No se pudo cargar el detalle.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
