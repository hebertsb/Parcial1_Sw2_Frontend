import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  titulo: string;
  onCerrar: () => void;
  children: ReactNode;
}

/** Modal genérico para los formularios de alta/edición del admin — reemplaza el patrón anterior de scrollear hasta el formulario. */
export const Modal = ({ titulo, onCerrar, children }: ModalProps) => {
  useEffect(() => {
    const alPresionarTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
    };
    document.addEventListener('keydown', alPresionarTecla);
    return () => document.removeEventListener('keydown', alPresionarTecla);
  }, [onCerrar]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-space-lg bg-surface-dim/80 backdrop-blur-sm"
      onClick={onCerrar}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-surface-container shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between px-space-lg py-space-md bg-surface-container border-b border-surface-container-highest">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">{titulo}</h2>
          <button
            onClick={onCerrar}
            className="w-9 h-9 rounded-lg flex items-center justify-center bg-surface-container-high hover:bg-surface-variant text-on-surface-variant transition-colors"
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <div className="p-space-lg">{children}</div>
      </div>
    </div>
  );
};
