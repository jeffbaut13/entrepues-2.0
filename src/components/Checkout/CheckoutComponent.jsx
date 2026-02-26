import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CreditCard,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  LoaderIcon,
} from "lucide-react";

import { Button } from "../ui/Button";
import useCheckoutStore from "../../store/checkoutStore";
import useReservaStore from "../../store/reservaStore";

export const CheckoutComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mostrarExito, setMostrarExito] = useState(false);

  const [activeCollapse, setActiveCollapse] = useState(1);

  // Determinar el estado basado en la URL
  const isSuccessPage = location.pathname.includes("/success");
  const isCancelPage = location.pathname.includes("/cancel");
  const { limpiarDatosCheckout, resetReserva } = useReservaStore();

  const {
    datosReserva,
    datosContacto,
    metodoPago,
    montoTotal,
    impuestos,
    montoFinal,
    pagoEnProceso,
    pagoCompletado,
    error,
    transaccion,
    cargarDatosReserva,
    updateDatosContacto,
    setMetodoPago,
    iniciarPago,
    clearError,
    resetCheckout,
  } = useCheckoutStore();

  // Cargar datos al montar el componente
  useEffect(() => {
    // Si es página de success o cancel, no cargar datos nuevos
    if (isSuccessPage || isCancelPage) {
      return;
    }

    const resultado = cargarDatosReserva();
    if (!resultado.ok) {
      // Si no hay datos, redirigir al inicio
      navigate("/reservar");
    }
  }, [isSuccessPage, isCancelPage]);

  // Manejar pago completado
  useEffect(() => {
    if (pagoCompletado || isSuccessPage) {
      setMostrarExito(true);
    }
  }, [pagoCompletado, isSuccessPage]);

  const handlePagar = async () => {
    clearError();
    const resultado = await iniciarPago();
    if (resultado.ok) {
      limpiarDatosCheckout();
      resetReserva();

      navigate("/checkout/success");
      return;
    }

    if (!resultado.ok) {
      console.error("Error al procesar pago:", resultado.error);
    }
  };

  const handleContactoChange = (campo, valor) => {
    if (campo === "whatsapp") {
      const onlyNumbers = String(valor).replace(/\D/g, "").slice(0, 10);
      updateDatosContacto({ whatsapp: onlyNumbers });
      return;
    }

    updateDatosContacto({ [campo]: valor });
  };

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return "";
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString("es-CO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatearHora = (hora, minuto) => {
    if (!hora || !minuto) return "";
    const hour24 = parseInt(hora);
    let hour12 = hour24;
    let period = "AM";

    if (hour24 >= 12) {
      period = "PM";
      if (hour24 > 12) {
        hour12 = hour24 - 12;
      }
    }
    if (hour24 === 0) {
      hour12 = 12;
    }

    return `${String(hour12).padStart(2, "0")}:${minuto} ${period}`;
  };

  // Si no hay datos de reserva y no es página especial, mostrar cargando
  if (!datosReserva && !isSuccessPage && !isCancelPage) {
    return (
      <div className="size-full flex items-center justify-center">
        <div className="text-center text-white">
          <LoaderIcon className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Cargando datos de la reserva...</p>
        </div>
      </div>
    );
  }

  // Página de cancelación
  if (isCancelPage) {
    return (
      <motion.div
        className="h-dvh bg-gradient-to-br  flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
          initial={{ scale: 0.9, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.2 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          </motion.div>

          <h1 className="text-2xl font-bold mb-4">Pago Cancelado</h1>

          <p className=" mb-6">
            El proceso de pago fue cancelado. No se realizó ningún cargo. Puedes
            intentar nuevamente cuando desees.
          </p>

          <div className="space-y-3">
            <Button
              onClick={() => navigate("/checkout")}
              className="w-full"
              variant="primary"
            >
              Intentar de Nuevo
            </Button>

            <Button
              onClick={() => navigate("/")}
              variant="secondary"
              className="w-full"
            >
              Volver al Inicio
            </Button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // Página de éxito
  if (mostrarExito) {
    return (
      <motion.div
        className="size-full bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
          initial={{ scale: 0.9, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.2 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          </motion.div>

          <h1 className="text-2xl font-bold mb-4">¡Reserva Confirmada!</h1>

          <p className=" mb-6">
            Tu reserva ha sido procesada exitosamente. Recibirás un email de
            confirmación pronto.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm ">Número de referencia:</p>
            <p className="font-mono font-bold text-lg">
              {transaccion?.referencia}
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => navigate("/")}
              className="w-full"
              variant="primary"
            >
              Volver al Inicio
            </Button>

            <Button
              onClick={resetCheckout}
              variant="secondary"
              className="w-full"
            >
              Nueva Reserva
            </Button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="size-full flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Main Content */}
      <main className="w-full max-w-md mx-auto pt-12">
        <motion.div
          className="flex flex-col"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            className="bg-white/20 text-dark rounded-t-2xl flex flex-col justify-between overflow-hidden"
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.25 }}
          >
            <button
              type="button"
              className={`w-full text-left ${
                activeCollapse === 1 ? "bg-dark text-white" : ""
              } px-6 py-4 transition-all duration-200`}
              onClick={() => setActiveCollapse(0)}
            >
              <h2 className="font-parkson">
                <span className="!text-3xl">Resumen de tu</span>
                <br />
                <span className="!text-6xl !leading-10">Reserva</span>
              </h2>

              <span
                className={`w-14 h-1 rounded-full ${
                  activeCollapse === 1 ? "bg-white" : ""
                } inline-block `}
              />
            </button>

            <motion.div
              initial={false}
              animate={
                activeCollapse === 0
                  ? { opacity: 1, height: "auto" }
                  : { opacity: 0, height: 0 }
              }
              transition={{
                height: { duration: 0.28, ease: "easeInOut" },
                opacity: { duration: 0.2, ease: "easeOut" },
              }}
              className="overflow-hidden px-6"
            >
              <div className="w-full">
                <div className="space-y-4 mb-6">
                  <div className="flex items-center">
                    <div>
                      <p>
                        {formatearFecha(datosReserva.reservaData?.selectedDate)}
                      </p>
                      <p>
                        {formatearHora(
                          datosReserva.reservaData?.hour,
                          datosReserva.reservaData?.minute
                        )}
                      </p>
                      <p>
                        {datosReserva.reservaData?.adults} adulto(s)
                        {datosReserva.reservaData?.children > 0 &&
                          `, ${datosReserva.reservaData.children} niño(s)`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-bold mb-3">Platos Seleccionados</h3>
                  <div className="bg-dark/5 rounded-lg p-4 max-h-48 overflow-y-auto">
                    {datosReserva.platosSeleccionados?.map(
                      (asistente, index) => (
                        <div key={index} className="mb-3 last:mb-0">
                          <p className="font-medium mb-2">{asistente.nombre}</p>
                          {asistente.platos?.map((plato, platoIndex) => (
                            <div
                              key={platoIndex}
                              className="[&>span]:!text-base flex justify-between items-center py-1"
                            >
                              <span>
                                {plato.cantidad}x {plato.nombre}
                              </span>
                              <span className="font-bold">
                                ${plato.precio * plato.cantidad}
                              </span>
                            </div>
                          ))}
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="py-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium">
                      ${montoTotal?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-dark/20">
                    <span>IVA (19%)</span>
                    <span className="font-medium">
                      ${impuestos?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2">
                    <span>Total</span>
                    <span>${montoFinal?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className={`bg-white text-dark rounded-2xl flex flex-col justify-between overflow-hidden`}
            initial={{ x: 30, opacity: 0, y: 0 }}
            animate={{ x: 0, opacity: 1, y: activeCollapse === 1 ? -12 : 0 }}
            transition={{ duration: 0.25 }}
          >
            <button
              type="button"
              className="w-full px-6 flex flex-col justify-center items-center transition-all duration-200 py-4"
              onClick={() => setActiveCollapse(1)}
            >
              <span
                className={`w-14 h-1 rounded-full ${
                  activeCollapse === 0 ? "bg-dark" : ""
                } inline-block`}
              />
              <h2 className="font-bold font-parkson !text-6xl leading-12 inline-block">
                Contacto
              </h2>
            </button>

            <motion.div
              initial={false}
              animate={
                activeCollapse === 1
                  ? { opacity: 1, height: "auto" }
                  : { opacity: 0, height: 0 }
              }
              transition={{
                height: { duration: 0.28, ease: "easeInOut" },
                opacity: { duration: 0.2, ease: "easeOut" },
              }}
              className="overflow-hidden px-6"
            >
              <div className="w-full space-y-3">
                {error && (
                  <motion.div
                    className="bg-red-50 border border-red-200 rounded-3xl p-4 flex items-center space-x-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-red-700 !text-xs">{error}</p>
                  </motion.div>
                )}

                <div className="py-1">
                  <label className="hidden items-center font-medium">
                    <span>Nombre Completo</span>
                  </label>
                  <input
                    type="text"
                    value={datosContacto.nombre}
                    onChange={(e) =>
                      handleContactoChange("nombre", e.target.value)
                    }
                    className="w-full px-3 py-4 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-dark focus:border-transparent"
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div className="py-1">
                  <label className="hidden items-center space-x-2  font-medium mb-2">
                    <span>Email</span>
                  </label>
                  <input
                    type="email"
                    value={datosContacto.email}
                    onChange={(e) =>
                      handleContactoChange("email", e.target.value)
                    }
                    className="w-full px-3 py-4 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-dark focus:border-transparent"
                    placeholder="tu@email.com"
                  />
                </div>

                <div className="py-1">
                  <label className="hidden items-center space-x-2  font-medium mb-2">
                    <span>WhatsApp</span>
                  </label>
                  <input
                    type="tel"
                    value={datosContacto.whatsapp}
                    onChange={(e) =>
                      handleContactoChange("whatsapp", e.target.value)
                    }
                    className="w-full px-3 py-4 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-dark focus:border-transparent"
                    placeholder="+57 123 456 7890"
                    maxLength={10}
                  />
                </div>

                <div className="py-1">
                  <label className="hidden items-center space-x-2  font-medium mb-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Notas Especiales (Opcional)</span>
                  </label>
                  <textarea
                    value={datosContacto.notas}
                    onChange={(e) =>
                      handleContactoChange("notas", e.target.value)
                    }
                    className="w-full px-3 py-4 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-dark focus:border-transparent h-24 resize-none"
                    placeholder="Notas Especiales (Opcional), ej: Alergias, preferencias especiales, etc."
                  />
                </div>
              </div>

              <div className="w-full space-y-2 my-6">
                <Button
                  onClick={handlePagar}
                  disabled={pagoEnProceso}
                  type="button-dark"
                  width="full"
                  customClass="disabled:opacity-50 disabled:cursor-not-allowed py-3"
                  title={
                    <>
                      {pagoEnProceso ? (
                        <div className="flex items-center justify-center space-x-2">
                          <LoaderIcon className="w-5 h-5 animate-spin" />
                          <span>Procesando Pago...</span>
                        </div>
                      ) : (
                        `Pagar $${montoFinal?.toLocaleString()}`
                      )}
                    </>
                  }
                ></Button>

                <p className="!text-sm text-center">
                  Al hacer clic en pagar aceptas nuestros términos y
                  condiciones.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </main>
    </motion.div>
  );
};
