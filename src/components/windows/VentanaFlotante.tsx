import { useRef, type PointerEvent, type ReactNode } from 'react';
import { motion } from 'motion/react';

interface VentanaFlotanteProps {
  titulo: string;
  icono: string;
  ancho: number;
  x: number;
  y: number;
  z: number;
  /** Color del icono y del borde superior: sigue el tono de cada tipo de ventana. */
  acento?: 'primary' | 'secondary' | 'tertiary';
  onMover: (x: number, y: number) => void;
  onEnfocar: () => void;
  onCerrar: () => void;
  children: ReactNode;
}

const COLOR_ACENTO = {
  primary: 'text-primary border-primary/60',
  secondary: 'text-secondary border-secondary/60',
  tertiary: 'text-tertiary border-tertiary/60',
} as const;

const limitar = (valor: number, minimo: number, maximo: number) => Math.min(Math.max(valor, minimo), maximo);

/**
 * Marco de una ventana flotante: se abre con una animacion, se arrastra desde la barra de titulo (sin salirse de
 * la pantalla) y pasa al frente al tocarla. El contenido lo pone quien la usa.
 */
export const VentanaFlotante = ({ titulo, icono, ancho, x, y, z, acento = 'primary', onMover, onEnfocar, onCerrar, children }: VentanaFlotanteProps) => {
  const arrastre = useRef<{ dx: number; dy: number } | null>(null);

  const alBajarPuntero = (e: PointerEvent<HTMLDivElement>) => {
    onEnfocar();
    if ((e.target as HTMLElement).closest('button')) return; // el boton de cerrar no arrastra
    arrastre.current = { dx: e.clientX - x, dy: e.clientY - y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const alMoverPuntero = (e: PointerEvent<HTMLDivElement>) => {
    if (!arrastre.current) return;
    onMover(
      limitar(e.clientX - arrastre.current.dx, 8 - ancho + 96, window.innerWidth - 96),
      limitar(e.clientY - arrastre.current.dy, 8, window.innerHeight - 64),
    );
  };

  const alSoltarPuntero = () => {
    arrastre.current = null;
  };

  return (
    <motion.section
      role="dialog"
      aria-label={titulo}
      data-ventana={titulo}
      className="fixed flex flex-col rounded-2xl bg-surface-container/95 backdrop-blur-2xl shadow-[0_24px_60px_-12px_rgba(0,0,0,0.9)] overflow-hidden select-none"
      // Alto maximo: lo que queda de pantalla debajo de donde esta (deja libre la barra inferior); si no entra, el contenido se desplaza.
      style={{ left: x, top: y, width: ancho, maxWidth: 'calc(100vw - 16px)', maxHeight: `max(240px, calc(100vh - ${y + 104}px))`, zIndex: z }}
      initial={{ opacity: 0, scale: 0.92, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: 8, transition: { duration: 0.16 } }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      onPointerDown={onEnfocar}
    >
      <div
        className={`flex items-center justify-between gap-space-sm px-space-md py-space-sm border-t-2 bg-surface-container-high/80 cursor-grab active:cursor-grabbing touch-none ${COLOR_ACENTO[acento]}`}
        onPointerDown={alBajarPuntero}
        onPointerMove={alMoverPuntero}
        onPointerUp={alSoltarPuntero}
        onPointerCancel={alSoltarPuntero}
      >
        <div className="flex items-center gap-space-xs min-w-0">
          <span className="material-symbols-outlined text-[20px]">{icono}</span>
          <span className="font-label-md text-label-md font-bold text-on-surface uppercase tracking-wider truncate">{titulo}</span>
        </div>
        <button
          type="button"
          onClick={onCerrar}
          aria-label={`Cerrar ${titulo}`}
          className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
      <div className="overflow-y-auto p-space-md select-text">{children}</div>
    </motion.section>
  );
};
