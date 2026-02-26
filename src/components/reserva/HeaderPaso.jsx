/**
 * Header del acordeon para cada paso de la reserva
 * Muestra el titulo, descripcion y estado del paso
 */
export default function HeaderPaso({
  paso,
  isExpanded,
  habilitado,
  onClick,
  content,
}) {
  return (
    <div className="size-full text-dark relative">
      <button
        onClick={onClick}
        disabled={!habilitado}
        className={`size-full flex lg:flex-col flex-row lg:items-start items-center lg:justify-center justify-between ${
          isExpanded ? "lg:pl-16 pl-4" : "font-bold lg:pl-8 pl-4 opacity-40"
        } ${
          !habilitado ? "!cursor-not-allowed" : "hover:opacity-100"
        } relative font-light transition ease-in-out`}
      >
        {isExpanded && (
          <span className="absolute left-0 h-2/3 w-1.5 rounded-full bg-brown" />
        )}
        <h3 className="text-xl">{paso.titulo}</h3>
        {content && <>{content}</>}
      </button>
    </div>
  );
}
