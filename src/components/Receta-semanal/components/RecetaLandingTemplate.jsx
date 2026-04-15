import { motion } from "framer-motion";
import { Button } from "../../ui/Button";
import { SiteFooter } from "../../footer/SiteFooter";

export const RecetaLandingTemplate = ({ receta, isMobile }) => {
  if (!receta) return null;

  const heroBg = isMobile ? receta.hero.mobileBg : receta.hero.desktopBg;

  return (
    <div className="w-full bg-secondary text-dark">
      <section
        className="relative min-h-dvh w-full bg-cover bg-center"
        style={{ backgroundImage: `url('${heroBg}')` }}
      >
        <div className={`absolute inset-0 ${receta.hero.overlayOpacityClass}`} />

        <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-6xl flex-col items-center justify-center px-6 py-16 text-secondary text-center">
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
            className="mt-2 font-parkson text-6xl leading-[0.95] md:text-8xl"
          >
            {receta.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16 }}
            className="mt-6 max-w-3xl text-base md:text-lg"
          >
            {receta.review}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.24 }}
            className="mt-8"
          >
            <Button
              type="enlace"
              href={receta.cta.href}
              title={receta.cta.label}
              fontSize="2xl"
            />
          </motion.div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24">
        <div className="grid gap-8 md:grid-cols-2">
          <article className="rounded-3xl border border-dark/15 bg-white p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
            <h2 className="font-parkson text-5xl leading-none md:text-6xl">
              {receta.ingredientsTitle}
            </h2>
            <ul className="mt-6 space-y-3">
              {receta.ingredients.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-base md:text-lg"
                >
                  <span className="mt-2 inline-block h-2 w-2 rounded-full bg-brown" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-3xl border border-dark/15 bg-dark p-6 md:p-8 text-secondary shadow-[0_20px_60px_rgba(0,0,0,0.16)]">
            <h2 className="font-parkson text-5xl leading-none md:text-6xl">
              {receta.stepsTitle}
            </h2>
            <ol className="mt-6 space-y-4">
              {receta.steps.map((step, index) => (
                <li
                  key={step}
                  className="grid grid-cols-[2rem_1fr] gap-3 text-base md:text-lg"
                >
                  <span className="font-parkson text-3xl leading-none text-secondary/80">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </article>
        </div>
      </section>

      <section className="pb-16 md:pb-24">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="overflow-hidden rounded-3xl border border-dark/15">
            <div
              className="relative h-[42vh] min-h-[20rem] w-full bg-cover bg-center"
              style={{ backgroundImage: `url('${receta.showcase.image}')` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-dark/70 via-dark/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 text-secondary">
                <p className="font-parkson text-4xl leading-none md:text-6xl">
                  {receta.showcase.title}
                </p>
                <p className="mt-3 text-sm md:text-base">
                  {receta.showcase.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};
