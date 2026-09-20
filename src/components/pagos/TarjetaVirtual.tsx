import type { CSSProperties } from 'react';
import type { EstadoCampoTarjeta } from '../../core/types/pago.types';
import { poligonoBiselado } from './MarcoBiselado';

type EstadoPuntos = 'vacio' | 'escribiendo' | 'completo' | 'error';

/** Cómo va un campo, para pintar sus puntos. Solo se sabe si está vacío, a medias, completo o inválido: lo escrito vive dentro de Stripe. */
export const estadoDe = (campo: EstadoCampoTarjeta): EstadoPuntos =>
  campo.error ? 'error' : campo.completo ? 'completo' : campo.vacio ? 'vacio' : 'escribiendo';

const CLASE_PUNTO: Record<EstadoPuntos, string> = {
  vacio: 'bg-white/25',
  escribiendo: 'bg-white/70 animate-pulse',
  completo: 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.75)]',
  error: 'bg-error shadow-[0_0_8px_rgba(255,180,171,0.6)]',
};

/** Puntos que "se llenan" a medida que el campo avanza (no se pueden mostrar los dígitos reales: Stripe los guarda en su iframe seguro). */
const Puntos = ({ cantidad, estado, retraso = 0 }: { cantidad: number; estado: EstadoPuntos; retraso?: number }) => (
  <span className="inline-flex items-center gap-[7px]">
    {Array.from({ length: cantidad }, (_, i) => (
      <span key={i} className={`h-[9px] w-[9px] rounded-full transition-all duration-500 ${CLASE_PUNTO[estado]}`} style={{ animationDelay: `${retraso + i * 90}ms` }} />
    ))}
  </span>
);

const MarcaTarjeta = ({ marca }: { marca: string }) => {
  switch (marca) {
    case 'visa':
      return <span className="font-black italic text-[26px] leading-none tracking-tight text-white">VISA</span>;
    case 'mastercard':
      return (
        <span className="relative inline-block h-8 w-12" aria-label="Mastercard">
          <span className="absolute left-0 top-0 h-8 w-8 rounded-full bg-[#eb001b]/90" />
          <span className="absolute right-0 top-0 h-8 w-8 rounded-full bg-[#f79e1b]/85 mix-blend-screen" />
        </span>
      );
    case 'amex':
      return <span className="rounded border border-sky-200/60 px-1.5 py-0.5 text-[15px] font-black tracking-[0.2em] text-sky-100">AMEX</span>;
    case 'unknown':
      return <span className="material-symbols-outlined text-[30px] text-white/25">credit_card</span>;
    default:
      return <span className="text-[15px] font-bold uppercase tracking-widest text-white/80">{marca}</span>;
  }
};

/** Chip EMV dorado. */
const Chip = () => (
  <span className="relative block h-9 w-12 overflow-hidden rounded-md bg-gradient-to-br from-[#ffe2a6] via-[#e9a92f] to-[#b9781a] shadow-inner">
    <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-black/25" />
    <span className="absolute inset-y-0 left-1/3 w-px bg-black/25" />
    <span className="absolute inset-y-0 right-1/3 w-px bg-black/25" />
    <span className="absolute left-1/3 right-1/3 top-1/4 bottom-1/4 rounded-sm border border-black/25" />
  </span>
);

interface TarjetaVirtualProps {
  titular: string;
  marca: string;
  numero: EstadoCampoTarjeta;
  vencimiento: EstadoCampoTarjeta;
  cvc: EstadoCampoTarjeta;
  /** Muestra el reverso (donde va el CVV). */
  volteada: boolean;
  /** El cobro se aprobó: la tarjeta se pone verde con un check. */
  aprobada: boolean;
}

