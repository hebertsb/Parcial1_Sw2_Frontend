import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import type { SerieTemporalPunto } from '../../core/types/reporte.types';

interface ChartProps {
  data: SerieTemporalPunto[];
  tipo: 'linea' | 'barras' | 'combinado';
  metrica?: 'montoTotal' | 'cantidadEntradas' | 'totalVentas';
  titulo: string;
}

const METRICA_LABELS: Record<string, string> = {
  montoTotal: 'Monto (Bs)',
  cantidadEntradas: 'Entradas',
  totalVentas: 'Ventas',
};

const METRICA_FORMATTER: Record<string, (value: number) => string> = {
  montoTotal: (v) => `${Number(v).toLocaleString()} Bs`,
  cantidadEntradas: (v) => v.toLocaleString(),
  totalVentas: (v) => v.toLocaleString(),
};

const COLORS = {
  montoTotal: 'var(--color-primary)',
  cantidadEntradas: 'var(--color-secondary)',
};

export const ReportesChart = ({ data, tipo, metrica, titulo }: ChartProps) => {
  if (!data.length) {
    return (
      <div className="rounded-2xl bg-surface-container-low shadow-lg p-space-xl text-center text-on-surface-variant">
        Sin datos para el rango seleccionado.
      </div>
    );
  }

  const chartData = data.map((d) => ({
    fecha: d.fecha.slice(0, 10),
    montoTotal: Number(d.montoTotal),
    cantidadEntradas: d.cantidadEntradas,
    totalVentas: d.totalVentas,
  }));

  // Modo combinado: dual axis (monto + entradas)
  if (tipo === 'combinado') {
    return (
      <div className="rounded-2xl bg-surface-container-low shadow-lg p-space-lg h-full flex flex-col">
        <div className="flex flex-wrap items-center justify-between gap-space-xs mb-space-md">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">{titulo}</h3>
          <div className="flex items-center gap-space-md font-body-xs text-body-xs text-on-surface-variant">
            <span className="flex items-center gap-space-2xs">
              <span className="w-2 h-2 rounded-full" style={{ background: COLORS.montoTotal }} />
              Monto (Bs)
            </span>
            <span className="flex items-center gap-space-2xs">
              <span className="w-2 h-2 rounded-full" style={{ background: COLORS.cantidadEntradas }} />
              Entradas
            </span>
          </div>
        </div>
        <div className="h-[260px] flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
              <YAxis
                yAxisId="left"
                orientation="left"
                tick={{ fontSize: 11 }}
                width={40}
                tickFormatter={(v) => Number(v).toLocaleString()}
              />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} width={32} />
              <Tooltip
                formatter={(value, name) => {
                  if (name === 'montoTotal') return [METRICA_FORMATTER.montoTotal(value), 'Monto'];
                  if (name === 'cantidadEntradas') return [METRICA_FORMATTER.cantidadEntradas(value), 'Entradas'];
                  return [value, name];
                }}
                labelFormatter={(fecha) => fecha}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="montoTotal"
                stroke={COLORS.montoTotal}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
                name="montoTotal"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="cantidadEntradas"
                stroke={COLORS.cantidadEntradas}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
                strokeDasharray="5 5"
                name="cantidadEntradas"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // Modos simples: linea o barras
  const label = METRICA_LABELS[metrica ?? 'montoTotal'] ?? metrica;
  const formatter = METRICA_FORMATTER[metrica ?? 'montoTotal'] ?? ((v) => String(v));

  const simpleChartData = data.map((d) => ({
    fecha: d.fecha.slice(0, 10),
    valor: metrica === 'montoTotal' ? Number(d.montoTotal) : d[metrica ?? 'montoTotal'],
  }));

  return (
    <div className="rounded-2xl bg-surface-container-low shadow-lg p-space-lg">
      <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-md">{titulo}</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          {tipo === 'linea' ? (
            <LineChart data={simpleChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={formatter} />
              <Tooltip formatter={formatter} labelFormatter={(fecha) => fecha} />
              <Line
                type="monotone"
                dataKey="valor"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          ) : (
            <BarChart data={simpleChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={formatter} />
              <Tooltip formatter={formatter} labelFormatter={(fecha) => fecha} />
              <Bar dataKey="valor" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};