import { useNavigate } from "react-router-dom";
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

export const Header = ({ loading, logo }) => {
  const { isHome, isDark, isLight, isBg } = useRouteMode();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isLight) {
      document.documentElement.classList.add("not_scroll");
      document.body.classList.add("not_scroll");
    }

    return () => {
      document.documentElement.classList.remove("not_scroll");
      document.body.classList.remove("not_scroll");
    };
  }, [isLight]);

  const isSectionTwoVisible = useObserverVisibility(".hide-logo-section");
  const { loadingComplete } = useLoaderContext();

  // Calcular delay basado en si el loader ha completado
  const getAnimationDelay = () => {
    return loadingComplete ? 1 : 2;
  };

  const headerRender = (isSectionTwoVisible, isMobile) => {
    if (isHome) {
      return (
        <HeaderHome
          isSectionTwoVisible={isSectionTwoVisible}
          isMobile={isMobile}
        />
      );
    }

    if (isDark || isBg) {
      return <HeaderTheme darkTheme={true} logo={logo} isMobile={isMobile} />;
    }
    if (isLight) {
      return <HeaderTheme darkTheme={false} logo={logo} isMobile={isMobile} />;
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && (
          <motion.header
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: getAnimationDelay() }}
            className={`w-full ${
              isBg ? "bg-secondary" : ""
            } h-auto fixed z-1001 top-0 left-0 text-secondary flex flex-col items-center justify-between`}
          >
            {(isHome || isLight) && (
              <div className="bg-gradient-to-t to-black/65 w-full h-62 absolute top-0 left-0 z-0 pointer-events-none" />
            )}
            <div className="mx-auto max-w-7xl w-full md:px-0 md:h-32 max-lg:mt-6 grid grid-cols-3 items-center gap-4 place-items-center relative z-10">
              {headerRender(isSectionTwoVisible, isMobile)}
            </div>
          </motion.header>
        )}
      </AnimatePresence>
    </>
  );
};

const HeaderHome = ({ isSectionTwoVisible, isMobile }) => {
  return (
    <>
      <div />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        className="py-8"
      >
        <Logo color={"white"} size={`${isMobile ? "md" : "lg"}`} />
      </motion.div>
      <div />
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
          customClass={`max-lg:!px-2 max-lg:ml-4 !backdrop-blur-none !bg-transparent !border-none  ${
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
      <AnimatePresence mode="wait">
        {logo ? (
          <motion.div
            key={"logo"}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          >
            <Logo
              color={darkTheme ? "dark" : "white"}
              size={`${isMobile ? "sm" : "lg"}`}
            />
          </motion.div>
        ) : (
          <div />
        )}
      </AnimatePresence>
      <div />
    </>
  );
};
