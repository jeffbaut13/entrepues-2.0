import { motion } from "framer-motion";

import { Button } from "../ui/Button";

import { Title } from "../ui/Title";
import { IconoSeparador } from "../ui/IconoSeparador";
import { MediaDisplay } from "../ui/MediaDisplay";

/**
 * Modal del menú con integración de Firebase
 * Muestra categorías, subcategorías y productos en 5 columnas
 */
export const MenuComponent = () => {
  const content = [
    {
      type: "column",
      title: "La bandeja paisa",
      description: "100% rolo",
      videoSrc: "/video/menu/bandeja-paisa.mp4",
      imageSrc: "/imagenes/menu/bandeja-paisa.webp",
      width: "w-full",
      precio: "$63.900",
    },
    {
      type: "row",
      title: "El ajiaco santafereño",
      description: "más rico del país",
      videoSrc: "/video/menu/ajiaco.mp4",
      imageSrc: "/imagenes/menu/ajiaco.webp",
      width: "w-full",

      precio: "$47.900",
    },

    {
      type: "row",
      title: "La picada",
      description: "más rica del país",
      videoSrc: "",
      imageSrc: "/imagenes/menu/picada.webp",
      width: "w-full",
      precio: "desde $74.900",
      invert: true,
    },
    {
      type: "row",
      title: "Sancocho bifásico",
      description: "",
      videoSrc: "",
      imageSrc: "/imagenes/menu/sancocho.webp",
      width: "w-full",
      precio: "$47.900",
    },
  ];
  return (
    <>
      <>
        <div className="w-full bg-secondary flex justify-center items-center gap-12 flex-col">
          <div className="h-22" />
          <SectionOne />
          <div className="max-w-6xl flex justify-center items-center flex-wrap gap-12 pb-12">
            <SectionTwo />
            {content.map((section, index) => (
              <Sections key={index} content={section} invert={section.invert} />
            ))}
          </div>

          <div className="h-46 w-full flex justify-center items-center mb-14">
            <Button
              type="enlace"
              href={"/carta"}
              variant="button-dark"
              fontSize="2xl"
              customClass="px-8 bg-dark"
              title={"Ver la carta"}
            />
          </div>
        </div>
      </>
    </>
  );
};

const SectionOne = () => {
  return (
    <main className="size-full flex justify-center items-center relative">
      <div
        className="relative w-full lg:h-[46.9rem] h-96 bg-cover bg-no-repeat bg-center overflow-hidden flex items-center justify-center"
        style={{
          backgroundImage: "url('/imagenes/menu/background_menu.webp')",
        }}
      >
        <div className="size-full absolute top-0 left-0 bg-black/50 z-10" />
        <motion.div
          variants={{
            hidden: { opacity: 0, scale: 0.85 },
            visible: { opacity: 1, scale: 1 },
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full relative z-20 text-center scale-120"
        >
          <Title
            headContent={"La casa de la cocina"}
            content={"Más rica del país"}
            theme="light"
            headingLevel="h1"
          />
          <IconoSeparador theme="light" />
        </motion.div>
      </div>
    </main>
  );
};

const SectionTwo = () => {
  return <div />;
};

const Sections = ({ invert = false, content }) => {
  const direction = () => {
    switch (content.type) {
      case "row":
        return (
          <div
            className={`${content.width} h-auto bg-white flex ${
              invert ? "lg:flex-row-reverse flex-col" : "lg:flex-row flex-col"
            } items-center`}
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.85 },
                visible: { opacity: 1, scale: 1 },
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-full lg:w-1/2 relative z-20 text-center text-dark my-20"
            >
              <Textos
                title={content.title}
                parraf={content.description}
                size="md"
              />
              <p className="font-parkson !text-4xl">{content.precio}</p>
            </motion.div>

            {/* Ejemplo con otro video/imagen usando el componente reutilizable */}
            <div className="w-full lg:w-1/2">
              <MediaDisplay
                videoSrc={content.videoSrc}
                imageSrc={content.imageSrc}
                alt={content.title}
                className="w-full h-auto object-cover"
                autoPlay={true}
                muted={false}
                animated={true}
                animationVariants={{
                  hidden: { opacity: 0, x: 20 },
                  visible: { opacity: 1, x: 0 },
                }}
              />
            </div>
          </div>
        );
      case "column":
        return (
          <div
            className={`${content.width} h-full flex flex-col justify-between bg-white`}
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.85 },
                visible: { opacity: 1, scale: 1 },
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-full relative z-20 text-center text-dark my-20"
            >
              <Textos
                title={content.title}
                parraf={content.description !== "" ? content.description : null}
              />
              <p className="font-parkson !text-6xl">{content.precio}</p>
            </motion.div>

            {/* Usando el componente reutilizable MediaDisplay */}
            <div className="flex-1 overflow-hidden">
              <MediaDisplay
                videoSrc={content.videoSrc !== "" ? content.videoSrc : null}
                imageSrc={content.imageSrc !== "" ? content.imageSrc : null}
                alt={content.title}
                className="w-full h-full object-cover"
                autoPlay={true}
                controls={false}
                muted={true}
                loop={true}
                animated={true}
              />
            </div>
          </div>
        );
    }
  };

  return <>{direction()}</>;
};

const Textos = ({ title, parraf, size = "lg" }) => {
  const fontSize = () => {
    switch (size) {
      case "xs":
        return "lg:!text-4xl !text-2xl";
      case "md":
        return "lg:!text-6xl !text-4xl";
      case "lg":
        return "lg:!text-8xl !text-6xl";
      default:
        "";
    }
  };
  return (
    <>
      <h2 className={`font-parkson ${fontSize()}`}>{title}</h2>
      {parraf && <p>{parraf}</p>}
    </>
  );
};
