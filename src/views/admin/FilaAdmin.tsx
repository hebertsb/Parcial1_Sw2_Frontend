import { useEffect, useRef, type ReactNode } from 'react';
import { useUiControl, type EntidadAdmin } from '../../core/ui/UiControlContext';

interface FilaAdminProps {
  entidad: EntidadAdmin;
  id: number;
  children: ReactNode;
}

/**
 * Fila de una tabla del admin. Si el agente de voz acaba de crearla o cambiarla (`admin.resaltar`), se marca con un
 * fondo ambar y una barra a la izquierda y se centra en pantalla: asi se VE lo que hizo, en vez de tener que buscarlo.
 * La marca se apaga sola (ver UiControlContext). Sin agente, es una fila comun.
 */
export const FilaAdmin = ({ entidad, id, children }: FilaAdminProps) => {
  const { resaltadoAdmin } = useUiControl();
  const resaltada = resaltadoAdmin?.entidad === entidad && resaltadoAdmin.id === id;
  const ref = useRef<HTMLTableRowElement | null>(null);

  useEffect(() => {
    if (resaltada) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [resaltada, resaltadoAdmin?.n]);

  return (
    <tr
      ref={ref}
      data-fila-resaltada={resaltada ? 'true' : undefined}
      className={resaltada ? 'bg-primary-container/15 transition-colors [&>td:first-child]:shadow-[inset_4px_0_0_0_#f59e0b]' : 'transition-colors'}
    >
      {children}
    </tr>
  );
};
