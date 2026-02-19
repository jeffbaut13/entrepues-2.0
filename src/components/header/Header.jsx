import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, Home } from "lucide-react";

import { useRouteMode } from "../../hooks/RouteMode";
import { useObserverVisibility } from "../../hooks/useObserverVisibility";

import { useLoaderContext } from "../../context/LoaderContext";
import { Button } from "../ui/Button";
import { Logo } from "../ui/Logo";

export const Header = ({ loading }) => {
  const navigate = useNavigate();
  const { isHome, isDark, isLight } = useRouteMode();

  const isSectionTwoVisible = useObserverVisibility(".hide-logo-section");
  const { loadingComplete } = useLoaderContext();

  // Calcular delay basado en si el loader ha completado
  const getAnimationDelay = () => {
    return loadingComplete ? 1 : 2;
  };

  const headerRender = (isSectionTwoVisible) => {
    if (isHome) {
      return <HeaderHome isSectionTwoVisible={isSectionTwoVisible} />;
    }

    if (isDark) {
      return <HeaderTheme darkTheme={true} />;
    }
    if (isLight) {
      return <HeaderTheme darkTheme={false} />;
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
            className={`w-full h-auto fixed z-1001 top-0 left-0 text-secondary flex flex-col items-center justify-between`}
          >
            <div className="mx-auto max-w-7xl w-full md:px-0 h-22 grid grid-cols-3 items-center gap-4 place-items-center">
              {headerRender(isSectionTwoVisible)}
            </div>
          </motion.header>
        )}
      </AnimatePresence>
    </>
  );
};

const HeaderHome = ({ isSectionTwoVisible }) => {
  return (
    <>
      <div />
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        className="py-8"
      >
        <Logo color={isSectionTwoVisible ? "dark" : "white"} size="lg" />
      </motion.div>
      <div />
    </>
  );
};

const HeaderTheme = ({ darkTheme }) => {
  const navigate = useNavigate();
  return (
    <>
      <motion.div
        className={`w-fit inline-flex gap-4 items-center justify-self-start ${
          darkTheme ? "text-dark" : "text-white"
        }`}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
      >
        <Button
          type="enlace"
          href={"/"}
          Icon={Home}
          customClass={`!bg-transparent !border-none ${
            darkTheme ? "!text-dark" : "!text-white  "
          }`}
        />
        |
        <Button
          type="button-secondary"
          Icon={ChevronLeft}
          title="Volver"
          customClass={`!bg-transparent !border-none ${
            darkTheme ? "!text-dark" : "!text-white "
          }`}
          onClick={() => navigate(-1)}
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
      >
        <Logo color={darkTheme ? "dark" : "white"} size="md" />
      </motion.div>
      <div />
    </>
  );
};
