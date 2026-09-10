import { useEffect, useState } from 'react';
import { useAuth } from '../../controllers/AuthContext';
import { listarPeliculas } from '../../api/peliculas.api';
import { listarSalas } from '../../api/salas.api';
import { listarPrecios } from '../../api/precios.api';
import { listarFunciones } from '../../api/funciones.api';
import type { Funcion } from '../../core/types/funcion.types';
import type { Pelicula } from '../../core/types/pelicula.types';
import type { Sala } from '../../core/types/sala.types';
import type { Precio } from '../../core/types/precio.types';
import { PeliculasPanel } from './PeliculasPanel';
import { FuncionesPanel } from './FuncionesPanel';

type SubTab = 'peliculas' | 'funciones';

/**
 * CU03/CU04 — shell con sub-tabs: gestión real de películas
 * (`GET/POST/PATCH/DELETE /peliculas`, con poster subido a Cloudinary) y de funciones
 * (`GET/POST/PATCH /funciones`). Dueño único del fetch — los paneles reciben los datos
 * por props y piden `onCambio()` para recargar después de mutar.
 */
export const AdminCartelera = () => {
  const { token } = useAuth();
  const [subTab, setSubTab] = useState<SubTab>('peliculas');
  const [peliculas, setPeliculas] = useState<Pelicula[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [precios, setPrecios] = useState<Precio[]>([]);
  const [funciones, setFunciones] = useState<Funcion[]>([]);
  const [cargando, setCargando] = useState(false);

  const cargarTodo = async () => {
    if (!token) return;
    setCargando(true);
    try {
      const [p, s, pr, f] = await Promise.all([listarPeliculas(token), listarSalas(token), listarPrecios(token), listarFunciones(token)]);
      setPeliculas(p.filter((x) => x.estado === 'activa'));
      setSalas(s);
      setPrecios(pr);
      setFunciones(f.sort((a, b) => `${a.fecha}${a.horaInicio}`.localeCompare(`${b.fecha}${b.horaInicio}`)));
    } catch (err) {
      console.error('No se pudo cargar la gestión de cartelera.', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargarTodo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="p-space-xl flex flex-col gap-space-lg">
      <div className="flex flex-wrap items-center justify-between gap-space-md">
        <div className="flex flex-col gap-space-2xs">
          <span className="px-space-xs py-0.5 rounded bg-primary/10 text-primary font-label-code text-label-code uppercase tracking-wider w-fit">CU03 / CU04 • Datos reales</span>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Cartelera & Funciones</h1>
        </div>
        <div className="flex items-center gap-space-xs p-space-2xs rounded-xl bg-surface-container-low shadow-inner">
          <button
            onClick={() => setSubTab('peliculas')}
            className={`px-space-md py-space-2xs rounded-lg font-label-lg text-label-lg transition-colors ${subTab === 'peliculas' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Películas
          </button>
          <button
            onClick={() => setSubTab('funciones')}
            className={`px-space-md py-space-2xs rounded-lg font-label-lg text-label-lg transition-colors ${subTab === 'funciones' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Funciones
          </button>
        </div>
      </div>

      {token && subTab === 'peliculas' && (
        <PeliculasPanel token={token} peliculas={peliculas} cargando={cargando} onCambio={cargarTodo} />
      )}
      {token && subTab === 'funciones' && (
        <FuncionesPanel token={token} peliculas={peliculas} salas={salas} precios={precios} funciones={funciones} cargando={cargando} onCambio={cargarTodo} />
      )}
    </div>
  );
};
