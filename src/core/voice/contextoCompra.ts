import type { CineState } from '../../controllers/cine.reducer';
import type { ContextoCompra } from './voiceProtocol';

const VACIO: ContextoCompra = { idPelicula: null, idFuncion: null, asientos: [], dulceria: [] };

/**
 * Lo que el cliente tiene marcado en la pantalla, solo con ids: se le manda al agente para que sepa lo que se marco TOCANDO
 * (y pueda contestar "¿que pelicula tengo seleccionada?" o sacarla con "eliminame la pelicula"). Ver estado_compra.py.
 *
 * Una compra ya PAGADA no cuenta: su pelicula y butacas siguen en pantalla solo para mostrar la entrada digital, y si el agente las
 * tomara por una compra nueva "resucitaria" lo que acaba de terminar.
 */
export function contextoDeCine(
  cine: Pick<CineState, 'peliculaSeleccionada' | 'funcionSeleccionada' | 'butacasSeleccionadas' | 'candyBarSeleccionado' | 'estadoCompra' | 'ventaCreada'>,
): ContextoCompra {
  if (cine.estadoCompra === 'completado' || cine.ventaCreada) return VACIO;
  return {
    idPelicula: cine.peliculaSeleccionada?.idPelicula ?? null,
    idFuncion: cine.funcionSeleccionada?.idFuncion ?? null,
    asientos: cine.butacasSeleccionadas.map((b) => ({ id: b.id, idAsiento: b.idAsiento })),
    dulceria: cine.candyBarSeleccionado
      .map((item) => ({ idProducto: Number(item.id), cantidad: item.cantidad }))
      .filter((item) => Number.isInteger(item.idProducto) && item.idProducto > 0),
  };
}
