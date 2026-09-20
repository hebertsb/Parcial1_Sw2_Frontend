import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import type { SerieTemporalPunto } from '../../core/types/reporte.types';

interface ChartProps {
  data: SerieTemporalPunto[];
  tipo: 'linea' | 'barras';
  metrica: 'montoTotal' | 'cantidadEntradas' | 'totalVentas';
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

export const ReportesChart = ({ data, tipo, metrica, titulo }: ChartProps) => {
  if (!data.length) {
    return (
      <div className="rounded-2xl bg-surface-container-low shadow-lg p-space-xl text-center text-on-surface-variant">
        Sin datos para el rango seleccionado.
      </div>
    );
  }

  const label = METRICA_LABELS[metrica] ?? metrica;
  const formatter = METRICA_FORMATTER[metrica] ?? ((v) => String(v));

  const chartData = data.map((d) => ({
    fecha: d.fecha.slice(0, 10),
    valor: metrica === 'montoTotal' ? Number(d.montoTotal) : d[metrica],
  }));

  return (
    <div className="rounded-2xl bg-surface-container-low shadow-lg p-space-lg">
      <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-md">{titulo}</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          {tipo === 'linea' ? (
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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