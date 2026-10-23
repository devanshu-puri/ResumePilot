"use client";

import React, { useEffect } from "react";

/**
 * AmbientBackground
 * Inspired by https://tglobal.in/work
 * Renders an ethereal, smooth ambient mesh gradient with a fine tactile SVG fractal noise texture.
 */
export function AmbientBackground() {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      {/* Ethereal Soft Mesh Gradients */}
      <div className="ambient-mesh" aria-hidden="true" />
      {/* Tactile SVG Fractal Noise Texture */}
      <div className="noise-overlay" aria-hidden="true" />
    </>
  );
}
