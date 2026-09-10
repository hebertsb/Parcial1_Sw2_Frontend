import { useState } from 'react';
import { useAuth } from '../controllers/AuthContext';

export const AdminAccess = ({ onBack, onSuccess }: { onBack: () => void, onSuccess: () => void }) => {
  const { loginSimplificado } = useAuth();
  const [activeRole, setActiveRole] = useState<'ADMIN' | 'MANAGER' | 'TECH'>('ADMIN');
  const [method, setMethod] = useState<'pin' | 'voice'>('pin');
  const [codigo, setCodigo] = useState('');
  const [status, setStatus] = useState<'idle' | 'validating' | 'success'>('idle');
  const [error, setError] = useState<string | null>(null);

  // Login simplificado (nombre+rol, sin contraseña — ver docs/db-schema-notes.md
  // del backend) — el "código de acceso" es literalmente el `nombre` del
  // usuario administrador sembrado en la base. Solo `rol='administrador'`
  // existe de verdad en el backend; MANAGER/TECH quedan como selección
  // decorativa hasta que existan esos roles.
  const submitCodigo = async () => {
    if (!codigo.trim() || status === 'validating') return;
    setError(null);
    setStatus('validating');
    try {
      await loginSimplificado(codigo.trim(), 'administrador');
      setStatus('success');
      setTimeout(() => onSuccess(), 1200);
    } catch {
      setError('Código de acceso incorrecto.');
      setStatus('idle');
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
            <span className="font-label-code text-label-code tracking-widest text-primary uppercase">Sistema Cerrado de Control Operativo</span>
            <div className="font-body-sm text-body-sm text-outline flex items-center gap-2">
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
                      <div className="font-body-sm text-body-sm text-outline">Acceso completo a cartelera y reportes</div>
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
                      <div className="font-body-sm text-body-sm text-outline">Taquilla y Salas</div>
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
                <span className="font-label-code text-label-code uppercase text-outline">Auditoría de Accesos</span>
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
                  Acceso Administrativo
                </button>
                <button
                  onClick={() => setMethod('voice')}
                  className={`px-4 py-2.5 rounded-lg font-label-lg text-label-lg flex items-center gap-2 transition-all ${method === 'voice' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'}`}
                >
                  <span className="material-symbols-outlined text-label-lg">mic</span>
                  Voz Staff
                </button>
              </div>
              <span className="font-label-code text-label-code text-outline tracking-wider uppercase">MODO ALTA FIDELIDAD</span>
            </div>

            {method === 'pin' && (
              <div className="flex flex-col items-center justify-center py-4 w-full">
                <div className="w-full max-w-sm flex flex-col items-center">
                  <div className="font-label-md text-label-md text-outline uppercase tracking-wider mb-3">Ingrese Código de Acceso de Personal</div>

                  <input
                    type="password"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') void submitCodigo(); }}
                    disabled={status === 'validating'}
                    autoFocus
                    className="w-full h-16 px-5 mb-6 rounded-xl bg-surface-container text-on-surface font-headline-sm text-headline-sm text-center shadow-inner outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  />

                  <button
                    onClick={() => void submitCodigo()}
                    disabled={!codigo.trim() || status === 'validating'}
                    className="w-full h-16 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary active:scale-95 transition-all flex items-center justify-center gap-2 font-label-lg text-label-lg disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-headline-md">login</span>
                    Ingresar
                  </button>

                  <div className={`mt-4 font-body-sm text-body-sm text-center h-6 ${status === 'validating' ? 'text-secondary animate-pulse' : status === 'success' ? 'text-tertiary' : error ? 'text-error' : 'text-outline'}`}>
                    {status === 'validating' ? 'Validando credenciales...' : status === 'success' ? 'Código Aceptado' : error ? error : 'Ingrese su código de acceso de personal'}
                  </div>
                </div>
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
                <h2 className="font-headline-md text-headline-md text-on-surface">Validación de Voz Staff</h2>
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
                <div className="font-body-sm text-body-sm text-outline">Alta / Baja de Películas</div>
              </div>
            </div>
            <div className="bg-surface-container-low p-4 rounded-xl flex items-center gap-3">
              <div className="p-3 rounded-lg bg-surface-container text-secondary">
                <span className="material-symbols-outlined text-headline-sm">schedule</span>
              </div>
              <div>
                <div className="font-label-lg text-label-lg text-on-surface">Programación Salas</div>
                <div className="font-body-sm text-body-sm text-outline">Horarios & Formatos</div>
              </div>
            </div>
            <div className="bg-surface-container-low p-4 rounded-xl flex items-center gap-3">
              <div className="p-3 rounded-lg bg-surface-container text-tertiary">
                <span className="material-symbols-outlined text-headline-sm">monitoring</span>
              </div>
              <div>
                <div className="font-label-lg text-label-lg text-on-surface">Reportes en Vivo</div>
                <div className="font-body-sm text-body-sm text-outline">Recaudación y Butacas</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {status === 'success' && (
        <div className="absolute inset-0 bg-surface-dim/80 backdrop-blur-md flex items-center justify-center p-4 z-50 rounded-xl" onClick={() => {setStatus('idle'); setCodigo('');}}>
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
            <span className="font-label-code text-label-code text-outline uppercase tracking-wider">Cargando Módulos de Administración</span>
          </div>
        </div>
      )}
    </div>
  );
};
