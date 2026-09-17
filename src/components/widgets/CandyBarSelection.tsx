import { useEffect, useState } from 'react';
import { useCine } from '../../controllers/CineContext';
import { useAuth } from '../../controllers/AuthContext';
import { listarCategoriasDulceria, listarProductosDulceria } from '../../api/dulceria.api';
import type { CategoriaDulceria, ProductoDulceria } from '../../core/types/dulceria.types';

/**
 * CU09/RF20 — antes esta vitrina tenía 3 productos hardcodeados en JSX
 * ("Combo Pareja Épico", etc.), desconectados de `productos_dulceria`: un
 * producto creado por el admin en `AdminDulceria.tsx` nunca aparecía acá.
 * Ahora consume `GET /dulceria/categorias` + `GET /dulceria/productos` real.
 *
 * `listarProductosDulceria` trae TODOS los productos (disponibles o no —
 * ver DulceriaService.listarProductos en el backend, que no filtra por
 * `disponible`); acá sí se filtra a `disponible === true`, que es lo único
 * que el cliente debería poder agregar al carrito.
 */
export const CandyBarSelection = () => {
  const { state, dispatch } = useCine();
  const { token } = useAuth();
  const [categorias, setCategorias] = useState<CategoriaDulceria[]>([]);
  const [productos, setProductos] = useState<ProductoDulceria[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState<number | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelado = false;
    (async () => {
      setCargando(true);
      setError(null);
      try {
        const [c, p] = await Promise.all([listarCategoriasDulceria(token), listarProductosDulceria(token)]);
        if (!cancelado) {
          setCategorias(c);
          setProductos(p.filter((producto) => producto.disponible));
        }
      } catch (err) {
        console.error('No se pudo cargar el menú de dulcería.', err);
        if (!cancelado) {
          setError('No se pudo cargar el menú de dulcería. Podés saltar este paso y seguir con el pago.');
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [token]);

  const handleUpdate = (producto: ProductoDulceria, delta: number) => {
    const id = String(producto.idProducto);
    const existing = state.candyBarSeleccionado.find((c) => c.id === id);
    const count = existing ? existing.cantidad : 0;
    const nextCount = Math.max(0, count + delta);

    dispatch({
      type: 'ACTUALIZAR_CANDYBAR',
      payload: {
        id,
        nombre: producto.nombre,
        precio: Number(producto.precioBase),
        cantidad: nextCount,
        descripcion: producto.descripcion ?? '',
        imagenUrl: producto.imagenUrl ?? '',
      },
    });
  };

  const getQty = (idProducto: number) => state.candyBarSeleccionado.find((c) => c.id === String(idProducto))?.cantidad || 0;

  const skipToPago = () => {
    dispatch({ type: 'SET_ESTADO_COMPRA', payload: 'pago' });
  };

  const productosVisibles = categoriaActiva === null ? productos : productos.filter((p) => p.idCategoria === categoriaActiva);

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="rounded-xl bg-gradient-to-r from-surface-container via-surface-container-high to-surface-container p-space-md shadow-xl flex flex-col md:flex-row items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md">
          <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-secondary-container/20 shadow-[0_0_24px_rgba(6,182,212,0.4)]">
            <div className="w-10 h-10 rounded-full bg-secondary-container/40 animate-ping absolute"></div>
            <span className="material-symbols-outlined text-secondary text-[28px] animate-pulse">graphic_eq</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs">
              <span className="font-label-code text-label-code text-secondary uppercase tracking-wider font-bold">LUMEN Acoustic Intelligence</span>
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            </div>
            <p className="font-body-md text-body-md text-on-surface mt-0.5">
              Pide tus golosinas por voz: <span className="text-primary italic font-semibold">"Agrega un combo dúo con pipocas saladas y Coca-Cola Zero"</span>
            </p>
          </div>
        </div>
        <button onClick={skipToPago} className="px-space-md py-space-xs rounded-full bg-surface-container hover:bg-surface-bright text-on-surface font-label-md text-label-md font-bold flex items-center gap-space-xs shadow-sm active:scale-95 transition-all border border-outline/20">
          <span>Saltar Candy Bar</span>
          <span className="material-symbols-outlined text-[18px] text-primary">arrow_forward</span>
        </button>
      </div>

      {categorias.length > 0 && (
        <div className="w-full overflow-x-auto pb-space-xs flex items-center gap-space-xs">
          <button
            onClick={() => setCategoriaActiva(null)}
            className={`px-space-md py-space-xs rounded-full font-label-md text-label-md font-bold whitespace-nowrap transition-colors ${categoriaActiva === null ? 'bg-primary-container text-on-primary-container shadow-[0_0_12px_rgba(245,158,11,0.3)]' : 'bg-surface-container hover:bg-surface-bright text-on-surface-variant hover:text-on-surface'}`}
          >
            Todos
          </button>
          {categorias.map((categoria) => (
            <button
              key={categoria.idCategoria}
              onClick={() => setCategoriaActiva(categoria.idCategoria)}
              className={`px-space-md py-space-xs rounded-full font-label-md text-label-md whitespace-nowrap transition-colors ${categoriaActiva === categoria.idCategoria ? 'bg-primary-container text-on-primary-container font-bold shadow-[0_0_12px_rgba(245,158,11,0.3)]' : 'bg-surface-container hover:bg-surface-bright text-on-surface-variant hover:text-on-surface'}`}
            >
              {categoria.nombre}
            </button>
          ))}
        </div>
      )}

      {cargando && <p className="font-label-md text-label-md text-on-surface-variant">Cargando menú de dulcería...</p>}
      {error && <p className="font-body-sm text-body-sm text-error">{error}</p>}

      {!cargando && !error && productosVisibles.length === 0 && (
        <p className="font-label-md text-label-md text-on-surface-variant">No hay productos disponibles en esta categoría por ahora.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
        {productosVisibles.map((producto) => {
          const cantidad = getQty(producto.idProducto);
          return (
            <div key={producto.idProducto} className="rounded-xl bg-surface-container p-space-md shadow-lg flex flex-col justify-between gap-space-md">
              <div>
                <div className="w-full h-40 rounded-lg overflow-hidden relative">
                  {producto.imagenUrl ? (
                    <img src={producto.imagenUrl} alt={producto.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-[36px]">fastfood</span>
                    </div>
                  )}
                  {producto.etiqueta && (
                    <span className="absolute top-2 right-2 px-space-xs py-space-2xs rounded bg-surface-container-lowest/80 text-primary font-label-code text-label-code font-bold backdrop-blur-md">
                      {producto.etiqueta}
                    </span>
                  )}
                </div>
                <div className="flex items-start justify-between mt-space-sm">
                  <h4 className="font-headline-sm text-headline-sm text-on-surface">{producto.nombre}</h4>
                  <span className="font-headline-sm text-headline-sm text-primary font-bold shrink-0">{Number(producto.precioBase).toFixed(2)} Bs</span>
                </div>
                {producto.descripcion && (
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-2">{producto.descripcion}</p>
                )}
              </div>
              <div className="flex items-center justify-between pt-space-xs">
                <span className="font-label-code text-label-code text-on-surface-variant uppercase">
                  {producto.tipo === 'combo' ? 'Combo' : 'Individual'}
                </span>
                {cantidad === 0 ? (
                  <button onClick={() => handleUpdate(producto, 1)} className="h-10 px-space-md rounded-lg bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface font-label-md text-label-md font-bold transition-all flex items-center gap-1 active:scale-95">
                    <span className="material-symbols-outlined text-[16px]">add</span> Agregar
                  </button>
                ) : (
                  <div className="flex items-center gap-space-xs">
                    <button onClick={() => handleUpdate(producto, -1)} className="w-10 h-10 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface flex items-center justify-center font-bold text-lg active:scale-95 transition-transform">-</button>
                    <span className="w-8 text-center font-headline-sm text-headline-sm text-on-surface">{cantidad}</span>
                    <button onClick={() => handleUpdate(producto, 1)} className="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-lg shadow-[0_0_12px_rgba(245,158,11,0.3)] active:scale-95 transition-transform">+</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
