import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { CallToActions } from "../common/CallToAction/CallToActions";
import ArcScrollReveal from "../ScrollSvg";
import { Title } from "../ui/Title";
import { IconoSeparador } from "../ui/IconoSeparador";
import { ScrollDownLottie } from "../ui/ScrollDownLottie";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useOutletContext } from "react-router-dom";
import { Button } from "../ui/Button";
import { SiteFooter } from "../footer/SiteFooter";
import { SectionTwo } from "./SectionTwo";
import { SectionThree } from "./SectionThree";

export const HomeComponent = () => {
  const [showScrollHint, setShowScrollHint] = useState(false);
  const isMobile = useIsMobile();
  const { onOpenReservePopup, onOpenHistoriaVideoPopup } = useOutletContext();

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollHint(window.scrollY < 1068);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <CallToActions onOpenReservePopup={onOpenReservePopup} />
      <ArcScrollReveal />
      <div className="hide-logo-section">
        <SectionTwo
          isMobile={isMobile}
          onOpenHistoriaVideoPopup={onOpenHistoriaVideoPopup}
        />

        {/* Aca va la transiciond e las imagenes: */}
        <SectionThree isMobile={isMobile} />

        {/* aca finaliza */}
        <SiteFooter />
      </div>
      <ScrollDownLottie
        color="#FFFFFF"
        size={isMobile ? 40 : 60}
        showScrollHint={showScrollHint}
        className={`${isMobile ? "!bottom-70" : "!bottom-38"}`}
      />
    </>
  );
};

 