import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { readBrand } from "@/brand/brand";

/** PWA manifest generated per request so it follows the deployment's brand. */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  await connection();
  const brand = readBrand();
  return {
    name: brand.name,
    short_name: brand.shortName,
    description: brand.tagline,
    lang: "pt-BR",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: brand.primaryColor,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
