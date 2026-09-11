import { useEffect, useState } from 'react';
import { useAuth } from '../../controllers/AuthContext';
import {
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
} from '../../api/usuarios.api';
import type { Usuario, Rol } from '../../core/types/usuario.types';

const TH = 'py-space-sm px-space-md text-left font-label-code text-label-code uppercase text-outline';
const TD = 'py-space-sm px-space-md font-body-sm text-body-sm text-on-surface whitespace-nowrap';

type FiltroRol = 'todos' | 'cliente' | 'administrador';

export const AdminUsuarios = () => {
  const { token } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filtros de UI
  const [filtroRol, setFiltroRol] = useState<FiltroRol>('todos');
  const [busqueda, setBusqueda] = useState('');

  // Estados para Modal de Crear / Editar
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState<Usuario | null>(null);
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState<Rol>('cliente');
  const [email, setEmail] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargarUsuarios = async () => {
    if (!token) return;
    setCargando(true);
    setErrorMsg(null);
    try {
      const data = await listarUsuarios(token);
      setUsuarios(data);
    } catch (err: any) {
      setErrorMsg(err.message ?? 'Error al cargar los usuarios.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, [token]);

  const abrirModalCrear = () => {
    setUsuarioEditar(null);
    setNombre('');
    setRol('cliente');
    setEmail('');
    setModalAbierto(true);
  };

  const abrirModalEditar = (u: Usuario) => {
    setUsuarioEditar(u);
    setNombre(u.nombre);
    setRol(u.rol);
    setEmail(u.email ?? '');
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setUsuarioEditar(null);
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setGuardando(true);
    setErrorMsg(null);
    try {
      if (usuarioEditar) {
        await actualizarUsuario(usuarioEditar.idUsuario, { nombre, rol, email: email || undefined }, token);
      } else {
        await crearUsuario({ nombre, rol, email: email || undefined }, token);
      }
      cerrarModal();
      await cargarUsuarios();
    } catch (err: any) {
      setErrorMsg(err.message ?? 'Error al guardar el usuario.');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (u: Usuario) => {
    if (!token) return;
    if (!confirm(`¿Estás seguro de eliminar el usuario "${u.nombre}" (#${u.idUsuario})?`)) return;
    try {
      await eliminarUsuario(u.idUsuario, token);
      await cargarUsuarios();
    } catch (err: any) {
      alert(err.message ?? 'Error al eliminar usuario.');
    }
  };

  // Filtrar lista
  const usuariosFiltrados = usuarios.filter((u) => {
    const cumpleRol = filtroRol === 'todos' || u.rol === filtroRol;
    const q = busqueda.toLowerCase().trim();
    const cumpleBusqueda =
      !q ||
      u.nombre.toLowerCase().includes(q) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      String(u.idUsuario).includes(q);
    return cumpleRol && cumpleBusqueda;
  });

  const totalClientes = usuarios.filter((u) => u.rol === 'cliente').length;
  const totalAdmins = usuarios.filter((u) => u.rol === 'administrador').length;

  return (
    <div className="p-space-xl flex flex-col gap-space-lg">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-space-2xs">
          <span className="px-space-xs py-0.5 rounded bg-primary/10 text-primary font-label-code text-label-code uppercase tracking-wider w-fit">
            RF11 — Control de Usuarios
          </span>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
            Gestión de Usuarios
          </h1>
        </div>
        <button
          onClick={abrirModalCrear}
          className="flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary/90 transition-colors shadow-md"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          Nuevo Usuario
        </button>
      </div>

      {/* Filtros de Búsqueda y Rol */}
      <div className="flex flex-wrap items-center justify-between gap-space-md bg-surface-container-low p-space-md rounded-2xl shadow-sm">
        {/* Chips de Selección de Rol */}
        <div className="flex items-center gap-space-xs">
          <button
            onClick={() => setFiltroRol('todos')}
            className={`px-space-md py-space-xs rounded-lg font-label-md transition-colors flex items-center gap-space-xs ${
              filtroRol === 'todos'
                ? 'bg-primary-container text-on-primary-container font-bold'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'
            }`}
          >
            <span>Todos</span>
            <span className="px-1.5 py-0.2 text-xs rounded-full bg-surface/40">
              {usuarios.length}
            </span>
          </button>

          <button
            onClick={() => setFiltroRol('administrador')}
            className={`px-space-md py-space-xs rounded-lg font-label-md transition-colors flex items-center gap-space-xs ${
              filtroRol === 'administrador'
                ? 'bg-primary-container text-on-primary-container font-bold'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">shield_person</span>
            <span>Administradores</span>
            <span className="px-1.5 py-0.2 text-xs rounded-full bg-surface/40">
              {totalAdmins}
            </span>
          </button>

          <button
            onClick={() => setFiltroRol('cliente')}
            className={`px-space-md py-space-xs rounded-lg font-label-md transition-colors flex items-center gap-space-xs ${
              filtroRol === 'cliente'
                ? 'bg-primary-container text-on-primary-container font-bold'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">person</span>
            <span>Clientes</span>
            <span className="px-1.5 py-0.2 text-xs rounded-full bg-surface/40">
              {totalClientes}
            </span>
          </button>
        </div>

        {/* Buscador Rápido */}
        <div className="relative w-full sm:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            search
          </span>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="w-full pl-10 pr-space-md py-space-xs rounded-lg bg-surface-container-high border border-outline/20 text-on-surface font-body-sm placeholder:text-outline/60 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {errorMsg && (
        <div className="p-space-md rounded-lg bg-error-container text-on-error-container font-body-sm">
          {errorMsg}
        </div>
      )}

      {cargando && (
        <p className="font-label-md text-label-md text-on-surface-variant">Cargando usuarios...</p>
      )}

      <div className="rounded-2xl bg-surface-container-low shadow-lg overflow-x-auto">
        <table className="w-full min-w-[620px]">
          <thead>
            <tr>
              <th className={TH}>ID</th>
              <th className={TH}>Nombre</th>
              <th className={TH}>Rol</th>
              <th className={TH}>Email</th>
              <th className={TH}>Método Auth</th>
              <th className={TH}>Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {usuariosFiltrados.length === 0 ? (
              <tr>
                <td className={TD} colSpan={6}>
                  No se encontraron usuarios con el filtro seleccionado.
                </td>
              </tr>
            ) : (
              usuariosFiltrados.map((u) => (
                <tr key={u.idUsuario}>
                  <td className={TD}>#{u.idUsuario}</td>
                  <td className={TD}><span className="font-bold">{u.nombre}</span></td>
                  <td className={TD}>
                    <span
                      className={`px-space-xs py-0.5 rounded text-xs uppercase font-label-code ${
                        u.rol === 'administrador'
                          ? 'bg-primary-container text-on-primary-container font-bold'
                          : 'bg-surface-container-high text-on-surface-variant'
                      }`}
                    >
                      {u.rol}
                    </span>
                  </td>
                  <td className={TD}>{u.email ?? '—'}</td>
                  <td className={TD}>{u.metodoAuth ?? 'manual'}</td>
                  <td className={TD}>
                    <div className="flex items-center gap-space-xs">
                      <button
                        onClick={() => abrirModalEditar(u)}
                        className="p-space-2xs rounded bg-surface-container-high hover:bg-surface-variant text-on-surface transition-colors"
                        title="Editar"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleEliminar(u)}
                        className="p-space-2xs rounded bg-error-container/20 hover:bg-error-container text-error transition-colors"
                        title="Eliminar"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Crear / Editar */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-space-md">
          <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl w-full max-w-md p-space-lg shadow-2xl flex flex-col gap-space-md">
            <h2 className="font-headline-md text-headline-md text-on-surface">
              {usuarioEditar ? `Editar Usuario #${usuarioEditar.idUsuario}` : 'Nuevo Usuario'}
            </h2>

            <form onSubmit={handleGuardar} className="flex flex-col gap-space-md">
              <div className="flex flex-col gap-space-2xs">
                <label className="font-label-md text-label-md text-on-surface">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="px-space-sm py-space-xs rounded-lg bg-surface-container-high border border-outline/20 text-on-surface font-body-md"
                  placeholder="Ej: Carlos Gómez"
                />
              </div>

              <div className="flex flex-col gap-space-2xs">
                <label className="font-label-md text-label-md text-on-surface">Rol</label>
                <select
                  value={rol}
                  onChange={(e) => setRol(e.target.value as Rol)}
                  className="px-space-sm py-space-xs rounded-lg bg-surface-container-high border border-outline/20 text-on-surface font-body-md"
                >
                  <option value="cliente">Cliente</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>

              <div className="flex flex-col gap-space-2xs">
                <label className="font-label-md text-label-md text-on-surface">Correo Electrónico (Opcional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-space-sm py-space-xs rounded-lg bg-surface-container-high border border-outline/20 text-on-surface font-body-md"
                  placeholder="carlos@example.com"
                />
              </div>

              <div className="flex items-center justify-end gap-space-sm mt-space-sm">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="px-space-md py-space-xs rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-variant transition-colors font-label-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-space-md py-space-xs rounded-lg bg-primary text-on-primary hover:bg-primary/90 transition-colors font-label-md shadow-md disabled:opacity-50"
                >
                  {guardando ? 'Guardando...' : usuarioEditar ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
