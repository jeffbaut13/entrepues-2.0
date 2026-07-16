import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import useCheckoutStore from "../../store/checkoutStore";
import { Logo } from "../ui/Logo";

const capitalizeSentence = (value = "") => {
  const text = String(value || "").trim();
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const CheckoutSuccesComponent = ({ onFinalizar }) => {
  const navigate = useNavigate();
  const { obtenerReservaGuardada } = useCheckoutStore();

  const reserva = useMemo(
    () => obtenerReservaGuardada(),
    [obtenerReservaGuardada],
  );

  useEffect(() => {
    if (!reserva) {
      if (typeof onFinalizar === "function") {
        onFinalizar();
        return;
      }
    }
  }, [reserva, navigate, onFinalizar]);

  const detallesReserva = reserva?.detalles || {};
  const asistentesReserva = reserva?.asistentes || {};
  const resumenAsistentes = asistentesReserva?.resumen || {};

  const numeroReserva = detallesReserva?.numeroReserva || "----";

  const fechaReserva = capitalizeSentence(detallesReserva?.fecha || "");
  const horaReserva = detallesReserva?.hora || "";

  if (!reserva) return null;

  return (
    <div className="size-full lg:min-w-280 sm:min-w-156 flex justify-center items-center">
      <div className="w-full flex justify-center items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 22, stiffness: 260 }}
          className="flex justify-evenly items-center flex-col size-full text-center rounded-lg"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Logo color={"white"} size={"md"} />
            <h2 className="font-parkson lg:!text-3xl text-5xl!">
              Reserva confirmada
              <br />
              N°: <strong>{numeroReserva}</strong>
            </h2>
            <p className="my-2">
              Sus platos estarán listos 5 minutos después de su llegada.
            </p>
          </motion.div>

          <div className="border border-secondary/60 rounded-3xl grid grid-cols-2 grid-rows-2 gap-2 p-6 my-2">
            <div className="justify-self-start text-start">
              Km. 9 Autopista Norte vía Tunja
            </div>
            <div className="justify-self-end text-end">
              {Number(resumenAsistentes?.adultos || 0) +
                Number(resumenAsistentes?.ninos || 0) +
                Number(resumenAsistentes?.mascotas || 0)}{" "}
              {Number(resumenAsistentes?.adultos || 0) +
                Number(resumenAsistentes?.ninos || 0) +
                Number(resumenAsistentes?.mascotas || 0) <
              2
                ? "Persona"
                : "Personas"}
            </div>
            <div className="justify-self-start text-start">{fechaReserva}</div>
            <div className="justify-self-end text-end">{horaReserva}</div>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="flex flex-col justify-center items-center gap-6 mt-6"
          >
            <p>
              Le informamos que el tiempo de espera es de 15 minutos. Los
              horarios de <br className="hidden lg:block" />
              cierre de cocina son los siguientes:
            </p>
            <div className="max-w-xl justify-center flex flex-wrap [&_div]:bg-amber-full/5 [&_div]:p-2 [&_div]:rounded-full [&_div]:min-w-42 gap-2">
              <div>Lunes - Martes 9:30 pm</div>
              <div>Miercoles 10 pm</div>
              <div>Jueves - Sábado 11 pm</div>
              <div>Domingo 9:30 pm</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
