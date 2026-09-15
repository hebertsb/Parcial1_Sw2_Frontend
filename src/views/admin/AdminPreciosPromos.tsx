import { useEffect, useState } from 'react';
import { useAuth } from '../../controllers/AuthContext';
import { listarPrecios } from '../../api/precios.api';
import { listarPromociones } from '../../api/promociones.api';
import { listarFunciones } from '../../api/funciones.api';
import { listarPeliculas } from '../../api/peliculas.api';
import type { Precio } from '../../core/types/precio.types';
import type { Promocion } from '../../core/types/promocion.types';
import type { Funcion } from '../../core/types/funcion.types';
import type { Pelicula } from '../../core/types/pelicula.types';
import { PreciosPanel } from './PreciosPanel';
import { PromocionesPanel } from './PromocionesPanel';

type SubTab = 'precios' | 'promociones';

/**
 * CU06/CU07 — shell con sub-tabs: gestión real de precios (`GET/POST/PATCH/DELETE
 * /precios`) y de promociones (`GET/POST/PATCH/DELETE /promociones` + asociación a
 * funciones). Mismo patrón que `AdminCartelera.tsx` — dueño único del fetch, los paneles
 * reciben los datos por props y piden `onCambio()` para recargar tras mutar.
 */
export const AdminPreciosPromos = () => {
  const { token } = useAuth();
  const [subTab, setSubTab] = useState<SubTab>('precios');
  const [precios, setPrecios] = useState<Precio[]>([]);
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [funciones, setFunciones] = useState<Funcion[]>([]);
  const [peliculas, setPeliculas] = useState<Pelicula[]>([]);
  const [cargando, setCargando] = useState(false);

  const cargarTodo = async () => {
    if (!token) return;
    setCargando(true);
    try {
      const [pr, pm, f, p] = await Promise.all([listarPrecios(token), listarPromociones(token), listarFunciones(token), listarPeliculas(token)]);
      setPrecios(pr);
      setPromociones(pm);
      // Sin filtrar por estado a propósito: PreciosTabla necesita contar TODAS las
      // funciones que referencian un precio (igual que PreciosService.eliminar en el
      // backend, que no filtra por estado) para que el badge "En uso" sea exacto.
      setFunciones(f);
      setPeliculas(p);
    } catch (err) {
      console.error('No se pudo cargar la gestión de precios y promociones.', err);
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
          <span className="px-space-xs py-0.5 rounded bg-primary/10 text-primary font-label-code text-label-code uppercase tracking-wider w-fit">CU06 / CU07 • Datos reales</span>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Precios & Promos</h1>
        </div>
        <div className="flex items-center gap-space-xs p-space-2xs rounded-xl bg-surface-container-low shadow-inner">
          <button
            onClick={() => setSubTab('precios')}
            className={`px-space-md py-space-2xs rounded-lg font-label-lg text-label-lg transition-colors ${subTab === 'precios' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Precios
          </button>
          <button
            onClick={() => setSubTab('promociones')}
            className={`px-space-md py-space-2xs rounded-lg font-label-lg text-label-lg transition-colors ${subTab === 'promociones' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Promociones
          </button>
        </div>
      </div>

      {token && subTab === 'precios' && (
        <PreciosPanel token={token} precios={precios} funciones={funciones} cargando={cargando} onCambio={cargarTodo} />
      )}
      {token && subTab === 'promociones' && (
        <PromocionesPanel
          token={token}
          promociones={promociones}
          funciones={funciones.filter((f) => f.estado === 'programada')}
          peliculas={peliculas}
          cargando={cargando}
          onCambio={cargarTodo}
        />
      )}
    </div>
  );
};
