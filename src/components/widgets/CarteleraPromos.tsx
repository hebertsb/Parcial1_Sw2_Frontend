/** Franja de promos del kiosco — decorativa, sin datos reales asociados. */
export const CarteleraPromos = () => (
  <div className="w-full px-space-lg py-space-md grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
    <div className="p-space-lg rounded-2xl bg-surface-container-low flex items-start gap-space-md">
      <div className="w-12 h-12 rounded-xl bg-secondary-container/20 text-secondary flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-[28px]">spatial_audio_off</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-headline-sm text-headline-sm text-on-surface">Acústica Espacial Dolby Atmos</span>
        <p className="font-body-sm text-body-sm text-on-surface-variant">Calibración hiper-precisa con 64 canales independientes de audio inmersivo que se desplaza alrededor tuyo.</p>
      </div>
    </div>
    <div className="p-space-lg rounded-2xl bg-surface-container-low flex items-start gap-space-md">
      <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-[28px]">airline_seat_recline_extra</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-headline-sm text-headline-sm text-on-surface">Butacas Reclinables VIP Lounge</span>
        <p className="font-body-sm text-body-sm text-on-surface-variant">Tapicería de cuero genuino, servicio directo a butaca y soporte ergonómico Zero Gravity para máximo confort.</p>
      </div>
    </div>
    <div className="p-space-lg rounded-2xl bg-error-container/20 flex items-start gap-space-md">
      <div className="w-12 h-12 rounded-xl bg-error-container text-on-error-container flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-[28px]">verified_user</span>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-space-2xs">
          <span className="font-headline-sm text-headline-sm text-error">Política Estricta Kiosco</span>
          <span className="px-2 py-0.5 rounded bg-error text-on-error font-label-code text-label-code font-bold">AVISO</span>
        </div>
        <p className="font-body-sm text-body-sm text-on-error-container">
          Entradas no reembolsables una vez procesado el cobro. Verifique sala, formato, horario e idioma antes de confirmar en el datáfono.
        </p>
      </div>
    </div>
  </div>
);
