import { Logo } from "../ui/Logo";

export const Intro = ({ categorias, setCategoriaSelected }) => {
  return (
    <main
      style={{ backgroundImage: "url('/imagenes/background-home.jpg')" }}
      className={`${styles.main} ${styles.color}`}
    >
      <div className="bg-black/60 backdrop-blur-xl absolute top-0 left-0 w-full h-full z-0 opacity-95" />
      {/* <Logo color="#fff6ea" customClass={styles.logo} /> */}
      <h1 className={`${styles.fontFamily} ${styles.title} ${styles.relative}`}>
        MENÚ
      </h1>

      {categorias.map((categoria, index) => (
        <button
          key={index}
          className={`${styles.button} ${styles.relative} ${styles.border} ${styles.fontFamily} ${styles.color}`}
          onClick={() => setCategoriaSelected(null)}
        >
          {categoria}
        </button>
      ))}
      <p className={`${styles.legal} ${styles.relative}`}>
        Si usted tiene alguna observación con respecto <br /> a alergias, por
        favor notifíquelas antes de ordenar.
      </p>
    </main>
  );
};

const styles = {
  border: "border-[1px] border-[#fff6ea] rounded-[16px]",
  button:
    "min-w-[171px] text-[28px] flex items-center justify-center py-3 mb-[23px]",
  logo: "!w-[132px] h-auto mb-[17px]",
  main: "h-dvh w-full flex items-center justify-center flex-col",
  color: "!text-[#fff6ea]",
  fontFamily: "font-parkson tracking-widest",
  title: "!text-[42px] leading-11 text-center  mb-[48.78px]",
  legal: "!text-[13px] text-center mt-[28.73px]",
  relative: "relative z-10",
};
