import { useState, type FormEvent } from 'react';
import { AvisoValidacion } from '../../components/widgets/AvisoValidacion';
import type { Promocion, CrearPromocionInput, TipoDescuento } from '../../core/types/promocion.types';

const CAMPO = 'h-11 px-space-sm rounded-lg bg-surface-container text-on-surface font-body-sm text-body-sm outline-none shadow-inner w-full';
const LABEL = 'font-label-md text-label-md text-outline';

interface PromocionFormProps {
  promocion?: Promocion;
  guardando: boolean;
  error: string | null;
  onGuardar: (input: CrearPromocionInput & { activa?: boolean }) => void;
  onCancelar: () => void;
}

export const PromocionForm = ({ promocion, guardando, error, onGuardar, onCancelar }: PromocionFormProps) => {
  const [nombre, setNombre] = useState(promocion?.nombre ?? '');
  const [descripcion, setDescripcion] = useState(promocion?.descripcion ?? '');
  const [tipoDescuento, setTipoDescuento] = useState<TipoDescuento>(promocion?.tipoDescuento ?? 'porcentaje');
  const [valor, setValor] = useState(promocion ? Number(promocion.valor) : 0);
  const [fechaInicio, setFechaInicio] = useState(promocion?.fechaInicio ?? '');
  const [fechaFin, setFechaFin] = useState(promocion?.fechaFin ?? '');
  const [activa, setActiva] = useState(promocion?.activa ?? true);

  // Fechas `YYYY-MM-DD` (input type="date"), comparables como string.
  const ordenFechaInvalido = !!fechaInicio && !!fechaFin && fechaFin < fechaInicio;
  const porcentajeFueraDeRango = tipoDescuento === 'porcentaje' && valor > 100;
  const hayErrorValidacion = ordenFechaInvalido || porcentajeFueraDeRango;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (hayErrorValidacion) return;
    onGuardar({
      nombre,
      descripcion: descripcion || undefined,
      tipoDescuento,
      valor,
      fechaInicio,
      fechaFin,
      ...(promocion ? { activa } : {}),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-space-lg rounded-2xl bg-surface-container-low shadow-lg flex flex-col gap-space-md">
      <h2 className="font-headline-sm text-headline-sm text-on-surface">{promocion ? 'Editar promoción' : 'Nueva promoción'}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
        <label className="flex flex-col gap-space-2xs md:col-span-2">
          <span className={LABEL}>Nombre</span>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} className={CAMPO} maxLength={100} required />
        </label>
        <label className="flex flex-col gap-space-2xs md:col-span-2">
          <span className={LABEL}>Descripción (opcional)</span>
          <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className={CAMPO} />
        </label>

        <label className="flex flex-col gap-space-2xs">
          <span className={LABEL}>Tipo de descuento</span>
          <select value={tipoDescuento} onChange={(e) => setTipoDescuento(e.target.value as TipoDescuento)} className={CAMPO}>
            <option value="porcentaje">Porcentaje (%)</option>
            <option value="monto_fijo">Monto fijo (Bs)</option>
          </select>
        </label>
        <label className="flex flex-col gap-space-2xs">
          <span className={LABEL}>Valor {tipoDescuento === 'porcentaje' ? '(%)' : '(Bs)'}</span>
          <input type="number" min={0.01} step={0.01} value={valor} onChange={(e) => setValor(Number(e.target.value))} className={CAMPO} required />
        </label>

        <label className="flex flex-col gap-space-2xs">
          <span className={LABEL}>Fecha inicio</span>
          <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className={CAMPO} required />
        </label>
        <label className="flex flex-col gap-space-2xs">
          <span className={LABEL}>Fecha fin</span>
          <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className={CAMPO} required />
        </label>

        {promocion && (
          <label className="flex items-center gap-space-xs md:col-span-2">
            <input type="checkbox" checked={activa} onChange={(e) => setActiva(e.target.checked)} className="w-5 h-5" />
            <span className={LABEL}>Activa (desmarcar para desactivarla sin borrarla)</span>
          </label>
        )}
      </div>

      {porcentajeFueraDeRango && (
        <AvisoValidacion tipo="error">Un descuento porcentual no puede superar 100%.</AvisoValidacion>
      )}
      {ordenFechaInvalido && (
        <AvisoValidacion tipo="error">"Fecha fin" tiene que ser igual o posterior a "Fecha inicio".</AvisoValidacion>
      )}

      {error && <p className="font-body-sm text-body-sm text-error">{error}</p>}

      <div className="flex items-center gap-space-sm">
        <button type="submit" disabled={guardando || hayErrorValidacion} className="px-space-lg py-space-sm rounded-xl bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-container transition-all disabled:opacity-50">
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
        <button type="button" onClick={onCancelar} className="px-space-lg py-space-sm rounded-xl bg-surface-container-high text-on-surface font-label-lg text-label-lg hover:bg-surface-variant transition-all">
          Cancelar
        </button>
      </div>
    </form>
  );
};