const CARA: CSSProperties = { position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', clipPath: poligonoBiselado(22) };

/**
 * Tarjeta de vidrio que acompaña al formulario: se voltea al escribir el CVV, muestra la marca (Visa, Mastercard…) en cuanto Stripe la
 * detecta, el nombre del titular en vivo y puntos que se van llenando por campo. Es decorativa Y honesta: NO muestra los dígitos que se
 * escriben, porque los campos de tarjeta son de Stripe (iframes) y ni esta app ni el agente de voz pueden leerlos — por eso el pago es seguro.
 */
export const TarjetaVirtual = ({ titular, marca, numero, vencimiento, cvc, volteada, aprobada }: TarjetaVirtualProps) => {
  const estadoNumero = estadoDe(numero);
  const fondo = aprobada
    ? 'from-[#0f5c3f] via-[#12704d] to-[#0b4a34] border-tertiary/60'
    : 'from-[#23242c] via-[#15161b] to-[#0c0d11] border-primary-container/50';

  return (
    <div className="w-full max-w-[380px]" style={{ perspective: '1400px' }}>
      <div
        data-testid="tarjeta-virtual"
        data-volteada={volteada ? 'si' : 'no'}
        className="relative aspect-[1.586] w-full transition-transform duration-700 ease-[cubic-bezier(0.4,0.2,0.2,1)]"
        style={{ transformStyle: 'preserve-3d', transform: volteada ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* ----- frente ----- */}
        <div style={CARA} className={`bg-gradient-to-br ${fondo} border transition-colors duration-700`}>
          <div className="pointer-events-none absolute -right-10 -top-16 h-52 w-52 rounded-full bg-primary-container/15 blur-3xl" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          <div className="relative flex h-full flex-col justify-between p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Chip />
                <span className="material-symbols-outlined rotate-90 text-[22px] text-white/60">contactless</span>
              </div>
              <span className="font-label-code text-[11px] font-bold uppercase tracking-[0.3em] text-primary">Lumen Pass</span>
            </div>

            <div data-testid="tarjeta-numero" data-estado={estadoNumero} className="flex items-center justify-between gap-2 pr-1">
              {[0, 1, 2, 3].map((grupo) => (
                <Puntos key={grupo} cantidad={4} estado={estadoNumero} retraso={grupo * 140} />
              ))}
            </div>

            <div className="flex items-end justify-between gap-3">
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="font-label-code text-[9px] uppercase tracking-[0.25em] text-white/45">Titular</span>
                <span data-testid="tarjeta-titular" className="truncate font-label-md text-[14px] font-semibold uppercase tracking-widest text-white">
                  {titular.trim() || <span className="text-white/25">Nombre del titular</span>}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-label-code text-[9px] uppercase tracking-[0.25em] text-white/45">Vence</span>
                <span className="inline-flex items-center gap-1.5">
                  <Puntos cantidad={2} estado={estadoDe(vencimiento)} />
                  <span className="text-white/40">/</span>
                  <Puntos cantidad={2} estado={estadoDe(vencimiento)} retraso={180} />
                </span>
              </div>
              <div className="flex h-8 min-w-12 items-end justify-end">
                <MarcaTarjeta marca={marca} />
              </div>
            </div>
          </div>

          {aprobada && (
            <div className="absolute inset-0 grid place-items-center bg-[#0b3d2b]/40 backdrop-blur-[1px]">
              <span className="material-symbols-outlined animate-[pop_0.5s_ease-out] text-[72px] text-tertiary drop-shadow-[0_0_18px_rgba(86,229,169,0.65)]" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
          )}
        </div>

        {/* ----- reverso (CVV) ----- */}
        <div style={{ ...CARA, transform: 'rotateY(180deg)' }} className="border border-primary-container/50 bg-gradient-to-br from-[#1a1b21] via-[#101116] to-[#0a0b0e]">
          <div className="mt-6 h-11 w-full bg-black/90" />
          <div className="px-5 pt-5">
            <span className="font-label-code text-[9px] uppercase tracking-[0.25em] text-white/45">Código de seguridad (CVV)</span>
            <div className="mt-1.5 flex h-11 items-center justify-end rounded-md bg-white/[0.07] px-4 ring-1 ring-white/10">
              <Puntos cantidad={3} estado={estadoDe(cvc)} />
            </div>
            <p className="mt-4 font-body-sm text-[10.5px] leading-snug text-white/40">
              Este código se escribe en un campo seguro de Stripe. Lumen no lo ve ni lo guarda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
