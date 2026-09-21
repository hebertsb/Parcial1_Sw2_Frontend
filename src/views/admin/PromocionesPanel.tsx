import { useState } from 'react';
import { crearPromocion, actualizarPromocion, eliminarPromocion } from '../../api/promociones.api';
import { ApiError } from '../../api/client';
import { mensajeDeError } from '../../core/mensajesError';
import type { Promocion, CrearPromocionInput } from '../../core/types/promocion.types';
import type { Funcion } from '../../core/types/funcion.types';
import type { Pelicula } from '../../core/types/pelicula.types';
import { PromocionesTabla } from './PromocionesTabla';
import { PromocionForm } from './PromocionForm';
import { AsociarFuncionForm } from './AsociarFuncionForm';

interface PromocionesPanelProps {
  token: string;
  promociones: Promocion[];
  funciones: Funcion[];
  peliculas: Pelicula[];
  cargando: boolean;
  onCambio: () => Promise<void>;
}

/** CU06 — CRUD real de `promociones` + asociación N:M a `funciones`, mismo patrón que `PeliculasPanel.tsx`. */
export const PromocionesPanel = ({ token, promociones, funciones, peliculas, cargando, onCambio }: PromocionesPanelProps) => {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [promocionEditando, setPromocionEditando] = useState<Promocion | undefined>(undefined);
  const [promocionAsociando, setPromocionAsociando] = useState<Promocion | undefined>(undefined);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const handleNuevo = () => {
    setPromocionEditando(undefined);
    setPromocionAsociando(undefined);
    setErrorForm(null);
    setMostrarForm(true);
  };

  const handleEditar = (promocion: Promocion) => {
    setPromocionEditando(promocion);
    setPromocionAsociando(undefined);
    setErrorForm(null);
    setMostrarForm(true);
  };

  const handleAsociar = (promocion: Promocion) => {
    setPromocionAsociando(promocion);
    setMostrarForm(false);
  };

  const handleEliminar = async (promocion: Promocion) => {
    if (!window.confirm(`¿Eliminar "${promocion.nombre}"? Se rechaza si alguna venta ya la usó.`)) return;
    try {
      await eliminarPromocion(promocion.idPromocion, token);
      await onCambio();
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'No se pudo eliminar la promoción.');
    }
  };

  const handleGuardar = async (input: CrearPromocionInput & { activa?: boolean }) => {
    setGuardando(true);
    setErrorForm(null);
    try {
      if (promocionEditando) {
        await actualizarPromocion(promocionEditando.idPromocion, input, token);
      } else {
        await crearPromocion(input, token);
      }
      setMostrarForm(false);
      await onCambio();
    } catch (err) {
      setErrorForm(mensajeDeError(err, 'No se pudo guardar la promoción.'));
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
            <span className="material-symbols-outlined text-[20px]">add_circle</span>Nueva promoción
          </button>
        )}
      </div>

      {mostrarForm && (
        <PromocionForm promocion={promocionEditando} guardando={guardando} error={errorForm} onGuardar={handleGuardar} onCancelar={() => setMostrarForm(false)} />
      )}

      {promocionAsociando && (
        <AsociarFuncionForm token={token} promocion={promocionAsociando} funciones={funciones} peliculas={peliculas} onCancelar={() => setPromocionAsociando(undefined)} />
      )}

      {cargando ? (
        <p className="font-label-md text-label-md text-on-surface-variant">Cargando promociones...</p>
      ) : (
        <PromocionesTabla promociones={promociones} onEditar={handleEditar} onEliminar={handleEliminar} onAsociar={handleAsociar} />
      )}
    </div>
  );
};
