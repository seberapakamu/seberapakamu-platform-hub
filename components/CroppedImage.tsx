"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  imageUrl: string;
  cropX: number;      // persen 0–100
  cropY: number;
  cropWidth: number;
  cropHeight: number;
  alt: string;
  className?: string;
}

export default function CroppedImage({
  imageUrl,
  cropX,
  cropY,
  cropWidth,
  cropHeight,
  alt,
  className,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const safeW = cropWidth > 0 && cropWidth <= 100 ? cropWidth : 100;
  const safeH = cropHeight > 0 && cropHeight <= 100 ? cropHeight : 100;

  useEffect(() => {
    if (!imageUrl) {
      setHasError(true);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const natW = img.naturalWidth;
      const natH = img.naturalHeight;

      const sx = (cropX / 100) * natW;
      const sy = (cropY / 100) * natH;
      const sWidth = (safeW / 100) * natW;
      const sHeight = (safeH / 100) * natH;

      canvas.width = sWidth;
      canvas.height = sHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);
      setIsLoaded(true);
    };
    
    img.onerror = () => {
      setHasError(true);
    };
    
    img.src = imageUrl;
  }, [imageUrl, cropX, cropY, safeW, safeH]);

  if (!imageUrl || hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 ${className ?? ""}`}
        style={{ minHeight: 160, backgroundColor: "var(--color-surface-alt)" }}
      >
        <span className="text-4xl" aria-hidden="true">🎭</span>
        <p className="text-sm font-semibold" style={{ color: "var(--color-text-muted)" }}>
          Gambar tidak tersedia
        </p>
      </div>
    );
  }

  const hasFixedHeight = className?.includes("h-full");

  return (
    <>
      {!isLoaded && (
        <div
          className={`flex items-center justify-center ${className ?? ""}`}
          style={{ 
            minHeight: 160, 
            backgroundColor: "var(--color-surface-alt)",
            ...(hasFixedHeight ? { height: "100%" } : { aspectRatio: `${safeW} / ${safeH}` })
          }}
        >
          <div className="animate-pulse text-3xl" aria-hidden="true">🎭</div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        aria-label={alt}
        role="img"
        className={className ?? ""}
        style={{
          width: "100%",
          height: hasFixedHeight ? "100%" : "auto",
          maxHeight: "100%",
          objectFit: "contain",
          display: isLoaded ? "block" : "none",
          backgroundColor: "var(--color-surface-alt)",
        }}
      />
    </>
  );
}
