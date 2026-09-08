import { useState } from 'react';

export const AdminAccess = ({ onBack, onSuccess }: { onBack: () => void, onSuccess: () => void }) => {
  const [activeRole, setActiveRole] = useState<'ADMIN' | 'MANAGER' | 'TECH'>('ADMIN');
  const [method, setMethod] = useState<'pin' | 'nfc' | 'voice'>('pin');
  const [pin, setPin] = useState('');
  const [status, setStatus] = useState<'idle' | 'validating' | 'success'>('idle');

  const handlePin = (num: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + num);
    }
  };

  const clearPin = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const submitPin = () => {
    if (pin.length === 6) {
      setStatus('validating');
      setTimeout(() => {
        setStatus('success');
        setTimeout(() => onSuccess(), 1500);
      }, 700);
    }
  };

  const triggerSuccess = () => {
    setStatus('success');
    setTimeout(() => onSuccess(), 1500);
  };


  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto px-4 py-8 relative">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-surface-container-low p-4 rounded-xl shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary animate-pulse">
            <span className="material-symbols-outlined text-headline-sm" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
          </div>
          <div>
            <span className="font-label-code text-label-code tracking-widest text-primary uppercase">SISTEMA CERRADO DE CONTROL OPERATIVO • RF11 ROLE ACCESS</span>
            <div className="font-body-sm text-body-sm text-outline flex items-center gap-2">
              <span>Terminal Kiosk-04</span>
              <span>•</span>
              <span className="text-tertiary font-medium flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-tertiary"></span> Nodo Seguro Conectado
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-label-md text-label-md" onClick={onBack}>
            <span className="material-symbols-outlined text-label-md">arrow_back</span>
            Volver a Cartelera (Modo Público)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Role Selection */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-surface-container-low p-6 rounded-xl shadow-lg flex flex-col gap-4">
            <div>
              <span className="font-label-code text-label-code uppercase tracking-wider text-secondary">Control Operativo Maestro</span>
              <h1 className="font-headline-lg text-headline-lg text-on-surface mt-1">Acceso de Staff</h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                Autenticación autorizada para administración de cartelera, cronogramas de salas y reporte de recaudación fiscal.
              </p>
            </div>
            
            <div className="flex flex-col gap-2 mt-2">
              <label className="font-label-md text-label-md text-outline">Rol Operativo Solicitado</label>
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => setActiveRole('ADMIN')}
                  className={`text-left p-3 rounded-lg transition-all flex items-center justify-between group ${activeRole === 'ADMIN' ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-headline-sm text-primary">admin_panel_settings</span>
                    <div>
                      <div className="font-label-lg text-label-lg">Administrador General</div>
                      <div className="font-body-sm text-body-sm text-outline">Acceso completo • RF06 / RF08</div>
                    </div>
                  </div>
                  <span className={`material-symbols-outlined text-headline-sm ${activeRole === 'ADMIN' ? 'text-primary' : 'text-outline opacity-0 group-hover:opacity-100'}`}>
                    {activeRole === 'ADMIN' ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                </button>
                <button 
                  onClick={() => setActiveRole('MANAGER')}
                  className={`text-left p-3 rounded-lg transition-all flex items-center justify-between group ${activeRole === 'MANAGER' ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-headline-sm text-secondary">manage_accounts</span>
                    <div>
                      <div className="font-label-lg text-label-lg">Gerente de Turno</div>
                      <div className="font-body-sm text-body-sm text-outline">Taquilla y Salas • RF07</div>
                    </div>
                  </div>
                  <span className={`material-symbols-outlined text-headline-sm ${activeRole === 'MANAGER' ? 'text-primary' : 'text-outline opacity-0 group-hover:opacity-100'}`}>
                    {activeRole === 'MANAGER' ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                </button>
                <button 
                  onClick={() => setActiveRole('TECH')}
                  className={`text-left p-3 rounded-lg transition-all flex items-center justify-between group ${activeRole === 'TECH' ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-headline-sm text-tertiary">videocam</span>
                    <div>
                      <div className="font-label-lg text-label-lg">Técnico de Proyección</div>
                      <div className="font-body-sm text-body-sm text-outline">DCP, Sonido & Calibración</div>
                    </div>
                  </div>
                  <span className={`material-symbols-outlined text-headline-sm ${activeRole === 'TECH' ? 'text-primary' : 'text-outline opacity-0 group-hover:opacity-100'}`}>
                    {activeRole === 'TECH' ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-surface-container flex flex-col gap-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="font-label-code text-label-code uppercase text-outline">Auditoría Criptográfica RF12</span>
                <span className="font-label-code text-label-code text-tertiary flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-ping"></span> ACTIVO
                </span>
              </div>
              <div className="font-body-sm text-body-sm text-on-surface-variant flex flex-col gap-1">
                <div className="flex justify-between">
                  <span className="text-outline">Terminal ID:</span>
                  <span className="font-label-code text-label-code text-on-surface">KIOSK-04-CTR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Nodo Core:</span>
                  <span className="font-label-code text-label-code text-on-surface">NestJS Edge v2.4</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Base Ledger:</span>
                  <span className="font-label-code text-label-code text-on-surface">Supabase PG-Crypto</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-error-container/20 text-on-error-container flex items-start gap-3">
              <span className="material-symbols-outlined text-error shrink-0 mt-0.5">policy</span>
              <p className="font-body-sm text-body-sm text-error">
                Acceso estrictamente monitoreado. Cualquier intento irregular activa el bloqueo de pasarela y genera registro inmutable de incidente.
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: Auth Methods */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-surface-container-low p-6 rounded-xl shadow-lg flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between border-b pb-4 gap-4" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setMethod('pin')}
                  className={`px-4 py-2.5 rounded-lg font-label-lg text-label-lg flex items-center gap-2 transition-all ${method === 'pin' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'}`}
                >
                  <span className="material-symbols-outlined text-label-lg">pin</span>
                  Teclado PIN Kiosco
                </button>
                <button 
                  onClick={() => setMethod('nfc')}
                  className={`px-4 py-2.5 rounded-lg font-label-lg text-label-lg flex items-center gap-2 transition-all ${method === 'nfc' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'}`}
                >
                  <span className="material-symbols-outlined text-label-lg">nfc</span>
                  Credencial RFID / NFC
                </button>
                <button 
                  onClick={() => setMethod('voice')}
                  className={`px-4 py-2.5 rounded-lg font-label-lg text-label-lg flex items-center gap-2 transition-all ${method === 'voice' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'}`}
                >
                  <span className="material-symbols-outlined text-label-lg">mic</span>
                  Voz Staff (RF11/RF14)
                </button>
              </div>
              <span className="font-label-code text-label-code text-outline tracking-wider uppercase">MODO ALTA FIDELIDAD</span>
            </div>

            {method === 'pin' && (
              <div className="flex flex-col items-center justify-center py-4 w-full">
                <div className="w-full max-w-sm flex flex-col items-center">
                  <div className="font-label-md text-label-md text-outline uppercase tracking-wider mb-3">Ingrese PIN de Autorización (6 Dígitos)</div>
                  
                  <div className="flex items-center justify-center gap-3 mb-6 bg-surface-container px-6 py-4 rounded-xl shadow-inner w-full">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className={`w-4 h-4 rounded-full transition-all duration-150 ${i < pin.length ? 'bg-primary scale-110 shadow-sm' : 'bg-surface-variant'}`}></div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-3 w-full">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                      <button key={num} onClick={() => handlePin(num)} className="h-16 rounded-xl bg-surface-container hover:bg-surface-container-high active:scale-95 text-headline-md font-headline-md text-on-surface transition-all flex items-center justify-center shadow-sm">
                        {num}
                      </button>
                    ))}
                    <button onClick={clearPin} className="h-16 rounded-xl bg-surface-container-high text-error hover:bg-surface-bright active:scale-95 transition-all flex items-center justify-center font-label-lg text-label-lg">
                      <span className="material-symbols-outlined text-headline-md">backspace</span>
                    </button>
                    <button onClick={() => handlePin('0')} className="h-16 rounded-xl bg-surface-container hover:bg-surface-container-high active:scale-95 text-headline-md font-headline-md text-on-surface transition-all flex items-center justify-center shadow-sm">
                      0
                    </button>
                    <button onClick={submitPin} className="h-16 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary active:scale-95 transition-all flex items-center justify-center font-label-lg text-label-lg">
                      <span className="material-symbols-outlined text-headline-md">login</span>
                    </button>
                  </div>

                  <div className={`mt-4 font-body-sm text-body-sm text-center h-6 ${status === 'validating' ? 'text-secondary animate-pulse' : status === 'success' ? 'text-tertiary' : 'text-outline'}`}>
                    {status === 'validating' ? 'Validando credenciales criptográficas...' : status === 'success' ? 'PIN Aceptado' : 'Toque los números para ingresar su código de personal'}
                  </div>
                </div>
              </div>
            )}

            {method === 'nfc' && (
              <div className="flex flex-col items-center justify-center py-10 w-full text-center">
                <div className="relative flex items-center justify-center w-36 h-36 rounded-full bg-secondary/10 mb-6 group cursor-pointer" onClick={triggerSuccess}>
                  <div className="absolute inset-0 rounded-full border-2 border-secondary animate-ping opacity-25"></div>
                  <div className="w-28 h-28 rounded-full bg-surface-container flex items-center justify-center shadow-xl">
                    <span className="material-symbols-outlined text-display-hero text-secondary">contactless</span>
                  </div>
                </div>
                <h2 className="font-headline-md text-headline-md text-on-surface">Lector NFC Activo</h2>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-md mt-2">
                  Acerque su credencial física RFID, pulsera autorizada o teléfono con pass digital al sensor lateral del tótem.
                </p>
                <div className="mt-6 flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary font-label-md text-label-md">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                  Sensor 13.56 MHz ISO/IEC 14443 listo para lectura
                </div>
                <button onClick={triggerSuccess} className="mt-6 px-6 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-all">
                  Simular Lectura de Llave RFID
                </button>
              </div>
            )}

            {method === 'voice' && (
              <div className="flex flex-col items-center justify-center py-10 w-full text-center">
                <div className="relative flex items-center justify-center w-32 h-32 rounded-full bg-primary/10 mb-6 cursor-pointer" onClick={triggerSuccess}>
                  <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-30"></div>
                  <div className="w-24 h-24 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg transform hover:scale-105 transition-all">
                    <span className="material-symbols-outlined text-display-hero">mic</span>
                  </div>
                </div>
                <h2 className="font-headline-md text-headline-md text-on-surface">Validación de Voz Staff (RF11 / RF14)</h2>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-md mt-2">
                  El motor de reconocimiento procesa comandos verbales con firma biométrica del operador registrado.
                </p>
                <div className="mt-4 p-4 rounded-xl bg-surface-container max-w-lg w-full text-left">
                  <span className="font-label-code text-label-code uppercase text-primary tracking-wide">Comando sugerido:</span>
                  <div className="font-body-md text-body-md text-on-surface italic mt-1">
                    "Modo Supervisor: Autorizar acceso terminal 04 con clave Alfa-Cinco"
                  </div>
                </div>
                <div className="mt-4 font-label-md text-label-md text-primary flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                  Escuchando espectro acústico... Diga su frase
                </div>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface-container-low p-4 rounded-xl flex items-center gap-3">
              <div className="p-3 rounded-lg bg-surface-container text-primary">
                <span className="material-symbols-outlined text-headline-sm">movie_filter</span>
              </div>
              <div>
                <div className="font-label-lg text-label-lg text-on-surface">Gestión Cartelera</div>
                <div className="font-body-sm text-body-sm text-outline">RF06 Alta / Baja Películas</div>
              </div>
            </div>
            <div className="bg-surface-container-low p-4 rounded-xl flex items-center gap-3">
              <div className="p-3 rounded-lg bg-surface-container text-secondary">
                <span className="material-symbols-outlined text-headline-sm">schedule</span>
              </div>
              <div>
                <div className="font-label-lg text-label-lg text-on-surface">Programación Salas</div>
                <div className="font-body-sm text-body-sm text-outline">RF07 Horarios & Formatos</div>
              </div>
            </div>
            <div className="bg-surface-container-low p-4 rounded-xl flex items-center gap-3">
              <div className="p-3 rounded-lg bg-surface-container text-tertiary">
                <span className="material-symbols-outlined text-headline-sm">monitoring</span>
              </div>
              <div>
                <div className="font-label-lg text-label-lg text-on-surface">Reportes en Vivo</div>
                <div className="font-body-sm text-body-sm text-outline">RF08 Recaudación y Butacas</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {status === 'success' && (
        <div className="absolute inset-0 bg-surface-dim/80 backdrop-blur-md flex items-center justify-center p-4 z-50 rounded-xl" onClick={() => {setStatus('idle'); setPin('');}}>
          <div className="bg-surface-container max-w-md w-full p-6 rounded-2xl shadow-2xl flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-tertiary/20 text-tertiary flex items-center justify-center">
              <span className="material-symbols-outlined text-display-hero">verified_user</span>
            </div>
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface">Identidad Verificada</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                Acceso concedido para {activeRole === 'ADMIN' ? 'Administrador General' : activeRole === 'MANAGER' ? 'Gerencia Operativa' : 'Soporte Técnico'}. Cambiando modo de interfaz...
              </p>
            </div>
            <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden mt-2">
              <div className="bg-tertiary h-full rounded-full w-full animate-pulse"></div>
            </div>
            <span className="font-label-code text-label-code text-outline uppercase tracking-wider">Cargando Módulos RF06 / RF07 / RF08</span>
          </div>
        </div>
      )}
    </div>
  );
};
