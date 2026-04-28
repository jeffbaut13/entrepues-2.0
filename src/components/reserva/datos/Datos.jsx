import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, MessageSquare, LoaderIcon } from "lucide-react";

import { Button } from "../../ui/Button";
import useCheckoutStore from "../../../store/checkoutStore";
export const Datos = ({ onContinue, back }) => {
  const { pagoEnProceso, error, datosContacto, updateDatosContacto } =
    useCheckoutStore();

  const [touched, setTouched] = useState({
    nombre: false,
    email: false,
    whatsapp: false,
  });

  const normalizePhoneDigits = (value = "") =>
    String(value || "")
      .replace(/\D/g, "")
      .slice(0, 10);

  const formatPhoneForInput = (value = "") => {
    const digits = normalizePhoneDigits(value);

    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;

    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
  };

  const nombreInput = String(datosContacto?.nombre || "").trim();
  const emailInput = String(datosContacto?.email || "").trim();
  const whatsappDigits = normalizePhoneDigits(datosContacto?.whatsapp || "");

  const nombreError =
    nombreInput.length === 0
      ? "Debes ingresar tu nombre."
      : nombreInput.length < 3
        ? "Tu nombre debe tener al menos 3 caracteres."
        : "";

  const emailLower = emailInput.toLowerCase();
  const emailDominioValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower);
  const emailError =
    emailInput.length === 0
      ? "Debes ingresar tu email."
      : !emailDominioValido
        ? "Ingresa un email valido con formato usuario@dominio.com"
        : "";

  const whatsappError =
    whatsappDigits.length === 0
      ? "Debes ingresar tu WhatsApp."
      : whatsappDigits.length < 10
        ? "Tu WhatsApp debe tener 10 digitos."
        : whatsappDigits.length > 10
          ? "Tu WhatsApp debe tener exactamente 10 digitos."
          : "";

  const nombreValido = !nombreError;
  const emailValido = !emailError;
  const whatsappValido = !whatsappError;

  const puedeContinuar =
    nombreValido && emailValido && whatsappValido && !pagoEnProceso;

  const getInputError = (field) => {
    if (field === "nombre") return nombreError;
    if (field === "email") return emailError;
    if (field === "whatsapp") return whatsappError;
    return "";
  };

  const hasFieldError = (field) =>
    touched[field] && Boolean(getInputError(field));

  const handleBlurField = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleContactoChange = (campo, valor) => {
    if (campo === "whatsapp") {
      const onlyNumbers = normalizePhoneDigits(valor);
      updateDatosContacto({ whatsapp: onlyNumbers });
      return;
    }

    updateDatosContacto({ [campo]: valor });
  };

  const variantsTitle = [
    "¡Eh Ave María, que gusto verlo!",
    "¡Buenas Sumercé!",
    "¡A la orden, bien pueda!",
    "¡Ve, llegó el que faltaba!",
    "¡Ajá, ¿y ese milagro?",
  ];

  const randomTitle = useMemo(() => {
    if (!variantsTitle.length) return "";
    const randomIndex = Math.floor(Math.random() * variantsTitle.length);
    return variantsTitle[randomIndex];
  }, []);

  return (
    <motion.div
      className="w-full rounded-2xl flex flex-col justify-between overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <h2
        type="button"
        className="w-full lg:px-6 px-4 flex flex-col justify-center items-center transition-all duration-200 py-4"
      >
        <span className={`w-14 h-1 rounded-full inline-block`} />
        <span className="font-bold font-parkson !text-5xl leading-12 inline-block">
          {randomTitle}
        </span>
      </h2>
      <p className="mb-4">Déjenos sus datos pa´ conocerlo</p>

      <div className="lg:px-6 px-4">
        <div className="w-full space-y-3">
          {error && (
            <motion.div
              className="w-full bg-red-50 border border-red-200 rounded-3xl p-4 flex items-start gap-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="min-w-0 text-red-700 !text-xs leading-5 whitespace-normal [overflow-wrap:anywhere]">
                {error}
              </p>
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
              onBlur={() => handleBlurField("nombre")}
              className={`w-full px-3 py-4 text-lg border rounded-3xl focus:outline-none focus:ring-2 focus:border-transparent ${
                hasFieldError("nombre")
                  ? "border-red-400 focus:ring-red-400"
                  : "border-gray-300 focus:ring-dark"
              }`}
              placeholder="Tu nombre completo"
            />
            {hasFieldError("nombre") && (
              <p className="mt-1 px-2 text-xs text-red-600 whitespace-normal break-words">
                {nombreError}
              </p>
            )}
          </div>

          <div className="py-1">
            <label className="hidden items-center space-x-2 font-medium mb-2">
              <span>Email</span>
            </label>
            <input
              type="email"
              value={datosContacto.email}
              onChange={(e) => handleContactoChange("email", e.target.value)}
              onBlur={() => handleBlurField("email")}
              className={`w-full px-3 py-4 text-lg border rounded-3xl focus:outline-none focus:ring-2 focus:border-transparent ${
                hasFieldError("email")
                  ? "border-red-400 focus:ring-red-400"
                  : "border-gray-300 focus:ring-dark"
              }`}
              placeholder="Email"
            />
            {hasFieldError("email") && (
              <p className="mt-1 px-2 text-xs text-red-600 whitespace-normal break-words">
                {emailError}
              </p>
            )}
          </div>

          <div className="py-1">
            <label className="hidden items-center space-x-2 font-medium mb-2">
              <span>WhatsApp</span>
            </label>
            <input
              type="tel"
              value={formatPhoneForInput(datosContacto.whatsapp)}
              onChange={(e) => handleContactoChange("whatsapp", e.target.value)}
              onBlur={() => handleBlurField("whatsapp")}
              className={`w-full px-3 py-4 text-lg border rounded-3xl focus:outline-none focus:ring-2 focus:border-transparent ${
                hasFieldError("whatsapp")
                  ? "border-red-400 focus:ring-red-400"
                  : "border-gray-300 focus:ring-dark"
              }`}
              placeholder="Celular"
              maxLength={12}
            />
            {hasFieldError("whatsapp") && (
              <p className="mt-1 px-2 text-xs text-red-600 whitespace-normal break-words">
                {whatsappError}
              </p>
            )}
          </div>

          <div className="py-1">
            <label className="hidden items-center space-x-2 font-medium mb-2">
              <MessageSquare className="w-4 h-4" />
              <span>Notas Especiales (Opcional)</span>
            </label>
            <textarea
              value={datosContacto.notas}
              onChange={(e) => handleContactoChange("notas", e.target.value)}
              className="w-full px-3 py-4 text-lg border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-dark focus:border-transparent h-24 resize-none"
              placeholder="Notas Especiales (Opcional), ej: Alergias, preferencias especiales, etc."
            />
          </div>
        </div>

        <div className="w-full flex justify-center items-center mt-6">
          {back}
          <Button
            onClick={() => {
              if (!puedeContinuar) {
                setTouched({ nombre: true, email: true, whatsapp: true });
                return;
              }
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
        </div>
        <p className="lg:!text-sm !text-base text-center">
          Al confirmar acepta los términos y condiciones
        </p>
      </div>
    </motion.div>
  );
};
