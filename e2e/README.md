# Pruebas de navegador de la voz (Playwright + micrófono falso)

Scripts que abren la app real en Edge/Chrome **sin tocar ningún botón de grabar**: el micrófono es un WAV
(`--use-file-for-fake-audio-capture`) y se comprueba lo que hace el agente y cómo se mueve la pantalla. Se corren a
mano (no forman parte de `npm run lint`): necesitan el sistema levantado con los modelos reales.

## Requisitos

1. `docker compose up -d` con `ollama`, `back_agent` (con GPU: ver `docker-compose.gpu.yml`), `backend` y `frontend`.
2. Playwright sin tocar `package.json`: `npm install --no-save playwright-core` (en `Frontend/`).
3. Un navegador Chromium. Por defecto busca Edge de Windows; en otro sistema: `EDGE_PATH=/ruta/al/chrome`.
4. Un usuario cliente y uno administrador que existan en la base (por defecto `Hebert Suárez burgos` y `Admin Lumen`;
   se cambian con `NOMBRE=... ROL=cliente|administrador`).

Variables opcionales para todos: `BASE_URL` (`http://localhost:3000`), `BACKEND_URL` (`http://localhost:3333/api`).

## Los WAV

```bash
# frase hablada por Piper (2.5 s de silencio al principio para que la página abra el micrófono y el WebSocket)
docker exec back_agent python tests/manual/generar_wav.py "Qué películas hay en cartelera" tests/manual/out/cartelera.wav
# dos frases (la segunda cae mientras el agente todavía habla: prueba la interrupción)
docker exec back_agent python tests/manual/generar_wav.py "Qué películas hay en cartelera||Espera, no quiero eso." tests/manual/out/barge.wav
# la compra entera (4 frases, ~9 s entre una y otra)
docker exec back_agent python tests/manual/generar_wav.py "Quiero dos entradas para Oppenheimer||Los asientos del medio, juntos||Agregame un pochoclo grande||Listo, quiero pagar" tests/manual/out/compra.wav
# un WAV de silencio (para los scripts que hablan por el canal de texto: sin esto el micrófono falso mete un pitido
# que el detector de voz toma por una frase)
python -c "import wave;w=wave.open('silencio.wav','wb');w.setnchannels(1);w.setsampwidth(2);w.setframerate(16000);w.writeframes(b'\0\0'*16000*120)"
```

## Los scripts

| Script | Qué comprueba |
|---|---|
| `voz-continua.cjs` | **Audio real por el micrófono falso**: el agente entiende la frase, contesta y el navegador reproduce el audio. `MODO=barge` con `barge.wav`: hablarle encima lo corta y la segunda frase se procesa. `PANTALLA="Solo Voz"` o `"Voz + UI"`. |
| `ui-dinamica.cjs` | La **app real se mueve** con la conversación: compra completa (función, asientos reales, dulcería, resumen con el aviso de no reembolso, ventana flotante arrastrable). Con `ROL=administrador NOMBRE="Admin Lumen"`: ventana de reporte y confirmación de alta de película. **No confirma nada**: cancela en la ventana, así no escribe en la base compartida. |
| `compra-hablada.cjs` | **La compra entera hablada** (4 frases por el micrófono falso: película, asientos, dulcería, pagar) y el estado final de la app: butacas reales, dulcería, resumen con aviso de no reembolso y ventana de confirmación abierta. No confirma. Es la prueba más cercana a la demo. |
| `dinamica-visible.cjs` | **Voz + UI Dinámica se ve, no se esconde**: nunca aparece la pantalla de Solo Voz; el panel de voz es **una sola franja pegada al selector de modo, de borde a borde** (mide las posiciones) y no hay botones de cambio de modo abajo (la barra inferior solo existe con una compra en curso); "Mostrame la cartelera" lleva sola a la cartelera y, al terminar de hablar, el panel **vuelve solo a "escuchando"**; "Quiero entradas para X" **resalta la tarjeta y el horario ANTES de saltar a los asientos** (mide el orden y el tiempo en el navegador); cambiar de función estando en los asientos no te saca de ahí; las ventanas se abren debajo del panel, la confirmación se cierra al completarse la compra y el ticket no queda flotando al salir; un error de un turno se muestra y se va solo; **lo que se muestra es real**: el reloj de la cabecera marca la hora del sistema (se compara con la de la máquina que corre la prueba), en Táctil el micrófono figura apagado y solo pasa a "Mic activo" al cambiar a voz (también "Mic pausado"), y la latencia y la hora de cada respuesta salen de mediciones. |
| `entradas-voz.cjs` | Los otros caminos a la voz: portal del Home, salir de Solo Voz, pasar de Voz + UI a Solo Voz sin cortar la sesión, elegir "Modo Táctil" para cerrar el panel de voz, y que sin sesión pida login. |

```bash
WAV=/ruta/cartelera.wav node e2e/voz-continua.cjs
WAV=/ruta/compra.wav node e2e/compra-hablada.cjs
SILENCIO_WAV=/ruta/silencio.wav node e2e/dinamica-visible.cjs
SILENCIO_WAV=/ruta/silencio.wav node e2e/ui-dinamica.cjs
SILENCIO_WAV=/ruta/silencio.wav ROL=administrador NOMBRE="Admin Lumen" node e2e/ui-dinamica.cjs
SILENCIO_WAV=/ruta/silencio.wav node e2e/entradas-voz.cjs
```

Terminan con código 0 si todo salió bien y dejan capturas (`ui*.png`, `voz_continua.png`) en el directorio actual.
Los scripts que hablan por texto usan el hook de desarrollo `window.__lumen` (solo existe con `npm run dev`).

## Si algo falla

- *"ready" nunca llega*: `docker logs back_agent` (¿terminó de calentar? busca "Modelos calentados").
- Ollama se queda sin memoria de GPU con dos servicios de voz a la vez: dejá un solo `back_agent` corriendo.
- Las funciones de las películas reales de la base pueden estar en el pasado: con datos viejos el agente ofrece
  "el 24 de diciembre". Programá funciones para los próximos días antes de una demo.
