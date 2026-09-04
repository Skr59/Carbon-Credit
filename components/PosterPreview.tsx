"use client";

import React, { forwardRef, useEffect, useState } from "react";
import { PropertyData } from "./InputPanel";
import {
  Phone,
  ShieldCheck,
  MapPin,
  BadgeCheck,
  QrCode,
  Globe,
  Star,
} from "lucide-react";
import QRCode from "qrcode";

export type ListingType = "buy" | "rent" | "sell" | "agent";
export type Platform = "whatsapp" | "instagram" | "facebook";

interface PosterPreviewProps {
  data: PropertyData;
  userName?: string;
  image?: string;
  listingType?: ListingType;
  platform?: Platform;
}

const POSTER_BG =
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80&auto=format&fit=crop";

const PLATFORM_SIZE: Record<Platform, { w: number; h: number; label: string }> = {
  whatsapp: { w: 480, h: 853, label: "WhatsApp Status" },
  instagram: { w: 480, h: 480, label: "Instagram Post" },
  facebook: { w: 480, h: 600, label: "Facebook Post" },
};

const TYPE_META: Record<ListingType, { label: string; badgeClass: string }> = {
  buy: { label: "For Sale", badgeClass: "bg-emerald-500 text-white" },
  rent: { label: "For Rent", badgeClass: "bg-sky-500 text-white" },
  sell: { label: "Selling Property", badgeClass: "bg-rose-500 text-white" },
  agent: { label: "Top Rated Agent", badgeClass: "bg-amber-500 text-stone-900" },
};

const PRICE_LABEL: Record<ListingType, string> = {
  buy: "Asking Price",
  rent: "Rent / Month",
  sell: "Expected Price",
  agent: "",
};

const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "A";

