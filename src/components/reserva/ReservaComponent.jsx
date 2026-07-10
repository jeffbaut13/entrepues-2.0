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
    "pet family": "pet-family",
    petFamily: "pet-family",
  };

  return aliases[normalized] || normalized;
};

export const ReservaComponent = ({
  stepinvert,
  region,
  onRegionChange,
  onReservaSinMenuCheckout,
}) => {
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
    <SliderVertical
      stepinvert={stepinvert}
      onRegionChange={onRegionChange}
      onReservaSinMenuCheckout={onReservaSinMenuCheckout}
    />
  );
};
