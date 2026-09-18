# Plan — Depurar el flujo de compra (sacar mockup, bajar la sobrecarga visual)

Complementa el análisis ya compartido en el chat (auditoría de `ProcesoCompra.tsx`,
`SeleccionButacas.tsx`, `BottomHUD.tsx`, `Layout.tsx`). Este documento es el plan de
ejecución, con el rol de front-end senior: **no se toca la paleta de colores, no se
agregan librerías ni componentes nuevos** — todo se resuelve con los mismos tokens
Tailwind (`bg-primary-container`, `font-headline-sm`, etc.) y los mismos patrones que
ya usa el resto del proyecto (botones, badges, cards).

`SeleccionButacas.tsx` queda **fuera de este plan** — ya está 100% conectado a datos
reales, sin ningún mockup. El trabajo es en `ProcesoCompra.tsx`, `Layout.tsx` y
`BottomHUD.tsx`.

---

## Principio rector

Cada elemento visual de la pantalla de confirmación tiene que responder una de dos
preguntas reales del cliente: **"¿qué compré?"** o **"¿cómo lo uso/uso el
comprobante?"**. Todo lo que no responda ninguna de las dos (relleno decorativo,
datos inventados) se saca. Menos bloques, mejor jerarquía tipográfica dentro de esos
tokens — no "más simple" en el sentido de más pobre, sino más honesto y más legible.

---

## Fase 1 — Arreglar el nav superior roto (`Layout.tsx`)

**Problema:** "Asientos", "Candy Bar & VIP" y "Pago & Salida" tienen el mismo estilo
de botón que "Cartelera" (que sí navega) pero no tienen `onClick` — parecen
clickeables y no lo son.

**Cambio:**
- Los 3 botones pasan a hacer `dispatch({ type: 'SET_ESTADO_COMPRA', payload: <paso> })`
  cuando el paso al que apuntan **ya fue alcanzado** (ej. no dejar saltar a "Pago" si
  todavía no se seleccionó ningún asiento) — mismo criterio que ya usa
  `BottomHUD.handleNextStep`/`handleVolver`, no uno nuevo.
- Si el paso todavía no se alcanzó, el botón queda visualmente atenuado
  (`opacity-40 cursor-not-allowed`, sin `onClick`) en vez de fingir que funciona.
- No hace falta lógica nueva de "pasos alcanzados": alcanza con comparar contra
  `state.estadoCompra` actual usando el mismo orden que ya usa `handleNextStep`
  (`seleccionando_asientos` → `seleccionando_candybar` → `pago` → `completado`).

**Archivo:** `src/routes/Layout.tsx`.

---

## Fase 2 — Sacar la redundancia de "Candy Bar Express"

**Problema:** dentro del resumen de compra (sidebar de `ProcesoCompra.tsx`) conviven
dos formas de tocar el mismo carrito de dulcería: la lista real de lo que ya
agregaste, y una tarjeta aparte con un switch on/off que agrega/saca un producto
"recomendado". Ya lo conectamos a datos reales hace un rato, pero seguía siendo una
segunda UI para lo mismo que ya resuelve `CandyBarSelection.tsx`.

**Cambio:**
- Se elimina la tarjeta "Candy Bar Express" completa (el bloque con el switch) de
  `ProcesoCompra.tsx`.
- Se elimina el estado/efecto `candyBarExpress` y `toggleSnackExpress` que ya no
  tienen consumidor.
- Se mantiene tal cual la lista real "Confitería & Snacks" (la que refleja
  `state.candyBarSeleccionado`) — esa es la única fuente de verdad del carrito de
  dulcería, y ya tiene su botón "Quitar" por ítem.

**Archivo:** `src/views/ProcesoCompra.tsx`.

---

## Fase 3 — Rediseñar la pantalla de "Compra Confirmada"

Es la que concentra casi todo el mockup. Cambios punto por punto:

