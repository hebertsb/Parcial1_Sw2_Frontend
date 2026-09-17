import { useState } from 'react';
import { crearCategoriaDulceria, actualizarCategoriaDulceria, eliminarCategoriaDulceria } from '../../api/dulceria.api';
import { ApiError } from '../../api/client';
import type { CategoriaDulceria, ProductoDulceria, CrearCategoriaInput } from '../../core/types/dulceria.types';
import { CategoriasDulceriaTabla } from './CategoriasDulceriaTabla';
import { CategoriaDulceriaForm } from './CategoriaDulceriaForm';

interface CategoriasDulceriaPanelProps {
  token: string;
  categorias: CategoriaDulceria[];
  /** Todos los productos — para el badge "En uso" de CategoriasDulceriaTabla. */
  productos: ProductoDulceria[];
  cargando: boolean;
  onCambio: () => Promise<void>;
}

/** CU09/RF20 — CRUD real de `categorias_dulceria`, mismo patrón que `PreciosPanel.tsx`. */
export const CategoriasDulceriaPanel = ({ token, categorias, productos, cargando, onCambio }: CategoriasDulceriaPanelProps) => {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<CategoriaDulceria | undefined>(undefined);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const handleNuevo = () => {
    setCategoriaEditando(undefined);
    setErrorForm(null);
    setMostrarForm(true);
  };

  const handleEditar = (categoria: CategoriaDulceria) => {
    setCategoriaEditando(categoria);
    setErrorForm(null);
    setMostrarForm(true);
  };

  const handleEliminar = async (categoria: CategoriaDulceria) => {
    const enUso = productos.filter((p) => p.idCategoria === categoria.idCategoria).length;
    const aviso = enUso > 0
      ? `Esta categoría tiene ${enUso} producto(s) asociado(s) — el backend va a rechazar el borrado. ¿Intentar de todas formas?`
      : `¿Eliminar la categoría "${categoria.nombre}"?`;
    if (!window.confirm(aviso)) return;
    try {
      await eliminarCategoriaDulceria(categoria.idCategoria, token);
      await onCambio();
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'No se pudo eliminar la categoría.');
    }
  };

  const handleGuardar = async (input: CrearCategoriaInput) => {
    setGuardando(true);
    setErrorForm(null);
    try {
      if (categoriaEditando) {
        await actualizarCategoriaDulceria(categoriaEditando.idCategoria, input, token);
      } else {
        await crearCategoriaDulceria(input, token);
      }
      setMostrarForm(false);
      await onCambio();
    } catch (err) {
      setErrorForm(err instanceof ApiError ? err.message : 'No se pudo guardar la categoría.');
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
            <span className="material-symbols-outlined text-[20px]">add_circle</span>Nueva categoría
          </button>
        )}
      </div>

      {mostrarForm && (
        <CategoriaDulceriaForm categoria={categoriaEditando} guardando={guardando} error={errorForm} onGuardar={handleGuardar} onCancelar={() => setMostrarForm(false)} />
      )}

      {cargando ? (
        <p className="font-label-md text-label-md text-on-surface-variant">Cargando categorías...</p>
      ) : (
        <CategoriasDulceriaTabla categorias={categorias} productos={productos} onEditar={handleEditar} onEliminar={handleEliminar} />
      )}
    </div>
  );
};
