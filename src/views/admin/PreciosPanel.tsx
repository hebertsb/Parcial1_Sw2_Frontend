import { useState } from 'react';
import { crearPrecio, actualizarPrecio, eliminarPrecio } from '../../api/precios.api';
import { ApiError } from '../../api/client';
import type { Precio, CrearPrecioInput } from '../../core/types/precio.types';
import type { Funcion } from '../../core/types/funcion.types';
import { PreciosTabla } from './PreciosTabla';
import { PrecioForm } from './PrecioForm';

interface PreciosPanelProps {
  token: string;
  precios: Precio[];
  /** Todas las funciones (sin filtrar por estado) — para el badge "En uso" de PreciosTabla. */
  funciones: Funcion[];
  cargando: boolean;
  onCambio: () => Promise<void>;
}

/** CU07 — CRUD real de `precios`, mismo patrón que `PeliculasPanel.tsx`/`SalasTabla.tsx`. */
export const PreciosPanel = ({ token, precios, funciones, cargando, onCambio }: PreciosPanelProps) => {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [precioEditando, setPrecioEditando] = useState<Precio | undefined>(undefined);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const handleNuevo = () => {
    setPrecioEditando(undefined);
    setErrorForm(null);
    setMostrarForm(true);
  };

  const handleEditar = (precio: Precio) => {
    setPrecioEditando(precio);
    setErrorForm(null);
    setMostrarForm(true);
  };

  const handleEliminar = async (precio: Precio) => {
    const enUso = funciones.filter((f) => f.idPrecio === precio.idPrecio).length;
    const aviso = enUso > 0
      ? `Este precio lo usan ${enUso} función(es) — el backend va a rechazar el borrado. ¿Intentar de todas formas?`
      : `¿Eliminar el precio de ${Number(precio.valor).toFixed(2)} Bs?`;
    if (!window.confirm(aviso)) return;
    try {
      await eliminarPrecio(precio.idPrecio, token);
      await onCambio();
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'No se pudo eliminar el precio.');
    }
  };

  const handleGuardar = async (input: CrearPrecioInput) => {
    setGuardando(true);
    setErrorForm(null);
    try {
      if (precioEditando) {
        await actualizarPrecio(precioEditando.idPrecio, input, token);
      } else {
        await crearPrecio(input, token);
      }
      setMostrarForm(false);
      await onCambio();
    } catch (err) {
      setErrorForm(err instanceof ApiError ? err.message : 'No se pudo guardar el precio.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="flex items-center justify-end">
        {!mostrarForm && (
          <button
            onClick={handleNuevo}
            disabled={cargando}
            className="px-space-lg py-space-sm rounded-xl bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-container transition-all flex items-center gap-space-xs disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>Nuevo precio
          </button>
        )}
      </div>

      {mostrarForm && (
        <PrecioForm precio={precioEditando} guardando={guardando} error={errorForm} onGuardar={handleGuardar} onCancelar={() => setMostrarForm(false)} />
      )}

      {cargando ? (
        <p className="font-label-md text-label-md text-on-surface-variant">Cargando precios...</p>
      ) : (
        <PreciosTabla precios={precios} funciones={funciones} onEditar={handleEditar} onEliminar={handleEliminar} />
      )}
    </div>
  );
};
