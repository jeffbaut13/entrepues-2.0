import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { CallToActions } from "../common/CallToAction/CallToActions";
import ArcScrollReveal from "../ScrollSvg";
import { Title } from "../ui/Title";
import { IconoSeparador } from "../ui/IconoSeparador";
import { ScrollDownLottie } from "../ui/ScrollDownLottie";

export const HomeComponent = () => {
  const [showScrollHint, setShowScrollHint] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollHint(window.scrollY < 7068);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <CallToActions />
      <ArcScrollReveal />
      <SectionTwo />
      <SectionThree />
      <Footer />
      <ScrollDownLottie
        color="#FFFFFF"
        size={60}
        showScrollHint={showScrollHint}
        className="!bottom-38"
      />
      
    </>
  );
};

const SectionTwo = () => {
  return (
    <>
      <section
        className="hide-logo-section h-screen w-full bg-cover bg-center"
        style={{ backgroundImage: "url('/imagenes/backgroundTwo.webp')" }}
      >
        <div className="w-1/2 h-full flex justify-center items-center">
          <motion.div
            className="max-w-lg text-center"
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
              <Title headContent={"La casa"} content={"Del sabor Colombiano"} />
            </motion.div>
            <IconoSeparador />
            <motion.p
              className="text-center text-2xl "
              variants={{
                hidden: { opacity: 0, y: 18 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              En un país donde muchos hablan de comida típica, nosotros la{" "}
              <br className="hidden lg:block" />
              hacemos como es, respetando las preparaciones, los tiempos y{" "}
              <br className="hidden lg:block" /> los sabores como manda la
              tradición. Cocinamos con tiempo y{" "}
              <br className="hidden lg:block" />
              con cariño, para que cuando te sientes a la mesa sientas que
              <br className="hidden lg:block" />
              estás en casa, pero con el cuidado, la calidad y el detalle que
              <br className="hidden lg:block" /> merece un buen restaurante.
            </motion.p>
          </motion.div>
        </div>
        <div className="w-1/2"></div>
      </section>
    </>
  );
};
const SectionThree = () => {
  const imagenes = [
    {
      url: 0,
      title: "La bandeja paisa",
      content: "Más rica del país",
    },
    {
      url: 0,
      title: "El sanchocho",
      content: "Más rico del país",
    },
    {
      url: 0,
      title: "El ajiaco",
      content: "Más rico del país",
    },
  ];
  return (
    <>
      <section
        className="hide-logo-section h-screen w-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/imagenes/background_texture.webp')" }}
      >
        <div className="w-full h-full flex flex-col justify-center gap-4 items-center">
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
              className="text-8xl font-parkson pt-16"
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              LOS FAVORITOS DE LA CASA
            </motion.h2>
            <motion.p
              className="text-2xl my-6"
              variants={{
                hidden: { opacity: 0, y: 18 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              De esos que uno no olvida y siempre vuelve a pedir.
            </motion.p>
          </motion.div>
          <motion.div
            className="flex-1 w-full flex justify-between relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.15, ease: "easeOut" },
              },
            }}
          >
            <picture className="absolute -top-8 left-0 w-full h-25 z-10">
              <img
                className="size-full inline-block"
                src="/imagenes/divisor.webp"
                alt=""
              />
            </picture>
            {imagenes.map((item, i) => (
              <motion.div
                key={i}
                style={{
                  backgroundImage: `url(/imagenes/section-four/la-cocina-más-rica-del-país-${
                    i + 1
                  }.webp)`,
                }}
                className="bg-cover bg-center bg-no-repeat w-full h-full flex justify-center items-end pb-8 relative"
                variants={{
                  hidden: { opacity: 0, y: 24, scale: 0.98 },
                  visible: { opacity: 1, y: 0, scale: 1 },
                }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="bg-gradient-to-t from-black/60 pointer-events-none absolute top-0 left-0 size-full" />
                <h4 className="max-w-xl flex flex-col font-parkson text-secondary text-center z-10 relative">
                  <span className="flex justify-center items-center gap-4">
                    <span className="flex-1 h-px rounded-full bg-secondary" />
                    <span className="w-fit !text-4xl">{item.title}</span>
                    <span className="flex-1 h-px rounded-full bg-secondary" />
                  </span>
                  <span className="!text-7xl !leading-14">{item.content}</span>
                </h4>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
};
const Footer = () => {
  return (
    <>
      <footer
        className="hide-logo-section h-screen w-full bg-cover bg-center"
        style={{ backgroundImage: "url('/imagenes/background_texture.webp')" }}
      >
        <div className="size-full flex justify-center items-center">
          <motion.div
            className="max-w-2xl text-center space-y-14"
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
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 18 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              CHÍA, CUNDINAMARCA, 1987
            </motion.p>
            <motion.h2
              className="text-8xl font-parkson"
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              Nuestra Inspiración
            </motion.h2>
            <motion.picture
              className="h-20 w-auto inline-block"
              variants={{
                hidden: { opacity: 0, scale: 0.85 },
                visible: { opacity: 1, scale: 1 },
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <img
                className="size-full object-contain inline-block"
                src="/imagenes/vectorOne.svg"
                alt="vector decorativo"
              />
            </motion.picture>
            <motion.p
              className="text-2xl"
              variants={{
                hidden: { opacity: 0, y: 18 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              Entrepués nace del orgullo por lo nuestro y por la cocina
              colombiana hecha <br className="hidden lg:block" /> como debe ser.
              De esas recetas que pasan de generación en generación,{" "}
              <br className="hidden lg:block" />
              que se preparan con tiempo, con manos sabias y con la familia
              alrededor. <br className="hidden lg:block" />
              Queríamos que los sabores tradicionales del país tuvieran una casa
              donde <br className="hidden lg:block" />
              se respetaran sin cambios ni atajos. Aquí cada receta tiene
              historia, cada <br className="hidden lg:block" />
              ingrediente tiene origen y cada visita se siente como volver a
              casa.
            </motion.p>
          </motion.div>
        </div>
        <div className="w-1/2"></div>
      </footer>
    </>
  );
};
