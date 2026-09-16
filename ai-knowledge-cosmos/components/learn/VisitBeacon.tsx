"use client";

import { useEffect } from "react";
import { markVisited } from "@/lib/progress";

export function VisitBeacon({ slug }: { slug: string }) {
  useEffect(() => {
    markVisited(slug);
  }, [slug]);
  return null;
}
