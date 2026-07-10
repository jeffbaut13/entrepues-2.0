import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, MessageSquare, LoaderIcon } from "lucide-react";

import useCheckoutStore from "../../../store/checkoutStore";
export const Datos = () => {
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

  const style = {
    input: `w-full px-6 py-4 text-lg border rounded-2xl bg-secondary text-dark focus:outline-none focus:ring-2 focus:border-transparent ${
      hasFieldError("nombre")
        ? "border-red-400 focus:ring-red-400"
        : "border-gray-300 focus:ring-dark"
    }`,
  };

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
      className="w-full flex flex-col overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <h2
        type="button"
        className="w-full  flex flex-col justify-center items-center transition-all duration-200"
      >
        <span className="font-bold font-parkson !text-5xl leading-12 inline-block">
          {randomTitle}
        </span>
      </h2>
      <p>Déjenos sus datos pa´ conocerlo</p>

      <div className="w-full">
        <input
          type="text"
          value={datosContacto.nombre}
          onChange={(e) => handleContactoChange("nombre", e.target.value)}
          onBlur={() => handleBlurField("nombre")}
          className={style.input}
          placeholder="Nombre completo"
        />
        {hasFieldError("nombre") && (
          <p className="mt-1 px-2 text-xs text-red-600 whitespace-normal break-words">
            {nombreError}
          </p>
        )}

        <input
          type="email"
          value={datosContacto.email}
          onChange={(e) => handleContactoChange("email", e.target.value)}
          onBlur={() => handleBlurField("email")}
          className={style.input}
          placeholder="Correo electrónico"
        />
        {hasFieldError("email") && (
          <p className="mt-1 px-2 text-xs text-red-600 whitespace-normal break-words">
            {emailError}
          </p>
        )}

        <input
          type="tel"
          value={formatPhoneForInput(datosContacto.whatsapp)}
          onChange={(e) => handleContactoChange("whatsapp", e.target.value)}
          onBlur={() => handleBlurField("whatsapp")}
          className={style.input}
          placeholder="Número de teléfono"
          maxLength={12}
        />
        {hasFieldError("whatsapp") && (
          <p className="mt-1 px-2 text-xs text-red-600 whitespace-normal break-words">
            {whatsappError}
          </p>
        )}

        <textarea
          value={datosContacto.notas}
          onChange={(e) => handleContactoChange("notas", e.target.value)}
          className={style.input}
          placeholder="¿Alguna sugerencia? Alergias, indicaciones especiales, etc..."
        />
      </div>

      <div className="w-full flex justify-center items-center mt-6">
        <p className="lg:!text-sm !text-base text-center">
          Al confirmar acepta los términos y condiciones
        </p>
      </div>
    </motion.div>
  );
};
