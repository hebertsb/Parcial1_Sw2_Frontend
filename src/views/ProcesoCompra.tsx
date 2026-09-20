import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../controllers/AuthContext";
import { useCine } from "../controllers/CineContext";
import { SeleccionButacas } from "../components/widgets/SeleccionButacas";
import { CandyBarSelection } from "../components/widgets/CandyBarSelection";
import { SeccionPago } from "../components/pagos/SeccionPago";
import { ModalBoletoImpresion } from "../components/widgets/ModalBoletoImpresion";
import { obtenerDisponibilidad } from "../api/funciones.api";
import { obtenerPrecio } from "../api/precios.api";
import { obtenerSala } from "../api/salas.api";
import { posterFor } from "../core/posters";

export const ProcesoCompra = () => {
  const { state, dispatch } = useCine();
  const { usuario, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mostrarBoletoModal, setMostrarBoletoModal] = useState(false);

  const totalEntradas = state.butacasSeleccionadas.reduce(
    (acc, b) => acc + b.precio,
    0,
  );
  const totalSnacks = state.candyBarSeleccionado.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0,
  );
  const total = totalEntradas + totalSnacks;
  // `total` ya es el precio real por entrada (state.precioUnitario, traído de
  // GET /precios/:id según funcion.idPrecio) — pero no incluye descuentos por promoción,
  // esos solo los calcula el backend. Una vez que POST /ventas responde, su `total` real
  // (precio × entradas − descuento de PromocionesService) reemplaza este cálculo local.
  const totalReal = state.ventaCreada ? Number(state.ventaCreada.total) : total;
  const fechaFuncionLegible = state.funcionSeleccionada
    ? new Date(
        `${state.funcionSeleccionada.fecha}T00:00:00`,
      ).toLocaleDateString("es-BO", { day: "numeric", month: "short" })
    : "";
  const horaFuncionLegible =
    state.funcionSeleccionada?.horaInicio.slice(0, 5) ?? "";
  const sala = state.salaSeleccionada;

  // `funcionSeleccionada` ya llega resuelta desde PeliculaCard.tsx (el usuario elige un
  // horario real en la cartelera) — acá solo falta pedir la disponibilidad de esa función.
  // Depender de `idFuncion` (primitivo) y no del objeto `funcionSeleccionada` entero evita
  // el loop de limpieza/re-disparo que tuvo esta pantalla cuando el propio efecto seteaba
  // un objeto que también estaba en sus dependencias.
  useEffect(() => {
    const idFuncion = state.funcionSeleccionada?.idFuncion;
    const idPrecio = state.funcionSeleccionada?.idPrecio;
    const idSala = state.funcionSeleccionada?.idSala;
    if (!idFuncion || !idSala || !token) {
      return;
    }

    let cancelado = false;

    (async () => {
      dispatch({ type: "SET_CARGANDO_DISPONIBILIDAD", payload: true });
      try {
        // El precio se pide en paralelo, no bloquea la disponibilidad: si la función no
        // tiene idPrecio asignado (caso raro, ver VentasService.crear del backend) el
        // total simplemente queda en 0 hasta la confirmación, como antes.
        const [disponibilidad, precio, sala] = await Promise.all([
          obtenerDisponibilidad(idFuncion, token),
          idPrecio ? obtenerPrecio(idPrecio, token) : Promise.resolve(null),
          obtenerSala(idSala, token),
        ]);
        if (!cancelado) {
          dispatch({ type: "SET_DISPONIBILIDAD", payload: disponibilidad });
          dispatch({
            type: "SET_PRECIO_UNITARIO",
            payload: precio?.valor ?? null,
          });
          dispatch({ type: "SET_SALA_SELECCIONADA", payload: sala });
        }
      } catch (error) {
        console.error(
          "No se pudo cargar la disponibilidad real de la función.",
          error,
        );
      } finally {
        if (!cancelado) {
          dispatch({ type: "SET_CARGANDO_DISPONIBILIDAD", payload: false });
        }
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [
    state.funcionSeleccionada?.idFuncion,
    state.funcionSeleccionada?.idPrecio,
    state.funcionSeleccionada?.idSala,
    token,
    dispatch,
  ]);

  const volverACartelera = () => {
    dispatch({ type: "RESETEAR_COMPRA" });
    navigate("/cartelera");
  };

  const handleNextStep = () => {
    if (state.estadoCompra === "seleccionando_asientos") {
      dispatch({
        type: "SET_ESTADO_COMPRA",
        payload: "seleccionando_candybar",
      });
    } else if (state.estadoCompra === "seleccionando_candybar") {
      dispatch({ type: "SET_ESTADO_COMPRA", payload: "pago" });
    } else if (state.estadoCompra === "pago") {
      dispatch({ type: "SET_ESTADO_COMPRA", payload: "completado" });
    }
  };

  const handleVolver = () => {
    if (state.estadoCompra === "pago") {
      dispatch({
        type: "SET_ESTADO_COMPRA",
        payload: "seleccionando_candybar",
      });
    } else if (state.estadoCompra === "seleccionando_candybar") {
      dispatch({
        type: "SET_ESTADO_COMPRA",
        payload: "seleccionando_asientos",
      });
    } else if (state.estadoCompra === "seleccionando_asientos") {
      volverACartelera();
    }
  };

  if (!state.peliculaSeleccionada) {
    return <Navigate to="/cartelera" replace />;
  }
  if (!usuario) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const hasSnacks = state.candyBarSeleccionado.length > 0;

  // Completion view
  if (state.estadoCompra === "completado") {
    return (
      <div className="flex flex-col w-full relative overflow-hidden select-none bg-surface-container-lowest text-on-surface h-full">
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[85vw] max-w-[1100px] h-[580px] bg-gradient-to-b from-primary/15 via-secondary/5 to-transparent blur-[110px] rounded-full opacity-70"></div>
        </div>

        <div className="max-w-6xl mx-auto flex flex-col gap-space-xl relative z-10 w-full">
          <div className="flex flex-col md:flex-row items-center justify-between gap-space-md p-space-lg rounded-xl bg-surface-container/90 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-space-md">
              <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-tertiary-container via-tertiary to-primary shadow-[0_0_32px_rgba(86,229,169,0.35)]">
                <span
                  className="material-symbols-outlined text-on-tertiary text-[36px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
                <div className="absolute inset-0 rounded-2xl border-2 border-tertiary-fixed opacity-40 animate-ping"></div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-space-xs">
                  <span className="font-label-code text-label-code text-tertiary uppercase tracking-widest bg-tertiary/10 px-space-xs py-space-2xs rounded-full">
                    Proceso RF-04 Completado
                  </span>
                  <span className="font-label-code text-label-code text-on-surface-variant">
                    {state.ventaCreada?.metodoPagoElegido === "stripe"
                      ? "• Pago con tarjeta confirmado por Stripe"
                      : "• Pago en efectivo registrado"}
                  </span>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                  ¡Compra Confirmada con Éxito!
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Tu compra{" "}
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">
                    #{state.ventaCreada?.idVenta ?? "—"}
                  </span>{" "}
                  fue procesada correctamente.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-space-md w-full md:w-auto justify-end">
              <button
                onClick={volverACartelera}
                className="h-touch-target-kiosk px-space-lg rounded-xl bg-surface-container-highest hover:bg-error-container hover:text-on-error-container text-on-surface font-label-lg text-label-lg flex items-center gap-space-xs transition-all duration-300 shadow-md active:scale-95"
              >
                <span className="material-symbols-outlined text-[22px]">
                  logout
                </span>
                <span>Finalizar y Salir</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
            <div className="lg:col-span-7 flex flex-col gap-space-md">
              <div className="relative overflow-hidden rounded-xl bg-surface-container-low shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
                <div className="relative w-full h-44 overflow-hidden">
                  <img
                    src={
                      state.peliculaSeleccionada
                        ? (state.peliculaSeleccionada.posterUrl ??
                          posterFor(state.peliculaSeleccionada.idPelicula))
                        : undefined
                    }
                    alt=""
                    className="w-full h-full object-cover object-center filter brightness-50 contrast-125"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-surface-container-low/60 to-transparent"></div>
                  <div className="absolute top-space-md left-space-md right-space-md flex items-center justify-between">
                    <div className="flex items-center gap-space-xs bg-surface-container-lowest/80 backdrop-blur-md px-space-sm py-space-2xs rounded-full">
                      <span className="material-symbols-outlined text-primary text-[16px]">
                        stars
                      </span>
                      <span className="font-label-code text-label-code text-primary tracking-widest uppercase">
                        {sala?.tipo ?? "Entrada"} Pass
                      </span>
                    </div>
                  </div>
                  <div className="absolute bottom-space-md left-space-md right-space-md flex flex-col">
                    <span className="font-label-code text-label-code text-secondary tracking-widest uppercase">
                      LUMEN CINEMA •{" "}
                      {sala?.nombre?.toUpperCase() ?? "SALA POR CONFIRMAR"}
                    </span>
                    <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                      {state.peliculaSeleccionada?.titulo}
                    </h2>
                  </div>
                </div>

                <div className="p-space-lg flex flex-col gap-space-lg">
                  <div className="grid grid-cols-2 gap-space-sm p-space-md rounded-xl bg-surface-container">
                    <div className="flex flex-col">
                      <span className="font-label-code text-label-code text-on-surface-variant uppercase">
                        Fecha & Horario
                      </span>
                      <span className="font-headline-sm text-headline-sm text-on-surface mt-1">
                        {fechaFuncionLegible}
                      </span>
                      <span className="font-label-md text-label-md text-primary font-bold">
                        {horaFuncionLegible}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-label-code text-label-code text-on-surface-variant uppercase">
                        Auditorio
                      </span>
                      <span className="font-headline-sm text-headline-sm text-primary mt-1">
                        {sala?.nombre ?? "—"}
                      </span>
                      <span className="font-label-md text-label-md text-tertiary">
                        {sala?.tipo ?? "Estándar"}
                      </span>
                    </div>
                  </div>

                  <div className="p-space-lg rounded-xl bg-gradient-to-r from-surface-container-high via-surface-container to-surface-container-high shadow-inner flex flex-col sm:flex-row items-center justify-between gap-space-md">
                    <div className="flex items-center gap-space-md">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[32px]">
                          chair
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-code text-label-code text-on-surface-variant uppercase tracking-wider">
                          Butacas{sala?.tipo ? ` ${sala.tipo}` : ""}
                        </span>
                        <span className="font-display-hero-mobile text-display-hero-mobile text-primary font-bold tracking-tight">
                          {state.butacasSeleccionadas
                            .map((b) => b.id)
                            .join(", ")}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-space-xs">
                      <span className="font-label-code text-label-code text-tertiary uppercase font-bold bg-tertiary/10 px-space-sm py-space-2xs rounded-full">
                        {state.butacasSeleccionadas.length} Boleto
                        {state.butacasSeleccionadas.length === 1 ? "" : "s"}
                      </span>
                      <span className="font-headline-sm text-headline-sm text-on-surface">
                        Bs. {totalReal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-space-lg p-space-md rounded-xl bg-surface-container-lowest">
                    <div className="flex flex-col items-start gap-space-xs">
                      <div className="flex items-center gap-space-xs text-primary">
                        <span className="material-symbols-outlined text-[20px]">
                          confirmation_number
                        </span>
                        <span className="font-label-code text-label-code uppercase tracking-widest font-bold">
                          Código de compra
                        </span>
                      </div>
                      <span className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">
                        Mostralo en boletería o en {sala?.nombre ?? "la sala"}{" "}
                        si te lo piden.
                      </span>
                    </div>
                    <span className="font-display-hero-mobile text-display-hero-mobile text-primary font-bold tracking-tight">
                      #{state.ventaCreada?.idVenta ?? "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-space-lg">
              <div className="p-space-lg rounded-xl bg-surface-container shadow-xl flex flex-col gap-space-md">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-primary text-[24px]">
                    send_to_mobile
                  </span>
                  <h3 className="font-headline-md text-headline-md text-on-surface">
                    Opciones de Entrega
                  </h3>
                </div>
                <button
                  onClick={() => setMostrarBoletoModal(true)}
                  className="h-touch-target-kiosk w-full p-space-md rounded-xl bg-surface-container-high hover:bg-surface-container-highest transition-all flex items-center justify-between group active:scale-[0.99] text-left"
                >
                  <div className="flex items-center gap-space-md">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[26px]">
                        confirmation_number
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-lg text-label-lg text-on-surface font-bold">
                        Imprimir boleto / comprobante
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Emite tu entrada térmica y descárgala en PDF
                      </span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">
                    chevron_right
                  </span>
                </button>
              </div>

              <div className="w-full flex items-center justify-end p-space-md">
                <button
                  onClick={volverACartelera}
                  className="h-touch-target-min px-space-lg rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold hover:bg-primary-container transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-95 flex items-center gap-space-xs"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    home
                  </span>
                  <span>Volver al Inicio</span>
                </button>
              </div>
            </div>
          </div>

          <ModalBoletoImpresion
            abierto={mostrarBoletoModal}
            onCerrar={() => setMostrarBoletoModal(false)}
            datos={{
              idVenta: state.ventaCreada?.idVenta,
              pelicula: state.peliculaSeleccionada?.titulo ?? "Película",
              sala: sala?.nombre ?? "Sala 1",
              fecha: state.funcionSeleccionada?.fecha,
              hora: horaFuncionLegible,
              asientos: state.butacasSeleccionadas.map((b) => b.id),
              total: totalReal,
              subtotal: total,
              cliente: usuario?.nombre ?? "Cliente",
              metodoPago: state.ventaCreada?.metodoPagoElegido ?? "Tarjeta",
              fechaCompra: state.ventaCreada?.fechaHora,
              dulceria: state.candyBarSeleccionado.map((s) => ({
                nombre: s.nombre,
                cantidad: s.cantidad,
                precio: s.precio,
              })),
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden w-full bg-surface-container-lowest relative z-10">
      {/* Central Dynamic Workspace (Interactive Seating & Generative Sidebar) */}
      <div className="w-full px-space-lg py-space-xl max-w-[1720px] mx-auto flex-grow overflow-hidden flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg flex-grow overflow-hidden">
          {/* Left Column: Dynamic Step Content */}
          <div className="lg:col-span-8 bg-surface-container-low rounded-xl p-space-md md:p-space-lg flex flex-col relative overflow-y-auto shadow-2xl">
            {state.estadoCompra === "seleccionando_asientos" && (
              <SeleccionButacas />
            )}
            {state.estadoCompra === "seleccionando_candybar" && (
              <CandyBarSelection />
            )}
            {state.estadoCompra === "pago" && <SeccionPago />}
          </div>

          {/* Right Column: Always Sidebar Resumen */}
          <div className="lg:col-span-4 flex flex-col gap-space-md">
            <div className="bg-surface-container rounded-2xl p-space-lg flex flex-col gap-space-md shadow-xl relative overflow-hidden flex-grow">
              <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none"></div>
              <div className="flex items-center justify-between">
                <span className="font-label-code text-label-code text-primary uppercase tracking-widest">
                  Resumen de Compra
                </span>
                <span className="px-space-xs py-1 rounded-full bg-primary/10 text-primary font-label-code text-label-code font-bold">
                  Kiosco #04
                </span>
              </div>

              <div className="flex items-center gap-space-md pb-space-sm bg-surface-container-low p-space-sm rounded-xl">
                <img
                  src={
                    state.peliculaSeleccionada
                      ? (state.peliculaSeleccionada.posterUrl ??
                        posterFor(state.peliculaSeleccionada.idPelicula))
                      : undefined
                  }
                  alt=""
                  className="w-20 h-28 object-cover rounded-lg shadow-md shrink-0"
                />
                <div className="flex flex-col gap-space-2xs">
                  <span className="font-headline-sm text-headline-sm text-on-surface line-clamp-1">
                    {state.peliculaSeleccionada?.titulo}
                  </span>
                  <span className="font-body-sm text-body-sm text-primary font-bold">
                    {sala?.nombre ?? "Sala por confirmar"}
                    {sala?.tipo ? ` • ${sala.tipo}` : ""}
                  </span>
                  <div className="flex items-center gap-space-xs text-on-surface-variant font-label-code text-label-code">
                    <span className="material-symbols-outlined text-[16px] text-secondary">
                      calendar_today
                    </span>
                    <span>
                      {fechaFuncionLegible}, {horaFuncionLegible}
                    </span>
                  </div>
                  <div className="flex items-center gap-space-xs text-on-surface-variant font-label-code text-label-code">
                    <span className="material-symbols-outlined text-[16px] text-secondary">
                      surround_sound
                    </span>
                    <span>Audio Inmersivo Dolby Atmos</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-space-xs py-space-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      event_seat
                    </span>
                    <span className="font-label-md text-label-md text-on-surface">
                      Butacas VIP Recliner
                    </span>
                  </div>
                  <span className="font-label-md text-label-md text-primary font-bold px-space-xs py-0.5 rounded bg-primary/10">
                    {state.butacasSeleccionadas.length > 0
                      ? state.butacasSeleccionadas.map((b) => b.id).join(", ")
                      : "Ninguna"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm">
                  <span>
                    {state.butacasSeleccionadas.length}x Entradas IMAX
                  </span>
                  <span>{totalEntradas.toFixed(2)} Bs</span>
                </div>
              </div>

              {hasSnacks && (
                <div className="flex flex-col gap-space-xs">
                  <span className="font-label-code text-label-code uppercase tracking-wider text-on-surface-variant">
                    Confitería & Snacks
                  </span>
                  {state.candyBarSeleccionado.map((snack) => (
                    <div
                      key={snack.id}
                      className="rounded-lg bg-surface-container p-space-md flex flex-col gap-space-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-label-md text-label-md text-on-surface font-semibold">
                          {snack.cantidad}x {snack.nombre}
                        </span>
                        <span className="font-label-md text-label-md text-on-surface font-bold">
                          {(snack.precio * snack.cantidad).toFixed(2)} Bs
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-space-2xs">
                        <span className="font-label-code text-label-code text-tertiary">
                          Preparación en curso
                        </span>
                        <button
                          onClick={() =>
                            dispatch({
                              type: "ACTUALIZAR_CANDYBAR",
                              payload: { ...snack, cantidad: 0 },
                            })
                          }
                          className="text-error font-label-code text-label-code hover:underline flex items-center gap-0.5"
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            delete
                          </span>{" "}
                          Quitar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="relative py-2">
                <div className="w-full h-px bg-surface-variant"></div>
              </div>

              <div className="flex items-end justify-between mt-auto">
                <div className="flex flex-col">
                  <span className="font-label-code text-label-code text-on-surface-variant uppercase tracking-widest">
                    Importe Final
                  </span>
                  <span className="font-display-hero text-[38px] leading-none text-primary font-extrabold">
                    {totalReal.toFixed(2)}{" "}
                    <span className="text-headline-sm text-on-surface">Bs</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
