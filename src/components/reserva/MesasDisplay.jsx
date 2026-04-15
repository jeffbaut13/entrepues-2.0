import { MesasSelectorx4, MesasSelectorx6 } from "../common/MesasSelector";

const MesasDisplay = ({
  selectedZoneName,
  mesaSeleccionada,
  isMobile,
  totalOcupacion,
  totalPersonas,
  childrenNum,
  mascotasNum,
  sizeOverride,
}) => {
  const renderMesaUnit = (
    capacidadBase,
    ocupadas,
    size,
    selected = false,
    petSeats = [],
    childSeats = [],
  ) => {
    if (capacidadBase <= 4) {
      return (
        <div>
          <MesasSelectorx4
            index={ocupadas}
            size={size}
            colorRelleno="fill-brown"
            strokeSecondary="var(--secondary)"
            strokeDark="var(--dark)"
            petSeats={petSeats}
            childSeats={childSeats}
          />
        </div>
      );
    }

    return (
      <div>
        <MesasSelectorx6
          index={ocupadas}
          size={size}
          colorRelleno="fill-brown"
          strokeSecondary="var(--secondary)"
          strokeDark="var(--dark)"
          petSeats={petSeats}
          childSeats={childSeats}
        />
      </div>
    );
  };

  const renderMesaGroup = (
    opcion,
    size,
    selected = false,
    ocupacionManual = null,
  ) => {
    const mesasPlan =
      opcion?.mesasPlan?.length > 0
        ? opcion.mesasPlan
        : Array.from(
            { length: opcion.mesasUnidas || 1 },
            () => opcion.capacidadBase,
          );

    const ocupacionBase =
      ocupacionManual !== null ? ocupacionManual : totalOcupacion;
    const ocupacionAUsar = Math.min(ocupacionBase, opcion.capacidadTotal || 0);

    let ocupacionRestante = ocupacionAUsar;
    let personasRestantes = Math.min(totalPersonas, ocupacionAUsar);
    let childrenRestantes = Math.min(childrenNum, personasRestantes);
    let adultsRestantes = Math.max(0, personasRestantes - childrenRestantes);
    let mascotasRestantes = Math.min(
      mascotasNum,
      Math.max(0, ocupacionAUsar - personasRestantes),
    );

    return mesasPlan.map((capacidadMesa, idx) => {
      const ocupadasMesa = Math.max(
        0,
        Math.min(capacidadMesa, ocupacionRestante),
      );
      ocupacionRestante = Math.max(0, ocupacionRestante - capacidadMesa);

      const personasEnMesa = Math.min(personasRestantes, ocupadasMesa);
      personasRestantes = Math.max(0, personasRestantes - personasEnMesa);

      const adultsEnMesa = Math.min(adultsRestantes, personasEnMesa);
      adultsRestantes = Math.max(0, adultsRestantes - adultsEnMesa);

      const childrenEnMesa = Math.min(
        childrenRestantes,
        Math.max(0, personasEnMesa - adultsEnMesa),
      );
      childrenRestantes = Math.max(0, childrenRestantes - childrenEnMesa);

      const mascotasEnMesa = Math.min(
        mascotasRestantes,
        Math.max(0, ocupadasMesa - personasEnMesa),
      );
      mascotasRestantes = Math.max(0, mascotasRestantes - mascotasEnMesa);

      const petSeats = Array.from(
        { length: mascotasEnMesa },
        (_, petIndex) => personasEnMesa + petIndex,
      );

      const childSeats = Array.from(
        { length: childrenEnMesa },
        (_, childIndex) => adultsEnMesa + childIndex,
      );

      return (
        <div
          key={`${opcion.capacidadBase}-${capacidadMesa}-${size}-${idx}`}
          className="flex items-center justify-center"
        >
          {renderMesaUnit(
            capacidadMesa,
            ocupadasMesa,
            size,
            selected && idx === 0,
            petSeats,
            childSeats,
          )}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col justify-between overflow-hidden">
      {mesaSeleccionada && (
        <div className="w-full h-full rounded-xl p-2 flex items-center justify-center">
          <div className="flex items-center justify-center gap-4">
            {renderMesaGroup(
              mesaSeleccionada,
              sizeOverride || `${isMobile ? "md" : "lg"}`,
              true,
              totalOcupacion,
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MesasDisplay;
