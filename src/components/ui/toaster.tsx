"use client";

import React from "react";
import { Toaster as SonnerToaster } from "sonner";

/**
 * Wrapper simples para o Toaster (sonner).
 * Importado como: import { Toaster } from "@/components/ui/toaster";
 */
export function Toaster() {
  return <SonnerToaster position="top-right" richColors />;
}

export default Toaster;