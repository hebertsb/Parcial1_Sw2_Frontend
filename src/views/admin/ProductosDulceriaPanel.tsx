import { useState } from 'react';
import { crearProductoDulceria, actualizarProductoDulceria, eliminarProductoDulceria } from '../../api/dulceria.api';
import { ApiError } from '../../api/client';
import type {
  CategoriaDulceria,
  ProductoDulceria,
  CrearProductoInput,
  ActualizarProductoInput,
} from '../../core/types/dulceria.types';
import { ProductosDulceriaTabla } from './ProductosDulceriaTabla';
import { ProductoDulceriaForm } from './ProductoDulceriaForm';

interface ProductosDulceriaPanelProps {
  token: string;
  productos: ProductoDulceria[];
  categorias: CategoriaDulceria[];
  cargando: boolean;
  onCambio: () => Promise<void>;
}

/**
 * CU09/RF20 — CRUD real de `productos_dulceria`, mismo patrón que `PreciosPanel.tsx`.
 * El "eliminar" en `ProductosDulceriaTabla` en realidad dispara un soft-delete
 * (`disponible=false`, ver DulceriaService.eliminarProducto en el backend) — se puede
 * reactivar el producto editándolo y tildando "Disponible" de nuevo.
 */
export const ProductosDulceriaPanel = ({ token, productos, categorias, cargando, onCambio }: ProductosDulceriaPanelProps) => {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [productoEditando, setProductoEditando] = useState<ProductoDulceria | undefined>(undefined);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const handleNuevo = () => {
    setProductoEditando(undefined);
    setErrorForm(null);
    setMostrarForm(true);
  };

  const handleEditar = (producto: ProductoDulceria) => {
    setProductoEditando(producto);
    setErrorForm(null);
    setMostrarForm(true);
  };

  const handleEliminar = async (producto: ProductoDulceria) => {
    if (!window.confirm(`¿Quitar "${producto.nombre}" del menú? No se borra el historial de ventas — se puede reactivar después editándolo.`)) return;
    try {
      await eliminarProductoDulceria(producto.idProducto, token);
      await onCambio();
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'No se pudo quitar el producto del menú.');
    }
  };

  const handleGuardar = async (input: CrearProductoInput & ActualizarProductoInput) => {
    setGuardando(true);
    setErrorForm(null);
    try {
      if (productoEditando) {
        await actualizarProductoDulceria(productoEditando.idProducto, input, token);
      } else {
        await crearProductoDulceria(input, token);
      }
      setMostrarForm(false);
      await onCambio();
    } catch (err) {
      setErrorForm(err instanceof ApiError ? err.message : 'No se pudo guardar el producto.');
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
            <span className="material-symbols-outlined text-[20px]">add_circle</span>Nuevo producto
          </button>
        )}
      </div>

      {mostrarForm && (
        <ProductoDulceriaForm
          producto={productoEditando}
          categorias={categorias}
          guardando={guardando}
          error={errorForm}
          onGuardar={handleGuardar}
          onCancelar={() => setMostrarForm(false)}
        />
      )}

      {cargando ? (
        <p className="font-label-md text-label-md text-on-surface-variant">Cargando productos...</p>
      ) : (
        <ProductosDulceriaTabla productos={productos} categorias={categorias} onEditar={handleEditar} onEliminar={handleEliminar} />
      )}
    </div>
  );
};
