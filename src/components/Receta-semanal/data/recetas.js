export const RECETAS_CONFIG = {
  bandejaPaisa: {
    key: "bandeja-paisa",
    badge: "La bandeja paisa",
    title: "De doña Segunda",
    subTitle: "desde 1960",
    review:
      "<p>Dicen por ahí que la mejor bandeja paisa no nació en una cocina, sino en el fogón de leña de una casa antigua, en medio de la montaña.</p> <p>Ahí estaba Doña Segunda, con el delantal amarrado y la olla de fríjoles siempre al punto. Desde 1960 viene cocinando como le enseñaron: sin afán, con paciencia y con ese ojo que no falla pa’ saber cuándo algo ya quedó.<p>",
    cta: {
      href: "/carta",
      label: "Ver menu",
    },
    hero: {
      desktopBg: "/imagenes/receta-semanal/receta-bandeja-paisa.webp",
      mobileBg: "/imagenes/receta-semanal/receta-bandeja-paisa-mobile.webp",
      overlayOpacityClass: "bg-dark/20",
    },
    ingredientsTitle: "Ingredientes",
    ingredients: [
      {
        label: "Fríjoles cargamanto cocidos en caldo",
        icon: "Soup",
      },
      {
        label: "Arroz blanco suelto",
        icon: "Wheat",
      },
      {
        label: "Carne molida sazonada",
        icon: "Beef",
      },
      {
        label: "Chicharrón crocante",
        icon: "Flame",
      },
      {
        label: "Chorizo antioqueño",
        icon: "ChefHat",
      },
      {
        label: "Huevo frito de yema suave",
        icon: "Egg",
      },
      {
        label: "Maduro caramelizado",
        icon: "Leaf",
      },
      {
        label: "Aguacate fresco y arepa blanca",
        icon: "Sandwich",
      },
    ],
    stepsTitle: "Preparación",
    steps: [
      {
        label:
          "Sofríe cebolla y tomate para formar una base sabrosa y cocina los fríjoles hasta que espesen.",
        icon: "CookingPot",
      },
      {
        label:
          "Dora la carne molida con comino, ajo y un toque de color para un sabor profundo.",
        icon: "Beef",
      },
      {
        label:
          "Fríe el chicharrón a fuego medio hasta que quede crujiente por fuera y jugoso por dentro.",
        icon: "Flame",
      },
      {
        label:
          "Asa o saltea el chorizo, prepara el huevo frito y calienta la arepa y el arroz al final.",
        icon: "UtensilsCrossed",
      },
      {
        label:
          "Emplata por capas: fríjoles, arroz, proteínas y remata con maduro, aguacate y arepa.",
        icon: "HandPlatter",
      },
    ],
    showcase: {
      image: "/imagenes/receta-semanal/section_three.webp",
      title: "La bandeja paisa de la casa",
      description:
        "Tradicion servida en abundancia, con alma antioquena y sabor colombiano.",
    },
  },
};

export const getRecetaConfig = (key) => RECETAS_CONFIG[key] || null;
