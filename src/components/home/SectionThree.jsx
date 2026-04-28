import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";

export const SectionThree = () => {
  const [sliderPos, setSliderPos] = useState(50);

  // Gradiente: desde qué % empieza a volverse transparente (posición) y hasta qué % llega (intensidad)
  const gradientStart = 40; // % desde abajo donde es negro sólido
  const gradientEnd = 100; // % desde abajo donde termina (transparente)
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const updateSlider = useCallback((clientX) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  }, []);

  const onMouseDown = (e) => {
    isDragging.current = true;
    updateSlider(e.clientX);
  };

  const onMouseMove = useCallback(
    (e) => {
      if (!isDragging.current) return;
      updateSlider(e.clientX);
    },
    [updateSlider],
  );

  const onMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const onTouchMove = useCallback(
    (e) => {
      updateSlider(e.touches[0].clientX);
    },
    [updateSlider],
  );

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  return (
    <section className="h-dvh relative overflow-hidden select-none">
      {/* Imagen de fondo — derecha (nuevo) */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/imagenes/section-three/nuevo.webp')" }}
      />

      {/* Imagen izquierda (antigua) recortada por el slider */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/imagenes/section-three/antigua.webp')",
          clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
        }}
      />

      {/* Línea divisora + handle */}
      <div
        ref={containerRef}
        className="absolute inset-0 cursor-ew-resize"
        onMouseDown={onMouseDown}
        onTouchMove={onTouchMove}
        onTouchStart={(e) => updateSlider(e.touches[0].clientX)}
      >
        {/* Línea vertical */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-secondary pointer-events-none"
          style={{ left: `${sliderPos}%` }}
        />

        {/* Handle circular */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-40 h-40 rounded-full flex items-center justify-center pointer-events-none z-10"
          style={{ left: `${sliderPos}%` }}
        >
          <ChevronLeft className="text-secondary h-40 w-40 mr-12" />
          <ChevronRight className="text-secondary h-40 w-40 " />
        </div>
      </div>

      {/* Texto inferior */}
      <div
        className="w-full h-[35vh] absolute bottom-0 left-0 flex items-center justify-center pointer-events-none"
        style={{
          background: `linear-gradient(to top, black ${gradientStart}%, transparent ${gradientEnd}%)`,
        }}
      >
        <h1 className="text-secondary font-parkson text-7xl leading-12 text-center">
          <span className="flex items-center gap-4">
            <span className="flex-1 h-0.5 bg-secondary/40"></span>
            abrimos en 1995
            <span className="flex-1 h-0.5 bg-secondary/40"></span>
          </span>
          <span className="text-5xl">y seguimos escribiendo la historia.</span>
        </h1>
      </div>
    </section>
  );
};
