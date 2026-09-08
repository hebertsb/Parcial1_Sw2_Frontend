import React from 'react';
import { useCine } from '../../controllers/CineContext';

export const CandyBarSelection = () => {
  const { state, dispatch } = useCine();

  const handleUpdate = (id: string, name: string, price: number, delta: number) => {
    const existing = state.candyBarSeleccionado.find(c => c.id === id);
    const count = existing ? existing.cantidad : 0;
    const nextCount = Math.max(0, count + delta);
    
    dispatch({
      type: 'ACTUALIZAR_CANDYBAR',
      payload: { id, nombre: name, precio: price, cantidad: nextCount }
    });
  };

  const getQty = (id: string) => {
    return state.candyBarSeleccionado.find(c => c.id === id)?.cantidad || 0;
  };

  const skipToPago = () => {
    dispatch({ type: 'SET_ESTADO_COMPRA', payload: 'pago' });
  };

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="rounded-xl bg-gradient-to-r from-surface-container via-surface-container-high to-surface-container p-space-md shadow-xl flex flex-col md:flex-row items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md">
          <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-secondary-container/20 shadow-[0_0_24px_rgba(6,182,212,0.4)]">
            <div className="w-10 h-10 rounded-full bg-secondary-container/40 animate-ping absolute"></div>
            <span className="material-symbols-outlined text-secondary text-[28px] animate-pulse">graphic_eq</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs">
              <span className="font-label-code text-label-code text-secondary uppercase tracking-wider font-bold">LUMEN Acoustic Intelligence</span>
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            </div>
            <p className="font-body-md text-body-md text-on-surface mt-0.5">
              Pide tus golosinas por voz: <span className="text-primary italic font-semibold">"Agrega un combo dúo con pipocas saladas y Coca-Cola Zero"</span>
            </p>
          </div>
        </div>
        <button onClick={skipToPago} className="px-space-md py-space-xs rounded-full bg-surface-container hover:bg-surface-bright text-on-surface font-label-md text-label-md font-bold flex items-center gap-space-xs shadow-sm active:scale-95 transition-all border border-outline/20">
          <span>Saltar Candy Bar</span>
          <span className="material-symbols-outlined text-[18px] text-primary">arrow_forward</span>
        </button>
      </div>

      <div className="w-full overflow-x-auto pb-space-xs flex items-center gap-space-xs">
        <button className="px-space-md py-space-xs rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md font-bold whitespace-nowrap shadow-[0_0_12px_rgba(245,158,11,0.3)]">
          Combos Recomendados
        </button>
        <button className="px-space-md py-space-xs rounded-full bg-surface-container hover:bg-surface-bright text-on-surface-variant hover:text-on-surface font-label-md text-label-md whitespace-nowrap transition-colors">
          Popcorn & Pipocas
        </button>
        <button className="px-space-md py-space-xs rounded-full bg-surface-container hover:bg-surface-bright text-on-surface-variant hover:text-on-surface font-label-md text-label-md whitespace-nowrap transition-colors">
          Bebidas & Coctelería de Sala
        </button>
        <button className="px-space-md py-space-xs rounded-full bg-surface-container hover:bg-surface-bright text-on-surface-variant hover:text-on-surface font-label-md text-label-md whitespace-nowrap transition-colors">
          Nachos & Dips
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
        <div className="sm:col-span-2 rounded-xl bg-surface-container p-space-md shadow-lg flex flex-col md:flex-row gap-space-md relative overflow-hidden group">
          <div className="w-full md:w-56 h-48 md:h-full relative rounded-lg overflow-hidden shrink-0">
            <div className="w-full h-full bg-surface-container-highest"></div>
            <span className="absolute top-2 left-2 px-space-xs py-space-2xs rounded bg-primary-container text-on-primary-container font-label-code text-label-code uppercase tracking-wider font-bold shadow-md">
              Bestseller Sala VIP
            </span>
          </div>
          <div className="flex flex-col justify-between w-full">
            <div>
              <div className="flex items-start justify-between gap-space-sm">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Combo Pareja Épico</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    Popcorn gigante artesanal mitad mantequilla dorada y mitad caramelo crocante toffee, acompañado de 2 bebidas de 1L a elección.
                  </p>
                </div>
                <span className="font-headline-sm text-headline-sm text-primary font-bold shrink-0">65 Bs</span>
              </div>
              <div className="mt-space-sm flex flex-wrap items-center gap-space-xs">
                <span className="font-label-code text-label-code text-on-surface-variant uppercase">Opciones:</span>
                <span className="px-space-xs py-space-2xs rounded bg-surface-container-high text-on-surface font-label-code text-label-code flex items-center gap-1">
                  <span className="material-symbols-outlined text-primary text-[14px]">tune</span> Mitad & Mitad
                </span>
                <span className="px-space-xs py-space-2xs rounded bg-surface-container-high text-on-surface font-label-code text-label-code">
                  2x Bebidas 1L
                </span>
              </div>
            </div>
            <div className="mt-space-md pt-space-sm flex items-center justify-between">
              <span className="font-label-md text-label-md text-tertiary flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">room_service</span>
                Entrega directa en Butaca F7-F8
              </span>
              <div className="flex items-center gap-space-xs">
                <button onClick={() => handleUpdate('c1', 'Combo Pareja Épico', 65, -1)} className="w-10 h-10 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface flex items-center justify-center font-bold text-lg active:scale-95 transition-transform">-</button>
                <span className="w-8 text-center font-headline-sm text-headline-sm text-on-surface">{getQty('c1')}</span>
                <button onClick={() => handleUpdate('c1', 'Combo Pareja Épico', 65, 1)} className="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-lg shadow-[0_0_12px_rgba(245,158,11,0.3)] active:scale-95 transition-transform">+</button>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-surface-container p-space-md shadow-lg flex flex-col justify-between gap-space-md">
          <div>
            <div className="w-full h-40 rounded-lg overflow-hidden relative">
              <div className="w-full h-full bg-surface-container-highest"></div>
              <span className="absolute top-2 right-2 px-space-xs py-space-2xs rounded bg-surface-container-lowest/80 text-secondary font-label-code text-label-code font-bold backdrop-blur-md">
                Gourmet Chef
              </span>
            </div>
            <div className="flex items-start justify-between mt-space-sm">
              <h4 className="font-headline-sm text-headline-sm text-on-surface">Popcorn Trufa Negra</h4>
              <span className="font-headline-sm text-headline-sm text-primary font-bold">35 Bs</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-2">
              Maíz mushroom premium bañado en mantequilla clarificada francesa y esencia sutil de trufa negra de verano.
            </p>
            <div className="flex gap-space-2xs mt-space-sm">
              <button className="px-space-xs py-space-2xs rounded bg-surface-container-high text-on-surface-variant font-label-code text-label-code">Mediano</button>
              <button className="px-space-xs py-space-2xs rounded bg-primary-container/20 text-primary font-label-code text-label-code font-bold">Grande (+10 Bs)</button>
            </div>
          </div>
          <div className="flex items-center justify-between pt-space-xs">
            <span className="font-label-code text-label-code text-on-surface-variant uppercase">Personalizable</span>
            {getQty('c2') === 0 ? (
              <button onClick={() => handleUpdate('c2', 'Popcorn Trufa Negra', 35, 1)} className="h-10 px-space-md rounded-lg bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface font-label-md text-label-md font-bold transition-all flex items-center gap-1 active:scale-95">
                <span className="material-symbols-outlined text-[16px]">add</span> Agregar
              </button>
            ) : (
              <div className="flex items-center gap-space-xs">
                <button onClick={() => handleUpdate('c2', 'Popcorn Trufa Negra', 35, -1)} className="w-10 h-10 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface flex items-center justify-center font-bold text-lg active:scale-95 transition-transform">-</button>
                <span className="w-8 text-center font-headline-sm text-headline-sm text-on-surface">{getQty('c2')}</span>
                <button onClick={() => handleUpdate('c2', 'Popcorn Trufa Negra', 35, 1)} className="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-lg shadow-[0_0_12px_rgba(245,158,11,0.3)] active:scale-95 transition-transform">+</button>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-surface-container p-space-md shadow-lg flex flex-col justify-between gap-space-md">
          <div>
            <div className="w-full h-40 rounded-lg overflow-hidden relative">
              <div className="w-full h-full bg-surface-container-highest"></div>
              <span className="absolute top-2 right-2 px-space-xs py-space-2xs rounded bg-surface-container-lowest/80 text-primary font-label-code text-label-code font-bold backdrop-blur-md">
                Caliente
              </span>
            </div>
            <div className="flex items-start justify-between mt-space-sm">
              <h4 className="font-headline-sm text-headline-sm text-on-surface">Nachos Supreme VIP</h4>
              <span className="font-headline-sm text-headline-sm text-primary font-bold">40 Bs</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-2">
              Totopos artesanales crocantes con doble porción de salsa queso cheddar fundido y guacamole fresco de la casa.
            </p>
            <div className="flex gap-space-2xs mt-space-sm">
              <button className="px-space-xs py-space-2xs rounded bg-primary-container/20 text-primary font-label-code text-label-code font-bold">Cheddar + Guacamole</button>
              <button className="px-space-xs py-space-2xs rounded bg-surface-container-high text-on-surface-variant font-label-code text-label-code">Jalapeños Extra</button>
            </div>
          </div>
          <div className="flex items-center justify-between pt-space-xs">
            <span className="font-label-code text-label-code text-on-surface-variant uppercase">Con Dips Térmicos</span>
            {getQty('c3') === 0 ? (
              <button onClick={() => handleUpdate('c3', 'Nachos Supreme VIP', 40, 1)} className="h-10 px-space-md rounded-lg bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface font-label-md text-label-md font-bold transition-all flex items-center gap-1 active:scale-95">
                <span className="material-symbols-outlined text-[16px]">add</span> Agregar
              </button>
            ) : (
              <div className="flex items-center gap-space-xs">
                <button onClick={() => handleUpdate('c3', 'Nachos Supreme VIP', 40, -1)} className="w-10 h-10 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface flex items-center justify-center font-bold text-lg active:scale-95 transition-transform">-</button>
                <span className="w-8 text-center font-headline-sm text-headline-sm text-on-surface">{getQty('c3')}</span>
                <button onClick={() => handleUpdate('c3', 'Nachos Supreme VIP', 40, 1)} className="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-lg shadow-[0_0_12px_rgba(245,158,11,0.3)] active:scale-95 transition-transform">+</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
