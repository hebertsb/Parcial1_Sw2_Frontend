/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { CineProvider, useCine } from './controllers/CineContext';
import { useAuth } from './controllers/AuthContext';
import { Home } from './views/Home';
import { Cartelera } from './views/Cartelera';
import { ProcesoCompra } from './views/ProcesoCompra';
import { Login } from './views/Login';
import { AdminAccess } from './views/AdminAccess';
import { AdminConsole } from './views/AdminConsole';
import { VoiceAgent } from './views/VoiceAgent';
import { BottomHUD } from './components/widgets/BottomHUD';
import { TopModeSwitcher } from './components/widgets/TopModeSwitcher';

const CineApp = () => {
  const { state, dispatch } = useCine();
  const { usuario, logout } = useAuth();
  const [view, setView] = useState<'home' | 'app' | 'admin' | 'admin_console' | 'voice' | 'login'>('home');
  const [interactionMode, setInteractionMode] = useState<'tactil' | 'hibrido' | 'voz'>('tactil');
  const [showTechModal, setShowTechModal] = useState(false);
  const [afterLoginAction, setAfterLoginAction] = useState<(() => void) | null>(null);

  const navigateToCartelera = () => {
    dispatch({ type: 'RESETEAR_COMPRA' });
    setView('app');
  };

  const goHome = () => {
    dispatch({ type: 'RESETEAR_COMPRA' });
    setView('home');
  };

  /** Comprar y los modos voz/híbrido requieren cuenta de Google — ver Login.tsx. Cartelera/Home nunca pasan por acá. */
  const requireAuth = (accion: () => void) => {
    if (usuario) {
      accion();
      return;
    }
    setAfterLoginAction(() => accion);
    setView('login');
  };

  const cambiarModoInteraccion = (m: 'tactil' | 'hibrido' | 'voz') => {
    if (m === 'tactil') {
      setInteractionMode(m);
      return;
    }
    requireAuth(() => {
      setInteractionMode(m);
      if (m === 'voz') setView('voice');
    });
  };

  const irAModoVoz = () => requireAuth(() => setView('voice'));

  const hasSelectedMovie = !!state.peliculaSeleccionada;

  if (view === 'admin_console') {
    return <AdminConsole onBack={goHome} />;
  }

  if (view === 'voice') {
    return <VoiceAgent onClose={() => setView('app')} />;
  }

  return (
    <div className={`bg-surface-container-lowest text-on-surface font-body-md antialiased selection:bg-primary-container selection:text-on-primary-container min-h-screen flex flex-col ${view === 'app' ? 'pb-32' : ''}`}>
      {view !== 'admin' && view !== 'admin_console' && view !== 'voice' && (
        <header className="fixed top-0 left-0 w-full z-50 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
          <div className="h-20 w-full px-space-lg flex items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-lg">
              <div className="flex items-center gap-space-xs cursor-pointer" onClick={goHome}>
                <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                  <span className="material-symbols-outlined text-primary text-[24px]">theater_comedy</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-headline-sm text-headline-sm tracking-wider text-primary">LUMEN<span className="text-on-surface font-light ml-1">CINEMA</span></span>
                  <span className="font-label-code text-label-code text-secondary tracking-widest uppercase">AI Precision Kiosk</span>
                </div>
              </div>
              <div className="hidden xl:flex items-center gap-space-xs px-space-sm py-space-2xs rounded-lg bg-surface-container-low">
                <span className="material-symbols-outlined text-primary text-[18px]">videocam</span>
                <div className="flex flex-col">
                  <span className="font-label-code text-label-code text-on-surface-variant uppercase">Sala Asignada</span>
                  <span className="font-label-md text-label-md text-on-surface font-bold">VIP Atmos 3 • Kiosco 04</span>
                </div>
              </div>
            </div>
            
            <nav className="flex items-center gap-space-xs p-space-2xs bg-surface-container-low rounded-full">
              <button 
                onClick={navigateToCartelera} 
                className={`px-space-md py-space-xs rounded-full font-label-md text-label-md transition-all ${view === 'app' && !state.peliculaSeleccionada ? 'bg-primary-container text-on-primary-container font-bold shadow-[0_0_16px_rgba(245,158,11,0.4)]' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Cartelera
              </button>
              <button 
                className={`px-space-md py-space-xs rounded-full font-label-md text-label-md transition-all ${view === 'app' && !!state.peliculaSeleccionada && state.estadoCompra === 'seleccionando_asientos' ? 'bg-primary-container text-on-primary-container font-bold shadow-[0_0_16px_rgba(245,158,11,0.4)]' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Asientos
              </button>
              <button 
                className={`px-space-md py-space-xs rounded-full font-label-md text-label-md transition-all ${view === 'app' && !!state.peliculaSeleccionada && state.estadoCompra === 'seleccionando_candybar' ? 'bg-primary-container text-on-primary-container font-bold shadow-[0_0_16px_rgba(245,158,11,0.4)]' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Candy Bar & VIP
              </button>
              <button 
                className={`px-space-md py-space-xs rounded-full font-label-md text-label-md transition-all ${view === 'app' && !!state.peliculaSeleccionada && (state.estadoCompra === 'pago' || state.estadoCompra === 'completado') ? 'bg-primary-container text-on-primary-container font-bold shadow-[0_0_16px_rgba(245,158,11,0.4)]' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Pago & Salida
              </button>
            </nav>

            <div className="flex items-center gap-space-md">
              <div className="flex items-center gap-space-xs px-space-sm py-space-xs rounded-full bg-surface-container-high">
                <div className="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse shadow-[0_0_8px_rgba(86,229,169,0.8)]"></div>
                <span className="font-label-code text-label-code text-tertiary uppercase tracking-wider hidden sm:inline">En línea • Mic Activo</span>
              </div>
              <div className="hidden lg:flex items-center gap-space-2xs px-space-sm py-space-xs rounded-lg bg-surface-container">
                <span className="material-symbols-outlined text-secondary text-[16px]">schedule</span>
                <span className="font-label-code text-label-code text-on-surface font-bold tracking-widest">20:45</span>
              </div>
              <div className="flex items-center px-space-xs py-space-2xs rounded-lg bg-surface-container-high text-on-surface font-label-code text-label-code font-bold tracking-wider">
                ES
              </div>
              {usuario ? (
                <button
                  onClick={logout}
                  type="button"
                  className="flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  <span className="hidden sm:flex flex-col items-start leading-tight">
                    <span className="font-label-md text-label-md font-bold">{usuario.nombre}</span>
                    <span className="font-label-code text-label-code text-on-surface-variant uppercase">
                      {usuario.rol === 'administrador' ? 'Administrador' : 'Cliente'}
                    </span>
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => setView('login')}
                  type="button"
                  className="flex items-center gap-space-2xs h-8 px-space-sm rounded-full bg-primary text-on-primary font-label-md text-label-md shadow-[0_0_12px_rgba(255,193,116,0.3)]"
                >
                  <span className="material-symbols-outlined text-[16px]">login</span>
                  <span className="hidden sm:inline">Iniciar sesión</span>
                </button>
              )}
              <div onClick={() => setView('admin')} className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-[0_0_12px_rgba(255,193,116,0.3)] cursor-pointer">
                <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className={`w-full ${view === 'admin' ? '' : 'pt-20'} flex-grow flex flex-col bg-surface-container-lowest relative z-10`}>
        {view === 'admin' ? (
          <AdminAccess onBack={() => setView('home')} onSuccess={() => setView('admin_console')} />
        ) : view === 'login' ? (
          <Login
            onBack={goHome}
            onLoggedIn={() => {
              const accion = afterLoginAction;
              setAfterLoginAction(null);
              if (accion) {
                accion();
              } else {
                setView('home');
              }
            }}
          />
        ) : view === 'home' ? (
          <>
            <TopModeSwitcher
              mode={interactionMode}
              onChangeMode={cambiarModoInteraccion}
            />
            <Home onNavigate={navigateToCartelera} onVoiceMode={irAModoVoz} />
          </>
        ) : (
          <div className="w-full h-full flex-grow flex flex-col relative">
             <TopModeSwitcher
              mode={interactionMode}
              onChangeMode={cambiarModoInteraccion}
            />
             {!state.peliculaSeleccionada ? (
               <div className="max-w-[1720px] mx-auto w-full px-space-xl lg:px-space-2xl py-space-xl flex-grow flex flex-col">
                 <Cartelera />
               </div>
             ) : !usuario ? (
               <Login
                 onBack={() => dispatch({ type: 'RESETEAR_COMPRA' })}
                 onLoggedIn={() => {}}
               />
             ) : (
               <ProcesoCompra onVoiceCommand={() => {
                 setInteractionMode('voz');
                 setView('voice');
               }} />
             )}
          </div>
        )}
      </main>

      {view !== 'admin' && (
        <footer className="w-full bg-surface-container-lowest py-space-xl shadow-[0_-4px_24px_rgba(0,0,0,0.6)] relative z-20 mt-auto">
          <div className="w-full px-space-lg flex flex-col md:flex-row items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-md">
              <span className="font-headline-sm text-headline-sm text-primary">LUMEN</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Sistemas de Kiosco Inteligente y Proyección Cinema NextGen © 2025. Todos los derechos reservados.</p>
            </div>
            <div className="flex items-center gap-space-lg">
              <div className="flex items-center gap-space-xs text-error">
                <span className="material-symbols-outlined text-[18px]">gpp_maybe</span>
                <span className="font-label-code text-label-code uppercase tracking-wider text-error">Entradas No Reembolsables</span>
              </div>
              <div className="flex items-center gap-space-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-secondary text-[18px]">bolt</span>
                <span className="font-label-code text-label-code uppercase tracking-wider">Dolby Atmos & Laser Certified</span>
              </div>
            </div>
          </div>
        </footer>
      )}

      {(view === 'home' || view === 'app') && (
        <BottomHUD onVoiceMode={irAModoVoz} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <CineProvider>
      <CineApp />
    </CineProvider>
  );
}
