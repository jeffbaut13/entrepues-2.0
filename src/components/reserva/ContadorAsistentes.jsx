import { IncremenAndDecrementComponent } from "../common/IncrementAndDrecrement";

const ContadorAsistentes = ({
  errorAsistentes,
  permiteMascotas,
  adultsNum,
  childrenNum,
  mascotasNum,
  setAdults,
  setChildren,
  setMascotas,
  syncAsistentes,
  showMaxAsistentesError,
  MAX_OCUPACION_TOTAL,
  MAX_MASCOTAS,
  totalOcupacion,
}) => {
  return (
    <div className="w-full flex justify-center flex-col gap-2">
      <div className="flex justify-between items-center gap-3">
        <p>Adultos</p>
        <IncremenAndDecrementComponent
          errorAsistentes={errorAsistentes}
          item={adultsNum}
          increaseQuantity={() => {
            if (totalOcupacion >= MAX_OCUPACION_TOTAL) {
              showMaxAsistentesError();
              return;
            }
            const nextAdults = adultsNum + 1;
            setAdults(nextAdults);
            syncAsistentes(nextAdults, childrenNum);
          }}
          decreaseQuantity={() => {
            const nextAdults = Math.max(adultsNum - 1, 0);
            setAdults(nextAdults);
            syncAsistentes(nextAdults, childrenNum);
          }}
        />
      </div>

      <div className="flex justify-between items-center lg:gap-3">
        <p>Niños</p>
        <IncremenAndDecrementComponent
          errorAsistentes={errorAsistentes}
          item={childrenNum}
          increaseQuantity={() => {
            if (totalOcupacion >= MAX_OCUPACION_TOTAL) {
              showMaxAsistentesError();
              return;
            }
            const nextChildren = childrenNum + 1;
            setChildren(nextChildren);
            syncAsistentes(adultsNum, nextChildren);
          }}
          decreaseQuantity={() => {
            const nextChildren = Math.max(childrenNum - 1, 0);
            setChildren(nextChildren);
            syncAsistentes(adultsNum, nextChildren);
          }}
        />
      </div>

      {permiteMascotas && (
        <div className="flex justify-between items-center gap-3">
          <p>Mascotas</p>
          <IncremenAndDecrementComponent
            errorAsistentes={errorAsistentes}
            item={mascotasNum}
            increaseQuantity={() => {
              if (mascotasNum >= MAX_MASCOTAS) {
                return;
              }
              if (totalOcupacion >= MAX_OCUPACION_TOTAL) {
                showMaxAsistentesError();
                return;
              }
              setMascotas(mascotasNum + 1);
            }}
            decreaseQuantity={() => {
              setMascotas(Math.max(mascotasNum - 1, 0));
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ContadorAsistentes;
