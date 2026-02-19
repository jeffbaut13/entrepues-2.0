import { ChevronDown, Check, ArrowRight, Calendar } from "lucide-react";
import { capitalizeFirst } from "../../constants/firsLetterUppercase";
import { BackgroundCards } from "../ui/BackgroundCards";

/**
 * Header del acordeón para cada paso de la reserva
 * Muestra el número, título, descripción y estado del paso
 */
export default function HeaderPaso({
  index,
  paso,
  isExpanded,
  isCompleted,
  currentStep,
  onClick,
  content,
}) {
  const isDisabled = index > currentStep && !isCompleted;

  return (
    <div className="size-full text-dark relative">
      <button
        onClick={onClick}
        disabled={isDisabled}
        className={`size-full flex lg:flex-col flex-row lg:items-start items-center lg:justify-center justify-between ${
          isExpanded ? "lg:pl-16 pl-4" : "font-bold lg:pl-8 pl-4 opacity-40"
        } ${
          isDisabled ? "!cursor-not-allowed" : "hover:opacity-100"
        } relative font-light transition ease-in-out`}
      >
        {/* Título y descripción */}
        {isExpanded && (
          <span className="absolute left-0 h-2/3 w-1.5 rounded-full bg-brown" />
        )}
        <h3 className="text-xl">{paso.titulo}</h3>

        {content && <>{content}</>}
      </button>
    </div>
  );
}
