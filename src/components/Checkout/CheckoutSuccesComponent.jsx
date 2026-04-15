import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { WhatsappShareButton } from "react-share";
import { Button } from "../ui/Button";
import useCheckoutStore from "../../store/checkoutStore";
import { X } from "lucide-react";

const capitalizeSentence = (value = "") => {
  const text = String(value || "").trim();
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const formatRegionName = (value = "") => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  if (!normalized) return "Zona general";
  if (normalized === "zona-pet") return "Zona Pet";
  if (normalized === "general") return "Zona general";

  return normalized
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const formatMesaPhrase = (adultos = 0, ninos = 0, mascotas = 0) => {
  const totalPersonas = Number(adultos || 0) + Number(ninos || 0);
  const totalMascotas = Number(mascotas || 0);

  if (totalPersonas <= 0 && totalMascotas <= 0) {
    return "pa' ustedes";
  }

  const personasTexto = totalPersonas === 1 ? "pa' 1" : `pa' ${totalPersonas}`;

  if (totalMascotas <= 0) {
    return personasTexto;
  }

  if (totalMascotas === 1) {
    return `${personasTexto} y un peludito`;
  }

  return `${personasTexto} y ${totalMascotas} peluditos`;
};

export const CheckoutSuccesComponent = ({ onFinalizar }) => {
  const navigate = useNavigate();
  const { obtenerReservaGuardada, resetCheckout } = useCheckoutStore();

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

  const handleFinalizar = () => {
    resetCheckout();
    if (typeof onFinalizar === "function") {
      onFinalizar();
      return;
    }
  };

  const numeroReserva = reserva?.["numero-de-reserva"] || "----";
  const nombreReserva = reserva?.nombre || "";
  const shareUrl =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "https://restauranteentrepues.com";
  const fechaReserva = capitalizeSentence(reserva?.fecha || "");
  const horaReserva = reserva?.hora || "";
  const regionReserva = formatRegionName(reserva?.region || "general");
  const mesaReservaTexto = formatMesaPhrase(
    reserva?.adultos,
    reserva?.ninos,
    reserva?.mascotas,
  );
  const mensajeWhatsApp = [
    `¡Ea pues, ${nombreReserva || "parcero"}!`,
    "Tu reserva en EntrePues ya está lista pa´ servir.",
    "Mijo, tenga a la mano estos los detalles:",
    `📅 ${fechaReserva}`,
    `⏰ ${horaReserva}`,
    `📍 ${regionReserva}`,
    `🐾 Aquí está la mesa lista ${mesaReservaTexto}`,
    `📌 #${numeroReserva}`,
    "Qué bueno tenerlos por acá, ¡los esperamos!",
  ]
    .filter(Boolean)
    .join("\n");

  if (!reserva) return null;

  return (
    <div className="size-full mx-auto flex justify-center items-center">
      <div className="md:max-w-4xl size-full bg-secondary flex justify-center items-center">
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
            <h2 className="font-parkson !text-4xl">¡Listo {nombreReserva}!</h2>
            <h2 className="font-parkson !text-4xl">
              Tu reserva está confirmada
            </h2>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="space-y-2"
          >
            <p className="text-2xl">
              N° de reserva: <strong>{numeroReserva}</strong>
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="space-y-2"
          >
            <p>
              Tus platos estarán listos <br />5 minutos después de tu llegada.
            </p>
            <p>
              Los detalles de tu reserva <br />
              te llegarán al correo.
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="space-y-2"
          >
            <p>
              Compártela por WhatsApp <br />a tus acompañantes y nos vemos{" "}
              <br /> pronto en la mesa.
            </p>
            <div className="flex flex-col gap-2 items-center justify-center">
              <WhatsappShareButton
                url={shareUrl}
                title={mensajeWhatsApp}
                separator=""
                className="rounded-full "
              >
                <Button
                  type="button-secondary"
                  title={
                    <>
                      <i className="w-6">
                        <img
                          src="/iconos/whatsapp.svg"
                          alt="compartir reserva por WhatsApp"
                          className="w-full h-full object-contain"
                        />
                      </i>
                      Compartir
                    </>
                  }
                  fontSize="lg"
                  customClass="bg-green-400 px-4"
                />
              </WhatsappShareButton>
              <Button
                onClick={handleFinalizar}
                title="Finalizar"
                width="ajustado"
                type="button-dark"
                fontSize="2xl"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
