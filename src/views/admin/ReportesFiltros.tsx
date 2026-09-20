import type { RangoFechas } from '../../core/types/reporte.types';
import { rangoDesdePreset, type PresetRapido } from '../../core/reportes.utils';

/** Filtros rápidos (Hoy/Ayer/Esta semana/Este mes/Mes anterior), rango manual,
 * agrupación de la serie y botones explícitos Filtrar/Restablecer. Controlado: el
 * estado vive en `AdminReportes` (draft vs aplicado), acá solo se disparan callbacks. */

const PRESETS: { id: PresetRapido; label: string }[] = [
  { id: 'hoy', label: 'Hoy' },
  { id: 'ayer', label: 'Ayer' },
  { id: 'semana', label: 'Esta semana' },
  { id: 'mes', label: 'Este mes' },
  { id: 'mes-anterior', label: 'Mes anterior' },
];

const AGRUPACIONES: { id: 'dia' | 'semana' | 'mes'; label: string }[] = [
  { id: 'dia', label: 'Día' },
  { id: 'semana', label: 'Semana' },
  { id: 'mes', label: 'Mes' },
];

const CLASES_INPUT =
  'h-10 px-space-sm rounded-lg bg-surface-container text-on-surface font-body-sm text-body-sm outline-none shadow-inner';
const CLASES_BOTON =
  'h-10 px-space-md rounded-lg font-label-md text-label-md outline-none shadow-inner transition-colors';

interface ReportesFiltrosProps {
  draft: RangoFechas;
  onDraftChange: (draft: RangoFechas) => void;
  onAplicar: () => void;
  onRestablecer: () => void;
}

export const ReportesFiltros = ({ draft, onDraftChange, onAplicar, onRestablecer }: ReportesFiltrosProps) => {
  const aplicarPreset = (preset: PresetRapido) => {
    const rango = rangoDesdePreset(preset);
    onDraftChange({ ...draft, desde: rango.desde, hasta: rango.hasta, offset: 0 });
  };

  return (
    <div className="rounded-2xl bg-surface-container-low shadow-lg p-space-lg flex flex-col gap-space-md">
      <div className="flex flex-wrap items-center gap-space-xs">
        <span className="font-label-code text-label-code uppercase tracking-wider text-outline">Rango rápido</span>
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => aplicarPreset(preset.id)}
            className={`${CLASES_BOTON} bg-surface-container hover:bg-primary/10 hover:text-primary`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-space-sm">
        <div className="flex flex-col gap-space-2xs">
          <label className="font-label-code text-label-code uppercase tracking-wider text-outline">Desde</label>
          <input
            type="date"
            value={draft.desde ?? ''}
            onChange={(e) => onDraftChange({ ...draft, desde: e.target.value || undefined })}
            className={CLASES_INPUT}
          />
        </div>
        <span className="text-on-surface-variant h-10 flex items-center">—</span>
        <div className="flex flex-col gap-space-2xs">
          <label className="font-label-code text-label-code uppercase tracking-wider text-outline">Hasta</label>
          <input
            type="date"
            value={draft.hasta ?? ''}
            onChange={(e) => onDraftChange({ ...draft, hasta: e.target.value || undefined })}
            className={CLASES_INPUT}
          />
        </div>

        <div className="flex flex-col gap-space-2xs">
          <label className="font-label-code text-label-code uppercase tracking-wider text-outline">Agrupar serie</label>
          <div className="flex rounded-lg overflow-hidden shadow-inner w-fit">
            {AGRUPACIONES.map((agrupacion) => (
              <button
                key={agrupacion.id}
                type="button"
                onClick={() => onDraftChange({ ...draft, agrupacion: agrupacion.id, offset: 0 })}
                aria-pressed={(draft.agrupacion ?? 'dia') === agrupacion.id}
                className={`h-10 px-space-md font-label-md text-label-md outline-none transition-colors ${
                  (draft.agrupacion ?? 'dia') === agrupacion.id
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {agrupacion.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-space-2xs">
          <label className="font-label-code text-label-code uppercase tracking-wider text-outline">Por página</label>
          <select
            value={String(draft.limit ?? 50)}
            onChange={(e) => onDraftChange({ ...draft, limit: Number(e.target.value), offset: 0 })}
            className={CLASES_INPUT}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>

        <div className="flex items-center gap-space-sm">
          <button
            type="button"
            onClick={onAplicar}
            className={`${CLASES_BOTON} bg-primary text-on-primary hover:opacity-90`}
          >
            Filtrar
          </button>
          <button
            type="button"
            onClick={onRestablecer}
            className={`${CLASES_BOTON} bg-surface-container text-on-surface-variant hover:text-on-surface`}
          >
            Restablecer
          </button>
        </div>
      </div>
    </div>
  );
};