| Elemento actual | Problema | Reemplazo |
|---|---|---|
| `#LMN-84920` (ID de transacción inventado) | No es un dato real | `#{state.ventaCreada.idVenta}` — ya existe en el estado, no hace falta pedir nada nuevo |
| QR de `<svg>` con rectángulos fijos | No codifica nada, parece escaneable y no lo es | Se saca. En su lugar, un badge de texto grande y legible: **"Código de compra #{idVenta}"** — mismo lugar, mismo peso visual, sin fingir una capacidad que no existe |
| `PASS-ID: 992-VIP` | Inventado, y redundante con las butacas ya listadas arriba | Se saca (sin reemplazo — la info ya está en "Butacas") |
| "Puerta A" / "Segundo Nivel" | No existen en el modelo de datos (`salas` no tiene puerta/nivel) | Se sacan esas dos columnas del grid de 3; queda un grid de **2** columnas reales: "Fecha & Horario" y "Auditorio" (con `sala.nombre` + `sala.tipo` real) |
| "VIP EXPANDED PASS" / "Butacas VIP Reclinables" (texto fijo) | Dice VIP siempre, no mira el dato real | Usa `sala?.tipo` real (ya está en `state.salaSeleccionada`) — si la sala es "2D" dice "2D", no "VIP" |
| Botón "Imprimir Ticket Físico" | No tiene `onClick`, no hace nada | Se conecta a `window.print()` — nativo del navegador, cero dependencias nuevas, funciona de verdad |
| Bloques decorativos de fondo (blur/gradientes/`animate-ping`) | Varios superpuestos, sin información, suman ruido visual | Se deja **uno solo** (el glow superior) en vez de los 3 actuales — mismo lenguaje visual, menos capas |
| "Transacción Cifrada TLS 1.3" / "Escaneo Obligatorio" | Relleno de ambientación sin dato real detrás | Se sacan — el badge de "Código de compra" ya cumple ese rol visual sin inventar seguridad que no se implementó |

**Lo que se mantiene tal cual** (ya es real, no es mockup):
- Header con estado "Proceso RF-04 Completado", poster real, sala real, fecha/hora
  real, butacas reales, `totalReal` (de `state.ventaCreada.total`).
- Dulcería (si hay) — ya viene de datos reales.
- Botón "Volver al Inicio".

**Archivo:** `src/views/ProcesoCompra.tsx` (bloque `estadoCompra === 'completado'`).

---

## Fase 4 (opcional, a confirmar con vos) — Limpieza menor en `BottomHUD.tsx`

Dos botones puramente decorativos, mismo patrón que el nav roto de Fase 1:
- "Llamar Asistente" — sin `onClick`. Opciones: (a) sacarlo si no hay backend de
  soporte real detrás, o (b) dejarlo pero atenuado visualmente como "próximamente".
- Ícono de carrito (🛍️) — muestra el contador de ítems pero no abre nada al
  tocarlo. Opción: que al tocarlo salte a `seleccionando_candybar` (si ya se
  alcanzó ese paso) para revisar el carrito rápido.

No lo marco como obligatorio porque no lo mencionaste en el pedido original — lo dejo
para que decidas si entra en este mismo trabajo o se queda para después.

---

## Orden de ejecución sugerido

1. Fase 1 (nav) — la más chica, cero riesgo de romper el flujo de compra.
2. Fase 2 (sacar Candy Bar Express) — borra código, no agrega nada.
3. Fase 3 (pantalla de confirmación) — la de mayor impacto visual, se hace al final
   porque toca el bloque más grande del archivo.
4. Fase 4 — solo si la confirmás.

## Verificación

- `npx tsc --noEmit` y `npx vite build` después de cada fase (mismo criterio que
  usamos en todo el proyecto).
- Prueba manual en navegador: completar una compra real de punta a punta (con y sin
  dulcería) y confirmar que la pantalla final muestra `idVenta` real, sala/tipo
  real, y que "Imprimir" abre el diálogo de impresión del navegador.
- Confirmar visualmente que no quedó ningún texto/dato inventado buscando en el
  archivo final: `LMN-`, `992-VIP`, `Puerta`, `Segundo Nivel`.

## No-regresión

- No se toca `CineContext`/`cine.reducer.ts` salvo remover el uso muerto de
  `candyBarExpress` (Fase 2) — ningún cambio de esquema de estado.
- No se toca el backend ni ningún endpoint — es 100% presentación.
- No se agregan dependencias nuevas (`window.print()` es API nativa del navegador).
