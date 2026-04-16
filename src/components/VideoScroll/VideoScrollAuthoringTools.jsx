import { useEffect, useRef, useState } from "react";

const DEFAULT_TIMEOUT_OFFSET = 0.4;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const formatNumber = (value, decimals = 2) =>
  Number(value || 0)
    .toFixed(decimals)
    .replace(/\.00$/, "")
    .replace(/(\.\d)0$/, "$1");
const escapeString = (value = "") => String(value).replace(/"/g, '\\"');
const toValidMesa = (value) => Math.max(1, Math.round(Number(value || 1)));
const formatPointId = (mesaNumber) =>
  `punto-${String(toValidMesa(mesaNumber)).padStart(2, "0")}`;
const extractPointNumber = (value = "") => {
  const match = String(value).match(/\d+/);
  if (!match) return null;
  return toValidMesa(match[0]);
};

const toViewportPosition = (clientX, clientY) => {
  const width = Math.max(window.innerWidth, 1);
  const height = Math.max(window.innerHeight, 1);
  const left = clamp((clientX / width) * 100, 0, 100);
  const bottom = clamp(((height - clientY) / height) * 100, 0, 100);
  return { left, bottom };
};

export const VideoScrollAuthoringTools = ({
  visible = false,
  currentFrame = 0,
  totalFrames = 1,
  onScrubFrameChange,
  frameToTime,
  regiones = [],
}) => {
  const scrubPanelRef = useRef(null);
  const scrubDragOffsetRef = useRef({ x: 0, y: 0 });
  const copyFeedbackTimeoutRef = useRef(null);

  const [isDraggingScrubPanel, setIsDraggingScrubPanel] = useState(false);
  const [scrubPanelPos, setScrubPanelPos] = useState({ x: null, y: null });
  const [isDraggingDraftPoint, setIsDraggingDraftPoint] = useState(false);
  const [isEditorOnRightSide, setIsEditorOnRightSide] = useState(true);
  const [copyFeedback, setCopyFeedback] = useState("");
  const [draftPoint, setDraftPoint] = useState(() => ({
    id: formatPointId(1),
    mesa: 1,
    name: "mesa",
    region: regiones[1]?.slug || regiones[0]?.slug || "andina",
    timeShow: 0,
    timeout: DEFAULT_TIMEOUT_OFFSET,
    left: 50,
    bottom: 40,
  }));

  const setDraftPositionFromPointer = (clientX, clientY) => {
    const { left, bottom } = toViewportPosition(clientX, clientY);
    setDraftPoint((prev) => ({
      ...prev,
      left,
      bottom,
    }));
  };

  const handleDraftPointerDown = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingDraftPoint(true);
    setDraftPositionFromPointer(event.clientX, event.clientY);
  };

  const getClampedScrubPanelPosition = (x, y) => {
    const panelWidth = scrubPanelRef.current?.offsetWidth || 640;
    const panelHeight = scrubPanelRef.current?.offsetHeight || 104;
    const margin = 8;
    const maxX = Math.max(margin, window.innerWidth - panelWidth - margin);
    const maxY = Math.max(margin, window.innerHeight - panelHeight - margin);

    return {
      x: clamp(x, margin, maxX),
      y: clamp(y, margin, maxY),
    };
  };

  const handleScrubPanelPointerDown = (event) => {
    event.preventDefault();
    const panelRect = scrubPanelRef.current?.getBoundingClientRect();
    if (!panelRect) return;

    event.currentTarget.setPointerCapture?.(event.pointerId);
    scrubDragOffsetRef.current = {
      x: event.clientX - panelRect.left,
      y: event.clientY - panelRect.top,
    };
    setIsDraggingScrubPanel(true);
  };

  const handleDraftInputChange = (field) => (event) => {
    const rawValue = event.target.value;
    setDraftPoint((prev) => {
      if (field === "mesa") {
        const mesa = toValidMesa(rawValue);
        return { ...prev, mesa, id: formatPointId(mesa) };
      }
      if (field === "id") {
        const detectedMesa = extractPointNumber(rawValue);
        if (detectedMesa === null) {
          return { ...prev, id: rawValue };
        }
        return {
          ...prev,
          mesa: detectedMesa,
          id: formatPointId(detectedMesa),
        };
      }
      return { ...prev, [field]: rawValue };
    });
  };

  const regionIndex = regiones.findIndex(
    (item) => item.slug === draftPoint.region,
  );
  const regionExpression =
    regionIndex >= 0
      ? `REGIONES[${regionIndex}].slug`
      : `"${draftPoint.region}"`;
  const draftSnippet = `{
  id: "${escapeString(draftPoint.id)}",
  region: ${regionExpression},
  mesa: ${Number(draftPoint.mesa || 0)},
  name: "${escapeString(draftPoint.name)}",
  timeShow: ${formatNumber(draftPoint.timeShow)},
  timeout: ${formatNumber(draftPoint.timeout)},
  left: "${formatNumber(draftPoint.left)}%",
  bottom: "${formatNumber(draftPoint.bottom)}%",
},`;

  const handleCopyDraftSnippet = async () => {
    try {
      await navigator.clipboard.writeText(draftSnippet);
      setCopyFeedback("Copiado");
      setDraftPoint((prev) => {
        const nextMesa = toValidMesa(prev.mesa) + 1;
        return {
          ...prev,
          mesa: nextMesa,
          id: formatPointId(nextMesa),
        };
      });
    } catch {
      setCopyFeedback("No se pudo copiar");
    }
  };

  useEffect(() => {
    if (!isDraggingDraftPoint) return undefined;

    const handlePointerMove = (event) => {
      setDraftPositionFromPointer(event.clientX, event.clientY);
    };
    const handlePointerUp = () => {
      setIsDraggingDraftPoint(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDraggingDraftPoint]);

  useEffect(() => {
    if (!isDraggingScrubPanel) return undefined;

    const handlePointerMove = (event) => {
      const nextX = event.clientX - scrubDragOffsetRef.current.x;
      const nextY = event.clientY - scrubDragOffsetRef.current.y;
      setScrubPanelPos(getClampedScrubPanelPosition(nextX, nextY));
    };
    const handlePointerUp = () => {
      setIsDraggingScrubPanel(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDraggingScrubPanel]);

  useEffect(() => {
    if (scrubPanelPos.x !== null && scrubPanelPos.y !== null) return;
    const panelWidth = scrubPanelRef.current?.offsetWidth || 640;
    const panelHeight = scrubPanelRef.current?.offsetHeight || 104;
    const centeredX = (window.innerWidth - panelWidth) / 2;
    const centeredY = (window.innerHeight - panelHeight) / 2;
    setScrubPanelPos(getClampedScrubPanelPosition(centeredX, centeredY));
  }, [scrubPanelPos.x, scrubPanelPos.y]);

  useEffect(() => {
    const handleResize = () => {
      setScrubPanelPos((prev) => {
        if (prev.x === null || prev.y === null) return prev;
        return getClampedScrubPanelPosition(prev.x, prev.y);
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const currentTime = Number(frameToTime(currentFrame).toFixed(2));
    setDraftPoint((prev) => ({
      ...prev,
      timeShow: currentTime,
      timeout: Number((currentTime + DEFAULT_TIMEOUT_OFFSET).toFixed(2)),
    }));
  }, [currentFrame, frameToTime]);

  useEffect(() => {
    if (!copyFeedback) return undefined;

    if (copyFeedbackTimeoutRef.current) {
      clearTimeout(copyFeedbackTimeoutRef.current);
    }

    copyFeedbackTimeoutRef.current = setTimeout(() => {
      setCopyFeedback("");
    }, 1200);

    return () => {
      if (copyFeedbackTimeoutRef.current) {
        clearTimeout(copyFeedbackTimeoutRef.current);
      }
    };
  }, [copyFeedback]);

  useEffect(() => {
    return () => {
      if (copyFeedbackTimeoutRef.current) {
        clearTimeout(copyFeedbackTimeoutRef.current);
      }
    };
  }, []);

  if (!visible) return null;

  return (
    <>
      <button
        type="button"
        onPointerDown={handleDraftPointerDown}
        className={`fixed z-[221] h-8 w-8 -translate-x-1/2 translate-y-1/2 rounded-full border-2 border-white bg-red-500 shadow-[0_8px_24px_rgba(0,0,0,0.35)] ${
          isDraggingDraftPoint ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{
          left: `${draftPoint.left}%`,
          bottom: `${draftPoint.bottom}%`,
          touchAction: "none",
        }}
        aria-label="Punto de referencia arrastrable"
      />

      <div
        className="pointer-events-none fixed z-[220] w-[min(640px,88vw)]"
        style={
          scrubPanelPos.x === null || scrubPanelPos.y === null
            ? { left: "50%", top: "50%", transform: "translate(-50%, -50%)" }
            : { left: scrubPanelPos.x, top: scrubPanelPos.y }
        }
      >
        <div
          ref={scrubPanelRef}
          className="pointer-events-auto rounded-xl border border-white/20 bg-black/55 px-4 py-3 text-white backdrop-blur-sm"
        >
          <button
            type="button"
            onPointerDown={handleScrubPanelPointerDown}
            className={`mb-2 w-full rounded-md border border-white/20 bg-white/10 px-2 py-1 text-left text-[11px] uppercase tracking-wide text-white/80 ${
              isDraggingScrubPanel ? "cursor-grabbing" : "cursor-grab"
            }`}
            style={{ touchAction: "none" }}
          >
            Mover Barra De Tiempo
          </button>
          <div className="mb-2 flex items-center justify-between text-xs md:text-sm">
            <span>Tiempo: {frameToTime(currentFrame).toFixed(2)}s</span>
            <span>
              Frame: {currentFrame} / {totalFrames - 1}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={totalFrames - 1}
            step={1}
            value={currentFrame}
            onChange={(event) =>
              onScrubFrameChange?.(Number(event.target.value))
            }
            className="h-2 w-full cursor-pointer accent-white"
            aria-label="Control de tiempo del recorrido"
          />
        </div>
      </div>

      <div
        className={`fixed top-20 z-[230] w-[min(420px,92vw)] ${
          isEditorOnRightSide ? "right-4" : "left-4"
        }`}
      >
        <div className="pointer-events-auto rounded-xl border border-white/20 bg-black/65 p-4 text-white backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setIsEditorOnRightSide((prev) => !prev)}
            className="mb-2 w-full rounded-md border border-white/20 bg-white/10 px-2 py-1 text-left text-[11px] uppercase tracking-wide text-white/80"
          >
            {isEditorOnRightSide
              ? "Mover Editor A La Izquierda"
              : "Mover Editor A La Derecha"}
          </button>
          <p className="text-sm font-semibold">Editor de Punto</p>
          <p className="mt-1 text-xs text-white/75">
            Arrastra el punto rojo y copia el bloque para `VIDEO_SCROLL_POINTS`.
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <input
              value={draftPoint.id}
              onChange={handleDraftInputChange("id")}
              placeholder="id"
              className="rounded bg-white/10 px-2 py-1.5 outline-none ring-1 ring-white/20 focus:ring-white/40"
            />
            <input
              type="number"
              min={1}
              value={draftPoint.mesa}
              onChange={handleDraftInputChange("mesa")}
              placeholder="mesa"
              className="rounded bg-white/10 px-2 py-1.5 outline-none ring-1 ring-white/20 focus:ring-white/40"
            />
            <input
              value={draftPoint.name}
              onChange={handleDraftInputChange("name")}
              placeholder="name"
              className="col-span-2 rounded bg-white/10 px-2 py-1.5 outline-none ring-1 ring-white/20 focus:ring-white/40"
            />
            <select
              value={draftPoint.region}
              onChange={handleDraftInputChange("region")}
              className="col-span-2 rounded bg-white/10 px-2 py-1.5 outline-none ring-1 ring-white/20 focus:ring-white/40"
            >
              {regiones
                .filter((region) => region.slug !== "bienvenido")
                .map((region, index) => (
                  <option
                    key={region.slug}
                    value={region.slug}
                    className="text-black"
                  >
                    REGIONES[{index + 1}].slug - {region.title}
                  </option>
                ))}
            </select>
            <input
              type="number"
              step="0.1"
              value={draftPoint.timeShow}
              readOnly
              placeholder="timeShow"
              className="rounded bg-white/5 px-2 py-1.5 text-white/90 outline-none ring-1 ring-white/20"
            />
            <input
              type="number"
              step="0.1"
              value={draftPoint.timeout}
              readOnly
              placeholder="timeout"
              className="rounded bg-white/5 px-2 py-1.5 text-white/90 outline-none ring-1 ring-white/20"
            />
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="rounded bg-white/15 px-2 py-1.5">
              Tiempo auto por scrub
            </span>
            <span className="text-white/75">
              left {formatNumber(draftPoint.left)}% | bottom{" "}
              {formatNumber(draftPoint.bottom)}%
            </span>
          </div>

          <textarea
            readOnly
            value={draftSnippet}
            className="mt-3 h-44 w-full resize-none rounded bg-black/40 p-2 text-xs leading-relaxed text-white/95 outline-none ring-1 ring-white/20"
          />

          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleCopyDraftSnippet}
              className="rounded bg-white px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-white/90"
            >
              Copiar bloque
            </button>
            <span className="text-xs text-emerald-300">{copyFeedback}</span>
          </div>
        </div>
      </div>
    </>
  );
};
