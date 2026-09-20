import type { CSSProperties, ReactNode } from 'react';

/** Recorte con las esquinas superior izquierda e inferior derecha cortadas en diagonal (el "biselado" del diseño de vidrio). */
export const poligonoBiselado = (corte: number): string =>
  `polygon(${corte}px 0, 100% 0, 100% calc(100% - ${corte}px), calc(100% - ${corte}px) 100%, 0 100%, 0 ${corte}px)`;

interface MarcoBiseladoProps {
  children: ReactNode;
  /** Largo del corte de las esquinas, en px. */
  corte?: number;
  className?: string;
  /** Clases del contenido (relleno, fondo). El borde de 1px de degradado ámbar lo pone este componente. */
  claseInterior?: string;
  style?: CSSProperties;
}

/**
 * Panel de vidrio con esquinas cortadas y un filo fino de degradado ámbar. `clip-path` no admite `border`, así que el filo es una capa
 * exterior de 1px de relleno con el mismo recorte y el contenido va dentro, recortado igual.
 */
export const MarcoBiselado = ({ children, corte = 28, className = '', claseInterior = '', style }: MarcoBiseladoProps) => (
  <div className={`p-px bg-gradient-to-br from-primary-container/80 via-white/10 to-primary-container/35 ${className}`} style={{ clipPath: poligonoBiselado(corte), ...style }}>
    <div className={`h-full w-full bg-[#0a0b0f]/85 backdrop-blur-2xl ${claseInterior}`} style={{ clipPath: poligonoBiselado(corte) }}>
      {children}
    </div>
  </div>
);
