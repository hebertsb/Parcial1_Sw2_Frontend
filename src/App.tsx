import { BrowserRouter, Route, Routes } from 'react-router-dom';
import {
 CineProvider } from './controllers/CineContext';
import { Layout } from './routes/Layout';
import { RequireAuth } from './routes/RequireAuth';
import {
 RequireAdmin } from './routes/RequireAdmin';
import { Home } from './views/Home';
import { Cartelera } from './views/Cartelera';
import { ProcesoCompra } from './views/ProcesoCompra';
import { MisCompras } from './views/MisCompras';
import { Login } from './views/Login';
import { AdminAccess } from './views/AdminAccess';
import { AdminConsole } from './views/AdminConsole';
import { VoiceAgent } from './views/VoiceAgent';
import { UiControlProvider } from './core/ui/UiControlContext';
import { VentanasProvider } from './core/ui/VentanasContext';
import { VoiceSessionProvider } from './core/voice/VoiceSessionProvider';

export default function App() {
  return (
    <BrowserRouter>
      <CineProvider>
        {/* La conversacion de voz vive arriba de las rutas: no se corta al navegar y puede mover la app real. */}
        <UiControlProvider>
          <VentanasProvider>
            <VoiceSessionProvider>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/cartelera" element={<Cartelera />} />
                  <Route path="/compra" element={<ProcesoCompra />} />
                  <Route
                    path="/mis-compras"
                    element={
                      <RequireAuth>
                        <MisCompras />
                      </RequireAuth>
                    }
                  />
                  <Route path="/login" element={<Login />} />
                </Route>
                <Route path="/admin" element={<AdminAccess />} />
                <Route
                  path="/admin/console"
                  element={
                    <RequireAdmin>
                      <AdminConsole />
                    </RequireAdmin>
                  }
                />
                <Route
                  path="/voz"
                  element={
                    <RequireAuth>
                      <VoiceAgent />
                    </RequireAuth>
                  }
                />
              </Routes>
            </VoiceSessionProvider>
          </VentanasProvider>
        </UiControlProvider>
      </CineProvider>
    </BrowserRouter>
  );
}
