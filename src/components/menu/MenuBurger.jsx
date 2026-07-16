import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMenuBurgerStore } from "../../store/menuBurgerStore";
import { Logo } from "../ui/Logo";
import { useScrollLock } from "../../hooks/useScrollLock";
import { Button } from "../ui/Button";

const MENU_LINKS = [
  { label: "Recorre EntrePues", href: "/descubrenos" },
  { label: "Plato de la Semana", href: "/#menu" },
  { label: "EntrePues a la Cocina", href: "/#streaming" },
  { label: "Menú", href: "/carta" },
];

const SOCIAL_LINKS = [
  {
    name: "Instagram",
    url: "https://www.instagram.com/restauranteentrepues",
    icon: "/iconos/Instagram.svg",
  },
  {
    name: "Youtube",
    url: "https://www.youtube.com/@restauranteentrepues",
    icon: "/iconos/Youtube.svg",
  },
  {
    name: "TikTok",
    url: "https://www.tiktok.com/@restauranteentrepues",
    icon: "/iconos/Tik-tok.svg",
  },
  {
    name: "Facebook",
    url: "https://www.facebook.com/restauranteentrepues",
    icon: "/iconos/Facebook.svg",
  },
];

export const MenuBurger = () => {
  const { isOpen, close } = useMenuBurgerStore();
  const navigate = useNavigate();

  useScrollLock(isOpen);

  const handleLinkClick = (href) => {
    close();
    navigate(href);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[30000] bg-black/40 backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="absolute right-0 top-0 h-full w-full lg:max-w-md bg-amber-opacity backdrop-blur-4xl shadow-glow overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full px-8 pb-6">
              {/* Header */}
              <div className="flex items-center justify-end py-6">
                <button
                  type="button"
                  onClick={close}
                  className="text-secondary hover:opacity-70 transition-opacity"
                  aria-label="Cerrar menú"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Navigation links */}
              <nav className="flex flex-col gap-6">
                {MENU_LINKS.map((link) => (
                  <Button
                    key={link.label}
                    title={
                      <span className="w-full flex justify-between items-center gap-3 transition-all ease-in-out duration-300">
                        <span>{link.label}</span>
                        <ChevronRight />
                      </span>
                    }
                    type="enlace"
                    onClick={() => handleLinkClick(link.href)}
                    fontSize="base"
                    customClass="w-full! bg-transparent! shadow-none! backdrop-blur-none!"
                  />
                ))}
              </nav>

              {/* Footer content */}
              <div className="flex-1 flex flex-col items-center justify-center gap-8 py-10">
                {/* Logo + tagline */}
                <div className="flex flex-col items-center gap-4">
                  <Logo color="white" size="sm" />
                  <div className="text-secondary text-center text-base leading-5">
                    <p>DESDE 1987</p>
                    <p>LA CASA DEL SABOR TRADICIONAL COLOMBIANO</p>
                  </div>
                </div>

                {/* Map */}
                <div className="w-full rounded-[32px] overflow-hidden h-[220px]">
                  <iframe
                    title="Ubicación EntrePues"
                    src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d2357.7751441041273!2d-74.016059!3d4.881145!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e4077edc5270e1f%3A0x4bdbf98b05f9e223!2sEntrepues!5e1!3m2!1ses-419!2sco!4v1784150703982!5m2!1ses-419!2sco"
                    className="w-full h-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>

                {/* Contact info */}
                <div className="w-full flex flex-col gap-6 text-secondary text-sm">
                  <div className="flex flex-col gap-4">
                    <p className="font-medium text-base">Nuestros datos</p>
                    <div className="flex flex-col gap-3 leading-[18px]">
                      <p>Km. 9 Autopista Norte vía Tunja</p>
                      <p>300 214 1978</p>
                      <p>servicio@restauranteentrepues.com</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <p className="font-medium text-base">Nuestros horarios</p>
                    <div className="flex flex-col gap-3 leading-[18px]">
                      <p>Lunes 10:00 a.m. - 4:00 p.m.</p>
                      <p>Martes 09:00 a.m. - 5:00 p.m.</p>
                      <p>Miércoles y jueves 8:00 a.m. - 6:00 p.m.</p>
                      <p>Viernes a domingo 8:00 a.m. - 6:00 p.m.</p>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-secondary/20" />

                {/* Copyright + socials */}
                <div className="w-full flex items-center justify-between">
                  <p className="text-secondary text-sm">
                    Copyright © 2026 EntrePues
                  </p>
                  <div className="flex items-center gap-4">
                    {SOCIAL_LINKS.map((social) => (
                      <a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:opacity-70 transition-opacity"
                        aria-label={social.name}
                      >
                        <img
                          src={social.icon}
                          alt={social.name}
                          className="w-6 h-6"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
