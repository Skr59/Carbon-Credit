# Lucknow Location Property Post Maker - High Application (Login + Interior + AI) — Complete Source Code

---

## app/page.tsx
``app/page.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import InputPanel, {
  PropertyData,
  InteriorDesign,
  INTERIOR_IMAGES,
} from "@/components/InputPanel";
import PosterPreview, {
  ListingType,
  Platform,
} from "@/components/PosterPreview";
import LoginScreen, { hasSession, logout } from "@/components/LoginScreen";
import AICopilot from "@/components/AICopilot";
import { toPng } from "html-to-image";
import {
  Building2,
  Phone,
  Home as HomeIcon,
  MapPin,
  Download,
  Sparkles,
  ArrowRight,
  Heart,
  Star,
  BadgeCheck,
  BedDouble,
  Bath,
  Ruler,
  Menu,
  LogOut,
} from "lucide-react";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=80&auto=format&fit=crop";

const FEATURED = [
  {
    img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80&auto=format&fit=crop",
    title: "Emerald Heights Villas",
    location: "Sushant Golf City, Lucknow",
    price: "â‚¹2.5 Cr",
    beds: "4",
    baths: "5",
    area: "3000 sq.ft",
  },
  {
    img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80&auto=format&fit=crop",
    title: "The Ivory Residences",
    location: "Gomti Nagar, Lucknow",
    price: "â‚¹4.8 Cr",
    beds: "5",
    baths: "6",
    area: "4500 sq.ft",
  },
  {
    img: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80&auto=format&fit=crop",
    title: "Skyline Luxury Apartments",
    location: "Hazratganj, Lucknow",
    price: "â‚¹1.2 Cr",
    beds: "3",
    baths: "3",
    area: "1950 sq.ft",
  },
];

