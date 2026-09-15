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
npm run dev
```

Abre en `http://localhost:3000`.
