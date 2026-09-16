"use client";

import { useEffect, useState } from "react";

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(media.matches);
    const onChange = () => setReduced(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function useGpu() {
  const [gpu, setGpu] = useState(true);
  useEffect(() => {
    const probe = document.createElement("canvas");
    setGpu(Boolean(probe.getContext("webgl2") || probe.getContext("webgl")));
  }, []);
  return gpu;
}
