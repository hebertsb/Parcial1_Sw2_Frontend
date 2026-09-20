import type { CineState } from '../../controllers/cine.reducer';

/**
 * Huella de lo que el cliente eligió (función + butacas + dulcería). La venta pendiente de pago guarda la huella de cuando se creó:
 * si al volver a pagar la huella cambió (el cliente movió butacas o sacó un producto), esa venta ya no corresponde a lo que ve en
 * pantalla y NO se cobra — se cancela y se crea otra. Así nunca se paga un total distinto al que se está mirando.
 */
export function firmaDeCompra(cine: Pick<CineState, 'funcionSeleccionada' | 'butacasSeleccionadas' | 'candyBarSeleccionado'>): string {
  const butacas = cine.butacasSeleccionadas.map((b) => b.idAsiento).sort((a, b) => a - b);
  const dulceria = cine.candyBarSeleccionado.map((i) => `${i.id}x${i.cantidad}`).sort();
  return `${cine.funcionSeleccionada?.idFuncion ?? 0}|${butacas.join(',')}|${dulceria.join(',')}`;
}
