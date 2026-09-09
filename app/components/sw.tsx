"use client";

import { useEffect } from "react";

export default function SwRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator && (window.location.protocol === "https:" || ["localhost", "127.0.0.1"].includes(window.location.hostname))) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}