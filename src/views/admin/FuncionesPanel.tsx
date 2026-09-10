import { useState } from 'react';
import { crearFuncion, actualizarFuncion, cancelarFuncion } from '../../api/funciones.api';
import { ApiError } from '../../api/client';
import type { Funcion, CrearFuncionInput } from '../../core/types/funcion.types';
import type { Pelicula } from '../../core/types/pelicula.types';
import type { Sala } from '../../core/types/sala.types';
import type { Precio } from '../../core/types/precio.types';
import { FuncionesTabla } from './FuncionesTabla';
import { FuncionForm } from './FuncionForm';

interface FuncionesPanelProps {
  token: string;
  peliculas: Pelicula[];
  salas: Sala[];
  precios: Precio[];
  funciones: Funcion[];
  cargando: boolean;
  onCambio: () => Promise<void>;
}

/** Extraído de `AdminCartelera.tsx` al agregar el sub-tab de Películas — mismo comportamiento de antes. */
export const FuncionesPanel = ({ token, peliculas, salas, precios, funciones, cargando, onCambio }: FuncionesPanelProps) => {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [funcionEditando, setFuncionEditando] = useState<Funcion | undefined>(undefined);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const handleNuevo = () => {
    setFuncionEditando(undefined);
    setErrorForm(null);
    setMostrarForm(true);
  };

  const handleEditar = (funcion: Funcion) => {
    setFuncionEditando(funcion);
    setErrorForm(null);
    setMostrarForm(true);
  };

  const handleCancelarFuncion = async (funcion: Funcion) => {
    if (!window.confirm(`¿Cancelar la función del ${funcion.fecha} ${funcion.horaInicio.slice(0, 5)}?`)) return;
    try {
      await cancelarFuncion(funcion.idFuncion, token);
      await onCambio();
    } catch (err) {
      console.error('No se pudo cancelar la función.', err);
    }
  };

  const handleGuardar = async (input: CrearFuncionInput) => {
    setGuardando(true);
    setErrorForm(null);
    try {
      if (funcionEditando) {
        await actualizarFuncion(funcionEditando.idFuncion, input, token);
      } else {
        await crearFuncion(input, token);
      }
      setMostrarForm(false);
      await onCambio();
    } catch (err) {
      setErrorForm(err instanceof ApiError ? err.message : 'No se pudo guardar la función.');
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
            <span className="material-symbols-outlined text-[20px]">add_circle</span>Nueva función
          </button>
        )}
      </div>

      {(salas.length === 0 || precios.length === 0) && !cargando && (
        <p className="font-body-sm text-body-sm text-error">
          Hace falta al menos una sala y un precio cargados para crear funciones (ver pestañas "Configuración Salas" / "Precios & Promos").
        </p>
      )}

      {mostrarForm && (
        <FuncionForm
          peliculas={peliculas}
          salas={salas}
          precios={precios}
          funcion={funcionEditando}
          guardando={guardando}
          error={errorForm}
          onGuardar={handleGuardar}
          onCancelar={() => setMostrarForm(false)}
        />
      )}

      {cargando ? (
        <p className="font-label-md text-label-md text-on-surface-variant">Cargando funciones...</p>
      ) : (
        <FuncionesTabla funciones={funciones} peliculas={peliculas} salas={salas} onEditar={handleEditar} onCancelar={handleCancelarFuncion} />
      )}
    </div>
  );
};
