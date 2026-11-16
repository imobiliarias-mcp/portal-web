import type { Metadata } from "next";
import { ListingPage } from "@/components/search/ListingPage";

export const metadata: Metadata = { title: "Imóvel" };

export default async function ListingRoute({ params }: PageProps<"/imovel/[provider]/[code]">) {
  const { provider, code } = await params;
  const listing = { provider: decodeURIComponent(provider), code: decodeURIComponent(code) };
  return <ListingPage key={`${listing.provider}/${listing.code}`} {...listing} />;
}
