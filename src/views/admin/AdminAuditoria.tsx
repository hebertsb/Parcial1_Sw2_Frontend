import { useEffect, useState } from 'react';
import { useAuth } from '../../controllers/AuthContext';
import { listarLogAcciones } from '../../api/audit.api';
import type { LogAccion } from '../../core/types/audit.types';

const TH = 'py-space-sm px-space-md text-left font-label-code text-label-code uppercase text-outline';
const TD = 'py-space-sm px-space-md font-body-sm text-body-sm text-on-surface whitespace-nowrap';

/** RF12 — historial real de `log_acciones` (`GET /audit/log-acciones`), reemplaza el log fake de una sola fila. */
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
        <span className="px-space-xs py-0.5 rounded bg-primary/10 text-primary font-label-code text-label-code uppercase tracking-wider w-fit">RF12 • Datos reales</span>
        <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Auditoría de Acciones</h1>
      </div>

      {cargando && <p className="font-label-md text-label-md text-on-surface-variant">Cargando log de auditoría...</p>}

      <div className="rounded-2xl bg-surface-container-low shadow-lg overflow-x-auto">
        <table className="w-full min-w-[620px]">
          <thead>
            <tr>
              <th className={TH}>Fecha y hora</th>
              <th className={TH}>Usuario</th>
              <th className={TH}>Acción</th>
              <th className={TH}>Nivel de despliegue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {logs.length === 0 ? (
              <tr>
                <td className={TD} colSpan={4}>Sin acciones registradas todavía.</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.idLog}>
                  <td className={TD}>{new Date(log.fechaHora).toLocaleString('es-BO')}</td>
                  <td className={TD}>#{log.idUsuario}</td>
                  <td className={TD}><code>{log.accion}</code></td>
                  <td className={TD}>{log.nivelDespliegue ?? '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
