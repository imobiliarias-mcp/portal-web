"use client";

import { useSyncExternalStore } from "react";
import { SearchExperience } from "@/components/search/SearchExperience";

const subscribe = () => () => undefined;

/** The search reads its state from the URL and localStorage, so it only renders in the browser. */
export function SearchApp() {
  const inBrowser = useSyncExternalStore(subscribe, () => true, () => false);
  if (!inBrowser) {
    return <div className="mx-auto min-h-dvh w-full max-w-7xl px-4 py-8 md:px-6" aria-busy="true" />;
  }
  return <SearchExperience />;
}
