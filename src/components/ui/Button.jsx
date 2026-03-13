import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export const Button = ({
  type = "button-primary",
  title,
  Icon,
  onClick,
  motionProps,
  props = {},
  target = "_self",
  href,
  width = "ajustado",
  iconSize = "medium",
  fontSize = "lg",
  customClass = "",
  disabled = false,
}) => {
  const getWidthClass = (width) => {
    switch (width) {
      case "ajustado":
        return "w-fit";
      case "full":
        return "w-full";
      case "flex":
        return "flex-1";
      case "medio":
      default:
        return "md:min-w-40 min-w-34";
    }
  };

  const getIconSize = (iconSize) => {
    switch (iconSize) {
      case "small":
        return 18;
      case "tall":
        return 30;
      case "medium":
      default:
        return 24;
    }
  };

  const getFontSizeClass = (fontSize) => {
    switch (fontSize) {
      case "xs":
        return "text-xs";
      case "md":
        return "text-md";
      case "lg":
        return "text-lg";
      case "xl":
        return "text-xl";
      case "2xl":
        return "text-2xl";
      case "base":
      default:
        return "text-base";
    }
  };

  const transition = `transition-all ease-in-out duration-300`;
  const disabledStyle = `disabled:opacity-40 disabled:!cursor-not-allowed`;
  const baseStyle = `tracking-widest flex justify-center items-center gap-1 cursor-pointer text-center rounded-full py-1.5 pb-2 ${transition} ${disabledStyle}`;
  const primary = `${baseStyle} font-parkson bg-dark/40 backdrop-blur-md hover:bg-black text-secondary border border-secondary/40 hover:border-black px-6`;
  const listas = {
    "button-primary": primary,
    enlace: primary,
    "button-secondary": `${baseStyle} font-parkson bg-none text-dark  hover:opacity-60`,
    "button-thirty": `${baseStyle} font-light text-dark`,
    "button-dark": `${baseStyle} font-parkson text-secondary bg-dark hover:bg-dark/80 px-6`,
    "just-icon": `cursor-pointer flex h-fit ${transition}   rounded-full p-2 hover:opacity-60 hover:bg-dark/20`,
    "just-icon-dark": `cursor-pointer flex h-fit ${transition} rounded-full p-2 bg-dark/30 hover:opacity-60 hover:bg-dark/20`,
    "just-icon-white": `cursor-pointer flex h-fit ${transition} rounded-full p-2 bg-white/30 text-white hover:opacity-60 hover:bg-dark/20`,
  };

  const navigate = useNavigate();

  const handleNavigate = (href) => {
    href ? navigate(href) : null;
    onClick ? onClick() : null;
  };
  switch (type) {
    case "enlace":
      return (
        <motion.button
          disabled={disabled}
          to={href}
          target={target}
          className={`w-fit ${getWidthClass(width)} ${getFontSizeClass(
            fontSize,
          )} ${listas[type]} ${customClass}`}
          {...motionProps}
          {...props}
          onClick={onClick ? onClick : () => handleNavigate(href)}
        >
          {Icon && <Icon size={getIconSize(iconSize)} />}
          {title}
        </motion.button>
      );
    case "button-primary":
      return (
        <motion.button
          {...motionProps}
          {...props}
          className={`${getWidthClass(width)} ${getFontSizeClass(fontSize)} ${
            listas[type]
          } ${customClass} ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
          onClick={disabled ? null : onClick}
          disabled={disabled}
        >
          {Icon && <Icon size={getIconSize(iconSize)} />}
          {title}
        </motion.button>
      );
    case "button-secondary":
      return (
        <motion.button
          {...motionProps}
          {...props}
          className={`${getWidthClass(width)} ${getFontSizeClass(fontSize)} ${
            listas[type]
          } ${customClass}`}
          onClick={onClick}
          disabled={disabled}
        >
          {Icon && <Icon size={getIconSize(iconSize)} />}
          {title}
        </motion.button>
      );
    case "button-thirty":
      return (
        <motion.button
          {...motionProps}
          {...props}
          className={`${getWidthClass(width)} ${getFontSizeClass(fontSize)} ${
            listas[type]
          } ${customClass}`}
          onClick={onClick}
          disabled={disabled}
        >
          {Icon && <Icon size={getIconSize(iconSize)} />}
          {title}
        </motion.button>
      );
    case "button-dark":
      return (
        <motion.button
          {...motionProps}
          {...props}
          className={`${getWidthClass(width)} ${getFontSizeClass(fontSize)} ${
            listas[type]
          } ${customClass}`}
          onClick={onClick}
          disabled={disabled}
        >
          {Icon && <Icon size={getIconSize(iconSize)} />}
          {title}
        </motion.button>
      );
    case "just-icon":
      return (
        <motion.a
          target={target}
          {...props}
          href={href}
          onClick={onClick ? onClick : null}
          className={`cursor-pointer ${
            listas[type]
          } ${customClass} ${getWidthClass(width)}`}
        >
          <Icon size={getIconSize(iconSize)} />
        </motion.a>
      );
    case "just-icon-dark":
      return (
        <motion.a
          target={target}
          {...props}
          href={href}
          onClick={onClick ? onClick : null}
          className={`${listas[type]} ${customClass}`}
        >
          <Icon size={getIconSize(iconSize)} />
        </motion.a>
      );
    case "just-icon-white":
      return (
        <motion.a
          target={target}
          {...props}
          href={href}
          onClick={onClick ? onClick : null}
          className={`${listas[type]} ${customClass}`}
        >
          <Icon size={getIconSize(iconSize)} />
        </motion.a>
      );
    default:
      return null;
  }
};
