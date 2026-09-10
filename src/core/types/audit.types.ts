/** Misma forma que `Backend/src/database/entities/log-accion.entity.ts` (RF12). */
export interface LogAccion {
  idLog: number;
  idUsuario: number;
  accion: string;
  fechaHora: string;
  nivelDespliegue: string | null;
}

export interface FiltrosConsultaLog {
  usuarioId?: number;
  accion?: string;
  desde?: string;
  hasta?: string;
  limite?: number;
}
