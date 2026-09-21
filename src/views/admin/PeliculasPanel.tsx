import { useState } from 'react';
import { crearPelicula, actualizarPelicula, eliminarPelicula } from '../../api/peliculas.api';
import { ApiError } from '../../api/client';
import { mensajeDeError } from '../../core/mensajesError';
import type { Pelicula, CrearPeliculaInput } from '../../core/types/pelicula.types';
import { PeliculasTabla } from './PeliculasTabla';
import { PeliculaForm } from './PeliculaForm';
import { Modal } from '../../components/widgets/Modal';
import { Paginacion } from '../../components/widgets/Paginacion';

const PELICULAS_POR_PAGINA = 8;

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
  const [pagina, setPagina] = useState(1);

  const totalPaginas = Math.max(1, Math.ceil(peliculas.length / PELICULAS_POR_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const peliculasPagina = peliculas.slice(
    (paginaSegura - 1) * PELICULAS_POR_PAGINA,
    paginaSegura * PELICULAS_POR_PAGINA,
  );

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
      setErrorForm(mensajeDeError(err, 'No se pudo guardar la película.'));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="flex items-center justify-end">
        <button
          onClick={handleNuevo}
          disabled={cargando}
          className="px-space-lg py-space-sm rounded-xl bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-container transition-all flex items-center gap-space-xs disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>Nueva película
        </button>
      </div>

      {mostrarForm && (
        <Modal titulo={peliculaEditando ? 'Editar película' : 'Nueva película'} onCerrar={() => setMostrarForm(false)}>
          <PeliculaForm peliculas={peliculas} pelicula={peliculaEditando} guardando={guardando} error={errorForm} onGuardar={handleGuardar} onCancelar={() => setMostrarForm(false)} />
        </Modal>
      )}

      {cargando ? (
        <p className="font-label-md text-label-md text-on-surface-variant">Cargando películas...</p>
      ) : (
        <>
          <PeliculasTabla peliculas={peliculasPagina} onEditar={handleEditar} onEliminar={handleEliminar} />
          <Paginacion paginaActual={paginaSegura} totalPaginas={totalPaginas} totalItems={peliculas.length} onCambiarPagina={setPagina} />
        </>
      )}
    </div>
  );
};
