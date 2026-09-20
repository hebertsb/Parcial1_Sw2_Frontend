import { generarInsights, type InsumosInsights } from '../../core/reportes.utils';

/** CU05/RF08 — "Análisis del período & Insights": frases derivadas de los datos
 * reales ya cargados (reglas simples, sin LLM). Ver `generarInsights`. */
export const ReportesInsights = ({ insumos }: { insumos: InsumosInsights }) => {
  const insights = generarInsights(insumos);
  if (insights.length === 0) return null;

  return (
    <div className="rounded-2xl bg-surface-container-low shadow-lg p-space-lg flex flex-col gap-space-md">
      <h2 className="font-headline-sm text-headline-sm text-on-surface">Análisis del período</h2>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
        {insights.map((insight) => (
          <li
            key={insight.titulo}
            className="p-space-md rounded-xl bg-surface-container flex flex-col gap-space-2xs"
          >
            <span className="font-label-code text-label-code uppercase tracking-wider text-outline">
              {insight.titulo}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface">{insight.texto}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};