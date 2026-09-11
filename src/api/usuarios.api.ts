import { apiFetch } from './client';
import type { Usuario, CrearUsuarioInput, ActualizarUsuarioInput } from '../core/types/usuario.types';

export function listarUsuarios(token: string): Promise<Usuario[]> {
  return apiFetch<Usuario[]>('/usuarios', { token });
}

export function buscarUsuarioPorId(idUsuario: number, token: string): Promise<Usuario> {
  return apiFetch<Usuario>(`/usuarios/${idUsuario}`, { token });
}

export function crearUsuario(input: CrearUsuarioInput, token: string): Promise<Usuario> {
  return apiFetch<Usuario>('/usuarios', { method: 'POST', body: input, token });
}

export function actualizarUsuario(idUsuario: number, input: ActualizarUsuarioInput, token: string): Promise<Usuario> {
  return apiFetch<Usuario>(`/usuarios/${idUsuario}`, { method: 'PATCH', body: input, token });
}

export function eliminarUsuario(idUsuario: number, token: string): Promise<void> {
  return apiFetch<void>(`/usuarios/${idUsuario}`, { method: 'DELETE', token });
}
