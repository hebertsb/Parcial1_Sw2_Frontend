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
# la compra entera (4 frases, ~9 s entre una y otra). Con la cartelera de la demo hay varias funciones por película: la primera
# frase tiene que nombrar una que exista (día y hora), si no el agente pregunta a cuál; y un producto inequívoco (hay dos popcorn grandes)
docker exec back_agent python tests/manual/generar_wav.py "Quiero dos entradas para Oppenheimer mañana a la una y media de la tarde||Los asientos del medio, juntos||Agregame un popcorn caramelo grande||Listo, quiero pagar" tests/manual/out/compra.wav
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
| `dinamica-visible.cjs` | **Voz + UI Dinámica se ve, no se esconde**: nunca aparece la pantalla de Solo Voz; el panel de voz es **una sola franja pegada al selector de modo, de borde a borde** (mide las posiciones) y no hay botones de cambio de modo abajo (la barra inferior solo existe con una compra en curso); la cabecera queda limpia: sin el rótulo "RF18" y con "Sala asignada" solo cuando ya hay una función elegida; "Mostrame la cartelera" lleva sola a la cartelera y, al terminar de hablar, el panel **vuelve solo a "escuchando"**; "Quiero entradas para X" **resalta la tarjeta y el horario ANTES de saltar a los asientos** (mide el orden y el tiempo en el navegador); cambiar de función estando en los asientos no te saca de ahí; las ventanas se abren debajo del panel, la confirmación se cierra al completarse la compra y el ticket no queda flotando al salir; un error de un turno se muestra y se va solo; **lo que se muestra es real**: el reloj de la cabecera marca la hora del sistema (se compara con la de la máquina que corre la prueba), en Táctil el micrófono figura apagado y solo pasa a "Mic activo" al cambiar a voz (también "Mic pausado"), y la latencia y la hora de cada respuesta salen de mediciones. |
| `admin-interfaz.cjs` | **La consola de administrador tiene la misma interfaz de voz que el cliente**: selector de modo visible, panel de voz pegado debajo (de borde a borde del contenido), hora real, "Mic activo" solo con voz, latencia real, sin la pestaña vieja "Asistente de Voz (RF18)"; y que **el agente señala la fila que crea o cambia** (película, función, precio: cambia de sub-pestaña y la resalta, y se apaga sola) y la ventana de reporte usa nombres legibles y muestra el periodo. No usa el modelo (inyecta las acciones del servidor con ids reales) y no escribe nada. |
| `admin-portada.cjs` | **La ventana de confirmación del administrador muestra la portada** de la película que se va a crear (la sirve el agente en `/portadas/...`) antes de decir «confirmo», con los datos al lado (y la sinopsis larga debajo); **Cancelar/Confirmar siguen a la vista** con la portada, también en una laptop chica (1366×680); sin portada no hay imagen y una imagen que falla se esconde sin dejar un ícono roto. Inyecta la acción del servidor y no escribe nada. Si el agente que corre todavía no sirve `/portadas`, simula esa respuesta y avisa (reconstruí `back_agent` para la prueba completa). |
| `entradas-voz.cjs` | Los otros caminos a la voz: portal del Home, salir de Solo Voz, pasar de Voz + UI a Solo Voz sin cortar la sesión, elegir "Modo Táctil" para cerrar el panel de voz, y que sin sesión pida login. |

`apoyo.cjs` no es una prueba: arma la frase de compra de `ui-dinamica.cjs` y `dinamica-visible.cjs` con un **día y una hora reales** de la
base («Quiero dos entradas para Oppenheimer el 20 de septiembre a las 13:30»). Con la cartelera de la demo cada película tiene varias funciones,
y decir solo «quiero entradas para X» hace que el agente pregunte a cuál ir (que es lo correcto, pero no lo que esas pruebas miden).

```bash
WAV=/ruta/cartelera.wav node e2e/voz-continua.cjs
WAV=/ruta/compra.wav node e2e/compra-hablada.cjs
SILENCIO_WAV=/ruta/silencio.wav node e2e/dinamica-visible.cjs
SILENCIO_WAV=/ruta/silencio.wav node e2e/ui-dinamica.cjs
SILENCIO_WAV=/ruta/silencio.wav ROL=administrador NOMBRE="Admin Lumen" node e2e/ui-dinamica.cjs
SILENCIO_WAV=/ruta/silencio.wav node e2e/admin-interfaz.cjs
SILENCIO_WAV=/ruta/silencio.wav node e2e/admin-portada.cjs
SILENCIO_WAV=/ruta/silencio.wav node e2e/entradas-voz.cjs
```

Terminan con código 0 si todo salió bien y dejan capturas (`ui*.png`, `voz_continua.png`) en el directorio actual.
Los scripts que hablan por texto usan el hook de desarrollo `window.__lumen` (solo existe con `npm run dev`).

## Si algo falla

- *"ready" nunca llega*: `docker logs back_agent` (¿terminó de calentar? busca "Modelos calentados").
- Ollama se queda sin memoria de GPU con dos servicios de voz a la vez: dejá un solo `back_agent` corriendo.
- Las funciones de las películas reales de la base pueden estar en el pasado: con datos viejos el agente ofrece
  "el 24 de diciembre". Antes de una demo corré `python scripts/poblar_base_de_datos.py --aplicar` (en `Backend_IA/agent_cine`):
  agrega funciones para los próximos 7 días sin duplicar lo que ya hay.
