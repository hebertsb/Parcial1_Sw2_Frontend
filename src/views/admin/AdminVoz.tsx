import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VoiceHybridBar } from '../../components/widgets/VoiceHybridBar';

type ModoVoz = 'elegir' | 'hibrido';

/**
 * CU03-CU07 por voz para el administrador (RF18). VoiceHybridBar ya renderiza
 * pantalla completa via portal (ver el propio componente), asi que alcanza
 * con montarlo cuando se elige "Voz + UI Dinámica" -- no hace falta que esta
 * vista tenga su propio layout especial. "Solo Voz" reusa la pantalla que ya
 * existe en /voz (misma tool, mismo rol de la sesión) en vez de duplicarla.
 */
export const AdminVoz = ({ onSalir }: { onSalir: () => void }) => {
  const navigate = useNavigate();
  const [modo, setModo] = useState<ModoVoz>('elegir');

  if (modo === 'hibrido') {
    return <VoiceHybridBar onSalir={() => setModo('elegir')} />;
  }

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
          onClick={() => setModo('hibrido')}
          className="flex flex-col items-start gap-space-sm p-space-lg rounded-2xl bg-surface-container hover:bg-surface-container-high transition-colors text-left shadow-md"
        >
          <span className="material-symbols-outlined text-primary text-[32px]">auto_awesome</span>
          <span className="font-headline-sm text-headline-sm text-on-surface">Voz + UI Dinámica</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Pantalla completa: hablás y los resultados (reportes, cartelera, confirmaciones) se muestran en tarjetas.
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
