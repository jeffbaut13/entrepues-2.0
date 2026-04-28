import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { WhatsappShareButton } from "react-share";
import { Button } from "../ui/Button";
import useCheckoutStore from "../../store/checkoutStore";
import { X } from "lucide-react";
import { formatRegionLabel } from "../../data/puntos";

const capitalizeSentence = (value = "") => {
  const text = String(value || "").trim();
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const formatMesaPhrase = (adultos = 0, ninos = 0, mascotas = 0) => {
  const totalPersonas = Number(adultos || 0) + Number(ninos || 0);
  const totalMascotas = Number(mascotas || 0);

  if (totalPersonas <= 0 && totalMascotas <= 0) {
    return "ustedes";
  }

  const personasTexto = totalPersonas === 1 ? "1" : `${totalPersonas}`;

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

  const detallesReserva = reserva?.detalles || {};
  const asistentesReserva = reserva?.asistentes || {};
  const resumenAsistentes = asistentesReserva?.resumen || {};
  const contactoReserva = reserva?.contacto || {};

  const numeroReserva = detallesReserva?.numeroReserva || "----";
  const nombreReserva = capitalizeSentence(contactoReserva?.nombre || "");
  /* const shareUrl =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "https://restauranteentrepues.com"; */
  const shareUrl ="https://restauranteentrepues.com";
  const fechaReserva = capitalizeSentence(detallesReserva?.fecha || "");
  const horaReserva = detallesReserva?.hora || "";
  const regionReserva = formatRegionLabel(detallesReserva?.region || "general");
  const mesaReservaTexto = formatMesaPhrase(
    resumenAsistentes?.adultos,
    resumenAsistentes?.ninos,
    resumenAsistentes?.mascotas,
  );
  const mensajeWhatsApp = [
    `¡Eh Ave María, que gusto verlo!`,
    "Lo invitaron a una reserva en EntrePues y ya",
    "está todo listo.",
    " ",
    "Le dejo todos los detalles:",
    `📅 ${fechaReserva}`,
    `⏰ ${horaReserva}`,
    `📍 ${regionReserva}`,
    `🍽️ Mesa para ${mesaReservaTexto}`,
    `🔖 #${numeroReserva}`,
    " ",
    "Qué emoción tenerlos por acá. ¡Los esperamos!",
    " ",
    " ",
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
            <h2 className="font-parkson !text-6xl">¡Listo {nombreReserva}!</h2>
            <h2 className="font-parkson !text-3xl">
              Su reserva está confirmada
            </h2>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="space-y-2"
          >
            <p className="text-2xl border border-dark/40 rounded-full px-4 py-2 inline-block">
              N°: <strong>{numeroReserva}</strong>
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="space-y-2"
          >
            <p>
              Sus platos estarán listos <br />5 minutos después de su llegada.
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="flex flex-col justify-center items-center gap-6"
          >
            <p>
              Comparta los detalles de la reserva <br />y nos vemos en
              EntrePues.
            </p>
            <Button
              type="button-secondary"
              title={
                <WhatsappShareButton
                  url={shareUrl}
                  title={mensajeWhatsApp}
                  separator=""
                  className="rounded-full"
                >
                  <div className="flex items-center gap-3 rounded-full px-4 py-2 transition-all duration-300 hover:opacity-60">
                    <i className="w-6">
                      <img
                        src="/iconos/whatsapp.svg"
                        alt="compartir reserva por WhatsApp"
                      />
                    </i>{" "}
                    Compartir
                  </div>
                </WhatsappShareButton>
              }
              fontSize="lg"
              customClass="bg-green-400 px-4"
            />
          </motion.div>

          {/* Boton de compartir whatsapp */}

          <Button
            onClick={handleFinalizar}
            title="Finalizar"
            Icon={X}
            width="ajustado"
            type="just-icon"
            customClass="absolute top-2 right-2"
            fontSize="2xl"
          />
        </motion.div>
      </div>
    </div>
  );
};
