import type { CSSProperties } from "react";
import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { connection } from "next/server";
import { Toaster } from "sonner";
import { BrandProvider } from "@/brand/brand-context";
import { readBrand } from "@/brand/brand";
import { ImageCacheRegistration } from "@/components/site/ImageCacheRegistration";
import "./globals.css";

const displayFont = Fraunces({ variable: "--font-display-face", subsets: ["latin"] });
const bodyFont = Manrope({ variable: "--font-body", subsets: ["latin"] });

/** Brand comes from the environment at request time, so one image can serve several brands. */
export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const brand = readBrand();
  return {
    title: { default: brand.name, template: `%s · ${brand.name}` },
    description: brand.tagline,
    applicationName: brand.name,
  };
}

export async function generateViewport(): Promise<Viewport> {
  await connection();
  return { themeColor: readBrand().primaryColor };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  await connection();
  const brand = readBrand();
  const brandColors = {
    "--brand-primary": brand.primaryColor,
    "--brand-accent": brand.accentColor,
  } as CSSProperties;
  return (
    <html lang="pt-BR" style={brandColors} className={`${displayFont.variable} ${bodyFont.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <BrandProvider brand={brand}>{children}</BrandProvider>
        <Toaster richColors position="top-center" />
        <ImageCacheRegistration />
      </body>
    </html>
  );
}
