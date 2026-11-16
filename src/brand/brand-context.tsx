"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Brand } from "@/brand/brand";

const BrandContext = createContext<Brand | null>(null);

export function BrandProvider({ brand, children }: { brand: Brand; children: ReactNode }) {
  return <BrandContext.Provider value={brand}>{children}</BrandContext.Provider>;
}

/** Brand of the current deployment; throws when used outside the root layout. */
export function useBrand(): Brand {
  const brand = useContext(BrandContext);
  if (!brand) {
    throw new Error("useBrand must be used inside BrandProvider");
  }
  return brand;
}