export default function Home() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    setAuthed(hasSession());
  }, []);

  const [propertyData, setPropertyData] = useState<PropertyData>({
    title: "4 BHK Luxury Villa, Ansal Golf City",
    location: "Sushant Golf City, Lucknow",
    price: "â‚¹2.5 Cr onwards",
    highlights: "3000 sq.ft Â· Corner plot Â· Ready to move",
  });

  const [isExporting, setIsExporting] = useState(false);
  const [bgImage, setBgImage] = useState<string>(
    INTERIOR_IMAGES.modern
  );
  const [interior, setInterior] = useState<InteriorDesign>("modern");
  const [listingType, setListingType] = useState<ListingType>("buy");
  const [platform, setPlatform] = useState<Platform>("instagram");
  const posterRef = useRef<HTMLDivElement>(null);

  const handleAISubmit = (
    data: PropertyData,
    aiListingType: ListingType
  ) => {
    setPropertyData(data);
    setListingType(aiListingType);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!authed) {
    return <LoginScreen onLogin={() => setAuthed(true)} />;
  }

  const handleDownloadPNG = async () => {
    if (!posterRef.current) return;
    try {
      setIsExporting(true);
      const dataUrl = await toPng(posterRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        quality: 0.95,
      });
      const link = document.createElement("a");
      link.download = `apex-realty-post-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      triggerConfetti();
    } catch (error) {
      console.error("Failed to generate PNG image:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const triggerConfetti = () => {
    const colors = ["#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#8b5cf6", "#ec4899"];
    for (let i = 0; i < 40; i++) {
      const el = document.createElement("div");
      el.className = "confetti-piece";
      el.style.left = `${50 + (Math.random() - 0.5) * 60}%`;
      el.style.setProperty("--drift", `${(Math.random() - 0.5) * 200}px`);
      el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      el.style.animationDuration = `${1.2 + Math.random() * 1.8}s`;
      el.style.animationDelay = `${Math.random() * 0.4}s`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3500);
    }
  };

  const [copied, setCopied] = useState(false);
  const copyPropertyText = async () => {
    const text = `ðŸ  ${propertyData.title}\nðŸ“ ${propertyData.location}\nðŸ’° ${propertyData.price}\nâœ¨ ${propertyData.highlights}\n\nðŸ“ž +91 98765 43210\nðŸŒ www.apexestates.com\n\n#ApexEstates #PropertyForSale #LucknowRealEstate #LuxuryHomes`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 flex flex-col selection:bg-amber-400 selection:text-stone-900">
      {/* ================= Top Bar ================= */}
      <div className="bg-estate-900 text-estate-100 text-xs py-2 px-6 hidden sm:flex justify-between items-center">
        <div className="flex items-center gap-6">
          <span className="inline-flex items-center gap-1.5">
            <Phone className="w-3 h-3 text-amber-300" /> +91 98765 43210
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-amber-300" /> Lucknow, UP, India
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 font-semibold">
          <BadgeCheck className="w-3 h-3 text-amber-300" /> RERA Registered Â·
          Trusted Since 2009
        </span>
      </div>

      {/* ================= Navbar ================= */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
          <a href="#home" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-estate-600 to-estate-400 flex items-center justify-center shadow-lg shadow-estate-500/25">
              <HomeIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-black text-lg leading-none text-estate-800">
                Apex <span className="text-amber-500">Estates</span>
              </p>
              <p className="text-[9px] uppercase tracking-[0.25em] text-stone-400">
                Realty Â· Luxury Living
              </p>
            </div>
          </a>

          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-stone-600">
            {["Home", "Buy", "Rent", "Sell", "Projects", "Agents"].map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                className="hover:text-estate-600 transition-colors"
              >
                {l}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#maker"
              className="hidden md:inline-flex items-center gap-2 bg-estate-600 hover:bg-estate-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-estate-500/25 transition-all hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4 text-amber-300" /> Post Maker
            </a>
            <button className="lg:hidden p-2 text-stone-600">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* ================= Hero Section ================= */}
      <section
        id="home"
        className="relative min-h-[78vh] flex items-center overflow-hidden"
      >
        <img
          src={HERO_IMAGE}
          alt="Luxury villa"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-estate-950/90 via-estate-950/60 to-black/30" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-estate-950/70 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-16 text-white">
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest">
            <Star className="w-3.5 h-3.5 fill-amber-300" /> Luxury Real Estate Â·
            Lucknow
          </span>

          <h1 className="mt-6 text-4xl md:text-6xl font-black leading-tight max-w-3xl text-shadow">
            Find Your Dream
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
              {" "}
              Home{" "}
            </span>
            With Apex Estates
          </h1>
          <p className="mt-5 max-w-xl text-estate-100 text-base md:text-lg text-shadow">
            Curated luxury villas, apartments aur commercial spaces â€” sab kuch
            ek trusted platform par. Verified listings, transparent pricing.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-8">
            <div>
              <p className="text-3xl font-black text-amber-400">500+</p>
              <p className="text-xs text-white/70 uppercase tracking-wider">
                Properties Listed
              </p>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div>
              <p className="text-3xl font-black text-amber-400">4.9â˜…</p>
              <p className="text-xs text-white/70 uppercase tracking-wider">
                Client Rating
              </p>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div>
              <p className="text-3xl font-black text-amber-400">2.4k+</p>
              <p className="text-xs text-white/70 uppercase tracking-wider">
                Happy Families
              </p>
            </div>
          </div>

          <a
            href="#maker"
            className="mt-10 inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-stone-900 font-extrabold px-7 py-3.5 rounded-2xl shadow-xl shadow-amber-500/30 transition-all hover:-translate-y-0.5"
          >
            Make Your Property Post <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* ================= Post Maker Section ================= */}
      <section id="maker" className="py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Section Heading */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-flex items-center gap-2 text-estate-600 bg-estate-50 border border-estate-100 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" /> Free Tool
            </span>
            <h2 className="mt-4 text-3xl md:text-4xl font-black text-estate-900">
              Property Post Maker
            </h2>
            <p className="mt-3 text-stone-500">
              4 details bharo â€” logo, branding aur contact apne aap add ho jata
              hai. Ready-to-share social post download karo.
            </p>
          </div>

          {/* Two-Column: Form + Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Form */}
            <div className="lg:col-span-5">
              <InputPanel
                data={propertyData}
                onChange={setPropertyData}
                image={bgImage}
                onImageChange={setBgImage}
                onDownload={handleDownloadPNG}
                isDownloading={isExporting}
                interior={interior}
                onInteriorChange={setInterior}
              />
            </div>

            {/* Right: Live Preview */}
            <div className="lg:col-span-7">
              <div className="bg-gradient-to-br from-estate-800 via-estate-900 to-stone-900 rounded-3xl p-5 md:p-8 border border-estate-700/50 shadow-2xl flex flex-col items-center justify-center space-y-5">
                {/* Type + Platform Selectors */}
                <div className="w-full max-w-[480px] flex flex-wrap items-center justify-between gap-3">
                  {/* Listing Type */}
                  <div className="flex items-center gap-1 bg-white/10 border border-white/10 rounded-xl p-1">
                    {(
                      [
                        { key: "buy", label: "Buy" },
                        { key: "rent", label: "Rent" },
                        { key: "sell", label: "Sell" },
                        { key: "agent", label: "Agents" },
                      ] as { key: ListingType; label: string }[]
                    ).map((t) => (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setListingType(t.key)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          listingType === t.key
                            ? "bg-gradient-to-r from-amber-400 to-amber-500 text-stone-900 shadow"
                            : "text-estate-100 hover:text-white"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Platform */}
                  <div className="flex items-center gap-1 bg-white/10 border border-white/10 rounded-xl p-1">
                    {(
                      [
                        { key: "whatsapp", label: "WhatsApp" },
                        { key: "instagram", label: "Instagram" },
                        { key: "facebook", label: "Facebook" },
                      ] as { key: Platform; label: string }[]
                    ).map((p) => (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => setPlatform(p.key)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          platform === p.key
                            ? "bg-gradient-to-r from-amber-400 to-amber-500 text-stone-900 shadow"
                            : "text-estate-100 hover:text-white"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between w-full max-w-[480px]">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-estate-100 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Live Canvas Preview
                  </span>
                  <span className="text-[10px] text-estate-300 font-mono bg-white/10 border border-white/10 px-2 py-1 rounded-md">
                    {platform === "whatsapp"
                      ? "1080 Ã— 1920 (9:16) Â· PNG"
                      : platform === "facebook"
                      ? "1080 Ã— 1350 (4:5) Â· PNG"
                      : "1080 Ã— 1080 (1:1) Â· PNG"}
                  </span>
                </div>

                <div className="w-full overflow-hidden flex justify-center items-center py-2 min-h-[614px] md:min-h-[768px] lg:min-h-[853px] rounded-2xl bg-gradient-to-br from-estate-900/30 via-amber-400/5 to-emerald-400/5 relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/5 via-transparent to-emerald-400/5 animate-gradient-shift pointer-events-none" />
                  <div className="transform transition-transform duration-300 ease-in-out origin-top flex items-center justify-center scale-[0.72] md:scale-90 lg:scale-100 relative z-10">
                    <PosterPreview
                      ref={posterRef}
                      data={propertyData}
                      userName="Shivam Kumar"
                      image={bgImage}
                      listingType={listingType}
                      platform={platform}
                    />
                  </div>
                </div>

                <div className="w-full max-w-[480px] space-y-2">
                  <button
                    onClick={handleDownloadPNG}
                    disabled={isExporting}
                    className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 p-[2px] font-extrabold text-stone-900 shadow-xl shadow-amber-500/20 transition-all duration-300 hover:shadow-amber-500/40 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 py-4 px-6 transition-all duration-300 group-hover:brightness-110">
                      <Download
                        className={`w-5 h-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110 ${
                          isExporting ? "animate-bounce" : ""
                        }`}
                      />
                      <span className="tracking-wide">
                        {isExporting
                          ? "Generating High-Res PNG..."
                          : `Download for ${platform.toUpperCase()} (PNG)`}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={copyPropertyText}
                    className="w-full rounded-2xl border-2 border-emerald-400/30 bg-emerald-500/10 py-3 px-6 text-sm font-semibold text-emerald-300 transition-all duration-200 hover:bg-emerald-500/20 hover:border-emerald-400/50 active:scale-[0.98]"
                  >
                    {copied ? "âœ“ Copied to clipboard!" : "ðŸ“‹ Copy Property Text for WhatsApp"}
                  </button>
                  <p className="text-center text-[10px] text-estate-300">
                    Logo Â· Contact Â· QR Auto-included Â· "Built by Shivam Kumar"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Featured Properties ================= */}
      <section id="projects" className="py-14 md:py-20 bg-white border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-estate-600 text-xs font-bold uppercase tracking-widest">
                Featured Projects
              </span>
              <h2 className="mt-2 text-3xl md:text-4xl font-black text-estate-900">
                Trending Properties
              </h2>
            </div>
            <a
              href="#maker"
              className="inline-flex items-center gap-1.5 text-estate-600 font-bold text-sm hover:gap-2.5 transition-all"
            >
              Post banao iski copy <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED.map((p) => (
              <div
                key={p.title}
                className="group bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={p.img}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute top-4 left-4 bg-white/90 backdrop-blur text-estate-800 text-xs font-black px-3 py-1.5 rounded-full">
                    {p.price}
                  </span>
                  <button className="absolute top-4 right-4 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                    <Heart className="w-4 h-4 text-rose-500" />
                  </button>
                  <span className="absolute bottom-4 left-4 inline-flex items-center gap-1 text-white text-xs font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-amber-300" />
                    {p.location}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-extrabold text-lg text-estate-900">
                    {p.title}
                  </h3>
                  <div className="mt-3 flex items-center gap-4 text-xs text-stone-500 font-medium">
                    <span className="inline-flex items-center gap-1">
                      <BedDouble className="w-4 h-4 text-estate-500" /> {p.beds}{" "}BHK
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Bath className="w-4 h-4 text-estate-500" /> {p.baths}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Ruler className="w-4 h-4 text-estate-500" /> {p.area}
                    </span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-base font-black text-estate-700">
                      {p.price}
                    </span>
                    <a
                      href="#maker"
                      className="inline-flex items-center gap-1 text-xs font-bold text-estate-600 hover:text-amber-500 transition-colors"
                    >
                      Make Post <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA Banner ================= */}
      <section className="py-14 md:py-20 bg-gradient-to-br from-estate-700 via-estate-800 to-estate-900">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center text-white">
          <span className="inline-flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-widest">
            <Building2 className="w-4 h-4" /> Apex Estates Â· RERA LG-09/2019
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-black leading-tight">
            Banaoye Apna Professional Property Post, Free mein
          </h2>
          <p className="mt-4 text-estate-100 max-w-xl mx-auto">
            Seconds mein logo + contact ke saath ready-to-share creative banakar
            WhatsApp, Instagram ya Facebook par post karein.
          </p>
          <a
            href="#maker"
            className="mt-7 inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-stone-900 font-extrabold px-8 py-4 rounded-2xl shadow-xl shadow-amber-500/30 transition-all hover:-translate-y-0.5"
          >
            <Sparkles className="w-5 h-5" /> Start Creating Now
          </a>
        </div>
      </section>

      {/* ================= Footer ================= */}
      <footer className="bg-estate-950 text-estate-200 pt-12 pb-6">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-estate-500 to-estate-400 flex items-center justify-center">
                  <HomeIcon className="w-4 h-4 text-white" />
                </div>
                <p className="font-black text-lg text-white">
                  Apex <span className="text-amber-500">Estates</span>
                </p>
              </div>
              <p className="mt-3 text-sm text-estate-300">
                Luxury Living Defined. Verified listings, honest deals â€” since
                2009.
              </p>
            </div>
            <div>
              <p className="font-bold text-white mb-3">Quick Links</p>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#home" className="hover:text-amber-400 transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#maker" className="hover:text-amber-400 transition-colors">
                    Property Post Maker
                  </a>
                </li>
                <li>
                  <a href="#projects" className="hover:text-amber-400 transition-colors">
                    Featured Projects
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-white mb-3">Contact</p>
              <ul className="space-y-2 text-sm">
                <li className="inline-flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-400" /> +91 98765 43210
                </li>
                <li className="inline-flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400" /> Sushant Golf
                  City, Lucknow
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-5 border-t border-estate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-estate-400">
            <span>Â© 2026 Apex Estates. All rights reserved.</span>
            <span className="inline-flex items-center gap-1 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Built by{" "}
              <span className="text-amber-400 font-bold">Shivam Kumar</span> Â·
              MLH Claude Intern
            </span>
          </div>
        </div>
      </footer>

      {/* Floating AI Assistant */}
      <AICopilot onApply={handleAISubmit} />

      {/* Logout floating button */}
      <button
        onClick={() => {
          logout();
          setAuthed(false);
        }}
        title="Logout"
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-stone-900/80 hover:bg-stone-800 text-white font-bold px-4 py-3 rounded-2xl shadow-2xl transition-all hover:-translate-y-0.5"
      >
        <LogOut className="w-5 h-5 text-amber-300" />
        <span className="text-sm">Logout</span>
      </button>
    </div>
  );
}

``

---

## app/globals.css
``app/globals.css
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap");
@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  scroll-behavior: smooth;
}

body {
  font-family: "Poppins", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, sans-serif;
  background-color: #fafaf9;
  color: #1c1917;
}

.text-shadow {
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.45);
}

.confetti-piece {
  position: fixed;
  top: -10px;
  width: 8px;
  height: 14px;
  border-radius: 2px;
  z-index: 9999;
  pointer-events: none;
  animation: confetti-fall 2.5s ease-in forwards;
}

@keyframes confetti-fall {
  0% {
    transform: translateY(0) translateX(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) translateX(var(--drift, 50px)) rotate(720deg);
    opacity: 0;
  }
}

@keyframes gradient-shift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.animate-gradient-shift {
  background-size: 200% 200%;
  animation: gradient-shift 4s ease infinite;
}
``

---

## app/layout.tsx
``app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Property Post Maker | MLH Claude Intern Task",
  description:
    "Generate and export real-estate property post creatives instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
``

---

## components/InputPanel.tsx
``components/InputPanel.tsx
"use client";

import React, { useRef } from "react";
import {
  Building2,
  MapPin,
  Tag,
  Sparkles,
  Wand2,
  Camera,
  Image as ImageIcon,
  Upload,
  Link2,
} from "lucide-react";

export interface PropertyData {
  title: string;
  location: string;
  price: string;
  highlights: string;
}

export type InteriorDesign =
  | "modern"
  | "minimalist"
  | "industrial"
  | "classic"
  | "coastal";

export const INTERIOR_IMAGES: Record<InteriorDesign, string> = {
  modern:
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80&auto=format&fit=crop",
  minimalist:
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80&auto=format&fit=crop",
  industrial:
    "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200&q=80&auto=format&fit=crop",
  classic:
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80&auto=format&fit=crop",
  coastal:
    "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200&q=80&auto=format&fit=crop",
};

const INTERIOR_LIST: { key: InteriorDesign; label: string }[] = [
  { key: "modern", label: "Modern" },
  { key: "minimalist", label: "Minimalist" },
  { key: "industrial", label: "Industrial" },
  { key: "classic", label: "Classic" },
  { key: "coastal", label: "Coastal" },
];

const PRESET_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80&auto=format&fit=crop",
    label: "Luxury Villa",
  },
  {
    url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80&auto=format&fit=crop",
    label: "Modern Home",
  },
  {
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80&auto=format&fit=crop",
    label: "Evening Villa",
  },
  {
    url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80&auto=format&fit=crop",
    label: "Pool Villa",
  },
  {
    url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80&auto=format&fit=crop",
    label: "Living Room",
  },
  {
    url: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=1200&q=80&auto=format&fit=crop",
    label: "Classic House",
  },
  {
    url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80&auto=format&fit=crop",
    label: "Bungalow",
  },
  {
    url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&q=80&auto=format&fit=crop",
    label: "White Home",
  },
];