const PosterPreview = forwardRef<HTMLDivElement, PosterPreviewProps>(
  (
    {
      data,
      userName = "Shivam Kumar",
      image = "",
      listingType = "buy",
      platform = "instagram",
    },
    ref
  ) => {
    const highlightList = data.highlights
      ? data.highlights.split("·").map((h) => h.trim()).filter(Boolean)
      : [];

    const { w, h } = PLATFORM_SIZE[platform];
    const typeMeta = TYPE_META[listingType];
    const isAgent = listingType === "agent";

    const qrText = isAgent
      ? "Chat with Shivam Kumar - Senior Consultant Apex Estates Luxury Realty, Lucknow | WhatsApp: wa.me/919876543210"
      : `${typeMeta.label.toUpperCase()} · ${data.title} · ${
          data.location
        } · ${data.price} · Contact: +91 98765 43210 · www.apexestates.com`;

    const [qr, setQr] = useState<string>("");
    const [tilt, setTilt] = useState({ x: 0, y: 0 });

    useEffect(() => {
      let alive = true;
      QRCode.toDataURL(qrText, {
        width: 160,
        margin: 1,
        errorCorrectionLevel: "M",
        color: { dark: "#0a3a40", light: "#ffffff" },
      })
        .then((url) => {
          if (alive) setQr(url);
        })
        .catch(() => {});
      return () => {
        alive = false;
      };
    }, [qrText]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setTilt({ x: y * -12, y: x * 12 });
    };

    const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

    return (
      <div
        className="flex flex-col items-center justify-center w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div style={{ perspective: 1000 }}>
          <div
            style={{
              transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transition: "transform 0.15s ease-out",
              transformStyle: "preserve-3d",
            }}
          >
            <div
              ref={ref}
              className="text-white relative overflow-hidden rounded-none shadow-2xl shrink-0 flex flex-col justify-between"
              style={{ width: w, height: h }}
            >
          {/* Background */}
          <img
            src={image || POSTER_BG}
            alt="Luxury property"
            className="absolute inset-0 w-full h-full object-cover"
            crossOrigin="anonymous"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/35 to-black/90" />
          <div
            className={`absolute inset-0 ${
              isAgent
                ? "bg-gradient-to-tr from-black/60 via-estate-900/40 to-transparent"
                : "bg-gradient-to-tr from-estate-900/40 via-transparent to-amber-400/20"
            }`}
          />

          {/* Header Brand Strip */}
          <div className="relative z-10 flex justify-between items-center px-6 pt-6">
            <div className="flex items-center gap-2.5 bg-black/40 backdrop-blur-sm rounded-2xl border border-white/15 py-2 pr-4 pl-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-200 flex items-center justify-center text-estate-900 font-black text-base shadow-lg">
                A
              </div>
              <div>
                <h1 className="font-extrabold tracking-wide text-sm uppercase text-amber-300 leading-none">
                  Apex Estates
                </h1>
                <p className="text-[9px] text-white/70 tracking-[0.2em] uppercase mt-0.5">
                  Luxury Living Defined
                </p>
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-md uppercase tracking-wider ${typeMeta.badgeClass}`}
            >
              <BadgeCheck className="w-3 h-3" /> {typeMeta.label}
            </span>
          </div>

          {isAgent ? (
            /* ================= AGENT POSTER ================= */
            <div className="relative z-10 px-6 my-auto">
              <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-[104px] h-[104px] rounded-full p-[4px] bg-gradient-to-tr from-amber-400 via-amber-300 to-amber-500 shadow-2xl shadow-amber-500/30">
                    <div className="w-full h-full rounded-full bg-estate-800 flex items-center justify-center text-4xl font-black text-amber-300">
                      {initialsOf(userName)}
                    </div>
                  </div>
                  <span className="absolute -bottom-1 -right-1 bg-emerald-500 w-7 h-7 rounded-full border-[3px] border-white flex items-center justify-center">
                    <BadgeCheck className="w-4 h-4 text-white" />
                  </span>
                </div>

                <h2 className="mt-4 text-[30px] font-black leading-tight text-shadow">
                  {userName}
                </h2>
                <p className="mt-1 text-sm font-semibold text-amber-300 uppercase tracking-widest text-shadow">
                  Senior Luxury Real Estate Consultant
                </p>

                <div className="mt-3 flex items-center gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="mt-1 text-xs text-white/80 font-medium text-shadow">
                  4.9 Rating · 500+ Happy Clients · Trusted Since 2009
                </p>

                <div className="mt-2 inline-flex items-center gap-1.5 bg-black/35 backdrop-blur-sm border border-white/25 text-[11px] font-semibold px-3 py-1.5 rounded-full">
                  <MapPin className="w-3 h-3 text-amber-300" /> Lucknow, UP ·
                  Serving All India
                </div>

                {/* Agent CTA chips */}
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <span className="bg-black/35 backdrop-blur-sm border border-white/25 text-[11px] px-3 py-1 rounded-full font-medium">
                    Buy
                  </span>
                  <span className="bg-black/35 backdrop-blur-sm border border-white/25 text-[11px] px-3 py-1 rounded-full font-medium">
                    Rent
                  </span>
                  <span className="bg-black/35 backdrop-blur-sm border border-white/25 text-[11px] px-3 py-1 rounded-full font-medium">
                    Sell
                  </span>
                  <span className="bg-black/35 backdrop-blur-sm border border-white/25 text-[11px] px-3 py-1 rounded-full font-medium">
                    Investment
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* ================= PROPERTY POSTER (Buy / Rent / Sell) ================= */
            <div className="relative z-10 px-6 my-auto space-y-3">
              <div className="inline-flex items-center gap-1.5 bg-estate-500/25 backdrop-blur-sm border border-white/20 text-[11px] font-semibold px-3 py-1.5 rounded-full">
                <MapPin className="w-3 h-3 text-amber-300" />
                {data.location || "Location City"}
              </div>

              <h2 className="text-[26px] font-extrabold leading-tight text-shadow">
                {data.title || "Property Title"}
              </h2>

              {listingType === "sell" && (
                <p className="text-sm font-semibold text-amber-300 text-shadow">
                  Get the Best Price for Your Property — Expert Guidance
                </p>
              )}

              {highlightList.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {highlightList.map((item, index) => (
                    <span
                      key={index}
                      className="bg-black/35 backdrop-blur-sm border border-white/25 text-white text-[11px] px-3 py-1 rounded-full font-medium shadow"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= FOOTER ================= */}
          <div className="relative z-10 px-6 pb-6 space-y-2.5">
            {!isAgent && (
              <div className="bg-black/40 backdrop-blur-sm border border-white/15 rounded-2xl px-4 py-2.5">
                <span className="text-[9px] text-amber-300 uppercase tracking-[0.2em] font-semibold block leading-none">
                  {PRICE_LABEL[listingType]}
                </span>
                <span className="text-[26px] lg:text-[30px] font-black leading-tight bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent break-words">
                  {data.price || "Price Details"}
                </span>
              </div>
            )}

            {/* Contact + QR Row */}
            <div className="flex items-center justify-between gap-3 bg-black/45 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-3">
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="inline-flex items-center gap-1.5 text-[11px] text-white/90 font-medium">
                  <Phone className="w-3 h-3 text-amber-300 shrink-0" /> +91
                  98765 43210
                </div>
                {isAgent ? (
                  <div className="inline-flex items-center gap-1.5 text-[11px] text-white/90 font-medium">
                    <BadgeCheck className="w-3 h-3 text-amber-300 shrink-0" />{" "}
                    RERA-Registered Expert
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 text-[11px] text-white/90 font-medium">
                    <Globe className="w-3 h-3 text-amber-300 shrink-0" />{" "}
                    apexestates.com
                  </div>
                )}
                <div className="inline-flex items-center gap-1.5 text-[11px] text-white/90 font-medium">
                  <QrCode className="w-3 h-3 text-amber-300 shrink-0" />{" "}
                  {isAgent ? "Scan karein chat ke liye" : "Scan karein details ke liye"}
                </div>
              </div>

              {/* QR Code */}
              <div className="shrink-0 flex flex-col items-center gap-1">
                <div className="bg-white rounded-xl p-1 shadow-lg">
                  {qr ? (
                    <img
                      src={qr}
                      alt="Listing QR code"
                      className="w-[64px] h-[64px] object-contain"
                    />
                  ) : (
                    <div className="w-[64px] h-[64px] animate-pulse bg-stone-200 rounded-lg" />
                  )}
                </div>
                <span className="text-[8px] uppercase tracking-widest text-white/70 font-semibold">
                  Scan Me
                </span>
              </div>
            </div>

            {/* Sell CTA strip */}
            {listingType === "sell" && (
              <div className="flex items-center justify-center gap-2 bg-rose-500/90 rounded-xl py-2 text-[12px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" /> Sell Your Property — 100%
                Verified Buyers
              </div>
            )}

            {/* Mandatory Watermark / Credit */}
            <div className="flex justify-between items-center text-[9px] text-white/60 tracking-wider uppercase">
              <span className="inline-flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3 h-3 text-estate-300" /> Apex Estates
                Realty · RERA LG-09/2019
              </span>
              <span className="font-semibold text-white/80">
                Built by <span className="text-amber-300">{userName}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
  }
);

PosterPreview.displayName = "PosterPreview";
export default PosterPreview;