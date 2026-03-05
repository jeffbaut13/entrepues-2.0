import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";
import useCheckoutStore from "../../store/checkoutStore";

export const CheckoutSuccesComponent = ({ onFinalizar }) => {
  const navigate = useNavigate();
  const { obtenerReservaGuardada, resetCheckout } = useCheckoutStore();

  const reserva = useMemo(
    () => obtenerReservaGuardada(),
    [obtenerReservaGuardada]
  );

  useEffect(() => {
    if (!reserva) {
      if (typeof onFinalizar === "function") {
        onFinalizar();
        return;
      }
    }
  }, [reserva, navigate, onFinalizar]);

  const handleFinalizar = () => {
    resetCheckout();
    if (typeof onFinalizar === "function") {
      onFinalizar();
      return;
    }
  };

  const numeroReserva = reserva?.["numero-de-reserva"] || "----";

  if (!reserva) return null;

  return (
    <div className="size-full mx-auto flex justify-center items-center">
      <div className="p-12 md:max-w-4xl bg-white/20 rounded-lg">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 22, stiffness: 260 }}
          className="text-center bg-[#faf7f1] rounded-lg p-6"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="p-8"
          >
            <h2 className="font-parkson mb-12">
              <span className="!text-5xl">Gracias por tu</span> <br />
              <span className="!text-[9rem] leading-20">reserva</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="space-y-2"
          >
            <p>Te enviamos los detalles al correo</p>
            <p>
              N° de reserva: <strong>{numeroReserva}</strong>
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-18 flex justify-center flex-col items-center gap-10 mx-auto"
          >
            <Button
              onClick={handleFinalizar}
              title="Finalizar"
              type="button-dark"
              customClass="px-16"
              fontSize="2xl"
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
