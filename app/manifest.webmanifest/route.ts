import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    name: "Kisan Carbon Hub",
    short_name: "Kisan Carbon",
    description: "Farmers: measure land & trees, earn carbon credits, sell on the marketplace.",
    start_url: "/carbon-farmer",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f9fafb",
    theme_color: "#16a34a",
    lang: "en",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  });
}