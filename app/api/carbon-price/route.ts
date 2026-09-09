import { NextResponse } from "next/server";
import { setCreditPriceINR, DEFAULT_CREDIT_PRICE_INR } from "@/lib/carbonRates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOKEN_ID = "toucan-protocol-nature-carbon-tonne";
const TOKEN_LABEL = "NCT (Nature Carbon Tonne)";

let last = { price: DEFAULT_CREDIT_PRICE_INR, live: false, fetchedAt: "", ts: 0 };

export async function GET() {
  const now = Date.now();
  if (last.ts && now - last.ts < 10 * 60 * 1000) {
    return NextResponse.json({
      price: last.price,
      token: TOKEN_ID,
      tokenLabel: TOKEN_LABEL,
      live: last.live,
      fetchedAt: last.fetchedAt,
    });
  }
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${TOKEN_ID}&vs_currencies=inr`,
      { cache: "no-store" }
    );
    if (res.ok) {
      const data = await res.json();
      const inr = Number(data?.[TOKEN_ID]?.inr);
      if (inr > 0) {
        setCreditPriceINR(inr);
        last = {
          price: inr,
          live: true,
          fetchedAt: new Date().toLocaleTimeString("en-IN", { hour12: false }),
          ts: now,
        };
        return NextResponse.json({
          price: inr,
          token: TOKEN_ID,
          tokenLabel: TOKEN_LABEL,
          live: true,
          fetchedAt: last.fetchedAt,
        });
      }
    }
  } catch {}
  if (last.ts) {
    last.live = false;
    last.fetchedAt = new Date().toLocaleTimeString("en-IN", { hour12: false });
    last.ts = now;
  } else {
    last = {
      price: DEFAULT_CREDIT_PRICE_INR,
      live: false,
      fetchedAt: new Date().toLocaleTimeString("en-IN", { hour12: false }),
      ts: now,
    };
  }
  return NextResponse.json({
    price: last.price,
    token: TOKEN_ID,
    tokenLabel: TOKEN_LABEL,
    live: last.live,
    fetchedAt: last.fetchedAt,
  });
}