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
import { Login } from './views/Login';
import { AdminAccess } from './views/AdminAccess';
import { AdminConsole } from './views/AdminConsole';
import { VoiceAgent } from './views/VoiceAgent';

export default function App() {
  return (
    <BrowserRouter>
      <CineProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/cartelera" element={<Cartelera />} />
            <Route path="/compra" element={<ProcesoCompra />} />
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
      </CineProvider>
    </BrowserRouter>
  );
}
