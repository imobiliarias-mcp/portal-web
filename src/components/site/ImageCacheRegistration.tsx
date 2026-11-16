"use client";

import { useEffect } from "react";

/** Registers the photo cache worker. It needs a secure context: HTTPS, or localhost in development. */
export function ImageCacheRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !window.isSecureContext) {
      return;
    }
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Without the worker the photos still load from the network.
    });
  }, []);
  return null;
}
