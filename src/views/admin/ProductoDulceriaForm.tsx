import { useState, type ChangeEvent, type FormEvent } from 'react';
import { subirImagen, CloudinaryError } from '../../api/cloudinary.api';
import type {
  CategoriaDulceria,
  ProductoDulceria,
  CrearProductoInput,
  ActualizarProductoInput,
  TipoProductoDulceria,
} from '../../core/types/dulceria.types';

const CAMPO = 'h-11 px-space-sm rounded-lg bg-surface-container text-on-surface font-body-sm text-body-sm outline-none shadow-inner w-full';
const LABEL = 'font-label-md text-label-md text-outline';

interface ProductoDulceriaFormProps {
  producto?: ProductoDulceria;
  categorias: CategoriaDulceria[];
  guardando: boolean;
  error: string | null;
  onGuardar: (input: CrearProductoInput & ActualizarProductoInput) => void;
  onCancelar: () => void;
}

export const ProductoDulceriaForm = ({ producto, categorias, guardando, error, onGuardar, onCancelar }: ProductoDulceriaFormProps) => {
  const [idCategoria, setIdCategoria] = useState(producto?.idCategoria ?? categorias[0]?.idCategoria ?? 0);
  const [nombre, setNombre] = useState(producto?.nombre ?? '');
  const [descripcion, setDescripcion] = useState(producto?.descripcion ?? '');
  const [precioBase, setPrecioBase] = useState(producto ? Number(producto.precioBase) : 0);
  const [tipo, setTipo] = useState<TipoProductoDulceria>(producto?.tipo ?? 'individual');
  const [etiqueta, setEtiqueta] = useState(producto?.etiqueta ?? '');
  const [disponible, setDisponible] = useState(producto?.disponible ?? true);
  const [imagenUrl, setImagenUrl] = useState(producto?.imagenUrl ?? '');
  const [subiendo, setSubiendo] = useState(false);
  const [errorSubida, setErrorSubida] = useState<string | null>(null);

  const handleArchivo = async (e: ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    setSubiendo(true);
    setErrorSubida(null);
    try {
      setImagenUrl(await subirImagen(archivo, 'dulceria'));
    } catch (err) {
      setErrorSubida(err instanceof CloudinaryError ? err.message : 'No se pudo subir la imagen.');
    } finally {
      setSubiendo(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onGuardar({
      idCategoria,
      nombre,
      descripcion: descripcion || undefined,
      precioBase,
      tipo,
      etiqueta: etiqueta || undefined,
      imagenUrl: imagenUrl || undefined,
      ...(producto ? { disponible } : {}),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-space-lg rounded-2xl bg-surface-container-low shadow-lg flex flex-col gap-space-md">
      <h2 className="font-headline-sm text-headline-sm text-on-surface">{producto ? 'Editar producto' : 'Nuevo producto'}</h2>

      {categorias.length === 0 ? (
        <p className="font-body-sm text-body-sm text-error">Creá primero una categoría en la pestaña "Categorías" antes de agregar productos.</p>
      ) : (
        <div className="flex flex-col md:flex-row gap-space-md">
          <div className="flex flex-col gap-space-2xs items-start shrink-0">
            <span className={LABEL}>Foto</span>
            {imagenUrl ? (
              <img src={imagenUrl} alt="" className="w-28 h-28 object-cover rounded-lg shadow-md" />
            ) : (
              <div className="w-28 h-28 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[32px]">fastfood</span>
              </div>
            )}
            <label className="px-space-sm py-space-xs rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-code text-label-code cursor-pointer transition-colors">
              {subiendo ? 'Subiendo...' : 'Elegir imagen'}
              <input type="file" accept="image/*" onChange={(e) => void handleArchivo(e)} disabled={subiendo} className="hidden" />
            </label>
            {errorSubida && <span className="font-body-sm text-body-sm text-error max-w-[10rem]">{errorSubida}</span>}
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-space-md">
            <label className="flex flex-col gap-space-2xs md:col-span-2">
              <span className={LABEL}>Nombre</span>
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} className={CAMPO} maxLength={120} required />
            </label>

            <label className="flex flex-col gap-space-2xs md:col-span-2">
              <span className={LABEL}>Descripción (opcional)</span>
              <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className={CAMPO} />
            </label>

            <label className="flex flex-col gap-space-2xs">
              <span className={LABEL}>Categoría</span>
              <select value={idCategoria} onChange={(e) => setIdCategoria(Number(e.target.value))} className={CAMPO} required>
                {categorias.map((categoria) => (
                  <option key={categoria.idCategoria} value={categoria.idCategoria}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-space-2xs">
              <span className={LABEL}>Precio base (Bs)</span>
              <input type="number" min={0.01} step={0.01} value={precioBase} onChange={(e) => setPrecioBase(Number(e.target.value))} className={CAMPO} required />
            </label>

            <label className="flex flex-col gap-space-2xs">
              <span className={LABEL}>Tipo</span>
              <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoProductoDulceria)} className={CAMPO}>
                <option value="individual">Individual</option>
                <option value="combo">Combo</option>
              </select>
            </label>

            <label className="flex flex-col gap-space-2xs">
              <span className={LABEL}>Etiqueta (opcional)</span>
              <input value={etiqueta} onChange={(e) => setEtiqueta(e.target.value)} className={CAMPO} maxLength={40} placeholder="Bestseller, Ahorro 25%..." />
            </label>

            {producto && (
              <label className="flex items-center gap-space-xs md:col-span-2">
                <input type="checkbox" checked={disponible} onChange={(e) => setDisponible(e.target.checked)} className="w-5 h-5" />
                <span className={LABEL}>Disponible (desmarcar para quitarlo del menú sin borrar su historial de ventas)</span>
              </label>
            )}
          </div>
        </div>
      )}

      {error && <p className="font-body-sm text-body-sm text-error">{error}</p>}

      <div className="flex items-center gap-space-sm">
        <button type="submit" disabled={guardando || subiendo || categorias.length === 0} className="px-space-lg py-space-sm rounded-xl bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-container transition-all disabled:opacity-50">
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
        <button type="button" onClick={onCancelar} className="px-space-lg py-space-sm rounded-xl bg-surface-container-high text-on-surface font-label-lg text-label-lg hover:bg-surface-variant transition-all">
          Cancelar
        </button>
      </div>
    </form>
  );
};
