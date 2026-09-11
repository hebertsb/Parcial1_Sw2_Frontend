export type Rol = 'cliente' | 'administrador';

export interface Usuario {
  idUsuario: number;
  nombre: string;
  rol: Rol;
  metodoAuth?: string | null;
  email?: string | null;
  googleId?: string | null;
  fechaRegistro?: string;
}

export interface CrearUsuarioInput {
  nombre: string;
  rol: Rol;
  email?: string;
  metodoAuth?: string;
}

export interface ActualizarUsuarioInput {
  nombre?: string;
  rol?: Rol;
  email?: string;
  metodoAuth?: string;
}
