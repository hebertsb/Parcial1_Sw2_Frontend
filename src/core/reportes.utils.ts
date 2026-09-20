import type {
  ResumenVentas,
  DashboardResponse,
  ReportePorPelicula,
  SerieTemporalPunto,
  ReportePorMetodoPago,
  ReportePorPromocion,
} from './types/reporte.types';

/**
 * Lógica pura de la vista de reportes (presets de fecha, % de participación,
 * insights narrativos). Sin React: así se puede testear con `node --test`
 * sin levantar la app (ver `tests/reportes.utils.test.ts`).
 */

/** `Date` → `YYYY-MM-DD` en hora local (evita el corrimiento de `toISOString`/UTC). */
export function isoDe(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

function inicioDelDia(fecha: Date): Date {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
}

export type PresetRapido = 'hoy' | 'ayer' | 'semana' | 'mes' | 'mes-anterior';

export interface RangoPreset {
  desde?: string;
  hasta?: string;
}

const MS_DIA = 24 * 60 * 60 * 1000;

/** Deriva el rango `desde`/`hasta` de un filtro rápido. `hoy` inyectable para testear. */
export function rangoDesdePreset(preset: PresetRapido, hoy: Date = new Date()): RangoPreset {
  const base = inicioDelDia(hoy);
  switch (preset) {
    case 'hoy':
      return { desde: isoDe(base), hasta: isoDe(base) };
    case 'ayer': {
      const ayer = new Date(base.getTime() - MS_DIA);
      return { desde: isoDe(ayer), hasta: isoDe(ayer) };
    }
    case 'semana': {
      // getDay(): 0=domingo…6=sábado. Normalizo para que lunes sea 0.
      const desdeLunes = (base.getDay() + 6) % 7;
      const lunes = new Date(base.getTime() - desdeLunes * MS_DIA);
      return { desde: isoDe(lunes), hasta: isoDe(base) };
    }
    case 'mes': {
      const primero = new Date(base.getFullYear(), base.getMonth(), 1);
      return { desde: isoDe(primero), hasta: isoDe(base) };
    }
    case 'mes-anterior': {
      const primero = new Date(base.getFullYear(), base.getMonth() - 1, 1);
      const ultimo = new Date(base.getFullYear(), base.getMonth(), 0);
      return { desde: isoDe(primero), hasta: isoDe(ultimo) };
    }
  }
}

/**
 * Calcula el % del total de cada fila. Con total 0 (o sin filas) devuelve share 0,
 * nunca `NaN`/`Infinity`. Los shares suman ~100 cuando hay datos.
 */
export function calcularShare<T>(
  filas: readonly T[],
  getValor: (fila: T) => number,
): (T & { share: number })[] {
  const total = filas.reduce((acc, fila) => acc + (Number(getValor(fila)) || 0), 0);
  if (total <= 0) return filas.map((fila) => ({ ...fila, share: 0 }));
  return filas.map((fila) => ({
    ...fila,
    share: ((Number(getValor(fila)) || 0) / total) * 100,
  }));
}

/** Cantidad de días (inclusivos) entre `desde` y `hasta`. `null` si falta rango o está invertido. */
export function diasEnRango(desde?: string, hasta?: string): number | null {
  if (!desde || !hasta) return null;
  const desdeFecha = new Date(`${desde}T00:00:00`).getTime();
  const hastaFecha = new Date(`${hasta}T00:00:00`).getTime();
  if (Number.isNaN(desdeFecha) || Number.isNaN(hastaFecha) || hastaFecha < desdeFecha) return null;
  return Math.round((hastaFecha - desdeFecha) / MS_DIA) + 1;
}

export function formatearFechaLegible(iso?: string): string | null {
  if (!iso) return null;
  const [anio, mes, dia] = iso.split('-').map(Number);
  if (!anio || !mes || !dia) return null;
  const nombres = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return `${dia} de ${nombres[mes - 1]} de ${anio}`;
}

export function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

const toNumber = (valor: string): number => Number(valor) || 0;

/** `Number()` seguro para montos en string: `null`/`NaN`/`undefined` → 0. */
export function toIntOrZero(valor: string | number | null | undefined): number {
  const num = Number(valor);
  return Number.isFinite(num) ? num : 0;
}

export interface InsumosInsights {
  resumen: ResumenVentas | null;
  dashboard: DashboardResponse | null;
  porPelicula: ReportePorPelicula[];
  serieTemporal: SerieTemporalPunto[];
  porMetodoPago: ReportePorMetodoPago[];
  porPromocion: ReportePorPromocion[];
}

export interface Insight {
  titulo: string;
  texto: string;
}

/**
 * Genera frases narrativas "Análisis del período" a partir de los datos reales
 * ya cargados (no LLM). Cada regla tiene guarda contra 0/null para no emitir
 * texto raro cuando no hay datos de sobra.
 */
export function generarInsights(insumos: InsumosInsights): Insight[] {
  const { resumen, dashboard, porPelicula, serieTemporal, porMetodoPago, porPromocion } = insumos;
  const insights: Insight[] = [];

  if (!resumen || (resumen.totalVentas === 0 && toNumber(resumen.montoTotal) === 0)) {
    return [{ titulo: 'Sin actividad', texto: 'No hay ventas pagadas en el período seleccionado.' }];
  }

  const monto = toNumber(resumen.montoTotal);
  const variacion = dashboard?.montoTotal.variacionPorcentual;

  if (variacion !== null && variacion !== undefined) {
    const num = Number(variacion) || 0;
    const direccion = num > 0 ? 'creció' : num < 0 ? 'bajó' : 'se mantuvo';
    const texto =
      num !== 0
        ? `La recaudación ${direccion} un ${Math.abs(num)}% respecto al período anterior.`
        : 'La recaudación se mantuvo igual que la del período anterior.';
    insights.push({ titulo: 'Recaudación', texto });
  } else {
    insights.push({
      titulo: 'Recaudación',
      texto: `Se recaudaron ${monto.toLocaleString()} Bs en el período.`,
    });
  }

  const topPelicula = [...porPelicula].sort(
    (a, b) => toNumber(b.montoTotal) - toNumber(a.montoTotal),
  )[0];
  if (topPelicula && toNumber(topPelicula.montoTotal) > 0) {
    insights.push({
      titulo: 'Top película',
      texto: `«${topPelicula.titulo}» lidera con ${topPelicula.totalVentas} venta${topPelicula.totalVentas === 1 ? '' : 's'} y ${toNumber(topPelicula.montoTotal).toLocaleString()} Bs recaudados.`,
    });
  }

  const pico = serieTemporal.reduce<SerieTemporalPunto | undefined>((max, punto) => {
    if (!max || toNumber(punto.montoTotal) > toNumber(max.montoTotal)) return punto;
    return max;
  }, undefined);
  if (pico && toNumber(pico.montoTotal) > 0) {
    const fecha = formatearFechaLegible(pico.fecha.slice(0, 10));
    insights.push({
      titulo: 'Día pico',
      texto: `El mejor día fue ${fecha ? `el ${fecha}` : 'del período'} con ${toNumber(pico.montoTotal).toLocaleString()} Bs.`,
    });
  }

  if (porMetodoPago.length > 0) {
    const conShare = calcularShare(porMetodoPago, (fila) => toNumber(fila.montoTotal));
    const dominante = conShare.reduce((max, fila) => (
      fila.share > max.share ? fila : max
    ), conShare[0]);
    if (dominante && dominante.share > 0) {
      insights.push({
        titulo: 'Forma de cobro',
        texto: `«${capitalizar(dominante.metodoPago)}» concentró el ${dominante.share.toFixed(1)}% del monto cobrado.`,
      });
    }
  }

  const topPromocion = [...porPromocion].sort((a, b) => b.totalVentas - a.totalVentas)[0];
  if (topPromocion && topPromocion.totalVentas > 0) {
    insights.push({
      titulo: 'Promociones',
      texto: `«${topPromocion.nombre}» se aplicó en ${topPromocion.totalVentas} venta${topPromocion.totalVentas === 1 ? '' : 's'} y descontó ${toNumber(topPromocion.montoDescuento).toLocaleString()} Bs en total.`,
    });
  }

  if (resumen.totalVentas > 0 && resumen.cantidadEntradas > 0) {
    insights.push({
      titulo: 'Ticketing',
      texto: `En promedio ${(resumen.cantidadEntradas / resumen.totalVentas).toFixed(1)} entradas por venta.`,
    });
  }

  return insights;
}