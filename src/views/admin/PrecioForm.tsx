import { useState } from 'react';
import type { Precio, CrearPrecioInput } from '../../core/types/precio.types';

const CAMPO = 'h-11 px-space-sm rounded-lg bg-surface-container text-on-surface font-body-sm text-body-sm outline-none shadow-inner w-full';
const LABEL = 'font-label-md text-label-md text-outline';

interface PrecioFormProps {
  precio?: Precio;
  guardando: boolean;
  error: string | null;
  onGuardar: (input: CrearPrecioInput) => void;
  onCancelar: () => void;
}

export const PrecioForm = ({ precio, guardando, error, onGuardar, onCancelar }: PrecioFormProps) => {
  const [valor, setValor] = useState(precio ? Number(precio.valor) : 0);
  const [vigenteDesde, setVigenteDesde] = useState(precio?.vigenteDesde ?? '');
  const [vigenteHasta, setVigenteHasta] = useState(precio?.vigenteHasta ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGuardar({ valor, vigenteDesde, vigenteHasta: vigenteHasta || undefined });
  };

  return (
    <form onSubmit={handleSubmit} className="p-space-lg rounded-2xl bg-surface-container-low shadow-lg flex flex-col gap-space-md">
      <h2 className="font-headline-sm text-headline-sm text-on-surface">{precio ? 'Editar precio' : 'Nuevo precio'}</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        <label className="flex flex-col gap-space-2xs">
          <span className={LABEL}>Valor (Bs)</span>
          <input type="number" min={0.01} step={0.01} value={valor} onChange={(e) => setValor(Number(e.target.value))} className={CAMPO} required />
        </label>
        <label className="flex flex-col gap-space-2xs">
          <span className={LABEL}>Vigente desde</span>
          <input type="date" value={vigenteDesde} onChange={(e) => setVigenteDesde(e.target.value)} className={CAMPO} required />
        </label>
        <label className="flex flex-col gap-space-2xs">
          <span className={LABEL}>Vigente hasta (opcional)</span>
          <input type="date" value={vigenteHasta} onChange={(e) => setVigenteHasta(e.target.value)} className={CAMPO} />
        </label>
      </div>

      <p className="font-body-sm text-body-sm text-on-surface-variant">
        Dejar "Vigente hasta" vacío para que el precio no expire. Se elige al crear una función (pestaña "Cartelera & Funciones"), no por tipo de asiento.
      </p>

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
