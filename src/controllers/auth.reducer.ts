import { Usuario } from '../core/types/usuario.types';

export interface AuthState {
  usuario: Usuario | null;
  token: string | null;
}

export type AuthAction =
  | { type: 'LOGIN'; payload: { usuario: Usuario; token: string } }
  | { type: 'LOGOUT' };

export const initialAuthState: AuthState = {
  usuario: null,
  token: null,
};

export const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN':
      return { usuario: action.payload.usuario, token: action.payload.token };
    case 'LOGOUT':
      return { usuario: null, token: null };
    default:
      return state;
  }
};
