import { useEffect, useState } from 'react';
import { useAuth } from '../../controllers/AuthContext';
import { listarCategoriasDulceria, listarProductosDulceria } from '../../api/dulceria.api';
import type { CategoriaDulceria, ProductoDulceria } from '../../core/types/dulceria.types';
import { CategoriasDulceriaPanel } from './CategoriasDulceriaPanel';
import { ProductosDulceriaPanel } from './ProductosDulceriaPanel';
import { leerEstadoSesion, guardarEstadoSesion } from '../../core/sessionState';

type SubTab = 'productos' | 'categorias';

/**
 * CU09/RF20 — shell con sub-tabs: gestión real de productos (`GET/POST/PATCH/DELETE
 * /dulceria/productos`) y de categorías (`GET/POST/PATCH/DELETE /dulceria/categorias`).
 * Mismo patrón que `AdminPreciosPromos.tsx` — dueño único del fetch, los paneles
 * reciben los datos por props y piden `onCambio()` para recargar tras mutar.
 */
export const AdminDulceria = () => {
  const { token } = useAuth();
  const [subTab, setSubTab] = useState<SubTab>(() => leerEstadoSesion('lumen_admin_dulceria_subtab', 'productos' as SubTab));
  const [categorias, setCategorias] = useState<CategoriaDulceria[]>([]);
  const [productos, setProductos] = useState<ProductoDulceria[]>([]);
  const [cargando, setCargando] = useState(false);

  const cargarTodo = async () => {
    if (!token) return;
    setCargando(true);
    try {
      const [c, p] = await Promise.all([listarCategoriasDulceria(token), listarProductosDulceria(token)]);
      setCategorias(c);
      // Sin filtrar por `disponible` a propósito: el admin necesita ver los productos
      // desactivados para poder reactivarlos (ver ProductosDulceriaTabla).
      setProductos(p);
    } catch (err) {
      console.error('No se pudo cargar la gestión de dulcería.', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargarTodo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    guardarEstadoSesion('lumen_admin_dulceria_subtab', subTab);
  }, [subTab]);

  return (
    <div className="p-space-xl flex flex-col gap-space-lg">
      <div className="flex flex-wrap items-center justify-between gap-space-md">
        <div className="flex flex-col gap-space-2xs">
          <span className="px-space-xs py-0.5 rounded bg-primary/10 text-primary font-label-code text-label-code uppercase tracking-wider w-fit">CU09 / RF20 • Datos reales</span>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Dulcería</h1>
        </div>
        <div className="flex items-center gap-space-xs p-space-2xs rounded-xl bg-surface-container-low shadow-inner">
          <button
            onClick={() => setSubTab('productos')}
            className={`px-space-md py-space-2xs rounded-lg font-label-lg text-label-lg transition-colors ${subTab === 'productos' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Productos
          </button>
          <button
            onClick={() => setSubTab('categorias')}
            className={`px-space-md py-space-2xs rounded-lg font-label-lg text-label-lg transition-colors ${subTab === 'categorias' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Categorías
          </button>
        </div>
      </div>

      {token && subTab === 'productos' && (
        <ProductosDulceriaPanel token={token} productos={productos} categorias={categorias} cargando={cargando} onCambio={cargarTodo} />
      )}
      {token && subTab === 'categorias' && (
        <CategoriasDulceriaPanel token={token} categorias={categorias} productos={productos} cargando={cargando} onCambio={cargarTodo} />
      )}
    </div>
  );
};
