# Parcial1_Sw2_Frontend

Frontend (React + Vite + Tailwind) del Sistema de Cine con Agente de Voz — Segundo Parcial, Ingeniería de Software 2.

Interfaz de kiosco para compra de entradas de cine, con modo táctil y modo de agente de voz (UI generativa). Consume la API del backend NestJS del mismo proyecto (`Backend/BackendParcial1/Backend`).

## Estado actual (2026-09-15)

Conectado end-to-end contra el backend real (NestJS + Supabase), no un mockup:

- **Flujo cliente**: cartelera real (con selector de día), selección de asientos, compra
  y pago controlado (`POST /pagos`, efectivo/tarjeta) — todo contra datos reales.
- **Panel admin**: Cartelera & Funciones, Configuración de Salas, Usuarios, Auditoría &
  Logs, Reportes, y **Precios & Promos** (CRUD completo, incluye asociar una promoción a
  una función) — todos con datos reales del backend, ninguno es mockup.
- **Agente de voz** (`VoiceAgent.tsx`) conectado al servicio de IA real (`agent_cine`,
  FastAPI) — graba audio, transcribe con Whisper, responde con TTS. La ejecución real de
  la acción confirmada contra el backend NestJS (`ia-gateway`) todavía no está conectada
  del lado de `agent_cine` (`gateway_client.py` no existe ahí).

**Pendiente conocido** (ver `AGENTS.md` del repo `BackendParcial1` para detalle): dulcería
sigue con productos hardcodeados en el carrito (el backend ya tiene el CRUD real, falta
conectarlo), `/admin/console` no tiene guard de rol en el frontend, y la confirmación de
no-reembolso (RF03) está fija en `true` en vez de un checkbox real.

## Correr en local

```bash
npm install
cp .env.example .env.local      # en Windows (cmd): copy .env.example .env.local
npm run dev
```

Abre en `http://localhost:3000`. Ese puerto es fijo: es el único origen autorizado en el cliente OAuth de Google.

### Puertos y variables

| Servicio | Puerto | Cómo se apunta desde el frontend |
|---|---|---|
| Frontend (Vite) | **3000** | — (no se puede cambiar por el login con Google) |
| Backend NestJS | **3333** | `VITE_API_URL=http://localhost:3333/api` (es también el valor por defecto) |
| Agente de voz (FastAPI) | 8000 | `VITE_VOICE_API_URL=http://localhost:8000` |

- El backend tiene que estar en el **3333**: con docker compose ya viene así; si lo corrés a mano, poné `PORT=3333` en el `.env` del backend
  (sin `PORT` arranca en el 3000 y choca con Vite).
- `VITE_API_URL` **nunca** debe ser el 3000: ese es el propio frontend y todas las llamadas de datos fallarían. En modo desarrollo la consola
  del navegador avisa si pasa.
- En `.env.local` también van `VITE_GOOGLE_CLIENT_ID` (login con Google) y las de Cloudinary (subir portadas de películas y productos).
  `.env.local` no se sube a git: cada integrante tiene el suyo.
