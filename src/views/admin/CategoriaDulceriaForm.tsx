import { useState, type FormEvent } from 'react';
import type { CategoriaDulceria, CrearCategoriaInput } from '../../core/types/dulceria.types';

const CAMPO = 'h-11 px-space-sm rounded-lg bg-surface-container text-on-surface font-body-sm text-body-sm outline-none shadow-inner w-full';
const LABEL = 'font-label-md text-label-md text-outline';

interface CategoriaDulceriaFormProps {
  categoria?: CategoriaDulceria;
  guardando: boolean;
  error: string | null;
  onGuardar: (input: CrearCategoriaInput) => void;
  onCancelar: () => void;
}

export const CategoriaDulceriaForm = ({ categoria, guardando, error, onGuardar, onCancelar }: CategoriaDulceriaFormProps) => {
  const [nombre, setNombre] = useState(categoria?.nombre ?? '');
  const [ordenVisualizacion, setOrdenVisualizacion] = useState(categoria?.ordenVisualizacion ?? 0);
  const [icono, setIcono] = useState(categoria?.icono ?? '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onGuardar({ nombre, ordenVisualizacion, icono: icono || undefined });
  };

  return (
    <form onSubmit={handleSubmit} className="p-space-lg rounded-2xl bg-surface-container-low shadow-lg flex flex-col gap-space-md">
      <h2 className="font-headline-sm text-headline-sm text-on-surface">{categoria ? 'Editar categoría' : 'Nueva categoría'}</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        <label className="flex flex-col gap-space-2xs md:col-span-2">
          <span className={LABEL}>Nombre</span>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} className={CAMPO} maxLength={60} required placeholder="Combos, Popcorn, Bebidas..." />
        </label>
        <label className="flex flex-col gap-space-2xs">
          <span className={LABEL}>Orden de visualización</span>
          <input type="number" min={0} step={1} value={ordenVisualizacion} onChange={(e) => setOrdenVisualizacion(Number(e.target.value))} className={CAMPO} />
        </label>
        <label className="flex flex-col gap-space-2xs md:col-span-3">
          <span className={LABEL}>Icono (opcional)</span>
          <input value={icono} onChange={(e) => setIcono(e.target.value)} className={CAMPO} maxLength={50} placeholder="local_movies, local_cafe..." />
        </label>
      </div>

      {error && <p className="font-body-sm text-body-sm text-error">{error}</p>}

      <div className="flex items-center gap-space-sm">
        <button type="submit" disabled={guardando} className="px-space-lg py-space-sm rounded-xl bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-container transition-all disabled:opacity-50">
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
        <button type="button" onClick={onCancelar} className="px-space-lg py-space-sm rounded-xl bg-surface-container-high text-on-surface font-label-lg text-label-lg hover:bg-surface-variant transition-all">
          Cancelar
        </button>
      </div>
    </form>
  );
};
