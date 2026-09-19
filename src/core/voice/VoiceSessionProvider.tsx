import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../controllers/AuthContext';
import { CapaVentanas } from '../../components/windows/CapaVentanas';
import { VoiceDock } from '../../components/voice/VoiceDock';
import { useUiActionHandler, type ModoInteraccion } from '../ui/useUiActionHandler';
import { useVentanas } from '../ui/VentanasContext';
import { useVoiceSession, type SesionVoz } from './useVoiceSession';

export type { ModoInteraccion } from '../ui/useUiActionHandler';

interface ContextoVoz {
  modo: ModoInteraccion;
  setModo: (modo: ModoInteraccion) => void;
  voz: SesionVoz;
}

const VozContext = createContext<ContextoVoz | undefined>(undefined);

/** Paginas que muestran la barra inferior de la app (BottomHUD): el dock de voz se sube para no taparla. */
const RUTAS_CON_BARRA_INFERIOR = ['/', '/cartelera', '/compra'];

/**
 * Dueño UNICO de la conversacion de voz. Vive arriba de las rutas (dentro del router y de los contextos de la app):
 * asi la sesion no se corta al navegar, ni al pasar de "Voz + UI Dinamica" a "Solo Voz", y el agente puede mover la
 * app real (router + estado de la compra) con las acciones de interfaz que manda el servidor.
 *
 *  - tactil: sin microfono.  hibrido: microfono + dock flotante + ventanas sobre la app real.
 *  - voz: microfono + pantalla de voz pura (RF16); el estado de la compra se actualiza pero no se navega.
 */
export const VoiceSessionProvider = ({ children }: { children: ReactNode }) => {
  const { usuario, token } = useAuth();
  const location = useLocation();
  const ventanas = useVentanas();
  const [modo, setModo] = useState<ModoInteraccion>('tactil');
  const modoRef = useRef(modo);
  modoRef.current = modo;
  const sesionIdRef = useRef(crypto.randomUUID());

  const manejarUi = useUiActionHandler(modoRef);
  const voz = useVoiceSession({
    rol: usuario?.rol ?? 'cliente',
    token,
    sesionId: sesionIdRef.current,
    onEvento: (evento) => {
      if (evento.type === 'ui_action') manejarUi(evento.acciones);
    },
  });
  const { iniciar, terminar } = voz;
  const { cerrarTodas } = ventanas;

  // El microfono solo esta abierto en los modos con voz, y nunca sin sesion (la voz exige cuenta; ver Layout.tsx).
  useEffect(() => {
    if (modo === 'tactil' || !usuario) {
      terminar();
      cerrarTodas();
      if (modo !== 'tactil') setModo('tactil');
      return;
    }
    void iniciar();
  }, [modo, usuario, iniciar, terminar, cerrarTodas]);

  // Cambiar de rol (ej. cerrar sesion y entrar como administrador) empieza una conversacion nueva.
  const rolAnterior = useRef(usuario?.rol);
  useEffect(() => {
    if (rolAnterior.current !== usuario?.rol) {
      rolAnterior.current = usuario?.rol;
      sesionIdRef.current = crypto.randomUUID();
    }
  }, [usuario?.rol]);

  const value = useMemo(() => ({ modo, setModo, voz }), [modo, voz]);

  // Solo desarrollo: expone la conversacion para las pruebas de navegador (Playwright) sin depender del audio.
  useEffect(() => {
    if (import.meta.env.DEV) Object.assign(window, { __lumen: { voz, modo, setModo, aplicarUi: manejarUi } });
  }, [voz, modo, manejarUi]);

  return (
    <VozContext.Provider value={value}>
      {children}
      {modo === 'hibrido' && (
        <>
          <CapaVentanas onCancelar={() => voz.enviarTexto('cancelá')} onConfirmar={() => voz.enviarTexto('confirmo')} />
          <VoiceDock voz={voz} sobreBarraInferior={RUTAS_CON_BARRA_INFERIOR.includes(location.pathname)} onCerrar={() => setModo('tactil')} />
        </>
      )}
    </VozContext.Provider>
  );
};

export const useVozSesion = (): ContextoVoz => {
  const contexto = useContext(VozContext);
  if (!contexto) throw new Error('useVozSesion debe usarse dentro de un VoiceSessionProvider');
  return contexto;
};