interface InputPanelProps {
  data: PropertyData;
  onChange: (data: PropertyData) => void;
  image?: string;
  onImageChange?: (url: string) => void;
  onDownload?: () => void;
  isDownloading?: boolean;
  interior?: InteriorDesign;
  onInteriorChange?: (d: InteriorDesign) => void;
}

export default function InputPanel({
  data,
  onChange,
  image,
  onImageChange,
  onDownload,
  isDownloading = false,
  interior = "modern",
  onInteriorChange,
}: InputPanelProps) {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    onChange({
      ...data,
      [name]: value,
    });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImageChange) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onImageChange(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const fields = [
    {
      name: "title",
      label: "Property & Type",
      placeholder: "e.g. 4 BHK Luxury Villa, Ansal Golf City",
      icon: Building2,
      rows: undefined as number | undefined,
    },
    {
      name: "location",
      label: "Location",
      placeholder: "e.g. Sushant Golf City, Lucknow",
      icon: MapPin,
      rows: undefined as number | undefined,
    },
    {
      name: "price",
      label: "Price",
      placeholder: "e.g. â‚¹2.5 Cr onwards",
      icon: Tag,
      rows: undefined as number | undefined,
    },
  ];

  return (
    <div className="bg-white border border-stone-200 shadow-xl shadow-estate-900/5 rounded-3xl overflow-hidden flex flex-col justify-between h-full">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-estate-700 via-estate-600 to-estate-500 p-5">
        <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
            <Wand2 className="w-4 h-4 text-amber-300" />
          </span>
          Create Your Property Post
        </h2>
        <p className="text-xs text-estate-100 mt-1.5">
          Fill the 4 details â€” logo, branding aur contact automatically add honge
        </p>
      </div>

      {/* Form Fields */}
      <div className="p-5 space-y-4">
        {fields.map((f) => (
          <div key={f.name}>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
              {f.label}
            </label>
            <div className="relative">
              <f.icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-estate-500" />
              <input
                type="text"
                name={f.name}
                value={data[f.name as keyof PropertyData]}
                onChange={handleChange}
                placeholder={f.placeholder}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-estate-500 focus:ring-2 focus:ring-estate-500/20 focus:bg-white transition"
              />
            </div>
          </div>
        ))}

        {/* House Image Picker */}
        {/* Interior Design Type */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5 flex items-center justify-between">
            <span className="inline-flex items-center gap-1">
              <Wand2 className="w-3.5 h-3.5 text-estate-500" /> Interior Design
            </span>
            <span className="uppercase text-[9px] font-semibold text-stone-400">
              Style choose karo
            </span>
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {INTERIOR_LIST.map((d) => (
              <button
                key={d.key}
                type="button"
                onClick={() => {
                  onInteriorChange?.(d.key);
                  onImageChange?.(INTERIOR_IMAGES[d.key]);
                }}
                className={`relative rounded-xl overflow-hidden border-2 aspect-[3/4] transition-all ${
                  interior === d.key
                    ? "border-amber-500 ring-2 ring-amber-500/40"
                    : "border-stone-200 hover:border-estate-400"
                }`}
              >
                <img
                  src={INTERIOR_IMAGES[d.key]}
                  alt={d.label}
                  className="w-full h-full object-cover"
                />
                <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[8px] font-bold py-1 text-center">
                  {d.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5 flex items-center justify-between">
            <span className="inline-flex items-center gap-1">
              <Camera className="w-3.5 h-3.5 text-estate-500" /> House Image
            </span>
            <span className="uppercase text-[9px] font-semibold text-stone-400">
              Photo choose karo
            </span>
          </label>

          {/* Preset Gallery */}
          <div className="grid grid-cols-4 gap-2">
            {PRESET_IMAGES.map((p) => (
              <button
                key={p.url}
                type="button"
                onClick={() => onImageChange?.(p.url)}
                title={p.label}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all group ${
                  image === p.url
                    ? "border-amber-500 ring-2 ring-amber-500/40"
                    : "border-stone-200 hover:border-estate-400"
                }`}
              >
                <img
                  src={p.url}
                  alt={p.label}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {image === p.url && (
                  <span className="absolute inset-0 bg-amber-500/25 flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-white drop-shadow" />
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="mt-2.5 flex items-center gap-2">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
              <input
                type="url"
                defaultValue={image && !image.startsWith("data:") ? image : ""}
                placeholder="Image URL paste karo..."
                onChange={(e) =>
                  e.target.value.trim() && onImageChange?.(e.target.value.trim())
                }
                className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 pl-9 pr-3 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-estate-500 focus:ring-2 focus:ring-estate-500/20 transition"
              />
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 bg-stone-900 hover:bg-estate-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all active:scale-95"
            >
              <Upload className="w-3.5 h-3.5" /> Upload
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </div>

        {/* Field 4: Highlights */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
            4. Highlights
          </label>
          <div className="relative">
            <Sparkles className="absolute left-3.5 top-3 w-4 h-4 text-estate-500" />
            <textarea
              name="highlights"
              rows={3}
              value={data.highlights}
              onChange={handleChange}
              placeholder="e.g. 3000 sq.ft Â· Corner plot Â· Ready to move"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-estate-500 focus:ring-2 focus:ring-estate-500/20 focus:bg-white transition resize-none"
            />
          </div>
          <p className="text-[10px] text-stone-400 mt-1">
            Dots (Â·) se separate karein â€” har dot ek tag/chip banega
          </p>
        </div>
      </div>

      {/* Download Button */}
      {onDownload && (
        <div className="p-5 pt-0">
          <button
            onClick={onDownload}
            disabled={isDownloading}
            className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 font-extrabold text-stone-900 py-3.5 shadow-lg shadow-amber-500/25 transition-all duration-300 hover:shadow-amber-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span className="relative flex items-center justify-center gap-2">
              <Wand2
                className={`w-5 h-5 transition-transform duration-300 group-hover:rotate-12 ${
                  isDownloading ? "animate-spin" : ""
                }`}
              />
              {isDownloading
                ? "Generating High-Res PNG..."
                : "Download Ready-to-Share Post (PNG)"}
            </span>
          </button>
          <p className="text-center text-[10px] text-stone-400 mt-2">
            1080 Ã— 1080 Â· High Resolution Â· Apex Estates branding included
          </p>
        </div>
      )}
    </div>
  );
}
``

---

## components/PosterPreview.tsx
``components/PosterPreview.tsx
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
      ? data.highlights.split("Â·").map((h) => h.trim()).filter(Boolean)
      : [];

    const { w, h } = PLATFORM_SIZE[platform];
    const typeMeta = TYPE_META[listingType];
    const isAgent = listingType === "agent";

    const qrText = isAgent
      ? "Chat with Shivam Kumar - Senior Consultant Apex Estates Luxury Realty, Lucknow | WhatsApp: wa.me/919876543210"
      : `${typeMeta.label.toUpperCase()} Â· ${data.title} Â· ${
          data.location
        } Â· ${data.price} Â· Contact: +91 98765 43210 Â· www.apexestates.com`;

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
                  4.9 Rating Â· 500+ Happy Clients Â· Trusted Since 2009
                </p>

                <div className="mt-2 inline-flex items-center gap-1.5 bg-black/35 backdrop-blur-sm border border-white/25 text-[11px] font-semibold px-3 py-1.5 rounded-full">
                  <MapPin className="w-3 h-3 text-amber-300" /> Lucknow, UP Â·
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
                  Get the Best Price for Your Property â€” Expert Guidance
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
                <ShieldCheck className="w-3.5 h-3.5" /> Sell Your Property â€” 100%
                Verified Buyers
              </div>
            )}

            {/* Mandatory Watermark / Credit */}
            <div className="flex justify-between items-center text-[9px] text-white/60 tracking-wider uppercase">
              <span className="inline-flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3 h-3 text-estate-300" /> Apex Estates
                Realty Â· RERA LG-09/2019
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
``

---

## components/LoginScreen.tsx
``components/LoginScreen.tsx
"use client";

import React, { useState } from "react";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  Home as HomeIcon,
  LogOut,
  BadgeCheck,
  ShieldCheck,
} from "lucide-react";

const DEMO_PASSWORD = "apex123";
const STORAGE_KEY = "apex-auth";

interface LoginScreenProps {
  onLogin: () => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "signup") {
      if (!name.trim() || !email.includes("@")) {
        setError("Please enter a valid name and email address.");
        return;
      }
      if (password.length < 4) {
        setError("Password must be at least 4 characters.");
        return;
      }
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ name: name.trim(), email, registered: true })
      );
      onLogin();
      return;
    }

    if (password !== DEMO_PASSWORD) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setError("Incorrect password. Hint: demo password is `apex123`");
      }, 600);
      return;
    }
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ name: "Shivam Kumar", email, registered: true })
    );
    onLogin();
  };

  const background =
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=80&auto=format&fit=crop";

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-estate-950">
      <img
        src={background}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-estate-950/95 via-estate-900/90 to-black/80" />

      <div className="relative z-10 w-full max-w-md px-4 py-10">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-estate-600 to-estate-400 flex items-center justify-center shadow-xl shadow-estate-500/30">
              <HomeIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="mt-4 text-2xl font-black text-estate-900">
              Apex <span className="text-amber-500">Estates</span>
            </h1>
            <p className="text-xs uppercase tracking-widest text-stone-400 mt-1">
              Luxury Living Defined
            </p>
            <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <ShieldCheck className="w-3.5 h-3.5" /> Secured Portal
            </div>
          </div>

          {/* Toggle */}
          <div className="mt-6 grid grid-cols-2 gap-1 bg-stone-100 rounded-xl p-1">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError("");
                }}
                className={`py-2 rounded-lg text-sm font-bold transition-all ${
                  mode === m
                    ? "bg-white shadow text-estate-700"
                    : "text-stone-500 hover:text-stone-700"
                }`}
              >
                {m === "login" ? "Login" : "Sign Up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-estate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Shivam Kumar"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-estate-500 focus:ring-2 focus:ring-estate-500/20"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                Email
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-estate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-estate-500 focus:ring-2 focus:ring-estate-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-estate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "login" ? "demo: apex123" : "Create a password"}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 pl-10 pr-11 text-sm focus:outline-none focus:border-estate-500 focus:ring-2 focus:ring-estate-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-estate-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-estate-600 to-estate-500 hover:from-estate-700 hover:to-estate-600 text-white font-extrabold py-3 rounded-xl shadow-lg shadow-estate-500/25 transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60"
            >
              <Lock className="w-4 h-4" />
              {loading
                ? "Verifying..."
                : mode === "login"
                ? "Login & Continue"
                : "Create Account"}
            </button>
          </form>

          <p className="mt-5 text-center text-[11px] text-stone-400 flex items-center justify-center gap-1">
            <BadgeCheck className="w-3.5 h-3.5 text-estate-500" />
            Built by{" "}
            <span className="font-bold text-estate-700">Shivam Kumar</span> Â·
            MLH Claude Intern
          </p>
        </div>
      </div>
    </div>
  );
}

export function logout() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function hasSession() {
  try {
    return !!localStorage.getItem(STORAGE_KEY);
  } catch {
    return false;
  }
}

``

---

## components/AICopilot.tsx
``components/AICopilot.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Bot,
  Send,
  Sparkles,
  X,
  Loader,
  Home as HomeIcon,
} from "lucide-react";
import { PropertyData } from "./InputPanel";

export type ListingType = "buy" | "rent" | "sell" | "agent";

interface AICopilotProps {
  onApply: (data: PropertyData, listingType: ListingType) => void;
}

interface ChatMsg {
  role: "bot" | "user";
  text: string;
}

interface Answers {
  type?: string;
  title?: string;
  location?: string;
  price?: string;
  highlights?: string;
}

const QUESTIONS: { key: keyof Answers; prompt: string; hint: string }[] = [
  {
    key: "type",
    prompt:
      "Great! Kaunsi category hai â€” Buy, Rent, Sell ya koi special? (e.g. `buy 4 bhk luxury villa`)",
    hint: "Type e.g. `buy 4 bhk luxury villa`",
  },
  {
    key: "title",
    prompt: "Property ka naam/main description kya hai? (e.g. `4 BHK Luxury Villa`)",
    hint: "Type the property title",
  },
  {
    key: "location",
    prompt: "Location kahan hai? (e.g. `Sushant Golf City, Lucknow`)",
    hint: "Type the location",
  },
  {
    key: "price",
    prompt: "Price/rent kitna hai? (e.g. `â‚¹2.5 Cr onwards`)",
    hint: "Type the price",
  },
  {
    key: "highlights",
    prompt:
      "Highlights kya hai? Akshar ko `Â·` se separate karein. (e.g. `3000 sq.ft Â· Corner plot Â· Ready to move`)",
    hint: "Separate with Â· dots",
  },
];

const TYPE_META: Record<ListingType, { ignore: RegExp; label: string }> = {
  buy: { ignore: /\bbuy\b|\bsale\b|\bkhareed/i, label: "buy" },
  rent: { ignore: /\brent\b|\bkraye/i, label: "rent" },
  sell: { ignore: /\bsell\b|\bbech/i, label: "sell" },
  agent: { ignore: /\bagent\b|\brealtor|\bconsultant/i, label: "agent" },
};

export default function AICopilot({ onApply }: AICopilotProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "bot",
      text: "ðŸ‘‹ Namaste! Main Apex AI hoon. Sirf kuch sawaal poochh kar tumhara poora property post bana dunga. Shuru karte hain?",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && step < QUESTIONS.length) {
      const t = setTimeout(() => {
        setMessages((m) => [
          ...m,
          { role: "bot", text: QUESTIONS[step].prompt },
        ]);
      }, 500);
      return () => clearTimeout(t);
    }
  }, [open, step]);

  useEffect(() => {
    bodyRef.current?.scrollTo({
      top: bodyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, thinking]);

  const askQuestion = () => {
    if (step >= QUESTIONS.length) return;
    const q = QUESTIONS[step];
    setMessages((m) => [...m, { role: "bot", text: q.prompt }]);
  };

  const handleSend = (raw: string) => {
    const msg = raw.trim();
    if (!msg) return;
    setMessages((m) => [...m, { role: "user", text: msg }]);
    setInput("");
    setThinking(true);

    setTimeout(() => {
      const q = QUESTIONS[Math.min(step, QUESTIONS.length - 1)];
      let next = answers;

      if (q.key === "type") {
        let detected: ListingType = "buy";
        for (const t of Object.keys(TYPE_META) as ListingType[]) {
          if (TYPE_META[t].ignore.test(msg)) {
            detected = t;
            break;
          }
        }
        next = { ...answers, type: detected, title: msg };
      } else {
        next = { ...answers, [q.key]: msg };
      }
      setAnswers(next);

      const newStep = Math.min(step + 1, QUESTIONS.length);
      setStep(newStep);
      setThinking(false);

      if (newStep >= QUESTIONS.length) {
        const listingType: ListingType = (next.type as ListingType) || "buy";
        const data: PropertyData = {
          title:
            next.title || "Luxury Property",
          location: next.location || "Lucknow, UP",
          price: next.price || "â‚¹ On Request",
          highlights: next.highlights || "Premium Â· Verified Â· Ready to move",
        };
        onApply(data, listingType);
        setMessages((m) => [
          ...m,
          {
            role: "bot",
            text: `âœ… Done! Tumhara post ban gaya. Poster preview mein dekho â€” agar kuch change karna ho toh form se edit kar lena.`,
          },
        ]);
      } else {
        askQuestion();
      }
    }, 700);
  };

  const startOver = () => {
    setStep(0);
    setAnswers({});
    setMessages([
      {
        role: "bot",
        text: "ðŸ‘‹ Chalo phir se shuru karte hain! Kyun post banana hai?",
      },
    ]);
    setTimeout(askQuestion, 400);
  };

  return (
    <>
      {/* Floating bot button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-estate-600 to-estate-500 hover:from-estate-700 hover:to-estate-600 text-white font-bold px-4 py-3.5 rounded-2xl shadow-2xl shadow-estate-500/40 transition-all hover:-translate-y-0.5"
      >
        {open ? (
          <X className="w-5 h-5" />
        ) : (
          <Bot className="w-5 h-5 animate-pulse" />
        )}
        {!open && <span className="text-sm">Apex AI</span>}
        {!open && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-white" />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] max-w-sm bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-estate-700 via-estate-600 to-estate-500 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <Bot className="w-5 h-5 text-amber-300" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-white text-sm flex items-center gap-1.5">
                Apex AI Assistant
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              </p>
              <p className="text-[10px] text-estate-100">
                Sawaal-pochh kar post banao Â· By Shivam Kumar
              </p>
            </div>
            <button
              onClick={startOver}
              className="text-[10px] font-bold bg-white/15 text-white px-2.5 py-1 rounded-lg hover:bg-white/25 transition"
            >
              Reset
            </button>
          </div>

          {/* Messages */}
          <div
            ref={bodyRef}
            className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[360px] bg-stone-50"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-estate-600 text-white rounded-br-sm"
                      : "bg-white border border-stone-200 text-stone-700 rounded-bl-sm shadow-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="flex justify-start">
                <div className="bg-white border border-stone-200 text-stone-500 rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex items-center gap-2 text-sm">
                  <Loader className="w-4 h-4 animate-spin text-estate-500" />
                  Thinking...
                </div>
              </div>
            )}
          </div>

          {/* Progress */}
          <div className="px-4 pt-1">
            <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-estate-500 to-amber-400 transition-all duration-500"
                style={{
                  width: `${(Math.min(step, QUESTIONS.length) / QUESTIONS.length) * 100}%`,
                }}
              />
            </div>
            <p className="text-[10px] text-stone-400 mt-1">
              {step < QUESTIONS.length
                ? `Step ${step + 1} of ${QUESTIONS.length}`
                : "Post ready! ðŸŽ‰"}
            </p>
          </div>

          {/* Input */}
          <div className="p-3 border-t border-stone-100 flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
              placeholder={
                step < QUESTIONS.length
                  ? QUESTIONS[step].hint
                  : "Type /reset se naya post banao"
              }
              className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-estate-500 focus:ring-2 focus:ring-estate-500/20"
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim()}
              className="w-10 h-10 bg-gradient-to-r from-estate-600 to-estate-500 text-white rounded-xl flex items-center justify-center hover:brightness-110 active:scale-95 disabled:opacity-40 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

``

---

## tailwind.config.ts
``tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0fdf4",
          500: "#16a34a",
          900: "#064e3b",
          gold: "#d4af37",
        },
        estate: {
          50: "#effaf1",
          100: "#d9f2de",
          300: "#8fdca2",
          500: "#15b79e",
          600: "#0f8f85",
          700: "#0b6e6b",
          800: "#0b4f52",
          900: "#0a3a40",
        },
      },
      fontFamily: {
        sans: ["Poppins", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
``

---

## next.config.mjs
``next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
``

---

## tsconfig.json
``tsconfig.json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
``

---

## postcss.config.js
``postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
``

---

## package.json
``package.json
{
  "name": "property-post-maker",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "html-to-image": "^1.11.11",
    "lucide-react": "^0.400.0",
    "next": "^14.2.35",
    "qrcode": "^1.5.4",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/node": "^20.14.9",
    "@types/qrcode": "^1.5.6",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.4",
    "typescript": "^5.5.2"
  }
}

``

---


