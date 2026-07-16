import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Home, Menu } from "lucide-react";

import { useRouteMode } from "../../hooks/RouteMode";
import { useObserverVisibility } from "../../hooks/useObserverVisibility";

import { Button } from "../ui/Button";
import { Logo } from "../ui/Logo";

import { useMenuBurgerStore } from "../../store/menuBurgerStore";
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
          isBg={isBg}
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
        <>
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
          {!isMobile && !isLight && <AnclasBotones />}
        </>
      )}
    </AnimatePresence>
  );
};

const HeaderHome = ({ isSectionTwoVisible, isMobile, onOpenReservePopup }) => {
  const openMenuBurger = useMenuBurgerStore((s) => s.open);
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
      <button type="button" className="max-lg:justify-self-end" onClick={openMenuBurger} aria-label="Abrir menú">
        <Menu />
      </button>
    </>
  );
};

const HeaderTheme = ({ darkTheme, logo, isMobile }) => {
  const navigate = useNavigate();

  return (
    <>
      <Button
        type="button-secondary"
        Icon={ChevronLeft}
        title="Volver"
        customClass={`${darkTheme ? "!text-dark" : "!text-white"} min-h-12 translate-y-full`}
        onClick={() => navigate(-1)}
      />

      <motion.div
        key={"logo"}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
      >
        <Logo color={darkTheme ? "dark" : "white"} size={"sm"} />
      </motion.div>

      <div />
    </>
  );
};

const AnclasBotones = () => {
  const { pathname, hash } = useLocation();
  const currentHash = hash || (pathname === "/" ? "#s1" : "");

  const MENU_LINKS = [
    { label: "inicio", href: "/#s1", Icon: House },
    { label: "Recorrido", href: "/#recorrido", Icon: Mouse },
    { label: "Plato de la Semana", href: "/#menu", Icon: Rice },
    { label: "EntrePues a la Cocina", href: "/#streaming", Icon: Play },
  ];
  
  const navigate = useNavigate();
  const handleLinkClick = (href) => {
    navigate(href);
  };

  const isActive = (href) => {
    const linkHash = href.includes("#") ? `#${href.split("#")[1]}` : "";
    return currentHash === linkHash;
  };

  return (
    <div className="fixed z-2999 flex flex-col top-1/2 -translate-y-1/2 left-[max(0px,calc((100vw-1280px)/2))]">
      <nav className="flex flex-col gap-6">
        {MENU_LINKS.map((link) => {
          const active = isActive(link.href);
          return (
            <Button
              key={link.label}
              title={
                <span className={`w-14 h-12 shadow-glow backdrop-blur-4xl rounded-full px-4 py-0 flex justify-between items-center gap-3 transition-all ease-in-out duration-300 ${active ? "bg-secondary [&_.icon-svg]:stroke-brown [&_.rice]:fill-brown" : "group-hover:bg-secondary"}`}>
                  <link.Icon />
                </span>
              }
              type="enlace"
              width="full"
              onClick={() => handleLinkClick(link.href)}
              fontSize="base"
              customClass="min-w-0! w-full! bg-transparent! shadow-none! backdrop-blur-none!"
            />
          );
        })}
      </nav>
    </div>
  );
};

