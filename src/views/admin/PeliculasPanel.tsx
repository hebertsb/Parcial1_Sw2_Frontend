import { useState } from 'react';
import { crearPelicula, actualizarPelicula, eliminarPelicula } from '../../api/peliculas.api';
import { ApiError } from '../../api/client';
import type { Pelicula, CrearPeliculaInput } from '../../core/types/pelicula.types';
import { PeliculasTabla } from './PeliculasTabla';
import { PeliculaForm } from './PeliculaForm';

interface PeliculasPanelProps {
  token: string;
  peliculas: Pelicula[];
  cargando: boolean;
  onCambio: () => Promise<void>;
}

export const PeliculasPanel = ({ token, peliculas, cargando, onCambio }: PeliculasPanelProps) => {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [peliculaEditando, setPeliculaEditando] = useState<Pelicula | undefined>(undefined);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const handleNuevo = () => {
    setPeliculaEditando(undefined);
    setErrorForm(null);
    setMostrarForm(true);
  };

  const handleEditar = (pelicula: Pelicula) => {
    setPeliculaEditando(pelicula);
    setErrorForm(null);
    setMostrarForm(true);
  };

  const handleEliminar = async (pelicula: Pelicula) => {
    if (!window.confirm(`¿Eliminar "${pelicula.titulo}"? Se rechaza si tiene funciones futuras programadas.`)) return;
    try {
      await eliminarPelicula(pelicula.idPelicula, token);
      await onCambio();
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'No se pudo eliminar la película.');
    }
  };

  const handleGuardar = async (input: CrearPeliculaInput) => {
    setGuardando(true);
    setErrorForm(null);
    try {
      if (peliculaEditando) {
        await actualizarPelicula(peliculaEditando.idPelicula, input, token);
      } else {
        await crearPelicula(input, token);
      }
      setMostrarForm(false);
      await onCambio();
    } catch (err) {
      setErrorForm(err instanceof ApiError ? err.message : 'No se pudo guardar la película.');
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
            <span className="material-symbols-outlined text-[20px]">add_circle</span>Nueva película
          </button>
        )}
      </div>

      {mostrarForm && (
        <PeliculaForm pelicula={peliculaEditando} guardando={guardando} error={errorForm} onGuardar={handleGuardar} onCancelar={() => setMostrarForm(false)} />
      )}

      {cargando ? (
        <p className="font-label-md text-label-md text-on-surface-variant">Cargando películas...</p>
      ) : (
        <PeliculasTabla peliculas={peliculas} onEditar={handleEditar} onEliminar={handleEliminar} />
      )}
    </div>
  );
};
