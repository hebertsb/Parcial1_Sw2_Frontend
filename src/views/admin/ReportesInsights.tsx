import { Zap } from 'lucide-react';
import { generarInsights, type InsumosInsights } from '../../core/reportes.utils';

/** Emoji por tipo de insight — puramente decorativo, `generarInsights` no lo conoce. */
const EMOJI_POR_TITULO: Record<string, string> = {
  Recaudación: '💡',
  'Top película': '🎬',
  'Día pico': '📈',
  'Forma de cobro': '💳',
  Promociones: '🏷️',
  Ticketing: '🎟️',
  'Sin actividad': 'ℹ️',
};

/** CU05/RF08 — "Análisis del período & Insights": frases derivadas de los datos
 * reales ya cargados (reglas simples, sin LLM). Ver `generarInsights`. */
export const ReportesInsights = ({ insumos }: { insumos: InsumosInsights }) => {
  const insights = generarInsights(insumos);
  if (insights.length === 0) return null;

  return (
    <div className="rounded-2xl bg-surface-container-low shadow-lg p-space-lg flex flex-col gap-space-md">
      <div className="flex flex-wrap items-center justify-between gap-space-sm">
        <div className="flex items-center gap-space-xs">
          <span className="w-8 h-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </span>
          <h2 className="font-headline-sm text-headline-sm text-on-surface uppercase tracking-wide">
            Análisis del período &amp; Insights (CU05)
          </h2>
        </div>
        <span className="font-label-code text-label-code uppercase tracking-wider text-outline">
          Motor de reportes LUMEN
        </span>
      </div>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {insights.map((insight) => (
          <li
            key={insight.titulo}
            className="p-space-md rounded-xl bg-surface-container flex flex-col gap-space-2xs"
          >
            <span className="font-label-code text-label-code uppercase tracking-wider text-outline flex items-center gap-space-2xs">
              <span aria-hidden="true">{EMOJI_POR_TITULO[insight.titulo] ?? '•'}</span>
              {insight.titulo}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface">{insight.texto}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};