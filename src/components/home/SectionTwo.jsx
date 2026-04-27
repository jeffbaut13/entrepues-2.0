import { motion } from "framer-motion";
import { Title } from "../ui/Title";
import { IconoSeparador } from "../ui/IconoSeparador";
import { Button } from "../ui/Button";
import { Logo } from "../ui/Logo";
import { id } from "date-fns/locale";

const data_a_la_cocina = {
  title: "A la cocina",
  content: [
    {
      id: 1,
      title: "Doña basilia",
      description: "Mejor Arepa de huevo desde 1960",
      image: "/imagenes/audiovisual/dona-basilia.webp",
      image_mobile: "/imagenes/audiovisual/dona-basilia.webp",
      video: "/video/historia.mp4",
    },
    {
      id: 2,
      title: "Doña basilia",
      description: "Mejor Arepa de huevo desde 1960",
      image: "/imagenes/audiovisual/dona-basilia.webp",
      image_mobile: "/imagenes/audiovisual/dona-basilia.webp",
      video: "/video/historia.mp4",
    },
    {
      id: 3,
      title: "Doña basilia",
      description: "Mejor Arepa de huevo desde 1960",
      image: "/imagenes/audiovisual/dona-basilia.webp",
      image_mobile: "/imagenes/audiovisual/dona-basilia.webp",
      video: "/video/historia.mp4",
    },
    {
      id: 4,
      title: "Doña basilia",
      description: "Mejor Arepa de huevo desde 1960",
      image: "/imagenes/audiovisual/dona-basilia.webp",
      image_mobile: "/imagenes/audiovisual/dona-basilia.webp",
      video: "/video/historia.mp4",
    },
  ],
};

export const SectionTwo = ({ isMobile, onOpenHistoriaVideoPopup }) => {
  const { title, content } = data_a_la_cocina;

  return (
    <>
      <section
        className="h-dvh w-full bg-cover md:bg-center bg-top flex flex-col items-center justify-around px-34"
        style={{
          backgroundImage: `url('/imagenes/backgroundTwo${isMobile ? "M" : ""}.webp')`,
        }}
      >
        <div />
        <div className="w-full flex md:items-center items-end justify-between">
          <div className="md:w-1/2 w-full md:h-full h-1/2 flex md:justify-start md:items-center items-end">
            <motion.div
              className="flex justify-center items-center flex-col gap-6"
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
                className="flex items-center justify-center flex-col"
              >
                <Logo color="white" customClass="w-60!" />
                <h2 className="text-4xl md:text-7xl font-parkson text-secondary text-center mt-8 mb-18 flex items-center gap-4">
                  <span className="w-2 h-2 rounded-full bg-secondary inline-block" />
                  <span>A la cocina</span>
                  <span className="w-2 h-2 rounded-full bg-secondary inline-block" />
                </h2>
              </motion.div>

              <Button
                type="button-primary"
                fontSize="2xl"
                title={
                  <>
                    Reproducir
                    <i className="w-8 h-8 flex justify-center items-center p-2 pl-2.5 border border-secondary rounded-full">
                      <img
                        src="/iconos/play.svg"
                        alt="play icon"
                        className="size-full inline-block object-contain"
                      />
                    </i>
                  </>
                }
                onClick={(event) => {
                  event.preventDefault();
                  onOpenHistoriaVideoPopup?.();
                }}
                aria-label="Ver historia"
              />
            </motion.div>
          </div>
          {!isMobile && <div className="w-full md:w-1/2 h-1/2 md:h-full"></div>}
        </div>
        <div className="w-full flex justify-between items-center gap-6">
          {content.map((item) => (
            <motion.div
              key={item.id}
              className="relative w-103 h-61 overflow-hidden rounded-2xl inline-block"
            >
              {/* Aquí puedes agregar el contenido adicional que quieras mostrar */}
              <div className="bg-black size-full absolute top-0 left-0 opacity-40 z-1" />
              <img
                src={isMobile ? item.image_mobile : item.image}
                alt={item.title}
                className="object-cover size-full absolute top-0 left-0 z-0"
              />
              <div className="absolute bottom-0 left-0 p-6 z-10 text-secondary">
                <h2 className="font-parkson text-7xl">{item.title}</h2>
                <p>{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
};
