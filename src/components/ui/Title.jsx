import { useMemo } from "react";

// Theme configuration for better maintainability
const THEME_CONFIG = {
  brown: {
    text: "text-brown",
    bg: "bg-brown/40",
  },
  light: {
    text: "text-secondary",
    bg: "bg-secondary/40",
  },
  dark: {
    text: "text-dark",
    bg: "bg-dark/40",
  },
};

export const Title = ({
  headContent,
  content,
  theme = "brown",
  className = "",
  headingLevel = "h2",
  animated = false,
}) => {
  // Memoize theme classes to avoid recalculation on every render
  const themeClasses = useMemo(() => {
    const config = THEME_CONFIG[theme] || THEME_CONFIG.brown;
    return {
      text: config.text,
      bg: config.bg,
    };
  }, [theme]);

  // Dynamic heading tag for better semantic HTML
  const HeadingTag = headingLevel;

  const FontSize = () => {
    switch (headingLevel) {
      case "h1":
        return "lg:!text-9xl lg:!leading-20 !text-6xl";
      case "h2":
        return "lg:!text-7xl lg:!leading-12 !text-5xl";
      case "h3":
        return "lg:!text-5xl lg:!leading-10 !text-4xl";
      default:
        return "lg:!text-7xl lg:!leading-12 !text-5xl";
    }
  };

  const FontSizeSubtitle = () => {
    switch (headingLevel) {
      case "h1":
        return "lg:!text-5xl !text-3xl";
      case "h2":
        return "lg:!text-5xl !text-4xl";
      case "h3":
        return "lg:!text-3xl !text-2xl";
      default:
        return "lg:!text-2xl !text-xl";
    }
  };

  return (
    <div
      className={`w-fit mx-auto lg:mb-8 mb-4 text-center ${
        themeClasses.text
      } ${className} ${animated ? "animate-fade-in" : ""}`}
      role="banner"
      aria-labelledby="title-heading"
    >
      {/* Decorative line with subtitle */}
      <div className="flex justify-center items-center gap-4 mb-2">
        <span
          className={`flex-1 h-px transition-colors duration-300 ${themeClasses.bg}`}
          aria-hidden="true"
        />
        <span
          className={`font-amithen ${FontSizeSubtitle()}`}
          role="text"
          aria-label="Subtítulo"
        >
          {headContent}
        </span>
        <span
          className={`flex-1 h-px transition-colors duration-300 ${themeClasses.bg}`}
          aria-hidden="true"
        />
      </div>

      {/* Main title */}
      <HeadingTag id="title-heading" className={`font-parkson ${FontSize()}`}>
        {content}
      </HeadingTag>
    </div>
  );
};
