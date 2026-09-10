import { useState } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '../controllers/AuthContext';

interface LoginProps {
  onLoggedIn: () => void;
  onBack?: () => void;
}

export const Login = ({ onLoggedIn, onBack }: LoginProps) => {
  const { loginConGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError('Google no devolvió credenciales. Intenta de nuevo.');
      return;
    }
    setError(null);
    setCargando(true);
    try {
      await loginConGoogle(credentialResponse.credential);
      onLoggedIn();
    } catch {
      setError('No se pudo iniciar sesión. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex flex-col w-full flex-grow items-center justify-center px-space-xl py-space-2xl">
      <div className="w-full max-w-md bg-surface-container-low rounded-xl shadow-xl p-space-2xl flex flex-col items-center gap-space-lg">
        <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center shadow-[0_0_24px_rgba(245,158,11,0.25)]">
          <span className="material-symbols-outlined text-primary text-[32px]">theater_comedy</span>
        </div>

        <div className="flex flex-col items-center text-center gap-space-2xs">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Inicia sesión para continuar</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xs">
            Necesitas una cuenta de Google para comprar entradas o usar el agente de voz. Ver
            cartelera y horarios no requiere cuenta.
          </p>
        </div>

        <div className="mt-space-sm">
          {cargando ? (
            <div className="h-11 flex items-center justify-center px-space-lg font-label-md text-label-md text-on-surface-variant">
              Iniciando sesión…
            </div>
          ) : (
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => setError('No se pudo iniciar sesión con Google.')}
              theme="filled_black"
              shape="pill"
              text="continue_with"
            />
          )}
        </div>

        {error && (
          <p className="font-body-sm text-body-sm text-error text-center">{error}</p>
        )}

        {onBack && (
          <button
            onClick={onBack}
            className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors"
            type="button"
          >
            Volver
          </button>
        )}
      </div>
    </div>
  );
};
