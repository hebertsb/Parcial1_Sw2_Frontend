import { useEffect, useState } from 'react';
import { useAuth } from '../../controllers/AuthContext';
import { listarLogAcciones } from '../../api/audit.api';
import type { LogAccion } from '../../core/types/audit.types';

const TH = 'py-space-sm px-space-md text-left font-label-code text-label-code uppercase text-outline';
const TD = 'py-space-sm px-space-md font-body-sm text-body-sm text-on-surface whitespace-nowrap';

export const AdminAuditoria = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState<LogAccion[]>([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelado = false;
    (async () => {
      setCargando(true);
      try {
        const registros = await listarLogAcciones({ limite: 100 }, token);
        if (!cancelado) setLogs(registros);
      } catch (error) {
        console.error('No se pudo cargar el log de auditoría real.', error);
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [token]);

  return (
    <div className="p-space-xl flex flex-col gap-space-lg">
      <div className="flex flex-col gap-space-2xs">
        <span className="px-space-xs py-0.5 rounded bg-primary/10 text-primary font-label-code text-label-code uppercase tracking-wider w-fit">
          RF12 — Datos de Auditoría Enterprise
        </span>
        <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
          Auditoría de Acciones y Seguridad
        </h1>
      </div>

      {cargando && (
        <p className="font-label-md text-label-md text-on-surface-variant">
          Cargando log de auditoría...
        </p>
      )}

      <div className="rounded-2xl bg-surface-container-low shadow-lg overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr>
              <th className={TH}>Fecha y hora</th>
              <th className={TH}>Usuario</th>
              <th className={TH}>Acción</th>
              <th className={TH}>IP Origen</th>
              <th className={TH}>User Agent / Cliente</th>
              <th className={TH}>Nivel Despliegue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {logs.length === 0 ? (
              <tr>
                <td className={TD} colSpan={6}>
                  Sin acciones registradas todavía.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.idLog}>
                  <td className={TD}>{new Date(log.fechaHora).toLocaleString('es-BO')}</td>
                  <td className={TD}>
                    <span className="font-bold text-primary">#{log.idUsuario}</span>
                  </td>
                  <td className={TD}>
                    <code className="px-space-xs py-0.5 rounded bg-surface-container-high text-on-surface font-mono text-xs">
                      {log.accion}
                    </code>
                  </td>
                  <td className={TD}>
                    <span className="font-mono text-xs text-secondary font-semibold">
                      {log.ipOrigen || '127.0.0.1'}
                    </span>
                  </td>
                  <td className={TD}>
                    <span className="text-xs text-outline max-w-xs truncate inline-block" title={log.userAgent ?? 'N/A'}>
                      {log.userAgent ? (log.userAgent.length > 35 ? `${log.userAgent.slice(0, 35)}...` : log.userAgent) : 'Desconocido'}
                    </span>
                  </td>
                  <td className={TD}>
                    <span className="px-space-xs py-0.5 rounded text-xs uppercase font-label-code bg-surface-container-high text-outline">
                      {log.nivelDespliegue ?? 'servidor_local'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
