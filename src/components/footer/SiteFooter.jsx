import { Mail, MapPin, Phone } from "lucide-react";
import { useIsMobile } from "../../hooks/useIsMobile";
import { RedesSociales } from "../common/CallToAction/CallToActions";
import { Logo } from "../ui/Logo";

export const SiteFooter = ({
  className = "",
  claimTitle = "LA CASA DEL SABOR COLOMBIANO",
  claimSubtitle = "Desde 1987",
}) => {
  const isMobile = useIsMobile();

  return (
    <footer
      className={`md:h-[80vh] h-dvh w-full bg-cover bg-center ${className} bg-secondary py-16`}
    >
      <div className="size-full flex flex-col justify-between items-center px-6">
        <Logo color="dark" size={isMobile ? "md" : "lg"} />

        <div className="w-fit space-y-2 text-center">
          <h2 className="md:text-xl text-lg">{claimTitle}</h2>
          <h2 className="md:text-xl text-lg mb-6">{claimSubtitle}</h2>
        </div>

        <div className="grid md:grid-cols-3 grid-cols-1 max-lg:grid-rows-3 text-dark  md:gap-24">
          <div className="flex flex-col md:items-start items-center justify-center gap-2 max-lg:row-start-3">
            <div className="flex items-center justify-center gap-1">
              <MapPin size={16} /> <p>Km. 9 Autopista Norte Via Tunja</p>
            </div>
            <div className="flex items-center justify-center gap-1">
              <Phone size={16} /> <p>300 - 214 - 19 - 78</p>
            </div>
            <div className="flex items-center justify-center gap-1">
              <Mail size={16} /> <p>servicio@restauranteentrepues.com</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-fit flex flex-col lg:items-start items-center justify-center">
              <h6 className="font-parkson text-3xl">Nuestros Horarios</h6>
              <p className="text-center">
                Lunes <br className="md:hidden" /> 10:00 a.m - 04:00 p.m.
              </p>
              <p className="text-center">
                Martes <br className="md:hidden" />
                09:00 a.m - 05:00 p.m.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:items-start items-center lg:justify-end">
            <p className="text-center">
              Miércoles y Jueves <br className="md:hidden" /> 08:00 a.m - 05:00
              p.m.
            </p>
            <p className="text-center">
              Viernes a Domingo <br className="md:hidden" /> 08:00 a.m - 06:00
              p.m.
            </p>
          </div>
        </div>

        <RedesSociales isSectionVisible={true} />
      </div>
    </footer>
  );
};
