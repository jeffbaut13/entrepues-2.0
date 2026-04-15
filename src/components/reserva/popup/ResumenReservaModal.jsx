import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";

import useCheckoutStore from "../../../store/checkoutStore";
import { Button } from "../../ui/Button";

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
  const hour24 = parseInt(hora, 10);
  let hour12 = hour24;
  let period = "AM";

  if (hour24 >= 12) {
    period = "PM";
    if (hour24 > 12) hour12 = hour24 - 12;
  }
  if (hour24 === 0) hour12 = 12;

  return `${String(hour12).padStart(2, "0")}:${minuto} ${period}`;
};

export const ResumenReservaModal = () => {
  const {
    showResumen,
    setShowResumen,
    datosReserva,
    montoTotal,
    impuestos,
    montoFinal,
    error: checkoutError,
  } = useCheckoutStore();

  const mesaAsignada =
    datosReserva?.reservaZonaData?.mesaAsignada ||
    datosReserva?.reservaData?.mesa ||
    null;

  return (
    <AnimatePresence>
      {showResumen && (
        <motion.div
          className="fixed max-lg:w-full inset-0 z-[20010] bg-black/70 backdrop-blur-2xl flex items-center justify-center lg:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowResumen(false)}
        >
          <motion.div
            className="w-full lg:max-w-md lg:max-h-[90vh] max-lg:h-full overflow-y-auto bg-white lg:rounded-2xl lg:shadow-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-dark text-white px-6 py-4 flex items-center justify-between">
              <h2 className="font-parkson">
                <span className="!text-3xl">Resumen de tu</span>
                <br />
                <span className="!text-6xl !leading-10">Reserva</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowResumen(false)}
                className="inline-flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 p-2 transition"
                aria-label="Cerrar resumen"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-4">
              {checkoutError && (
                <p className="text-red-600 !text-sm mb-4">{checkoutError}</p>
              )}

              <div className="space-y-4 mb-6">
                <div>
                  <p>{formatearFecha(datosReserva?.reservaData?.selectedDate)}</p>
                  <p>
                    {formatearHora(
                      datosReserva?.reservaData?.hour,
                      datosReserva?.reservaData?.minute,
                    )}
                  </p>
                  {datosReserva?.reservaZonaData?.selectedZoneName && (
                    <p className="font-bold mt-4">
                      Region: {datosReserva.reservaZonaData.selectedZoneName}
                    </p>
                  )}
                  {mesaAsignada && <p className="font-bold">Mesa: {mesaAsignada}</p>}
                  <p>
                    para {datosReserva?.reservaData?.adults || 0} adulto(s)
                    {Number(datosReserva?.reservaData?.children || 0) > 0
                      ? `, ${datosReserva.reservaData.children} nino(s)`
                      : ""}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-bold mb-3">Platos Seleccionados</h3>
                <div className="bg-dark/5 rounded-lg p-4 max-h-62 overflow-auto">
                  {(datosReserva?.platosSeleccionados || []).map(
                    (asistente, index) => (
                      <div key={index} className="mb-3 last:mb-0">
                        <p className="font-medium mb-2">
                          {asistente.asistente || `Asistente ${index + 1}`}
                        </p>
                        {(asistente.platos || []).map((plato, platoIndex) => (
                          <div
                            key={platoIndex}
                            className="[&>span]:!text-base flex justify-between items-center py-1"
                          >
                            <span>
                              {plato.cantidad}x {plato.nombre}
                            </span>
                            <span className="font-bold">
                              $
                              {(plato.precio * plato.cantidad).toLocaleString(
                                "es-CO",
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className="space-y-2 border-t border-dark/20 pt-4">
                <div className="flex justify-between">
                  <span className="font-light">Subtotal</span>
                  <span className="font-medium">
                    ${Number(montoTotal || 0).toLocaleString("es-CO")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>IVA (19%)</span>
                  <span className="font-medium">
                    ${Number(impuestos || 0).toLocaleString("es-CO")}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2">
                  <span>Total</span>
                  <span>${Number(montoFinal || 0).toLocaleString("es-CO")}</span>
                </div>
              </div>

              <div className="pt-6 flex justify-center">
                <Button
                  type="button-dark"
                  Icon={Check}
                  iconSize="small"
                  fontSize="2xl"
                  title="OK"
                  onClick={() => setShowResumen(false)}
                  className="px-6 py-2 rounded-full bg-dark text-white font-medium hover:opacity-90 transition"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
