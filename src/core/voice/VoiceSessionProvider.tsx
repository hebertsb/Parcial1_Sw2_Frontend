import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../controllers/AuthContext';
import { useCine } from '../../controllers/CineContext';
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

/**
 * Dueño UNICO de la conversacion de voz. Vive arriba de las rutas (dentro del router y de los contextos de la app):
 * asi la sesion no se corta al navegar, ni al pasar de "Voz + UI Dinamica" a "Solo Voz", y el agente puede mover la
 * app real (router + estado de la compra) con las acciones de interfaz que manda el servidor.
 *
 *  - tactil: sin microfono.  hibrido: microfono + panel de voz (debajo del selector de modo) + ventanas sobre la app real.
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
  const { cerrarTodas, cerrar } = ventanas;
  const { state: cine } = useCine();

  // La entrada digital es el comprobante de la compra TERMINADA: cuando la compra se reinicia (volver al inicio, empezar
  // otra) ya no corresponde y no debe quedar flotando sobre lo que sigue.
  useEffect(() => {
    if (cine.estadoCompra !== 'completado') cerrar('ticket');
  }, [cine.estadoCompra, cerrar]);

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
          {/* En la app de cliente el panel de voz va en el Layout, debajo del selector de modo (VoiceStrip). La consola de
              administrador no tiene ese selector: ahi el asistente queda como panel flotante. */}
          {location.pathname.startsWith('/admin') && <VoiceDock voz={voz} onCerrar={() => setModo('tactil')} />}
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
