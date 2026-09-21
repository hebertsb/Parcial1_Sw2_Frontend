interface AvisoValidacionProps {
  children: React.ReactNode;
  /** 'advertencia' = ámbar, no bloquea guardar (ej. título repetido). 'error' = rojo, bloquea guardar (ej. solapamiento real). */
  tipo?: 'advertencia' | 'error';
}

/** Aviso inline sutil para validaciones de formularios del admin — mismo lenguaje visual en Película/Función/Sala/Precio/Promoción. */
export const AvisoValidacion = ({ children, tipo = 'advertencia' }: AvisoValidacionProps) => {
  const estilos =
    tipo === 'error'
      ? 'bg-error-container/15 text-error border-error/20'
      : 'bg-tertiary-container/15 text-tertiary border-tertiary/20';

  return (
    <div className={`flex items-start gap-space-xs px-space-sm py-space-xs rounded-lg border font-body-sm text-body-sm ${estilos}`}>
      <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">
        {tipo === 'error' ? 'error' : 'warning'}
      </span>
      <span>{children}</span>
    </div>
  );
};
