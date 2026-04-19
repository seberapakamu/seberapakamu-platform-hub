"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export interface CropArea {
  x: number;      // persen 0–100
  y: number;
  width: number;
  height: number;
}

interface Props {
  imageUrl: string;
  initialCrop?: CropArea;
  onConfirm: (crop: CropArea) => void;
  onCancel: () => void;
}

const MIN_SIZE = 10; // minimum crop size dalam persen

export default function ImageCropperModal({ imageUrl, initialCrop, onConfirm, onCancel }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [crop, setCrop] = useState<CropArea>(
    initialCrop ?? { x: 20, y: 20, width: 60, height: 60 }
  );
  const dragState = useRef<{
    type: "move" | "resize-br" | "resize-bl" | "resize-tr" | "resize-tl" | null;
    startX: number;
    startY: number;
    startCrop: CropArea;
  }>({ type: null, startX: 0, startY: 0, startCrop: crop });

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  const getRelativePos = useCallback((clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { px: 0, py: 0 };
    return {
      px: ((clientX - rect.left) / rect.width) * 100,
      py: ((clientY - rect.top) / rect.height) * 100,
    };
  }, []);

  const onMouseDown = useCallback(
    (e: React.MouseEvent, type: typeof dragState.current.type) => {
      e.preventDefault();
      e.stopPropagation();
      const { px, py } = getRelativePos(e.clientX, e.clientY);
      dragState.current = { type, startX: px, startY: py, startCrop: { ...crop } };
    },
    [crop, getRelativePos]
  );

  const onTouchStart = useCallback(
    (e: React.TouchEvent, type: typeof dragState.current.type) => {
      e.stopPropagation();
      const touch = e.touches[0];
      const { px, py } = getRelativePos(touch.clientX, touch.clientY);
      dragState.current = { type, startX: px, startY: py, startCrop: { ...crop } };
    },
    [crop, getRelativePos]
  );

  useEffect(() => {
    function handleMove(clientX: number, clientY: number) {
      const { type, startX, startY, startCrop } = dragState.current;
      if (!type) return;

      const { px, py } = getRelativePos(clientX, clientY);
      const dx = px - startX;
      const dy = py - startY;

      setCrop((prev) => {
        let { x, y, width, height } = startCrop;

        if (type === "move") {
          x = clamp(x + dx, 0, 100 - width);
          y = clamp(y + dy, 0, 100 - height);
        } else if (type === "resize-br") {
          width = clamp(width + dx, MIN_SIZE, 100 - x);
          height = clamp(height + dy, MIN_SIZE, 100 - y);
        } else if (type === "resize-bl") {
          const newX = clamp(x + dx, 0, x + width - MIN_SIZE);
          width = clamp(width - dx, MIN_SIZE, x + width);
          x = newX;
          height = clamp(height + dy, MIN_SIZE, 100 - y);
        } else if (type === "resize-tr") {
          width = clamp(width + dx, MIN_SIZE, 100 - x);
          const newY = clamp(y + dy, 0, y + height - MIN_SIZE);
          height = clamp(height - dy, MIN_SIZE, y + height);
          y = newY;
        } else if (type === "resize-tl") {
          const newX = clamp(x + dx, 0, x + width - MIN_SIZE);
          width = clamp(width - dx, MIN_SIZE, x + width);
          x = newX;
          const newY = clamp(y + dy, 0, y + height - MIN_SIZE);
          height = clamp(height - dy, MIN_SIZE, y + height);
          y = newY;
        }

        return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, width: Math.round(width * 10) / 10, height: Math.round(height * 10) / 10 };
      });
    }

    function onMouseMove(e: MouseEvent) { handleMove(e.clientX, e.clientY); }
    function onTouchMove(e: TouchEvent) {
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    }
    function onUp() { dragState.current.type = null; }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [getRelativePos]);

  const handleReset = () => setCrop({ x: 0, y: 0, width: 100, height: 100 });

  const handleConfirm = () => onConfirm(crop);

  const handleSize = (size: "square" | "wide" | "tall") => {
    if (size === "square") setCrop({ x: 25, y: 25, width: 50, height: 50 });
    else if (size === "wide") setCrop({ x: 10, y: 25, width: 80, height: 50 });
    else setCrop({ x: 25, y: 10, width: 50, height: 80 });
  };

  const handleContainerMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.target !== containerRef.current) return;
      const { px, py } = getRelativePos(e.clientX, e.clientY);
      const newCrop: CropArea = { x: px, y: py, width: MIN_SIZE, height: MIN_SIZE };
      setCrop(newCrop);
      dragState.current = { type: "resize-br", startX: px, startY: py, startCrop: newCrop };
    },
    [getRelativePos]
  );

  const handleHandle = (e: React.MouseEvent | React.TouchEvent, type: typeof dragState.current.type) => {
    if ("touches" in e) onTouchStart(e, type);
    else onMouseDown(e, type);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
      role="dialog"
      aria-modal="true"
      aria-label="Crop gambar karakter"
    >
      <div
        className="w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--color-border)" }}>
          <h2 className="text-lg font-black" style={{ color: "var(--color-text-bold)" }}>
            ✂️ Crop Area Petunjuk
          </h2>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            Drag kotak untuk memilih bagian yang ditampilkan sebagai petunjuk
          </p>
        </div>

        {/* Preset buttons */}
        <div className="px-6 py-3 flex gap-2 flex-wrap" style={{ borderBottom: "1px solid var(--color-border)" }}>
          <span className="text-xs font-bold self-center" style={{ color: "var(--color-text-muted)" }}>Preset:</span>
          {(["square", "wide", "tall"] as const).map((s) => (
            <button
              key={s}
              onClick={() => handleSize(s)}
              className="px-3 py-1 rounded-full text-xs font-bold transition-transform hover:scale-105"
              style={{ backgroundColor: "var(--color-surface-alt)", color: "var(--color-accent)", border: "1px solid var(--color-border)" }}
            >
              {s === "square" ? "⬛ Kotak" : s === "wide" ? "▬ Lebar" : "▮ Tinggi"}
            </button>
          ))}
          <button
            onClick={handleReset}
            className="px-3 py-1 rounded-full text-xs font-bold transition-transform hover:scale-105"
            style={{ backgroundColor: "var(--color-surface-alt)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }}
          >
            🔄 Reset
          </button>
        </div>

        {/* Crop area */}
        <div className="flex-1 overflow-auto p-4 flex justify-center items-center" style={{ backgroundColor: "var(--color-bg)" }}>
          <div
            ref={containerRef}
            className="relative select-none"
            style={{ maxWidth: "100%", cursor: "crosshair", userSelect: "none", display: "inline-block", lineHeight: 0 }}
            onMouseDown={handleContainerMouseDown}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Gambar untuk di-crop"
              draggable={false}
              className="block pointer-events-none"
              style={{ maxWidth: "100%", maxHeight: "50vh", width: "auto", height: "auto" }}
            />

            {/* Dark overlay outside crop */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: "rgba(0,0,0,0.5)" }} />

            {/* Crop window — clears the overlay */}
            <div
              className="absolute"
              style={{
                left: `${crop.x}%`,
                top: `${crop.y}%`,
                width: `${crop.width}%`,
                height: `${crop.height}%`,
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
                border: "2px solid #fff",
                cursor: "move",
              }}
              onMouseDown={(e) => handleHandle(e, "move")}
              onTouchStart={(e) => handleHandle(e, "move")}
            >
              {/* Grid lines */}
              <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: "linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)",
                backgroundSize: "33.33% 33.33%",
              }} />

              {/* Resize handles */}
              {(["tl", "tr", "bl", "br"] as const).map((pos) => (
                <div
                  key={pos}
                  className="absolute w-4 h-4 bg-white rounded-sm shadow-md"
                  style={{
                    top: pos.startsWith("t") ? -6 : "auto",
                    bottom: pos.startsWith("b") ? -6 : "auto",
                    left: pos.endsWith("l") ? -6 : "auto",
                    right: pos.endsWith("r") ? -6 : "auto",
                    cursor: `${pos}-resize`,
                    zIndex: 10,
                  }}
                  onMouseDown={(e) => handleHandle(e, `resize-${pos}` as typeof dragState.current.type)}
                  onTouchStart={(e) => handleHandle(e, `resize-${pos}` as typeof dragState.current.type)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Crop info */}
        <div className="px-6 py-2 text-xs font-mono" style={{ color: "var(--color-text-muted)", borderTop: "1px solid var(--color-border)" }}>
          x: {crop.x.toFixed(1)}% · y: {crop.y.toFixed(1)}% · w: {crop.width.toFixed(1)}% · h: {crop.height.toFixed(1)}%
        </div>

        {/* Actions */}
        <div className="px-6 py-4 flex gap-3" style={{ borderTop: "1px solid var(--color-border)" }}>
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl font-bold text-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: "var(--color-bg)", border: "2px solid var(--color-border)", color: "var(--color-text-bold)" }}
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 rounded-2xl font-black text-sm text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            ✅ Gunakan Crop Ini
          </button>
        </div>
      </div>
    </div>
  );
}
