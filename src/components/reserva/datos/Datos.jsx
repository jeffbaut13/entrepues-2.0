import { motion } from "framer-motion";
import { AlertCircle, MessageSquare, LoaderIcon } from "lucide-react";

import { Button } from "../../ui/Button";
import useCheckoutStore from "../../../store/checkoutStore";
export const Datos = ({ onContinue }) => {
  const { pagoEnProceso, error, datosContacto, updateDatosContacto } =
    useCheckoutStore();

  const nombreValido = String(datosContacto?.nombre || "").trim().length >= 3;
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    String(datosContacto?.email || "").trim(),
  );
  const whatsappValido = /^\d{10}$/.test(
    String(datosContacto?.whatsapp || "").replace(/\D/g, ""),
  );

  const puedeContinuar =
    nombreValido && emailValido && whatsappValido && !pagoEnProceso;

  const handleContactoChange = (campo, valor) => {
    if (campo === "whatsapp") {
      const onlyNumbers = String(valor).replace(/\D/g, "").slice(0, 10);
      updateDatosContacto({ whatsapp: onlyNumbers });
      return;
    }

    updateDatosContacto({ [campo]: valor });
  };

 
  
  return (
    <motion.div
      className="rounded-2xl flex flex-col justify-between overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <h2
        type="button"
        className="w-full px-6 flex flex-col justify-center items-center transition-all duration-200 py-4"
      >
        <span className={`w-14 h-1 rounded-full inline-block`} />
        <span className="font-bold font-parkson !text-6xl leading-12 inline-block mb-4">
          Queremos conocerte
        </span>
      </h2>

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
              onChange={(e) => handleContactoChange("nombre", e.target.value)}
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
              onChange={(e) => handleContactoChange("email", e.target.value)}
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
              onChange={(e) => handleContactoChange("whatsapp", e.target.value)}
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
              onChange={(e) => handleContactoChange("notas", e.target.value)}
              className="w-full px-3 py-4 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-dark focus:border-transparent h-24 resize-none"
              placeholder="Notas Especiales (Opcional), ej: Alergias, preferencias especiales, etc."
            />
          </div>
        </div>

        <div className="w-full space-y-2 my-6">
          <Button
            onClick={() => {
              if (!puedeContinuar) return;
              onContinue?.();
            }}
            disabled={!puedeContinuar}
            type="button-dark"
            width="full"
            fontSize="2xl"
            customClass=""
            title={
              <>
                {pagoEnProceso ? (
                  <div className="flex items-center justify-center space-x-2">
                    <LoaderIcon className="w-5 h-5 animate-spin" />
                    <span>Guardando datos...</span>
                  </div>
                ) : (
                  `Continuar`
                )}
              </>
            }
          />

          <p className="!text-sm text-center">
            Al confirmar aceptas los términos y condiciones.
          </p>
        </div>
      </div>
    </motion.div>
  );
};
