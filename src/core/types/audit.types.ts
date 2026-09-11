export interface LogAccion {
  idLog: number;
  idUsuario: number;
  accion: string;
  fechaHora: string;
  nivelDespliegue: string | null;
  ipOrigen?: string | null;
  userAgent?: string | null;
}

export interface FiltrosConsultaLog {
  usuarioId?: number;
  accion?: string;
  desde?: string;
  hasta?: string;
  limite?: number;
}
