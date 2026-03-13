import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  MessageSquare,
  LoaderIcon,
  X,
  BookCheck,
  ChevronLeft,
} from "lucide-react";

import { Button } from "../ui/Button";
import useCheckoutStore from "../../store/checkoutStore";
import useReservaStore from "../../store/reservaStore";

export const CheckoutComponent = ({
  reservaResultado = null,
  isSinMenuFlow = false,
  onBackToMenu,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const [activeCollapse, setActiveCollapse] = useState(1);
  const { limpiarDatosCheckout, resetReserva } = useReservaStore();

  const {
    datosReserva,
    datosContacto,
    montoTotal,
    impuestos,
    montoFinal,
    pagoEnProceso,
    error,
    cargarDatosReserva,
    cargarDatosReservaDesdeResultado,
    updateDatosContacto,
    iniciarPago,
    clearError,
  } = useCheckoutStore();

  // Cargar datos al montar el componente
  useEffect(() => {
    if (reservaResultado) {
      cargarDatosReservaDesdeResultado(reservaResultado);
      return;
    }

    const resultado = cargarDatosReserva();
    if (!resultado.ok) {
      navigate("/reservar");
    }
  }, [
    reservaResultado,
    cargarDatosReserva,
    cargarDatosReservaDesdeResultado,
    navigate,
  ]);

  const handlePagar = async () => {
    clearError();
    const resultado = await iniciarPago({ sinMenu: isSinMenuFlow });
    if (resultado.ok) {
      limpiarDatosCheckout();
      resetReserva();
      if (typeof onSuccess === "function") {
        onSuccess(resultado);
        return;
      }
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

  const hasSelectedDishes = Array.isArray(datosReserva?.platosSeleccionados)
    ? datosReserva.platosSeleccionados.some(
        (asistente) =>
          Array.isArray(asistente?.platos) && asistente.platos.length > 0,
      )
    : false;

  const regionSeleccionada =
    datosReserva?.reservaZonaData?.selectedZoneName ||
    datosReserva?.reservaData?.selectedZoneName ||
    null;

  if (!datosReserva) {
    return (
      <div className="size-full flex items-center justify-center">
        <div className="text-center text-white">
          <LoaderIcon className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Cargando datos de la reserva...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="size-full flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {typeof onBackToMenu === "function" && (
        <Button
          type="button-secondary"
          Icon={ChevronLeft}
          title="Volver"
          fontSize="xl"
          customClass="absolute left-2 top-2 z-10"
          onClick={onBackToMenu}
        />
      )}

      <main className="w-full max-w-md mx-auto pt-12 relative">
        <motion.div
          className="bg-[#faf6ef] text-dark rounded-2xl flex flex-col justify-between overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            className="w-full px-6 flex flex-col justify-center items-center transition-all duration-200 py-4"
            onClick={() => setActiveCollapse(1)}
          >
            <span
              className={`w-14 h-1 rounded-full ${
                activeCollapse === 1 ? "bg-dark" : ""
              } inline-block`}
            />
            <h2 className="font-bold font-parkson !text-6xl leading-12 inline-block">
              Tus datos
            </h2>
          </button>

          <div className="px-6">
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
                <label className="hidden items-center space-x-2 font-medium mb-2">
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
                <label className="hidden items-center space-x-2 font-medium mb-2">
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
                <label className="hidden items-center space-x-2 font-medium mb-2">
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
              <div className="w-full flex justify-center items-center">
                <button
                  onClick={() => setActiveCollapse(0)}
                  className="w-fit flex relative justify-center font-bold gap-2 mb-4 hover:opacity-70 transition-opacity duration-300"
                >
                  Ver resumen <BookCheck />
                </button>
              </div>

              <Button
                onClick={handlePagar}
                disabled={pagoEnProceso}
                type="button-dark"
                width="full"
                fontSize="2xl"
                
                title={
                  <>
                    {pagoEnProceso ? (
                      <div className="flex items-center justify-center space-x-2">
                        <LoaderIcon className="w-5 h-5 animate-spin" />
                        <span>Guardando reserva...</span>
                      </div>
                    ) : (
                      `Reservar`
                    )}
                  </>
                }
              />

              <p className="!text-sm text-center">
                Al confirmar aceptas los terminos y condiciones.
              </p>
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {activeCollapse === 0 && (
            <motion.div
              className="fixed inset-0 z-[120] bg-black/60 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="sticky top-0 bg-dark text-white px-6 py-4 flex items-center justify-between">
                  <h2 className="font-parkson">
                    <span className="!text-3xl">Resumen de tu</span>
                    <br />
                    <span className="!text-6xl !leading-10">Reserva</span>
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveCollapse(1)}
                    className="inline-flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 p-2 transition"
                    aria-label="Cerrar resumen"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="px-6 py-4">
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center">
                      <div>
                        <p>
                          {formatearFecha(
                            datosReserva.reservaData?.selectedDate,
                          )}
                        </p>
                        <p>
                          {formatearHora(
                            datosReserva.reservaData?.hour,
                            datosReserva.reservaData?.minute,
                          )}
                        </p>

                        {regionSeleccionada && (
                          <p className="font-bold mt-4">
                            Región:{" "}
                            {regionSeleccionada.charAt(0).toUpperCase() +
                              regionSeleccionada.slice(1)}
                          </p>
                        )}
                        <p>
                          {datosReserva.reservaData?.adults} adulto(s)
                          {datosReserva.reservaData?.children > 0 &&
                            `, ${datosReserva.reservaData.children} niño(s)`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {hasSelectedDishes && (
                    <div className="mb-6">
                      <h3 className="font-bold mb-3">Platos Seleccionados</h3>
                      <div className="bg-dark/5 rounded-lg p-4">
                        {datosReserva.platosSeleccionados?.map(
                          (asistente, index) => (
                            <div key={index} className="mb-3 last:mb-0">
                              <p className="font-medium mb-2">
                                {asistente.nombre}
                              </p>
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
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  <div className="py-4">
                    {isSinMenuFlow ? (
                      <p className="text-center font-medium text-dark/80">
                        Esta reserva no genera costo
                      </p>
                    ) : (
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
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  );
};
