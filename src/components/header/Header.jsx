import { useNavigate, useOutletContext } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, Home } from "lucide-react";

import { useRouteMode } from "../../hooks/RouteMode";
import { useObserverVisibility } from "../../hooks/useObserverVisibility";

import { useLoaderContext } from "../../context/LoaderContext";
import { Button } from "../ui/Button";
import { Logo } from "../ui/Logo";
import { useHeaderChangeStore } from "../../store/headerChangeStore";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useEffect } from "react";

export const Header = ({
  loading,
  logo,
  fullwidth = false,
  onOpenReservePopup,
}) => {
  const { isHome, isDark, isLight, isBg, isLightScroll } = useRouteMode();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isLight) {
      document.documentElement.classList.add("not_scroll");
      document.body.classList.add("not_scroll");
    }
    if (isLightScroll) {
      document.documentElement.classList.add("scroll");
      document.body.classList.add("scroll");
    }

    return () => {
      document.documentElement.classList.remove("not_scroll");
      document.body.classList.remove("not_scroll");
      document.documentElement.classList.remove("scroll");
      document.body.classList.remove("scroll");
    };
  }, [isLight, isLightScroll]);

  const isSectionTwoVisible = useObserverVisibility(".hide-logo-section");

  const headerRender = (isSectionTwoVisible, isMobile) => {
    if (isHome) {
      return (
        <HeaderHome
          isSectionTwoVisible={isSectionTwoVisible}
          isMobile={isMobile}
          onOpenReservePopup={onOpenReservePopup}
        />
      );
    }

    if (isDark || isBg) {
      return <HeaderTheme darkTheme={true} logo={logo} isMobile={isMobile} />;
    }
    if (isLight || isLightScroll) {
      return <HeaderTheme darkTheme={false} logo={logo} isMobile={isMobile} />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.header
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`w-full ${
            isBg ? "bg-secondary" : ""
          } h-auto fixed z-1001 top-0 left-0 text-secondary flex flex-col items-center justify-between`}
        >
          {(isHome || isLight || isLightScroll) && (
            <div className="bg-gradient-to-t to-black/65 w-full h-62 absolute top-0 left-0 z-0 pointer-events-none" />
          )}
          <div
            className={`md:py-8 py-2 mx-auto ${fullwidth ? "px-6" : "max-w-7xl md:px-0"} w-full md:h-32 max-lg:mt-2 grid md:grid-cols-3 grid-cols-2 items-center gap-4 place-items-center relative z-10 `}
          >
            {headerRender(isSectionTwoVisible, isMobile)}
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  );
};

const HeaderHome = ({ isSectionTwoVisible, isMobile, onOpenReservePopup }) => {
  return (
    <>
      {!isMobile && <div />}

      {isSectionTwoVisible ? (
        <div />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-md:justify-self-start"
        >
          <Logo color={"white"} size={isMobile ? "xs" : "md"} />
        </motion.div>
      )}
      <Button
        width={"min"}
        type="enlace"
        fontSize={isMobile ? "xl" : "3xl"}
        href={"/carta"}
        title="Menú"
        customClass={"justify-self-end"}
        motionProps={{
          initial: { y: 100 },
          animate: { y: 0 },
        }}
      />
    </>
  );
};

const HeaderTheme = ({ darkTheme, logo, isMobile }) => {
  const navigate = useNavigate();

  return (
    <>
      <motion.div
        className={`w-fit inline-flex md:gap-4 gap-0 items-center justify-self-start ${
          darkTheme ? "text-dark" : "text-white"
        }`}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
      >
        <Button
          type="enlace"
          href={"/"}
          iconSize={`${isMobile ? "small" : "medium"}`}
          Icon={Home}
          customClass={`max-lg:!px-2 max-lg:ml-4 !backdrop-blur-none !bg-transparent !border-none ${
            darkTheme ? "!text-dark" : "!text-white"
          }`}
        />
        |
        <Button
          type="button-secondary"
          Icon={ChevronLeft}
          title="Volver"
          customClass={`${darkTheme ? "!text-dark" : "!text-white"}`}
          onClick={() => navigate(-1)}
        />
      </motion.div>
      <div />
      <AnimatePresence mode="wait">
        <motion.div
          key={"logo"}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="justify-self-end px-4"
        >
          <Logo color={darkTheme ? "dark" : "white"} size={"sm"} />
        </motion.div>
      </AnimatePresence>
    </>
  );
};
