import { useEffect } from "react";

import SliderVertical from "./slider/SliderVertical";

import useReservaStore from "../../store/reservaStore";

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
  onPagoSuccess,
  registerConfirmar,
}) => {
  // Estados derivados del store

  /* zustand */

  const { setCurrentStep, seleccionarZona } = useReservaStore();

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
      onPagoSuccess={onPagoSuccess}
      registerConfirmar={registerConfirmar}
    />
  );
};
