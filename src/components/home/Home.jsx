import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import {
  CallToActions,
} from "../common/CallToAction/CallToActions";
import ArcScrollReveal from "../ScrollSvg";
import { Title } from "../ui/Title";
import { IconoSeparador } from "../ui/IconoSeparador";
import { ScrollDownLottie } from "../ui/ScrollDownLottie";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useOutletContext } from "react-router-dom";
import { Button } from "../ui/Button";
import { SiteFooter } from "../footer/SiteFooter";

export const HomeComponent = () => {
  const [showScrollHint, setShowScrollHint] = useState(false);
  const isMobile = useIsMobile();
  const { onOpenReservePopup } = useOutletContext();

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
        <SectionTwo isMobile={isMobile} />
        <SectionThree isMobile={isMobile} />
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

const SectionTwo = ({ isMobile }) => {
  return (
    <>
      <section
        className="h-dvh w-full bg-cover bg-center md:py-0 py-24"
        style={{
          backgroundImage: `url('/imagenes/backgroundTwo${isMobile ? "M" : ""}.webp')`,
        }}
      >
        <div className="md:w-1/2 w-full md:h-full h-1/2 flex justify-center items-center">
          <motion.div
            className="text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.18, ease: "easeOut" },
              },
            }}
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.85 },
                visible: { opacity: 1, scale: 1 },
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Title
                headingLevel="h1"
                theme="light"
                headContent={"Nuestra"}
                content={"Historia"}
              />
            </motion.div>
            <IconoSeparador theme="light" />
            <motion.p
              className="text-center text-secondary text-lg"
              variants={{
                hidden: { opacity: 0, y: 18 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              Mijito vea, desde el 95 este Entre Pués abrió sus puertas, así
              bien <br className="hidden lg:block" />
              sencillito, pa’ que la gente viniera a comer como en la casa. <br className="hidden lg:block" />
              Todo en fogón de carbón, como se ha hecho toda la{" "}
              <br className="hidden lg:block" />
              vida, con ese saborcito que no se consigue en cualquier parte.
              <br className="hidden lg:block" />
              Aquí hemos ido juntando lo mejor de cada rincón de Colombia,{" "}
              <br className="hidden lg:block" />
              pero sin perder lo nuestro, lo bien paisa, lo de antes.{" "}
              <br className="hidden lg:block" />Y vea, lo más bonito de todo, es
              que aquí hemos visto crecer las <br className="hidden lg:block" />
              familias. Los que venían chiquitos, ahora vuelven con sus hijos, y{" "}
              <br className="hidden lg:block" />
              eso sí que le alegra a uno el corazón, mijo.
            </motion.p>
          </motion.div>
        </div>
        <div className="w-full md:w-1/2 h-1/2 md:h-full"></div>
      </section>
    </>
  );
};
const SectionThree = ({ isMobile }) => {
  return (
    <>
      <section className="h-dvh w-full">
        <div className="w-full h-full flex flex-col justify-between items-center relative">
          <motion.div
            className="max-w-full text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.18, ease: "easeOut" },
              },
            }}
          >
            <motion.h2
              className="md:text-8xl text-6xl font-parkson pt-16 text-secondary"
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              EL FAVORITO DE LA SEMANA
            </motion.h2>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            className="h-[80dvh] w-full bg-cover bg-top text-secondary"
            style={{
              backgroundImage: `url('/imagenes/section_three${isMobile ? "" : ""}.webp')`,
            }}
            viewport={{ once: true, amount: 0.35 }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.15, ease: "easeOut" },
              },
            }}
          >
            <div className="relative z-20 pb-24 size-fit flex flex-col items-center justify-end gap-2 text-center mx-auto h-full">
              <h2 className="font-parkson text-4xl">
                LA BANDEJA PAISA DE DOÑA SEGUNDA
              </h2>
              <h2 className="text-xl mb-6">Desde 1960</h2>
              <a
                href="/receta-semanal"
                target="_blank"
                rel="noopener noreferrer"
                className="tracking-widest font-parkson text-2xl bg-dark/40 backdrop-blur-md hover:bg-black text-secondary border border-secondary/40 hover:border-black px-6 rounded-full py-1.5 pb-2 transition-all ease-in-out duration-300"
              >
                ver historia
              </a>
            </div>
          </motion.div>
          <div className="overlay z-10" />
        </div>
      </section>
    </>
  );
};

