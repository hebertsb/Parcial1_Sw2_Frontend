import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { SesionVoz } from '../../core/voice/useVoiceSession';

interface VoiceStripProps {
  voz: SesionVoz;
  onCerrar: () => void;
}

const ETIQUETA_ESTADO = {
  apagada: 'Tocá el micrófono para conversar',
  conectando: 'Conectando…',
  escuchando: 'Escuchando — hablá cuando quieras',
  pensando: 'Procesando…',
  hablando: 'Lumen AI responde — podés interrumpir',
  error: 'Conversación detenida — tocá el micrófono',
} as const;

const N_BARRAS = 5;

/**
 * Panel de voz de "Voz + UI Dinamica": una franja FIJA debajo del selector de modo, donde se ve en vivo lo que se
 * entiende (izquierda) y lo que contesta Lumen (derecha) mientras la app de abajo se mueve sola. No tapa nada de la app.
 *
 * Despues de cada intercambio, cuando el agente termina de hablar, vuelve solo a "escuchando" (ver `SesionVoz.turno`)
 * en vez de quedarse con la respuesta anterior.
 */
export const VoiceStrip = ({ voz, onCerrar }: VoiceStripProps) => {
  const orbeRef = useRef<HTMLDivElement | null>(null);
  const barrasRef = useRef<Array<HTMLSpanElement | null>>([]);
  const estadoRef = useRef(voz.estado);
  const silenciadoRef = useRef(voz.silenciado);
  estadoRef.current = voz.estado;
  silenciadoRef.current = voz.silenciado;

  const [escribiendo, setEscribiendo] = useState(false);
  const [texto, setTexto] = useState('');

  // El aro del microfono y el ecualizador respiran con la voz (se lee el nivel sin re-renderizar React).
  useEffect(() => {
    let cuadro = 0;
    const animar = () => {
      const nivel = silenciadoRef.current ? 0 : Math.min(voz.nivelMicRef.current * 7, 1);
      const orbe = orbeRef.current;
      if (orbe) {
        orbe.style.transform = `scale(${1 + nivel * 0.22})`;
        orbe.style.opacity = String(0.35 + nivel * 0.5);
      }
      const t = performance.now() / 160;
      const habla = estadoRef.current === 'hablando';
      barrasRef.current.forEach((barra, i) => {
        if (!barra) return;
        const onda = 0.5 + 0.5 * Math.sin(t + i * 1.4);
        const altura = habla ? 0.3 + 0.7 * onda : 0.16 + nivel * (0.4 + 0.6 * onda);
        barra.style.transform = `scaleY(${altura.toFixed(3)})`;
      });
      cuadro = requestAnimationFrame(animar);
    };
    cuadro = requestAnimationFrame(animar);
    return () => cancelAnimationFrame(cuadro);
  }, [voz.nivelMicRef]);

  const apagada = voz.estado === 'apagada' || voz.estado === 'error';
  const etiqueta = voz.reconectando
    ? 'Reconectando con el asistente…'
    : voz.silenciado && !apagada
      ? 'Micrófono pausado'
      : voz.estado === 'escuchando' && voz.usuarioHablando
        ? 'Te escucho…'
        : ETIQUETA_ESTADO[voz.estado];

  // Un fallo de la conversacion (se cayo la conexion, no hay microfono) se queda; el de un turno se va con el turno.
  const error = voz.estado === 'error' ? voz.error : voz.turno.error;

  const colorOrbe = voz.silenciado || voz.estado === 'error'
    ? 'bg-error text-on-error'
    : voz.estado === 'escuchando'
      ? 'bg-secondary text-on-secondary'
      : voz.estado === 'hablando'
        ? 'bg-primary-container text-on-primary-container'
        : 'bg-surface-container-highest text-on-surface';

  const chip = voz.estado === 'pensando'
    ? { texto: 'Procesando', clase: 'bg-primary-container/25 text-primary animate-pulse' }
    : voz.estado === 'hablando'
      ? { texto: 'Respondiendo', clase: 'bg-tertiary/15 text-tertiary' }
      : error
        ? { texto: 'No se pudo', clase: 'bg-error-container text-on-error-container' }
        : null;

  const alOrbe = () => {
    if (apagada) void voz.iniciar();
    else if (voz.estado === 'hablando') voz.interrumpir();
    else voz.silenciar(!voz.silenciado);
  };

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (!texto.trim()) return;
    voz.enviarTexto(texto);
    setTexto('');
  };

  return (
    <section data-testid="voice-strip" aria-label="Asistente de voz" className="w-full px-space-lg pb-space-sm bg-surface-container-lowest">
      <div className="flex flex-col lg:flex-row items-stretch gap-space-sm">
        {/* Lo que se le entiende al usuario */}
        <div className="flex items-center gap-space-md rounded-2xl bg-surface-container px-space-md py-space-xs shadow-md lg:basis-5/12 min-w-0 h-24 overflow-hidden">
          <button
            type="button"
            onClick={alOrbe}
            aria-label={apagada ? 'Iniciar la conversación' : voz.estado === 'hablando' ? 'Interrumpir a Lumen' : voz.silenciado ? 'Reactivar el micrófono' : 'Pausar el micrófono'}
            className={`relative w-14 h-14 shrink-0 rounded-full flex items-center justify-center transition-colors ${colorOrbe}`}
          >
            <div ref={orbeRef} className="absolute inset-0 rounded-full bg-secondary/50 pointer-events-none" />
            <span className="relative material-symbols-outlined text-[28px]">
              {apagada ? 'mic' : voz.silenciado ? 'mic_off' : voz.estado === 'hablando' ? 'graphic_eq' : voz.estado === 'pensando' ? 'more_horiz' : 'mic'}
            </span>
          </button>
          <div className="flex-1 min-w-0 flex flex-col gap-space-2xs">
            <div className="flex items-center gap-space-xs">
              <span className="font-label-code text-label-code text-secondary uppercase tracking-wider truncate" data-testid="strip-estado">
                {etiqueta}
              </span>
              <span aria-hidden className="flex items-center gap-[3px] h-4 shrink-0">
                {Array.from({ length: N_BARRAS }, (_, i) => (
                  <span
                    key={i}
                    ref={(el) => {
                      barrasRef.current[i] = el;
                    }}
                    className="w-[3px] h-4 rounded-full bg-secondary origin-center"
                  />
                ))}
              </span>
            </div>
            {voz.turno.transcript ? (
              <p className="font-body-md text-body-md text-on-surface italic line-clamp-2" data-testid="strip-transcript">
                “{voz.turno.transcript}”
              </p>
            ) : (
              <p className="font-body-md text-body-md text-on-surface-variant/70 line-clamp-2" data-testid="strip-transcript-vacio">
                Decime qué querés hacer…
              </p>
            )}
          </div>
        </div>

        {/* Lo que contesta el agente */}
        <div className="flex items-start gap-space-md rounded-2xl bg-surface-container px-space-md py-space-xs shadow-md lg:basis-7/12 min-w-0 h-24 overflow-hidden">
          <div className="w-12 h-12 mt-space-2xs shrink-0 rounded-xl bg-surface-container-highest text-secondary flex items-center justify-center">
            <span className="material-symbols-outlined text-[26px]">smart_toy</span>
          </div>
          <div className="flex-1 min-w-0 h-full flex flex-col gap-space-2xs py-space-2xs">
            <div className="flex items-center gap-space-xs shrink-0">
              <span className="font-label-code text-label-code text-secondary uppercase tracking-wider truncate">Agente Lumen AI (voz)</span>
              {chip && <span className={`px-space-xs py-[1px] rounded-md font-label-code text-label-code ${chip.clase}`}>{chip.texto}</span>}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {error ? (
                <p className="font-body-sm text-body-sm text-error" data-testid="strip-error">
                  {error}
                </p>
              ) : voz.turno.respuesta ? (
                <p className="font-body-sm text-body-sm text-on-surface" data-testid="strip-respuesta">
                  {voz.turno.respuesta}
                </p>
              ) : (
                <p className="font-body-sm text-body-sm text-on-surface-variant/70" data-testid="strip-respuesta-vacio">
                  Lista para ayudarte: pedime la cartelera, entradas o algo de la dulcería.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="flex lg:flex-col items-center justify-center gap-space-2xs shrink-0">
          <button
            type="button"
            onClick={() => setEscribiendo((v) => !v)}
            aria-label="Escribir en vez de hablar"
            aria-pressed={escribiendo}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${escribiendo ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container text-on-surface-variant hover:bg-surface-variant'}`}
          >
            <span className="material-symbols-outlined text-[20px]">keyboard</span>
          </button>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar el asistente de voz"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      </div>

      {escribiendo && (
        <form onSubmit={enviar} className="mt-space-xs flex items-center gap-space-xs rounded-full bg-surface-container px-space-md py-space-xs">
          <input
            autoFocus
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribí lo que le dirías a Lumen…"
            aria-label="Escribir un mensaje a Lumen"
            className="flex-1 bg-transparent outline-none font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant"
          />
          <button type="submit" className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center" aria-label="Enviar">
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </form>
      )}
    </section>
  );
};
