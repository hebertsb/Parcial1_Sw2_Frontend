import { useState, useEffect } from 'react';
import { useCine } from '../controllers/CineContext';
import { SeleccionButacas } from '../components/widgets/SeleccionButacas';
import { CandyBarSelection } from '../components/widgets/CandyBarSelection';

const MOCK_CANDYBAR = [
  { id: 'c1', nombre: 'Combo Pareja Épico', descripcion: 'Mitad Salada / Mitad Caramelo', precio: 65.00, imagenUrl: '' },
];

export const ProcesoCompra = ({ onVoiceCommand }: { onVoiceCommand?: () => void }) => {
  const { state, dispatch } = useCine();
  
  const totalEntradas = state.butacasSeleccionadas.reduce((acc, b) => acc + b.precio, 0);
  const totalSnacks = state.candyBarSeleccionado.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  const total = totalEntradas + totalSnacks;

  const handleNextStep = () => {
    if (state.estadoCompra === 'seleccionando_asientos') {
      dispatch({ type: 'SET_ESTADO_COMPRA', payload: 'seleccionando_candybar' });
    } else if (state.estadoCompra === 'seleccionando_candybar') {
      dispatch({ type: 'SET_ESTADO_COMPRA', payload: 'pago' });
    } else if (state.estadoCompra === 'pago') {
      dispatch({ type: 'SET_ESTADO_COMPRA', payload: 'completado' });
    }
  };

  const handleVolver = () => {
    if (state.estadoCompra === 'pago') {
      dispatch({ type: 'SET_ESTADO_COMPRA', payload: 'seleccionando_candybar' });
    } else if (state.estadoCompra === 'seleccionando_candybar') {
      dispatch({ type: 'SET_ESTADO_COMPRA', payload: 'seleccionando_asientos' });
    } else if (state.estadoCompra === 'seleccionando_asientos') {
      dispatch({ type: 'RESETEAR_COMPRA' });
    }
  };

  const hasSnacks = state.candyBarSeleccionado.length > 0;
  
  const toggleSnackExpress = () => {
    const item = MOCK_CANDYBAR[0];
    if (hasSnacks) {
      dispatch({ type: 'ACTUALIZAR_CANDYBAR', payload: { ...item, cantidad: 0 } });
    } else {
      dispatch({ type: 'ACTUALIZAR_CANDYBAR', payload: { ...item, cantidad: 1 } });
    }
  };

  // Completion view
  if (state.estadoCompra === 'completado') {
    return (
      <div className="flex flex-col w-full relative overflow-hidden select-none bg-surface-container-lowest text-on-surface h-full">
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[85vw] max-w-[1100px] h-[580px] bg-gradient-to-b from-primary/15 via-secondary/5 to-transparent blur-[110px] rounded-full opacity-70"></div>
          <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary-container/10 blur-[130px] rounded-full"></div>
          <div className="absolute bottom-1/3 -right-40 w-[420px] h-[420px] bg-secondary-container/15 blur-[140px] rounded-full"></div>
        </div>

        <div className="max-w-6xl mx-auto flex flex-col gap-space-xl relative z-10 w-full">
          <div className="flex flex-col md:flex-row items-center justify-between gap-space-md p-space-lg rounded-xl bg-surface-container/90 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-space-md">
              <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-tertiary-container via-tertiary to-primary shadow-[0_0_32px_rgba(86,229,169,0.35)]">
                <span className="material-symbols-outlined text-on-tertiary text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                <div className="absolute inset-0 rounded-2xl border-2 border-tertiary-fixed opacity-40 animate-ping"></div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-space-xs">
                  <span className="font-label-code text-label-code text-tertiary uppercase tracking-widest bg-tertiary/10 px-space-xs py-space-2xs rounded-full">Proceso RF-04 Completado</span>
                  <span className="font-label-code text-label-code text-on-surface-variant">• Autorizado por Red Bancaria</span>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">¡Compra Confirmada con Éxito!</h1>
                <p className="font-body-md text-body-md text-on-surface-variant">Tu transacción <span className="font-headline-sm text-headline-sm text-primary font-bold">#LMN-84920</span> ha sido procesada correctamente.</p>
              </div>
            </div>
            <div className="flex items-center gap-space-md w-full md:w-auto justify-end">
              <button onClick={() => dispatch({ type: 'RESETEAR_COMPRA' })} className="h-touch-target-kiosk px-space-lg rounded-xl bg-surface-container-highest hover:bg-error-container hover:text-on-error-container text-on-surface font-label-lg text-label-lg flex items-center gap-space-xs transition-all duration-300 shadow-md active:scale-95">
                <span className="material-symbols-outlined text-[22px]">logout</span>
                <span>Finalizar y Salir</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
            <div className="lg:col-span-7 flex flex-col gap-space-md">
              <div className="relative overflow-hidden rounded-xl bg-surface-container-low shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
                <div className="relative w-full h-44 overflow-hidden">
                  <img src={state.peliculaSeleccionada?.posterUrl} alt="" className="w-full h-full object-cover object-center filter brightness-50 contrast-125" />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-surface-container-low/60 to-transparent"></div>
                  <div className="absolute top-space-md left-space-md right-space-md flex items-center justify-between">
                    <div className="flex items-center gap-space-xs bg-surface-container-lowest/80 backdrop-blur-md px-space-sm py-space-2xs rounded-full">
                      <span className="material-symbols-outlined text-primary text-[16px]">stars</span>
                      <span className="font-label-code text-label-code text-primary tracking-widest uppercase">VIP EXPANDED PASS</span>
                    </div>
                  </div>
                  <div className="absolute bottom-space-md left-space-md right-space-md flex flex-col">
                    <span className="font-label-code text-label-code text-secondary tracking-widest uppercase">LUMEN CINEMA VIP • SALA 3 IMAX LÁSER</span>
                    <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">{state.peliculaSeleccionada?.titulo}</h2>
                  </div>
                </div>
                
                <div className="p-space-lg flex flex-col gap-space-lg">
                  <div className="grid grid-cols-3 gap-space-sm p-space-md rounded-xl bg-surface-container">
                    <div className="flex flex-col">
                      <span className="font-label-code text-label-code text-on-surface-variant uppercase">Fecha & Horario</span>
                      <span className="font-headline-sm text-headline-sm text-on-surface mt-1">Hoy, 24 Oct</span>
                      <span className="font-label-md text-label-md text-primary font-bold">{state.horarioSeleccionado}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="font-label-code text-label-code text-on-surface-variant uppercase">Puerta & Nivel</span>
                      <span className="font-headline-sm text-headline-sm text-secondary mt-1">Puerta A</span>
                      <span className="font-label-md text-label-md text-on-surface">Segundo Nivel</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-label-code text-label-code text-on-surface-variant uppercase">Auditorio</span>
                      <span className="font-headline-sm text-headline-sm text-primary mt-1">Sala 03</span>
                      <span className="font-label-md text-label-md text-tertiary">Laser 4K HDR</span>
                    </div>
                  </div>

                  <div className="p-space-lg rounded-xl bg-gradient-to-r from-surface-container-high via-surface-container to-surface-container-high shadow-inner flex flex-col sm:flex-row items-center justify-between gap-space-md">
                    <div className="flex items-center gap-space-md">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[32px]">chair</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-code text-label-code text-on-surface-variant uppercase tracking-wider">Butacas VIP Reclinables</span>
                        <span className="font-display-hero-mobile text-display-hero-mobile text-primary font-bold tracking-tight">{state.butacasSeleccionadas.map(b => b.id).join(', ')}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-space-xs">
                      <span className="font-label-code text-label-code text-tertiary uppercase font-bold bg-tertiary/10 px-space-sm py-space-2xs rounded-full">{state.butacasSeleccionadas.length} Boletos VIP</span>
                      <span className="font-headline-sm text-headline-sm text-on-surface">Bs. {total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-space-lg p-space-md rounded-xl bg-surface-container-lowest">
                    <div className="flex flex-col items-start gap-space-xs">
                      <div className="flex items-center gap-space-xs text-primary">
                        <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
                        <span className="font-label-code text-label-code uppercase tracking-widest font-bold">Escaneo Obligatorio</span>
                      </div>
                      <span className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">Coloca este código frente al visor óptico en el torniquete de acceso o muestra en Sala 3.</span>
                    </div>
                    <div className="relative p-space-sm bg-surface-bright rounded-xl shadow-[0_0_24px_rgba(245,158,11,0.2)] flex flex-col items-center">
                      <div className="p-space-xs bg-surface-container-lowest rounded-lg shadow-inner">
                        <svg className="w-24 h-24" fill="none" viewBox="0 0 100 100">
                          <rect fill="#FFFFFF" height="100" width="100"></rect>
                          <rect fill="#0C0E13" height="22" width="22" x="10" y="10"></rect>
                          <rect fill="#FFFFFF" height="14" width="14" x="14" y="14"></rect>
                          <rect fill="#0C0E13" height="8" width="8" x="17" y="17"></rect>
                          <rect fill="#0C0E13" height="22" width="22" x="68" y="10"></rect>
                          <rect fill="#FFFFFF" height="14" width="14" x="72" y="14"></rect>
                          <rect fill="#0C0E13" height="8" width="8" x="75" y="17"></rect>
                          <rect fill="#0C0E13" height="22" width="22" x="10" y="68"></rect>
                          <rect fill="#FFFFFF" height="14" width="14" x="14" y="72"></rect>
                          <rect fill="#0C0E13" height="8" width="8" x="17" y="75"></rect>
                          <rect fill="#0C0E13" height="6" width="6" x="36" y="12"></rect>
                          <rect fill="#0C0E13" height="4" width="16" x="46" y="12"></rect>
                          <rect fill="#0C0E13" height="10" width="10" x="36" y="22"></rect>
                        </svg>
                      </div>
                      <span className="mt-2 font-label-code text-label-code text-on-surface tracking-wider font-bold">PASS-ID: 992-VIP</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-5 flex flex-col gap-space-lg">
              <div className="p-space-lg rounded-xl bg-surface-container shadow-xl flex flex-col gap-space-md">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-primary text-[24px]">send_to_mobile</span>
                  <h3 className="font-headline-md text-headline-md text-on-surface">Opciones de Entrega</h3>
                </div>
                <button className="h-touch-target-kiosk w-full p-space-md rounded-xl bg-surface-container-high hover:bg-surface-container-highest transition-all flex items-center justify-between group active:scale-[0.99] text-left">
                  <div className="flex items-center gap-space-md">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[26px]">print</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-lg text-label-lg text-on-surface font-bold">Imprimir Ticket Físico</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">En papel térmico de alta durabilidad</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">chevron_right</span>
                </button>
              </div>

              <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-space-md p-space-md rounded-xl bg-surface-container-low">
                <div className="flex items-center gap-space-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
                  <span className="font-label-code text-label-code uppercase tracking-wider">Transacción Cifrada TLS 1.3</span>
                </div>
                <button onClick={() => dispatch({ type: 'RESETEAR_COMPRA' })} className="h-touch-target-min px-space-lg rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold hover:bg-primary-container transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-95 flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[20px]">home</span>
                  <span>Volver al Inicio</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden w-full bg-surface-container-lowest relative z-10">
      {/* Central Dynamic Workspace (Interactive Seating & Generative Sidebar) */}
      <div className="w-full px-space-lg py-space-xl max-w-[1720px] mx-auto flex-grow overflow-hidden flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg flex-grow overflow-hidden">
          
          {/* Left Column: Dynamic Step Content */}
          <div className="lg:col-span-8 bg-surface-container-low rounded-xl p-space-md md:p-space-lg flex flex-col relative overflow-y-auto shadow-2xl">
            {state.estadoCompra === 'seleccionando_asientos' && <SeleccionButacas />}
            {state.estadoCompra === 'seleccionando_candybar' && <CandyBarSelection />}
            
            {state.estadoCompra === 'pago' && (
            <div className="flex flex-col gap-space-lg">
              <div className="flex flex-col gap-space-2xs">
                <div className="flex items-center gap-space-xs text-secondary">
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  <span className="font-label-code text-label-code tracking-widest uppercase">Canal Cifrado • EMV L1/L2 & Simple QR</span>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface">Seleccione Método de Pago</h1>
                <p className="font-body-md text-body-md text-on-surface-variant">Interacción directa táctil con periféricos de autoservicio integrados al Kiosco 04.</p>
              </div>

              <div className="cursor-pointer transition-all duration-300 rounded-2xl bg-surface-container p-space-md shadow-md border-primary border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-md">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[28px]">contactless</span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-space-xs">
                        <span className="font-headline-sm text-headline-sm text-on-surface">Tarjeta Débito / Crédito</span>
                        <span className="px-space-xs py-0.5 rounded bg-primary text-on-primary font-label-code text-label-code">Kiosco POS</span>
                      </div>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Contactless NFC, Chip EMV o Banda Magnética</span>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary">
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  </div>
                </div>

                <div className="mt-space-md pt-space-sm bg-surface-container-lowest/60 rounded-xl p-space-sm flex flex-col sm:flex-row items-center justify-between gap-space-sm">
                  <div className="flex items-center gap-space-sm">
                    <div className="relative w-10 h-10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-secondary text-[32px] animate-pulse">credit_card</span>
                      <div className="absolute inset-0 rounded-full bg-secondary/20 animate-ping"></div>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-on-surface font-bold">Lector Físico POS Habilitado</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Acerque su tarjeta al sensor frontal o inserte en ranura</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-xs px-space-sm py-1 rounded bg-secondary/10 text-secondary">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    <span className="font-label-code text-label-code">Esperando Tarjeta...</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-error-container/20 p-space-md flex flex-col gap-space-md shadow-md">
                <div className="flex items-start gap-space-sm">
                  <div className="w-10 h-10 rounded-xl bg-error/20 flex items-center justify-center text-error shrink-0">
                    <span className="material-symbols-outlined text-[24px]">gpp_maybe</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-space-xs">
                      <span className="font-headline-sm text-headline-sm text-error uppercase tracking-wide">Política Estricta de No Reembolso</span>
                      <span className="px-space-2xs py-0.5 rounded bg-error text-on-error font-label-code text-label-code">RF03 COMPLIANCE</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-error-container">
                      De acuerdo a la normativa legal, una vez procesado el pago <strong className="text-on-surface font-bold">no se aceptan cancelaciones ni devoluciones</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Always Sidebar Resumen */}
        <div className="lg:col-span-4 flex flex-col gap-space-md">
          <div className="bg-surface-container rounded-2xl p-space-lg flex flex-col gap-space-md shadow-xl relative overflow-hidden flex-grow">
            <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none"></div>
            <div className="flex items-center justify-between">
              <span className="font-label-code text-label-code text-primary uppercase tracking-widest">Resumen de Compra</span>
              <span className="px-space-xs py-1 rounded-full bg-primary/10 text-primary font-label-code text-label-code font-bold">Kiosco #04</span>
            </div>

            <div className="flex items-center gap-space-md pb-space-sm bg-surface-container-low p-space-sm rounded-xl">
              <img src={state.peliculaSeleccionada?.posterUrl} alt="" className="w-20 h-28 object-cover rounded-lg shadow-md shrink-0" />
              <div className="flex flex-col gap-space-2xs">
                <span className="font-headline-sm text-headline-sm text-on-surface line-clamp-1">{state.peliculaSeleccionada?.titulo}</span>
                <span className="font-body-sm text-body-sm text-primary font-bold">Sala 3 • IMAX Láser</span>
                <div className="flex items-center gap-space-xs text-on-surface-variant font-label-code text-label-code">
                  <span className="material-symbols-outlined text-[16px] text-secondary">calendar_today</span>
                  <span>Hoy 24 Oct, {state.horarioSeleccionado}</span>
                </div>
                <div className="flex items-center gap-space-xs text-on-surface-variant font-label-code text-label-code">
                  <span className="material-symbols-outlined text-[16px] text-secondary">surround_sound</span>
                  <span>Audio Inmersivo Dolby Atmos</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-space-xs py-space-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-primary text-[20px]">event_seat</span>
                  <span className="font-label-md text-label-md text-on-surface">Butacas VIP Recliner</span>
                </div>
                <span className="font-label-md text-label-md text-primary font-bold px-space-xs py-0.5 rounded bg-primary/10">
                  {state.butacasSeleccionadas.length > 0 ? state.butacasSeleccionadas.map(b => b.id).join(', ') : 'Ninguna'}
                </span>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm">
                <span>{state.butacasSeleccionadas.length}x Entradas IMAX</span>
                <span>{totalEntradas.toFixed(2)} Bs</span>
              </div>
            </div>

            {hasSnacks && (
              <div className="flex flex-col gap-space-xs">
                <span className="font-label-code text-label-code uppercase tracking-wider text-on-surface-variant">Confitería & Snacks</span>
                {state.candyBarSeleccionado.map(snack => (
                  <div key={snack.id} className="rounded-lg bg-surface-container p-space-md flex flex-col gap-space-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-label-md text-label-md text-on-surface font-semibold">{snack.cantidad}x {snack.nombre}</span>
                      <span className="font-label-md text-label-md text-on-surface font-bold">{(snack.precio * snack.cantidad).toFixed(2)} Bs</span>
                    </div>
                    <div className="flex items-center justify-between mt-space-2xs">
                      <span className="font-label-code text-label-code text-tertiary">Preparación en curso</span>
                      <button onClick={() => dispatch({ type: 'ACTUALIZAR_CANDYBAR', payload: { ...snack, cantidad: 0 } })} className="text-error font-label-code text-label-code hover:underline flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[14px]">delete</span> Quitar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(state.estadoCompra === 'pago' || state.estadoCompra === 'seleccionando_candybar') && (
              <div className="bg-surface-container p-space-md rounded-xl mb-space-md border border-surface-container-highest">
                <div className="flex items-start justify-between gap-space-sm mb-space-xs">
                  <div className="flex items-center gap-space-xs">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[20px]">fastfood</span>
                    </div>
                    <div>
                      <h3 className="font-label-lg text-label-lg font-bold text-on-surface">Candy Bar Express</h3>
                      <span className="font-label-code text-label-code text-secondary tracking-wide uppercase">Recomendado para 2</span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={hasSnacks} onChange={toggleSnackExpress} className="sr-only peer" />
                    <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-surface after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between pl-10">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Combo Popcorn Grande + 2 Bebidas</span>
                  <span className="font-label-md text-label-md font-bold text-primary">+ 18.00 Bs</span>
                </div>
              </div>
            )}

            <div className="relative py-2">
              <div className="w-full h-px bg-surface-variant"></div>
            </div>

            <div className="flex items-end justify-between mt-auto">
              <div className="flex flex-col">
                <span className="font-label-code text-label-code text-on-surface-variant uppercase tracking-widest">Importe Final</span>
                <span className="font-display-hero text-[38px] leading-none text-primary font-extrabold">{total.toFixed(2)} <span className="text-headline-sm text-on-surface">Bs</span></span>
              </div>
            </div>

          </div>
          </div>
        </div>
      </div>
    </div>
  );
};
