import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Timer, User } from "lucide-react";

import SliderVertical from "./slider/SliderVertical";
import HeaderPaso from "./HeaderPaso";
import { convertTo12Hour, getAmPm } from "./horaUtils";

import useReservaStore from "../../store/reservaStore";
import { useIsMobile } from "../../hooks/useIsMobile";

const normalizeRegionParam = (value = "") =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const resolveRegionName = (value = "") => {
  const normalized = normalizeRegionParam(value);

  const aliases = {
    pacifico: "pacífica",
    orinoquia: "orinoquía",
    amazonia: "amazonía",
    "zona pet": "zona-pet",
    zonapet: "zona-pet",
  };

  return aliases[normalized] || normalized;
};

export const ReservaComponent = ({ region, onReservaSinMenuCheckout }) => {
  // Estados derivados del store

  const isMobile = useIsMobile();
  /* zustand */

  const { currentStep, setCurrentStep, seleccionarZona } = useReservaStore();

  const regionFromUrl = region || null;

  useEffect(() => {
    if (regionFromUrl) return;

    try {
      const raw = localStorage.getItem("checkout:reserva:temp");
      if (!raw) return;

      const parsed = JSON.parse(raw);
      const debeAbrirMenu =
        parsed?.estado === "temporal" && parsed?.uiState?.showMenu === true;

      if (debeAbrirMenu) {
        setCurrentStep(3);
      }
    } catch (error) {
      console.error(
        "Error restaurando estado de menú desde checkout temp:",
        error,
      );
    }
  }, [regionFromUrl, setCurrentStep]);

  useEffect(() => {
    if (!regionFromUrl) return;

    const regionToSelect = resolveRegionName(regionFromUrl);
    if (!regionToSelect) return;

    seleccionarZona(regionToSelect);
  }, [regionFromUrl, seleccionarZona]);

  useEffect(() => {
    if (!regionFromUrl) return;
  }, [regionFromUrl]);

  return (
    <>
      <motion.div
        className="w-full h-full flex lg:flex-row flex-col max-lg:justify-center lg:items-stretch items-center bg-white/20 text-dark lg:rounded-2xl lg:gap-6 gap-3 lg:py-4 md:px-6 px-0 overflow-hidden relative"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <SliderVertical onReservaSinMenuCheckout={onReservaSinMenuCheckout} />
      </motion.div>
    </>
  );
};
