export type Rol = 'cliente' | 'administrador';

export interface Usuario {
  idUsuario: number;
  nombre: string;
  rol: Rol;
}
