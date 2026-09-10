import { useState } from 'react';
import { subirImagen, CloudinaryError } from '../../api/cloudinary.api';
import { posterFor } from '../../core/posters';
import type { Pelicula, CrearPeliculaInput } from '../../core/types/pelicula.types';

const CAMPO = 'h-11 px-space-sm rounded-lg bg-surface-container text-on-surface font-body-sm text-body-sm outline-none shadow-inner w-full';
const LABEL = 'font-label-md text-label-md text-outline';

interface PeliculaFormProps {
  /** Si viene, el form edita esta película; si no, crea una nueva. */
  pelicula?: Pelicula;
  guardando: boolean;
  error: string | null;
  onGuardar: (input: CrearPeliculaInput) => void;
  onCancelar: () => void;
}

export const PeliculaForm = ({ pelicula, guardando, error, onGuardar, onCancelar }: PeliculaFormProps) => {
  const [titulo, setTitulo] = useState(pelicula?.titulo ?? '');
  const [genero, setGenero] = useState(pelicula?.genero ?? '');
  const [duracionMin, setDuracionMin] = useState(pelicula?.duracionMin ?? 90);
  const [clasificacion, setClasificacion] = useState(pelicula?.clasificacion ?? '');
  const [posterUrl, setPosterUrl] = useState(pelicula?.posterUrl ?? '');
  const [subiendo, setSubiendo] = useState(false);
  const [errorSubida, setErrorSubida] = useState<string | null>(null);

  const handleArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    setSubiendo(true);
    setErrorSubida(null);
    try {
      setPosterUrl(await subirImagen(archivo));
    } catch (err) {
      setErrorSubida(err instanceof CloudinaryError ? err.message : 'No se pudo subir la imagen.');
    } finally {
      setSubiendo(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGuardar({
      titulo,
      genero: genero || undefined,
      duracionMin,
      clasificacion: clasificacion || undefined,
      posterUrl: posterUrl || undefined,
    });
  };

  const previewUrl = posterUrl || (pelicula ? posterFor(pelicula.idPelicula) : undefined);

  return (
    <form onSubmit={handleSubmit} className="p-space-lg rounded-2xl bg-surface-container-low shadow-lg flex flex-col gap-space-md">
      <h2 className="font-headline-sm text-headline-sm text-on-surface">{pelicula ? 'Editar película' : 'Nueva película'}</h2>

      <div className="flex flex-col md:flex-row gap-space-md">
        <div className="flex flex-col gap-space-2xs items-start shrink-0">
          <span className={LABEL}>Poster</span>
          {previewUrl && <img src={previewUrl} alt="" className="w-28 h-40 object-cover rounded-lg shadow-md" />}
          <label className="px-space-sm py-space-xs rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-code text-label-code cursor-pointer transition-colors">
            {subiendo ? 'Subiendo...' : 'Elegir imagen'}
            <input type="file" accept="image/*" onChange={(e) => void handleArchivo(e)} disabled={subiendo} className="hidden" />
          </label>
          {errorSubida && <span className="font-body-sm text-body-sm text-error max-w-[10rem]">{errorSubida}</span>}
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-space-md">
          <label className="flex flex-col gap-space-2xs md:col-span-2">
            <span className={LABEL}>Título</span>
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} className={CAMPO} maxLength={200} required />
          </label>
          <label className="flex flex-col gap-space-2xs">
            <span className={LABEL}>Género</span>
            <input value={genero} onChange={(e) => setGenero(e.target.value)} className={CAMPO} maxLength={80} />
          </label>
          <label className="flex flex-col gap-space-2xs">
            <span className={LABEL}>Duración (min)</span>
            <input type="number" min={1} value={duracionMin} onChange={(e) => setDuracionMin(Number(e.target.value))} className={CAMPO} required />
          </label>
          <label className="flex flex-col gap-space-2xs">
            <span className={LABEL}>Clasificación</span>
            <input value={clasificacion} onChange={(e) => setClasificacion(e.target.value)} className={CAMPO} maxLength={10} placeholder="ej. +16" />
          </label>
        </div>
      </div>

      {error && <p className="font-body-sm text-body-sm text-error">{error}</p>}

      <div className="flex items-center gap-space-sm">
        <button type="submit" disabled={guardando || subiendo} className="px-space-lg py-space-sm rounded-xl bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-container transition-all disabled:opacity-50">
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
        <button type="button" onClick={onCancelar} className="px-space-lg py-space-sm rounded-xl bg-surface-container-high text-on-surface font-label-lg text-label-lg hover:bg-surface-variant transition-all">
          Cancelar
        </button>
      </div>
    </form>
  );
};
