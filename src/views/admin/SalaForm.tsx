import { useState } from 'react';
import type { Sala, CrearSalaInput } from '../../core/types/sala.types';

const CAMPO = 'h-11 px-space-sm rounded-lg bg-surface-container text-on-surface font-body-sm text-body-sm outline-none shadow-inner w-full';
const CAMPO_DESHABILITADO = 'h-11 px-space-sm rounded-lg bg-surface-container-lowest text-on-surface-variant font-body-sm text-body-sm outline-none w-full cursor-not-allowed';
const LABEL = 'font-label-md text-label-md text-outline';

interface SalaFormProps {
  /** Si viene, el form edita esta sala (capacidad/asientosPorFila quedan fijos, no se pueden tocar); si no, crea una nueva. */
  sala?: Sala;
  guardando: boolean;
  error: string | null;
  onGuardar: (input: CrearSalaInput) => void;
  onCancelar: () => void;
}

export const SalaForm = ({ sala, guardando, error, onGuardar, onCancelar }: SalaFormProps) => {
  const [nombre, setNombre] = useState(sala?.nombre ?? '');
  const [capacidad, setCapacidad] = useState(sala?.capacidad ?? 60);
  const [asientosPorFila, setAsientosPorFila] = useState(10);
  const [tipo, setTipo] = useState(sala?.tipo ?? '');
  const [tiempoLimpiezaMin, setTiempoLimpiezaMin] = useState(sala?.tiempoLimpiezaMin ?? 20);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGuardar({
      nombre,
      capacidad,
      asientosPorFila,
      tipo: tipo || undefined,
      tiempoLimpiezaMin,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-space-lg rounded-2xl bg-surface-container-low shadow-lg flex flex-col gap-space-md">
      <h2 className="font-headline-sm text-headline-sm text-on-surface">{sala ? 'Editar sala' : 'Nueva sala'}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
        <label className="flex flex-col gap-space-2xs">
          <span className={LABEL}>Nombre</span>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} className={CAMPO} maxLength={50} required />
        </label>
        <label className="flex flex-col gap-space-2xs">
          <span className={LABEL}>Tipo (formato)</span>
          <input value={tipo} onChange={(e) => setTipo(e.target.value)} className={CAMPO} maxLength={30} placeholder="ej. 2D, 3D, VIP" />
        </label>

        <label className="flex flex-col gap-space-2xs">
          <span className={LABEL}>Capacidad{sala && ' (fija, no se puede cambiar)'}</span>
          {sala ? (
            <input value={sala.capacidad} disabled className={CAMPO_DESHABILITADO} />
          ) : (
            <input type="number" min={1} value={capacidad} onChange={(e) => setCapacidad(Number(e.target.value))} className={CAMPO} required />
          )}
        </label>
        {!sala && (
          <label className="flex flex-col gap-space-2xs">
            <span className={LABEL}>Asientos por fila</span>
            <input type="number" min={1} value={asientosPorFila} onChange={(e) => setAsientosPorFila(Number(e.target.value))} className={CAMPO} />
          </label>
        )}

        <label className="flex flex-col gap-space-2xs">
          <span className={LABEL}>Tiempo de limpieza (min)</span>
          <input type="number" min={1} value={tiempoLimpiezaMin} onChange={(e) => setTiempoLimpiezaMin(Number(e.target.value))} className={CAMPO} />
        </label>
      </div>

      {!sala && (
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Los asientos se generan automáticamente al crear la sala, repartidos en filas de "Asientos por fila". No se puede cambiar la capacidad después.
        </p>
      )}

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