const House = () => {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={style.svg}
    >
      <path
        opacity="0.34"
        d="M12 18V15"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.0693 2.81985L3.13929 8.36985C2.35929 8.98985 1.85929 10.2998 2.02929 11.2798L3.35929 19.2398C3.59929 20.6598 4.95929 21.8098 6.39929 21.8098H17.5993C19.0293 21.8098 20.3993 20.6498 20.6393 19.2398L21.9693 11.2798C22.1293 10.2998 21.6293 8.98985 20.8593 8.36985L13.9293 2.82985C12.8593 1.96985 11.1293 1.96985 10.0693 2.81985Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const Mouse = () => {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={style.svg}
    >
      <path
        d="M12 22C16.13 22 19.5 18.63 19.5 14.5V9.5C19.5 5.37 16.13 2 12 2C7.87 2 4.5 5.37 4.5 9.5V14.5C4.5 18.63 7.87 22 12 22Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g opacity="0.4">
        <path
          d="M12 11C11.17 11 10.5 10.33 10.5 9.5V7.5C10.5 6.67 11.17 6 12 6C12.82 6 13.5 6.67 13.5 7.5V9.5C13.5 10.33 12.82 11 12 11Z"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 6V2"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};

export const Play = () => {
  return (
    <svg
      viewBox="0 0 24 24"
      className={style.svg}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.9688 22C17.4916 22 21.9688 17.5228 21.9688 12C21.9688 6.47715 17.4916 2 11.9688 2C6.4459 2 1.96875 6.47715 1.96875 12C1.96875 17.5228 6.4459 22 11.9688 22Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        opacity="0.4"
        d="M8.73828 12.2306V10.5606C8.73828 8.48061 10.2083 7.63061 12.0083 8.67061L13.4583 9.51061L14.9083 10.3506C16.7083 11.3906 16.7083 13.0906 14.9083 14.1306L13.4583 14.9706L12.0083 15.8106C10.2083 16.8506 8.73828 16.0006 8.73828 13.9206V12.2306Z"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
const Rice = () => {
  return (
    <svg viewBox="0 0 23 21" xmlns="http://www.w3.org/2000/svg">
      <path
        className="rice fill-secondary group-hover:fill-brown transition-all ease-in-out duration-300"
        d="M13.3146 0.446482C13.4829 0.0679685 13.9273 -0.103582 14.3059 0.0646458C14.684 0.232975 14.8538 0.676532 14.6857 1.05488L12.7473 5.41718C12.7255 5.81192 12.4004 6.12519 12.0002 6.12519C11.7722 6.12513 11.5968 6.07237 11.4894 6.0373C11.4284 6.01735 11.4157 6.01192 11.3889 6.0041C11.3809 6.0018 11.3756 6.00072 11.3732 6.00019C11.3391 6.00309 11.1984 6.03051 10.8635 6.2209C10.3447 6.51564 9.74049 6.53839 9.21796 6.35468C8.67455 6.16376 8.31139 6.20322 8.02656 6.32734C7.71127 6.46491 7.39492 6.74733 7.03632 7.21113C6.56339 7.82282 5.81675 8.01619 5.18476 7.95722C4.87342 7.92826 4.66117 7.9869 4.50996 8.06953C4.35359 8.15505 4.21597 8.29197 4.09882 8.48359C3.87637 8.8475 3.77201 9.33972 3.7541 9.75019H12.2541C12.254 9.62852 12.2796 9.50507 12.342 9.39082L17.1125 0.666208C17.3112 0.303166 17.7658 0.169081 18.1291 0.36738C18.4926 0.566054 18.6266 1.02248 18.4279 1.38593L16.3137 5.25215C16.5379 5.24416 16.7642 5.25127 16.9836 5.2834C17.3856 5.34236 17.8365 5.48998 18.1916 5.83027C18.4012 6.03125 18.5484 6.27535 18.6398 6.55C18.8121 6.57565 18.9885 6.61049 19.1623 6.66133C19.5564 6.77666 19.9932 6.97913 20.3303 7.33222C20.6881 7.70741 20.8928 8.21278 20.8537 8.81758C20.8343 9.11712 20.7559 9.42778 20.6232 9.75019H20.8869C21.7776 9.75019 22.5001 10.4728 22.5002 11.3635C22.5 15.5275 19.4649 18.9804 15.4865 19.6359C15.4225 19.9852 15.118 20.2502 14.7502 20.2502H9.25019C8.88254 20.25 8.57677 19.9852 8.51289 19.6359C4.53517 18.9798 1.50037 15.527 1.50019 11.3635C1.50027 10.7861 1.80476 10.2803 2.26093 9.99531C2.25465 9.95624 2.25019 9.91604 2.25019 9.87519C2.25023 9.27221 2.38358 8.4145 2.81953 7.70136C3.04308 7.33572 3.35811 6.98984 3.79121 6.75312C4.22948 6.51374 4.74532 6.4101 5.32441 6.46406C5.5902 6.4888 5.77108 6.39587 5.8498 6.29414C6.26772 5.75357 6.77112 5.23842 7.42695 4.95234C8.11313 4.65321 8.87441 4.64387 9.71601 4.93965C9.87019 4.99373 10.0173 4.97578 10.1223 4.91621C10.6613 4.60977 11.0908 4.46969 11.51 4.50801L13.3146 0.446482ZM3.06953 11.259C3.02903 11.2761 3.00029 11.3168 3.00019 11.3635C3.0004 15.1667 6.08376 18.2498 9.88691 18.2502H14.1135L14.468 18.2414C18.1066 18.0567 21 15.0479 21.0002 11.3635C21.0001 11.3012 20.9492 11.2502 20.8869 11.2502H3.11347L3.06953 11.259ZM-61.4998 6.50019C-61.0857 6.50019 -60.75 6.8361 -60.7498 7.25019C-60.7498 7.66441 -61.0856 8.00019 -61.4998 8.00019C-62.0434 8.00035 -62.6251 8.29006 -63.1766 8.75898C-63.7181 9.21954 -64.1421 9.77908 -64.3563 10.1359C-64.5694 10.4909 -65.0304 10.6067 -65.3856 10.3937C-65.7404 10.1806 -65.8562 9.71949 -65.6434 9.36445C-65.3575 8.88806 -64.8313 8.19725 -64.1482 7.6164C-63.475 7.04391 -62.5559 6.50035 -61.4998 6.50019ZM16.7668 6.76679C16.3626 6.70763 15.8339 6.788 15.4084 6.90937L13.8566 9.75019H18.9299C19.2461 9.25646 19.3434 8.92327 19.3566 8.7209C19.3684 8.53843 19.3166 8.44212 19.2453 8.36738C19.1532 8.271 18.9873 8.17278 18.7414 8.10078C18.5011 8.03052 18.2335 8.00019 18.0002 8.00019C17.5862 7.99997 17.2502 7.66424 17.2502 7.25019C17.2501 7.01964 17.1846 6.944 17.1525 6.91328C17.1011 6.86433 16.9885 6.79937 16.7668 6.76679Z"
      />
    </svg>
  );
};

const style = {
  svg: "icon-svg transition-all ease-in-out duration-300 fill-none stroke-secondary group-hover:stroke-brown size-full object-contain",
};
