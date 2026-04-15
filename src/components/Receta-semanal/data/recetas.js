export const RECETAS_CONFIG = {
  bandejaPaisa: {
    key: "bandeja-paisa",
    badge: "Receta semanal",
    title: "Bandeja Paisa",
    review:
      "Mijito vea, desde el 95 este Entre Pues abrio sus puertas, asi bien sencillito, pa que la gente viniera a comer como en la casa. Todo en fogon de carbon, con ese saborcito que no se consigue en cualquier parte. Aqui hemos ido juntando lo mejor de cada rincon de Colombia, pero sin perder lo nuestro, lo bien paisa, lo de antes.",
    cta: {
      href: "/carta",
      label: "Ver menu",
    },
    hero: {
      desktopBg: "/imagenes/backgroundTwo.webp",
      mobileBg: "/imagenes/backgroundTwoM.webp",
      overlayOpacityClass: "bg-dark/55",
    },
    ingredientsTitle: "Ingredientes",
    ingredients: [
      "Frijoles cargamanto cocidos en caldo",
      "Arroz blanco suelto",
      "Carne molida sazonada",
      "Chicharron crocante",
      "Chorizo antioqueno",
      "Huevo frito de yema suave",
      "Maduro caramelizado",
      "Aguacate fresco y arepa blanca",
    ],
    stepsTitle: "Preparacion",
    steps: [
      "Sofrie cebolla y tomate para formar una base sabrosa y cocina los frijoles hasta que espesen.",
      "Dora la carne molida con comino, ajo y un toque de color para un sabor profundo.",
      "Frie el chicharron a fuego medio hasta que quede crujiente por fuera y jugoso por dentro.",
      "Asa o saltea el chorizo, prepara el huevo frito y calienta arepa y arroz al final.",
      "Emplata por capas: frijoles, arroz, proteinas y remata con maduro, aguacate y arepa.",
    ],
    showcase: {
      image: "/platos/Bandeja-Paisa.jpg",
      title: "La bandeja paisa de la casa",
      description:
        "Tradicion servida en abundancia, con alma antioquena y sabor colombiano.",
    },
  },
};

export const getRecetaConfig = (key) => RECETAS_CONFIG[key] || null;
