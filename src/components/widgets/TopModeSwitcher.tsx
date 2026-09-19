import type { ReactNode } from 'react';
import type { SesionVoz } from '../../core/voice/useVoiceSession';
import { formatearSegundos } from '../../core/time/reloj';

interface TopModeSwitcherProps {
  mode: 'tactil' | 'hibrido' | 'voz';
  onChangeMode: (mode: 'tactil' | 'hibrido' | 'voz') => void;
  /** La conversacion de voz: de ahi salen el estado de la conexion y las latencias que se muestran junto al selector. */
  voz: SesionVoz;
  /** Contenido extra a la izquierda del selector (la consola de admin, que no tiene esos datos en su cabecera, los pone aca). */
  izquierda?: ReactNode;
}

/**
 * Selector de modo de interaccion. "Voz + UI Dinamica" no tapa la pantalla con una capa propia: al activarlo, el panel
 * de voz (VoiceStrip) aparece justo DEBAJO de este selector y la app real queda a la vista, que el agente va moviendo
 * segun lo que se le pide (ver routes/Layout.tsx: los dos comparten el mismo contenedor fijo).
 */
export const TopModeSwitcher = ({ mode, onChangeMode, voz, izquierda }: TopModeSwitcherProps) => {
  // "Pipeline WebSocket activo" solo cuando la conversacion esta realmente en marcha; si no, el titulo de siempre.
  const conectado = mode === 'hibrido' && (voz.estado === 'escuchando' || voz.estado === 'pensando' || voz.estado === 'hablando');
  return (
    <div data-testid="mode-switcher" className="flex flex-col w-full bg-surface-container-lowest">
      {/* Status Strip & Mode Toggle Anchor */}
      <div className="w-full px-space-lg py-space-sm flex flex-wrap items-center justify-between gap-space-md bg-surface-container-low/60 backdrop-blur-md">
        {/* Izquierda: lo que aporte la pantalla (ej. la consola de admin pone aca la hora y el estado del microfono) y el
            estado del pipeline de voz, que solo aparece con la conversacion en marcha (en Tactil no se muestra nada). */}
        {(izquierda || conectado) && (
          <div className="flex flex-wrap items-center gap-space-sm">
            {izquierda}
            {conectado && (
              <>
                <div className="flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-full bg-secondary-container/20 text-secondary">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
                  <span className="font-label-code text-label-code uppercase tracking-wider" data-testid="pipeline-estado">
                    Pipeline generativo WebSocket activo
                  </span>
                </div>
                {/* Numeros medidos de verdad: la latencia de ida y vuelta al agente y lo que tardo su ultima respuesta. */}
                {voz.latenciaMs !== null && (
                  <span className="font-label-code text-label-code text-on-surface-variant uppercase tracking-wider" data-testid="latencia-voz">
                    • Latencia: {voz.latenciaMs} ms
                    {voz.ultimaRespuestaMs !== null && <> • Respuesta: {formatearSegundos(voz.ultimaRespuestaMs)}</>}
                  </span>
                )}
              </>
            )}
          </div>
        )}

        {/* Toggle Mode Segmented Switch */}
        <div className="flex items-center bg-surface-container rounded-full p-1 shadow-md ml-auto">
          <button
            onClick={() => onChangeMode('tactil')}
            className={`px-space-md py-space-xs rounded-full font-label-md text-label-md transition-all flex items-center gap-space-2xs ${mode === 'tactil' ? 'bg-primary-container text-on-primary-container font-bold shadow-[0_0_16px_rgba(245,158,11,0.35)]' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            <span className="material-symbols-outlined text-[16px]">touch_app</span>
            <span>Modo Táctil</span>
          </button>
          <button
            onClick={() => onChangeMode('hibrido')}
            className={`px-space-md py-space-xs rounded-full font-label-md text-label-md transition-all flex items-center gap-space-2xs ${mode === 'hibrido' ? 'bg-primary-container text-on-primary-container font-bold shadow-[0_0_16px_rgba(245,158,11,0.35)]' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
            <span>Voz + UI Dinámica</span>
          </button>
          <button
            onClick={() => onChangeMode('voz')}
            className={`px-space-md py-space-xs rounded-full font-label-md text-label-md transition-all flex items-center gap-space-2xs ${mode === 'voz' ? 'bg-primary-container text-on-primary-container font-bold shadow-[0_0_16px_rgba(245,158,11,0.35)]' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            <span className="material-symbols-outlined text-[16px]">graphic_eq</span>
            <span>Solo Voz (Puro)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
