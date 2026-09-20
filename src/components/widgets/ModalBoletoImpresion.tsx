import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export interface DatosBoleto {
  idVenta?: number;
  pelicula: string;
  sala?: string;
  fecha?: string;
  hora?: string;
  asientos: string[];
  total: number;
  subtotal?: number;
  descuento?: number;
  dulceria?: Array<{ nombre: string; cantidad: number; precio?: number }>;
  cliente?: string;
  metodoPago?: string;
  fechaCompra?: string;
}

interface ModalBoletoImpresionProps {
  abierto: boolean;
  onCerrar: () => void;
  datos: DatosBoleto;
}

export const ModalBoletoImpresion: React.FC<ModalBoletoImpresionProps> = ({ abierto, onCerrar, datos }) => {
  const [animando, setAnimando] = useState(true);
  const [copiado, setCopiado] = useState(false);

  // Reiniciar la animación de impresión cada vez que se abre el modal o se presiona "Re-imprimir"
  const reiniciarImpresion = () => {
    setAnimando(false);
    setTimeout(() => setAnimando(true), 50);
  };

  useEffect(() => {
    if (abierto) {
      setAnimando(true);
      setCopiado(false);
    }
  }, [abierto]);

  if (!abierto || typeof document === 'undefined') return null;

  const fechaFormateada = datos.fecha
    ? new Date(`${datos.fecha}T00:00:00`).toLocaleDateString('es-BO', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('es-BO', { day: 'numeric', month: 'short', year: 'numeric' });

  const fechaCompra = datos.fechaCompra
    ? new Date(datos.fechaCompra).toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' })
    : new Date().toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' });

  const codigoVenta = datos.idVenta ? `#${datos.idVenta}` : '#DEMO-041';
  const codigoTxn = `TXN-${datos.idVenta ?? '41'}-${new Date().getFullYear()}-LUMEN`;

  const handleCopiar = () => {
    navigator.clipboard.writeText(
      `LUMEN CINEMA - Boleto ${codigoVenta} | Película: ${datos.pelicula} | Butacas: ${datos.asientos.join(', ')} | Total: Bs. ${datos.total.toFixed(2)}`
    );
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  const handleImprimir = () => {
    // Dispara el diálogo de impresión del navegador. El CSS @media print asegura que SOLO se imprima el ticket blanco
    window.print();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] overflow-y-auto bg-black/85 backdrop-blur-md animate-fadeIn select-none p-4 flex flex-col items-center justify-start sm:justify-center"
      onClick={onCerrar}
    >
      <style>{`
        @keyframes printSlideDown {
          0% {
            max-height: 0;
            transform: translateY(-50px);
            opacity: 0.2;
          }
          100% {
            max-height: 800px;
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes stampSlap {
          0% {
            transform: scale(2.8) rotate(-35deg);
            opacity: 0;
          }
          65% {
            transform: scale(0.9) rotate(-12deg);
            opacity: 0.95;
          }
          100% {
            transform: scale(1) rotate(-12deg);
            opacity: 0.88;
          }
        }
        @media print {
          body * {
            visibility: hidden !important;
          }
          #ticket-termico-impresion, #ticket-termico-impresion * {
            visibility: visible !important;
          }
          #ticket-termico-impresion {
            position: fixed !important;
            left: 50% !important;
            top: 15px !important;
            transform: translateX(-50%) !important;
            width: 80mm !important;
            max-width: 80mm !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: 1px solid #ddd !important;
            padding: 8px !important;
            margin: 0 !important;
          }
        }
      `}</style>

      {/* Botón flotante siempre visible en la esquina superior derecha */}
      <button
        onClick={onCerrar}
        title="Cerrar ventana"
        className="fixed top-5 right-5 z-[100000] flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-800/95 hover:bg-zinc-700 text-white text-xs font-bold border border-zinc-600/80 shadow-[0_4px_25px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all active:scale-95 cursor-pointer"
      >
        <span className="material-symbols-outlined text-[16px]">close</span>
        <span>Cerrar</span>
      </button>

      {/* Contenedor central del comprobante */}
      <div
        className="relative w-full max-w-sm flex flex-col items-center my-auto py-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Kiosco */}
        <div className="w-full flex items-center justify-between mb-2.5 px-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></span>
            <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
              Impresora Térmica
            </span>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">80mm · Laser 4K</span>
        </div>

        {/* 1. Ranura de la Impresora Térmica Física */}
        <div className="relative z-20 w-64 sm:w-72 h-7 rounded-full bg-gradient-to-b from-zinc-800 via-zinc-900 to-black border border-zinc-700/80 shadow-[0_8px_20px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(255,255,255,0.15)] flex items-center justify-center">
          {/* Abertura de salida del papel */}
          <div className="w-52 sm:w-60 h-2 rounded-full bg-black shadow-[inset_0_3px_5px_rgba(0,0,0,1)] relative flex items-center justify-between px-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></span>
          </div>
        </div>

        {/* 2. Papel de Boleto Térmico que se desliza saliendo de la ranura */}
        <div
          id="ticket-termico-impresion"
          className="relative z-10 w-72 sm:w-80 bg-white text-zinc-900 rounded-b-xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] border-x border-b border-zinc-200 overflow-hidden font-mono -mt-3"
          style={{
            animation: animando ? 'printSlideDown 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'none',
          }}
        >
          {/* Contenido interior del ticket */}
          <div className="p-4 sm:p-5 pt-5 sm:pt-6 flex flex-col gap-2 sm:gap-2.5">
            {/* Encabezado del Cine */}
            <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-2">
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-extrabold tracking-wider text-sm sm:text-base text-zinc-950">LUMEN CINEMA</span>
                </div>
                <p className="text-[9px] sm:text-[10px] text-zinc-600 font-sans tracking-tight">Kiosco de Autoservicio · Laser 4K</p>
              </div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-zinc-950 flex items-center justify-center text-amber-400 font-bold text-base sm:text-lg">
                🎟
              </div>
            </div>

            {/* Datos de la transacción */}
            <div className="text-[10px] sm:text-[11px] text-zinc-700 flex flex-col gap-0.5 pt-0.5">
              <div className="flex justify-between">
                <span className="text-zinc-500">BOLETO:</span>
                <span className="font-bold text-zinc-950">{codigoVenta}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">CLIENTE:</span>
                <span className="font-semibold text-zinc-900 truncate max-w-[150px]">{datos.cliente ?? 'USUARIO GENERAL'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">EMISIÓN:</span>
                <span>{fechaCompra}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">MÉTODO:</span>
                <span className="font-bold">{datos.metodoPago ? datos.metodoPago.toUpperCase() : 'TARJETA'}</span>
              </div>
            </div>

            {/* Gran Importe Total con Sello de Pagado */}
            <div className="relative my-1 sm:my-1.5 py-2 px-3 sm:px-4 rounded-xl bg-zinc-100/90 border border-zinc-200/90 flex items-center justify-between overflow-hidden">
              <div className="flex flex-col z-10">
                <span className="text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-widest font-sans font-bold">TOTAL PAGADO</span>
                <span className="text-xl sm:text-2xl font-black tracking-tight text-zinc-950">
                  Bs. {datos.total.toFixed(2)}
                </span>
              </div>

              {/* Sello de tinta roja "PAGADO" que cae con fuerza */}
              <div
                className="absolute right-2 sm:right-3 top-1.5 sm:top-2 border-2 border-dashed border-red-600 px-2 py-0.5 rounded text-red-600 font-black text-[10px] sm:text-xs uppercase tracking-widest pointer-events-none select-none"
                style={{
                  animation: animando ? 'stampSlap 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.85s both' : 'none',
                }}
              >
                ✓ PAGADO
              </div>
            </div>

            {/* Detalles de la Película y Butacas */}
            <div className="border-t border-dashed border-zinc-300 pt-2 flex flex-col gap-1.5">
              <div>
                <span className="text-[9px] text-zinc-500 font-sans uppercase font-bold">PELÍCULA</span>
                <h4 className="font-bold text-xs sm:text-sm text-zinc-950 leading-snug line-clamp-1">{datos.pelicula}</h4>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[10px] sm:text-[11px] bg-zinc-50 p-2 rounded-lg border border-zinc-200/60">
                <div>
                  <span className="text-zinc-500 block text-[8px] sm:text-[9px] font-sans font-bold">SALA</span>
                  <span className="font-bold text-zinc-900 truncate block">{datos.sala ?? 'Sala 1 - IMAX'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[8px] sm:text-[9px] font-sans font-bold">HORARIO</span>
                  <span className="font-bold text-zinc-900">{fechaFormateada} · {datos.hora ?? '20:25'}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] sm:text-[11px] pt-0.5">
                <span className="font-semibold text-zinc-700">
                  {datos.asientos.length}x ENTRADA{datos.asientos.length === 1 ? '' : 'S'}
                </span>
                <span className="font-bold text-zinc-950 bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300 text-[10px]">
                  BUTACAS: {datos.asientos.join(', ')}
                </span>
              </div>

              {/* Snacks si hay */}
              {datos.dulceria && datos.dulceria.length > 0 && (
                <div className="border-t border-dashed border-zinc-200 pt-1.5 flex flex-col gap-0.5 text-[9px] sm:text-[10px] text-zinc-700">
                  <span className="text-zinc-500 font-sans uppercase font-bold text-[8px]">CONFITERÍA:</span>
                  {datos.dulceria.map((d, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{d.cantidad}x {d.nombre}</span>
                      {d.precio ? <span>Bs. {(d.precio * d.cantidad).toFixed(2)}</span> : null}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Código de barras y mensaje final */}
            <div className="border-t-2 border-dashed border-zinc-300 pt-2.5 sm:pt-3 flex flex-col items-center gap-1 text-center">
              <p className="text-[9px] sm:text-[10px] text-zinc-600 font-sans tracking-tight">¡Presenta este boleto en el ingreso a la sala!</p>
              
              {/* Código de barras simulado */}
              <div className="w-full flex items-center justify-center gap-[2.5px] h-6 sm:h-7 px-2">
                {[2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 4, 2].map((w, i) => (
                  <span key={i} className="bg-zinc-950 h-full" style={{ width: `${w * 1.5}px` }} />
                ))}
              </div>
              <span className="text-[8px] sm:text-[9px] text-zinc-500 tracking-widest">{codigoTxn}</span>
            </div>
          </div>

          {/* Corte irregular de papel térmico (sawtooth / zig-zag) */}
          <div className="w-full h-2.5 bg-zinc-900 -mb-0.5" style={{
            maskImage: 'radial-gradient(circle at 5px 0px, transparent 5px, black 6px)',
            maskSize: '10px 10px',
            WebkitMaskImage: 'radial-gradient(circle at 5px 0px, transparent 5px, black 6px)',
            WebkitMaskSize: '10px 10px',
          }}></div>
        </div>

        {/* 3. Mensaje de éxito debajo del boleto */}
        <div className="mt-2.5 sm:mt-3 text-center space-y-0.5">
          <h3 className="text-white font-bold text-sm sm:text-base tracking-tight flex items-center justify-center gap-1.5">
            <span className="text-emerald-400">✓</span> Boleto Emitido con Éxito
          </h3>
          <p className="text-[11px] sm:text-xs text-zinc-400">
            Listo para ingresar a la sala. Puedes imprimirlo en papel o guardarlo en PDF.
          </p>
        </div>

        {/* 4. Botones de Acción */}
        <div className="mt-2.5 sm:mt-3 flex flex-wrap items-center justify-center gap-2 w-full max-w-sm">
          <button
            onClick={reiniciarImpresion}
            title="Volver a ver la animación de impresión"
            className="flex-1 min-w-[95px] h-9 sm:h-10 px-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-white font-label-md text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-white/10"
          >
            <span className="material-symbols-outlined text-[16px]">sync</span>
            <span>Re-imprimir</span>
          </button>

          <button
            onClick={handleImprimir}
            title="Imprimir solo el boleto o guardar como PDF"
            className="flex-1 min-w-[125px] h-9 sm:h-10 px-3 rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary-container font-label-md text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:scale-105 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[17px]">print</span>
            <span>Descargar PDF</span>
          </button>

          <button
            onClick={handleCopiar}
            title="Copiar código de la compra"
            className={`h-9 sm:h-10 px-3 rounded-xl font-label-md text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
              copiado
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-surface-container-high hover:bg-surface-container-highest text-white border-white/10'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">{copiado ? 'check' : 'content_copy'}</span>
            <span>{copiado ? '¡Copiado!' : 'Copiar'}</span>
          </button>
        </div>

        {/* Botón secundario para volver/cerrar */}
        <button
          onClick={onCerrar}
          className="mt-2 text-xs text-zinc-400 hover:text-white underline underline-offset-4 py-1 transition-colors"
        >
          Finalizar y volver a la compra
        </button>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
