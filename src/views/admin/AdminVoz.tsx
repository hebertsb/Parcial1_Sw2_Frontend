import { useNavigate } from 'react-router-dom';
import { useVozSesion } from '../../core/voice/VoiceSessionProvider';

/**
 * CU03-CU07 por voz para el administrador (RF18). "Voz + UI Dinámica" abre el asistente flotante SOBRE la consola: el
 * agente cambia de pestaña, recarga las tablas y muestra el detalle de lo que va a aplicar en una ventana, sin cubrir
 * la pantalla. "Solo Voz" reusa la pantalla que ya existe en /voz (misma sesión, mismo rol).
 */
export const AdminVoz = ({ onSalir }: { onSalir: () => void }) => {
  const navigate = useNavigate();
  const { modo, setModo } = useVozSesion();
  const activo = modo === 'hibrido';

  return (
    <div className="p-space-xl flex flex-col gap-space-xl">
      <div className="flex flex-col gap-space-2xs">
        <span className="font-headline-md text-headline-md text-on-surface">Asistente de Voz (RF18)</span>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
          Gestioná cartelera, funciones, promociones, precios y consultá reportes hablando con Lumen AI —
          el agente confirma cada cambio antes de aplicarlo.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-lg max-w-3xl">
        <button
          onClick={() => setModo(activo ? 'tactil' : 'hibrido')}
          className={`flex flex-col items-start gap-space-sm p-space-lg rounded-2xl transition-colors text-left shadow-md ${activo ? 'bg-primary-container/25 ring-2 ring-primary' : 'bg-surface-container hover:bg-surface-container-high'}`}
        >
          <span className="material-symbols-outlined text-primary text-[32px]">auto_awesome</span>
          <span className="font-headline-sm text-headline-sm text-on-surface">{activo ? 'Asistente activo — tocá para apagarlo' : 'Voz + UI Dinámica'}</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            El asistente queda flotando sobre la consola: hablás y la pantalla se mueve sola (pestañas, tablas y ventanas de confirmación).
          </span>
        </button>

        <button
          onClick={() => navigate('/voz')}
          className="flex flex-col items-start gap-space-sm p-space-lg rounded-2xl bg-surface-container hover:bg-surface-container-high transition-colors text-left shadow-md"
        >
          <span className="material-symbols-outlined text-secondary text-[32px]">graphic_eq</span>
          <span className="font-headline-sm text-headline-sm text-on-surface">Solo Voz (Puro)</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Igual que el modo de voz del kiosco: todo se transmite hablado, sin tarjetas en pantalla.
          </span>
        </button>
      </div>

      <button
        onClick={onSalir}
        className="w-fit flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container-high hover:bg-surface-variant text-on-surface-variant transition-colors font-label-md text-label-md"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Volver
      </button>
    </div>
  );
};
