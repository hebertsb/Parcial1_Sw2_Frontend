import type { SesionVoz } from '../../core/voice/useVoiceSession';
import type { ModoInteraccion } from '../../core/ui/useUiActionHandler';

interface EstadoConexionProps {
  modo: ModoInteraccion;
  voz: SesionVoz;
}

type Tono = 'verde' | 'ambar' | 'rojo' | 'gris';

const COLOR_PUNTO: Record<Tono, string> = {
  verde: 'bg-tertiary shadow-[0_0_8px_rgba(86,229,169,0.8)]',
  ambar: 'bg-primary-container shadow-[0_0_8px_rgba(245,158,11,0.7)]',
  rojo: 'bg-error shadow-[0_0_8px_rgba(255,180,171,0.6)]',
  gris: 'bg-on-surface-variant',
};
const COLOR_TEXTO: Record<Tono, string> = {
  verde: 'text-tertiary',
  ambar: 'text-primary',
  rojo: 'text-error',
  gris: 'text-on-surface-variant',
};

interface Estado {
  punto: Tono;
  /** Que pasa con el enlace del kiosco ("En linea", "Conectando al agente…"). */
  enlace: { texto: string; tono: Tono };
  /** Que pasa con el microfono; ausente cuando el enlace mismo esta en problemas. */
  mic?: { texto: string; tono: Tono };
  pulsa: boolean;
}

/** Lo que de verdad pasa con el microfono y el agente, segun el modo elegido y la conversacion (nada fijo). */
function calcularEstado(modo: ModoInteraccion, voz: SesionVoz): Estado {
  // Tactil: no hay microfono ni conversacion. Solo cuando se cambia a voz "se activa".
  if (modo === 'tactil') return { punto: 'verde', enlace: { texto: 'En línea', tono: 'verde' }, mic: { texto: 'Mic apagado', tono: 'gris' }, pulsa: false };

  if (voz.reconectando) return { punto: 'ambar', enlace: { texto: 'Reconectando con el agente…', tono: 'ambar' }, pulsa: true };
  if (voz.estado === 'conectando') return { punto: 'ambar', enlace: { texto: 'Conectando con el agente…', tono: 'ambar' }, pulsa: true };
  if (voz.estado === 'error') return { punto: 'rojo', enlace: { texto: 'Agente sin conexión', tono: 'rojo' }, pulsa: false };
  if (voz.estado === 'apagada') return { punto: 'verde', enlace: { texto: 'En línea', tono: 'verde' }, mic: { texto: 'Mic apagado', tono: 'gris' }, pulsa: false };

  // Conversacion en curso (escuchando, pensando o hablando)
  if (voz.silenciado) return { punto: 'verde', enlace: { texto: 'En línea', tono: 'verde' }, mic: { texto: 'Mic pausado', tono: 'ambar' }, pulsa: false };
  return { punto: 'verde', enlace: { texto: 'En línea', tono: 'verde' }, mic: { texto: 'Mic activo', tono: 'verde' }, pulsa: true };
}

/** Indicador de la cabecera: "En linea • Mic activo" solo cuando el microfono esta abierto de verdad. */
export const EstadoConexion = ({ modo, voz }: EstadoConexionProps) => {
  const estado = calcularEstado(modo, voz);
  return (
    <div data-testid="estado-conexion" className="flex items-center gap-space-xs px-space-sm py-space-xs rounded-full bg-surface-container-high">
      <div className={`w-2.5 h-2.5 rounded-full ${COLOR_PUNTO[estado.punto]} ${estado.pulsa ? 'animate-pulse' : ''}`}></div>
      <span className="font-label-code text-label-code uppercase tracking-wider hidden sm:inline">
        <span className={COLOR_TEXTO[estado.enlace.tono]}>{estado.enlace.texto}</span>
        {estado.mic && <span className={COLOR_TEXTO[estado.mic.tono]}> • {estado.mic.texto}</span>}
      </span>
    </div>
  );
};
