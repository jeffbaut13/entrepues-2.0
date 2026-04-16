import { useOutletContext } from "react-router-dom";
import { useIsMobile } from "../../hooks/useIsMobile";
import { RecetaLandingTemplate } from "./components/RecetaLandingTemplate";
import { getRecetaConfig } from "./data/recetas";
import { FloatingReservaButton } from "../common/FloatingReservaButton";
import { CallToActions } from "../common/CallToAction/CallToActions";

export const RecetaSemanalComponent = () => {
  const isMobile = useIsMobile();
  const receta = getRecetaConfig("bandejaPaisa");
  const { onOpenReservePopup, isReservePopupOpen } = useOutletContext();

  return (
    <>
      <RecetaLandingTemplate receta={receta} isMobile={isMobile} />

      <CallToActions onOpenReservePopup={onOpenReservePopup} />
    </>
  );
};
