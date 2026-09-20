import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  rangoDesdePreset,
  calcularShare,
  diasEnRango,
  formatearFechaLegible,
  generarInsights,
} from '../src/core/reportes.utils';
import type { DashboardResponse, ResumenVentas } from '../src/core/types/reporte.types';

// Domingo 2026-09-20 (fijo para que los presets sean deterministas).
const HOY = new Date(2026, 8, 20);

test('rangoDesdePreset genera el rango correcto para cada preset', () => {
  assert.deepEqual(rangoDesdePreset('hoy', HOY), { desde: '2026-09-20', hasta: '2026-09-20' });
  assert.deepEqual(rangoDesdePreset('ayer', HOY), { desde: '2026-09-19', hasta: '2026-09-19' });
  // La semana arranca el lunes 14.
  assert.deepEqual(rangoDesdePreset('semana', HOY), { desde: '2026-09-14', hasta: '2026-09-20' });
  assert.deepEqual(rangoDesdePreset('mes', HOY), { desde: '2026-09-01', hasta: '2026-09-20' });
  assert.deepEqual(rangoDesdePreset('mes-anterior', HOY), { desde: '2026-08-01', hasta: '2026-08-31' });
});

test('calcularShare devuelve % que suman 100 y mantiene la fila original', () => {
  const filas = [
    { metodoPago: 'efectivo', montoTotal: '100.00' },
    { metodoPago: 'tarjeta', montoTotal: '300.00' },
  ];
  const conShare = calcularShare(filas, (fila) => Number(fila.montoTotal) || 0);

  assert.equal(conShare[0].share, 25);
  assert.equal(conShare[1].share, 75);
  assert.equal(conShare.reduce((acc, fila) => acc + fila.share, 0), 100);
  assert.equal(conShare[0].metodoPago, 'efectivo');
});

test('calcularShare con total 0 o sin filas devuelve share 0, no NaN/Infinity', () => {
  assert.deepEqual(
    calcularShare([{ nombre: 'A', totalVentas: 0 }], (fila) => fila.totalVentas),
    [{ nombre: 'A', totalVentas: 0, share: 0 }],
  );
  assert.deepEqual(calcularShare([], (fila) => fila.totalVentas), []);
});

test('diasEnRango cuenta días inclusivos y maneja rangos vacíos/invertidos', () => {
  assert.equal(diasEnRango('2026-09-01', '2026-09-20'), 20);
  assert.equal(diasEnRango('2026-09-20', '2026-09-20'), 1);
  assert.equal(diasEnRango(), null);
  assert.equal(diasEnRango('2026-09-20', '2026-09-01'), null);
});

test('formatearFechaLegible convierte ISO a texto', () => {
  assert.equal(formatearFechaLegible('2026-09-15'), '15 de septiembre de 2026');
  assert.equal(formatearFechaLegible(undefined), null);
});

test('generarInsights refleja los datos reales del rango', () => {
  const resumen: ResumenVentas = { totalVentas: 10, montoTotal: '1000.00', cantidadEntradas: 20 };
  const dashboard: DashboardResponse = {
    montoTotal: { actual: 1000, anterior: 500, variacionPorcentual: '100.0' },
    totalVentas: { actual: 10, anterior: 6, variacionPorcentual: '66.7' },
    cantidadEntradas: { actual: 20, anterior: 18, variacionPorcentual: '11.1' },
  };
  const insights = generarInsights({
    resumen,
    dashboard,
    porPelicula: [
      { idPelicula: 1, titulo: 'Inception', totalVentas: 6, montoTotal: '600.00', cantidadEntradas: 12 },
      { idPelicula: 2, titulo: 'Dune', totalVentas: 4, montoTotal: '400.00', cantidadEntradas: 8 },
    ],
    serieTemporal: [
      { fecha: '2026-09-15T00:00:00.000Z', totalVentas: 8, montoTotal: '800.00', cantidadEntradas: 16 },
      { fecha: '2026-09-13T00:00:00.000Z', totalVentas: 2, montoTotal: '200.00', cantidadEntradas: 4 },
    ],
    porMetodoPago: [
      { metodoPago: 'efectivo', totalVentas: 7, montoTotal: '700.00' },
      { metodoPago: 'tarjeta', totalVentas: 3, montoTotal: '300.00' },
    ],
    porPromocion: [
      { idPromocion: 1, nombre: '2x1 martes', tipoDescuento: 'porcentaje', totalVentas: 4, montoDescuento: '120.00' },
    ],
  });

  const texto = insights.map((i) => i.texto).join('\n');
  assert.match(texto, /creció un 100%/);
  assert.match(texto, /«Inception»/);
  assert.match(texto, /15 de septiembre de 2026/);
  assert.match(texto, /«Efectivo» concentró el 70\.0%/);
  assert.match(texto, /«2x1 martes» se aplicó en 4 ventas/);
  assert.match(texto, /En promedio 2\.0 entradas por venta/);
});

test('generarInsights con anterior en 0 no divide por cero y describe el monto', () => {
  const resumen: ResumenVentas = { totalVentas: 3, montoTotal: '90.00', cantidadEntradas: 3 };
  const dashboard: DashboardResponse = {
    montoTotal: { actual: 90, anterior: 0, variacionPorcentual: null },
    totalVentas: { actual: 3, anterior: 0, variacionPorcentual: null },
    cantidadEntradas: { actual: 3, anterior: 0, variacionPorcentual: null },
  };
  const insights = generarInsights({
    resumen,
    dashboard,
    porPelicula: [],
    serieTemporal: [],
    porMetodoPago: [],
    porPromocion: [],
  });

  assert.equal(insights.length, 2); // Recaudación (con monto) + Ticketing
  assert.match(insights[0].texto, /Se recaudaron 90 Bs en el período/);
});

test('generarInsights sin ventas devuelve un único insight de "sin actividad"', () => {
  const resumen: ResumenVentas = { totalVentas: 0, montoTotal: '0.00', cantidadEntradas: 0 };
  const insights = generarInsights({
    resumen,
    dashboard: null,
    porPelicula: [],
    serieTemporal: [],
    porMetodoPago: [],
    porPromocion: [],
  });

  assert.equal(insights.length, 1);
  assert.equal(insights[0].titulo, 'Sin actividad');
});