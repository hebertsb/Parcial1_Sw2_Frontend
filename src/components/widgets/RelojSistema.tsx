import { useEffect, useState } from 'react';
import { formatearHora } from '../../core/time/reloj';

/**
 * Reloj de la cabecera con la hora REAL del sistema (antes decia "20:45" fijo). Solo se vuelve a dibujar cuando cambia
 * el minuto; pasar el mouse por encima muestra la fecha completa.
 */
export const RelojSistema = () => {
  const [ahora, setAhora] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => {
      setAhora((anterior) => {
        const nuevo = new Date();
        return nuevo.getHours() === anterior.getHours() && nuevo.getMinutes() === anterior.getMinutes() ? anterior : nuevo;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <time
      data-testid="reloj-sistema"
      dateTime={ahora.toISOString()}
      title={ahora.toLocaleString('es-BO', { dateStyle: 'full', timeStyle: 'short' })}
      className="font-label-code text-label-code text-on-surface font-bold tracking-widest"
    >
      {formatearHora(ahora)}
    </time>
  );
};
