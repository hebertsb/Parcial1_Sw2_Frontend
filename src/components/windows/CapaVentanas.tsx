import { createPortal } from 'react-dom';
import { AnimatePresence } from 'motion/react';
import { ANCHO_VENTANA, useVentanas } from '../../core/ui/VentanasContext';
import { VentanaFlotante } from './VentanaFlotante';
import { ConfirmacionVentana, type DatosConfirmacion } from './ConfirmacionVentana';
import { ReporteVentana } from './ReporteVentana';
import { TicketVentana, type DatosTicketVoz } from './TicketVentana';

interface CapaVentanasProps {
  /** Manda "cancelá" a la conversacion (igual que decirlo). */
  onCancelar: () => void;
  /** Manda "confirmo" a la conversacion (solo lo usan las acciones de gestion del administrador). */
  onConfirmar: () => void;
}

/** Dibuja las ventanas que abrio el agente, por encima de la pagina (y por debajo del dock de voz). */
export const CapaVentanas = ({ onCancelar, onConfirmar }: CapaVentanasProps) => {
  const { ventanas, cerrar, enfocar, mover } = useVentanas();

  return createPortal(
    <AnimatePresence>
      {ventanas.map((ventana) => {
        const comunes = {
          ancho: ANCHO_VENTANA[ventana.tipo],
          x: ventana.x,
          y: ventana.y,
          z: ventana.z,
          onMover: (x: number, y: number) => mover(ventana.tipo, x, y),
          onEnfocar: () => enfocar(ventana.tipo),
          onCerrar: () => cerrar(ventana.tipo),
        };

        if (ventana.tipo === 'confirmacion') {
          const datos = ventana.datos as DatosConfirmacion;
          return (
            <VentanaFlotante key="confirmacion" titulo={datos.titulo ?? 'Confirmá la acción'} icono="fact_check" acento="primary" {...comunes}>
              <ConfirmacionVentana datos={datos} onCancelar={onCancelar} onConfirmar={datos.aviso ? undefined : onConfirmar} />
            </VentanaFlotante>
          );
        }
        if (ventana.tipo === 'reporte') {
          return (
            <VentanaFlotante key="reporte" titulo="Reporte" icono="analytics" acento="secondary" {...comunes}>
              <ReporteVentana datos={ventana.datos} />
            </VentanaFlotante>
          );
        }
        return (
          <VentanaFlotante key="ticket" titulo="Entrada digital" icono="confirmation_number" acento="tertiary" {...comunes}>
            <TicketVentana datos={ventana.datos as DatosTicketVoz} />
          </VentanaFlotante>
        );
      })}
    </AnimatePresence>,
    document.body,
  );
};
