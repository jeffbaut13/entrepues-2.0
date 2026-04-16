import { motion } from "framer-motion";
import { SiteFooter } from "../../footer/SiteFooter";
import * as LucideIcons from "lucide-react";

const getRecetaItemData = (item) => {
  if (typeof item === "string") {
    return { label: item, icon: "Footprints" };
  }

  return {
    label: item?.label || "",
    icon: item?.icon || "Footprints",
  };
};

const getRecetaIcon = (iconName) => {
  return LucideIcons[iconName] || LucideIcons.Footprints;
};

export const RecetaLandingTemplate = ({ receta, isMobile }) => {
  if (!receta) return null;

  const heroBg = isMobile ? receta.hero.mobileBg : receta.hero.desktopBg;

  return (
    <div className="w-full bg-secondary text-dark">
      <section
        className="relative min-h-dvh w-full bg-cover bg-center"
        style={{ backgroundImage: `url('${heroBg}')` }}
      >
        <div
          className={`absolute inset-0 ${receta.hero.overlayOpacityClass}`}
        />
        <div className="w-full flex">
          <div className="relative z-10 mx-auto flex min-h-dvh flex-1 max-w-6xl flex-col items-center justify-center px-6 py-16 text-secondary text-center">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="font-parkson text-2xl md:text-4xl"
            >
              {receta.badge}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="font-parkson text-6xl leading-18 md:text-8xl"
            >
              {receta.title}
            </motion.h1>
            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="mt-2 font-parkson text-xl md:text-3xl"
            >
              {receta.subTitle}
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.16 }}
              className="mt-12 max-w-133 text-base md:text-xl space-y-4"
              dangerouslySetInnerHTML={{ __html: receta.review }}
            />
          </div>
          <div className="flex-1" />
        </div>
      </section>

      <section className="hide-logo-section w-full px-6 py-16 md:py-24">
        <div className="grid justify-center gap-8 md:grid-cols-[auto_18rem_auto] justify-items-center">
          <article className="w-full max-w-140">
            <h2 className="font-parkson text-5xl leading-none md:text-6xl text-center">
              {receta.ingredientsTitle}
            </h2>
            <ul className="mt-6 space-y-3">
              {receta.ingredients.map((item) => {
                const itemData = getRecetaItemData(item);
                const ItemIcon = getRecetaIcon(itemData.icon);

                return (
                  <li
                    key={itemData.label}
                    className="flex items-center gap-3 text-base md:text-xl"
                  >
                    <ItemIcon className="w-16 h-16 opacity-40" />
                  <span className="mt-2 inline-block h-2 w-2 rounded-full bg-brown" />
                    <span>{itemData.label}</span>
                  </li>
                );
              })}
            </ul>
          </article>
          <span className="h-full w-px bg-dark" />
          <article className="max-w-140 w-full flex flex-col">
            <h2 className="font-parkson text-5xl leading-none md:text-6xl text-center">
              {receta.stepsTitle}
            </h2>
            <ol className="mt-6 flex flex-col justify-between flex-1">
              {receta.steps.map((step, index) => {
                const stepData = getRecetaItemData(step);
                const StepIcon = getRecetaIcon(stepData.icon);

                return (
                  <li
                    key={stepData.label}
                    className="grid grid-cols-[5.2rem_2rem_1fr] gap-3 text-base md:text-xl items-center"
                  >
                    <StepIcon className="w-16 h-16 opacity-40" />
                  <span className="font-parkson text-6xl leading-none">
                    {index + 1}
                  </span>
                    <span>{stepData.label}</span>
                  </li>
                );
              })}
            </ol>
          </article>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};
