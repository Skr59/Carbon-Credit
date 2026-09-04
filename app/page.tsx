"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
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
import SettingsPanel from "@/components/SettingsPanel";
import ErrorBoundary from "@/components/ErrorBoundary";
import {
  SettingsProvider,
  useSettings,
  t as translate,
} from "@/components/SettingsContext";
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
  Settings,
  X,
  ChevronRight,
  Shield,
  Globe,
  Leaf,
  TreePine,
  BarChart3,
  Droplets,
} from "lucide-react";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=80&auto=format&fit=crop";

const FEATURED = [
  {
    img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80&auto=format&fit=crop",
    title: "Emerald Heights Villas",
    location: "Sushant Golf City, Lucknow",
    price: "₹2.5 Cr",
    beds: "4",
    baths: "5",
    area: "3000 sq.ft",
  },
  {
    img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80&auto=format&fit=crop",
    title: "The Ivory Residences",
    location: "Gomti Nagar, Lucknow",
    price: "₹4.8 Cr",
    beds: "5",
    baths: "6",
    area: "4500 sq.ft",
  },
  {
    img: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80&auto=format&fit=crop",
    title: "Skyline Luxury Apartments",
    location: "Hazratganj, Lucknow",
    price: "₹1.2 Cr",
    beds: "3",
    baths: "3",
    area: "1950 sq.ft",
  },
];

function AppContent() {
  const { theme, language } = useSettings();
  const t = useMemo(() => (key: string) => translate(key, language), [language]);

  const [authed, setAuthed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    setAuthed(hasSession());
  }, []);

  const [propertyData, setPropertyData] = useState<PropertyData>({
    title: "4 BHK Luxury Villa, Ansal Golf City",
    location: "Sushant Golf City, Lucknow",
    price: "₹2.5 Cr onwards",
    highlights: "3000 sq.ft · Corner plot · Ready to move",
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

  const handleLogout = () => {
    logout();
    setAuthed(false);
  };

  if (!authed) {
    return <LoginScreen onLogin={() => setAuthed(true)} t={t} />;
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
    const text = `🏠 ${propertyData.title}\n📍 ${propertyData.location}\n💰 ${propertyData.price}\n✨ ${propertyData.highlights}\n\n📞 +91 98765 43210\n🌐 www.apexestates.com\n\n#ApexEstates #PropertyForSale #LucknowRealEstate #LuxuryHomes`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const navLinks = [
    { label: t("nav.home"), href: "#home" },
    { label: t("nav.buy"), href: "#buy" },
    { label: t("nav.rent"), href: "#rent" },
    { label: t("nav.sell"), href: "#sell" },
    { label: t("nav.projects"), href: "#projects" },
    { label: t("nav.agents"), href: "#agents" },
    { label: "Carbon Credits", href: "/carbon-credit", external: true },
    { label: "Farmer Money Hub", href: "/carbon-farmer", external: true },
  ];

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900 text-stone-800 dark:text-stone-100 flex flex-col selection:bg-amber-400 selection:text-stone-900 transition-colors duration-300">
      {/* ================= Top Bar ================= */}
      <div className="bg-estate-900 dark:bg-black text-estate-100 text-xs py-2 px-6 hidden sm:flex justify-between items-center">
        <div className="flex items-center gap-6">
          <span className="inline-flex items-center gap-1.5">
            <Phone className="w-3 h-3 text-amber-300" /> +91 98765 43210
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-amber-300" /> Lucknow, UP, India
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 font-semibold">
          <BadgeCheck className="w-3 h-3 text-amber-300" /> RERA Registered ·
          Trusted Since 2009
        </span>
      </div>

      {/* ================= Navbar ================= */}
      <header className="sticky top-0 z-50 bg-white/85 dark:bg-stone-900/85 backdrop-blur-xl border-b border-stone-200 dark:border-stone-700 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
          <a href="#home" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-estate-600 to-estate-400 flex items-center justify-center shadow-lg shadow-estate-500/25">
              <HomeIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-black text-lg leading-none text-estate-800 dark:text-estate-100">
                Apex <span className="text-amber-500">Estates</span>
              </p>
              <p className="text-[9px] uppercase tracking-[0.25em] text-stone-400 dark:text-stone-500">
                Realty · Luxury Living
              </p>
            </div>
          </a>

          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-stone-600 dark:text-stone-300">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={`hover:text-estate-600 dark:hover:text-estate-400 transition-colors ${
                  l.external ? "text-green-600 dark:text-green-400 font-bold" : ""
                }`}
                target={l.external ? "_blank" : undefined}
                rel={l.external ? "noopener noreferrer" : undefined}
              >
                {l.external && <Leaf className="w-3.5 h-3.5 inline mr-1" />}
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#maker"
              className="hidden md:inline-flex items-center gap-2 bg-estate-600 hover:bg-estate-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-estate-500/25 transition-all hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4 text-amber-300" /> {t("nav.postMaker")}
            </a>

            {/* Settings button */}
            <button
              onClick={() => setSettingsOpen(true)}
              className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center hover:bg-stone-200 dark:hover:bg-stone-700 transition-all group"
              title={t("settings.title")}
            >
              <Settings className="w-5 h-5 text-stone-600 dark:text-stone-300 group-hover:rotate-90 transition-transform duration-500" />
            </button>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 text-stone-600 dark:text-stone-300"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
            >
              {mobileNavOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileNavOpen && (
          <div className="lg:hidden border-t border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-4 py-4 space-y-1 animate-fade-in">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobileNavOpen(false)}
                className={`flex items-center justify-between px-4 py-3 text-sm font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-xl transition-colors ${
                  l.external ? "text-green-600 dark:text-green-400" : ""
                }`}
                target={l.external ? "_blank" : undefined}
                rel={l.external ? "noopener noreferrer" : undefined}
              >
                <span className="flex items-center gap-2">
                  {l.external && <Leaf className="w-4 h-4" />}
                  {l.label}
                </span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </a>
            ))}
            <a
              href="#maker"
              onClick={() => setMobileNavOpen(false)}
              className="flex items-center gap-2 px-4 py-3 text-sm font-bold text-estate-600 dark:text-estate-400 bg-estate-50 dark:bg-estate-900/30 rounded-xl"
            >
              <Sparkles className="w-4 h-4" /> {t("nav.postMaker")}
            </a>
          </div>
        )}
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
            <Star className="w-3.5 h-3.5 fill-amber-300" /> {t("hero.badge")}
          </span>

          <h1 className="mt-6 text-4xl md:text-6xl font-black leading-tight max-w-3xl text-shadow">
            {t("hero.title1")}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
              {" "}
              {t("hero.title2")}{" "}
            </span>
            {t("hero.title3")}
          </h1>
          <p className="mt-5 max-w-xl text-estate-100 text-base md:text-lg text-shadow">
            {t("hero.desc")}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-8">
            <div>
              <p className="text-3xl font-black text-amber-400">500+</p>
              <p className="text-xs text-white/70 uppercase tracking-wider">
                {t("hero.stat1Label")}
              </p>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div>
              <p className="text-3xl font-black text-amber-400">4.9★</p>
              <p className="text-xs text-white/70 uppercase tracking-wider">
                {t("hero.stat2Label")}
              </p>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div>
              <p className="text-3xl font-black text-amber-400">2.4k+</p>
              <p className="text-xs text-white/70 uppercase tracking-wider">
                {t("hero.stat3Label")}
              </p>
            </div>
          </div>

          <a
            href="#maker"
            className="mt-10 inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-stone-900 font-extrabold px-7 py-3.5 rounded-2xl shadow-xl shadow-amber-500/30 transition-all hover:-translate-y-0.5"
          >
            {t("hero.cta")} <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* ================= Post Maker Section ================= */}
      <section id="maker" className="py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Section Heading */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-flex items-center gap-2 text-estate-600 dark:text-estate-400 bg-estate-50 dark:bg-estate-900/30 border border-estate-100 dark:border-estate-800 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" /> {t("maker.badge")}
            </span>
            <h2 className="mt-4 text-3xl md:text-4xl font-black text-estate-900 dark:text-estate-100">
              {t("maker.title")}
            </h2>
            <p className="mt-3 text-stone-500 dark:text-stone-400">
              {t("maker.desc")}
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
                        { key: "buy", label: t("nav.buy") },
                        { key: "rent", label: t("nav.rent") },
                        { key: "sell", label: t("nav.sell") },
                        { key: "agent", label: t("nav.agents") },
                      ] as { key: ListingType; label: string }[]
                    ).map((tp) => (
                      <button
                        key={tp.key}
                        type="button"
                        onClick={() => setListingType(tp.key)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          listingType === tp.key
                            ? "bg-gradient-to-r from-amber-400 to-amber-500 text-stone-900 shadow"
                            : "text-estate-100 hover:text-white"
                        }`}
                      >
                        {tp.label}
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
                      ? "1080 × 1920 (9:16) · PNG"
                      : platform === "facebook"
                      ? "1080 × 1350 (4:5) · PNG"
                      : "1080 × 1080 (1:1) · PNG"}
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
                          ? t("maker.downloading")
                          : `${t("maker.downloadFor")} ${platform.toUpperCase()} (PNG)`}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={copyPropertyText}
                    className="w-full rounded-2xl border-2 border-emerald-400/30 bg-emerald-500/10 py-3 px-6 text-sm font-semibold text-emerald-300 transition-all duration-200 hover:bg-emerald-500/20 hover:border-emerald-400/50 active:scale-[0.98]"
                  >
                    {copied ? `✓ ${t("maker.copied")}` : `📋 ${t("maker.copyText")}`}
                  </button>
                  <p className="text-center text-[10px] text-estate-300">
                    {t("maker.helper")} · &quot;Built by Shivam Kumar&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Featured Properties ================= */}
      <section id="projects" className="py-14 md:py-20 bg-white dark:bg-stone-950 border-y border-stone-200 dark:border-stone-700 transition-colors">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-estate-600 dark:text-estate-400 text-xs font-bold uppercase tracking-widest">
                {t("projects.featured")}
              </span>
              <h2 className="mt-2 text-3xl md:text-4xl font-black text-estate-900 dark:text-estate-100">
                {t("projects.trending")}
              </h2>
            </div>
            <a
              href="#maker"
              className="inline-flex items-center gap-1.5 text-estate-600 dark:text-estate-400 font-bold text-sm hover:gap-2.5 transition-all"
            >
              {t("projects.copyLink")} <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED.map((p) => (
              <div
                key={p.title}
                className="group bg-white dark:bg-stone-800 rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-700 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={p.img}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute top-4 left-4 bg-white/90 dark:bg-stone-800/90 backdrop-blur text-estate-800 dark:text-estate-100 text-xs font-black px-3 py-1.5 rounded-full">
                    {p.price}
                  </span>
                  <button className="absolute top-4 right-4 w-9 h-9 bg-white/90 dark:bg-stone-800/90 backdrop-blur rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                    <Heart className="w-4 h-4 text-rose-500" />
                  </button>
                  <span className="absolute bottom-4 left-4 inline-flex items-center gap-1 text-white text-xs font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-amber-300" />
                    {p.location}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-extrabold text-lg text-estate-900 dark:text-estate-100">
                    {p.title}
                  </h3>
                  <div className="mt-3 flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400 font-medium">
                    <span className="inline-flex items-center gap-1">
                      <BedDouble className="w-4 h-4 text-estate-500" /> {p.beds}{" "}
                      BHK
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Bath className="w-4 h-4 text-estate-500" /> {p.baths}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Ruler className="w-4 h-4 text-estate-500" /> {p.area}
                    </span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-700 flex items-center justify-between">
                    <span className="text-base font-black text-estate-700 dark:text-estate-300">
                      {p.price}
                    </span>
                    <a
                      href="#maker"
                      className="inline-flex items-center gap-1 text-xs font-bold text-estate-600 dark:text-estate-400 hover:text-amber-500 transition-colors"
                    >
                      {t("projects.makePost")} <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= Carbon Credit Calculator Section ================= */}
      <section className="py-14 md:py-20 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left: Content */}
            <div>
              <span className="inline-flex items-center gap-2 text-green-700 bg-green-100 border border-green-200 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
                <Leaf className="w-3.5 h-3.5" /> Eco-Friendly Initiative
              </span>
              <h2 className="mt-4 text-3xl md:text-4xl font-black text-stone-900 leading-tight">
                Calculate Your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                  Carbon Credits
                </span>{" "}
                with Satellite Imagery
              </h2>
              <p className="mt-4 text-stone-600 text-lg">
                Use Google Satellite mode to analyze vegetation, soil, and water bodies.
                Get instant carbon credit estimates for any location on Earth.
              </p>
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-stone-700">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <TreePine className="w-5 h-5 text-green-600" />
                  </div>
                  <span>Real-time satellite imagery analysis</span>
                </div>
                <div className="flex items-center gap-3 text-stone-700">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-green-600" />
                  </div>
                  <span>Worldwide location coverage</span>
                </div>
                <div className="flex items-center gap-3 text-stone-700">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                  </div>
                  <span>Detailed carbon breakdown & recommendations</span>
                </div>
              </div>
              <a
                href="/carbon-credit"
                className="mt-8 inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-extrabold px-7 py-3.5 rounded-2xl shadow-xl shadow-green-500/30 transition-all hover:-translate-y-0.5"
              >
                <Leaf className="w-5 h-5" /> Launch Calculator
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>

            {/* Right: Preview Card */}
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-6 border border-green-100 transform rotate-1 hover:rotate-0 transition-transform duration-300">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-4 text-white mb-4">
                  <p className="text-green-100 text-sm">Total Carbon Credits</p>
                  <p className="text-3xl font-black">
                    47.82 <span className="text-lg">tCO₂e/ha</span>
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-stone-700">
                      <TreePine className="w-4 h-4 text-green-600" /> Vegetation
                    </span>
                    <span className="font-bold text-green-600">32.15</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full w-[70%] bg-gradient-to-r from-green-400 to-green-600 rounded-full" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-stone-700">
                      <Globe className="w-4 h-4 text-amber-600" /> Soil Carbon
                    </span>
                    <span className="font-bold text-amber-600">12.45</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full w-[45%] bg-gradient-to-r from-amber-400 to-amber-600 rounded-full" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-stone-700">
                      <Droplets className="w-4 h-4 text-blue-600" /> Water Bodies
                    </span>
                    <span className="font-bold text-blue-600">8.22</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full w-[30%] bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Powered by Google Satellite Imagery
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-green-200 rounded-full opacity-50 blur-xl" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-emerald-200 rounded-full opacity-50 blur-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA Banner ================= */}
      <section className="py-14 md:py-20 bg-gradient-to-br from-estate-700 via-estate-800 to-estate-900">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center text-white">
          <span className="inline-flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-widest">
            <Building2 className="w-4 h-4" /> Apex Estates · RERA LG-09/2019
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-black leading-tight">
            {t("cta.title")}
          </h2>
          <p className="mt-4 text-estate-100 max-w-xl mx-auto">
            {t("cta.desc")}
          </p>
          <a
            href="#maker"
            className="mt-7 inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-stone-900 font-extrabold px-8 py-4 rounded-2xl shadow-xl shadow-amber-500/30 transition-all hover:-translate-y-0.5"
          >
            <Sparkles className="w-5 h-5" /> {t("cta.button")}
          </a>
        </div>
      </section>

      {/* ================= Footer ================= */}
      <footer className="bg-estate-950 dark:bg-black text-estate-200 pt-12 pb-6 transition-colors">
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
                {t("footer.brandDesc")}
              </p>
            </div>
            <div>
              <p className="font-bold text-white mb-3">{t("footer.quickLinks")}</p>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#home" className="hover:text-amber-400 transition-colors">
                    {t("nav.home")}
                  </a>
                </li>
                <li>
                  <a href="#maker" className="hover:text-amber-400 transition-colors">
                    {t("maker.title")}
                  </a>
                </li>
                <li>
                  <a href="#projects" className="hover:text-amber-400 transition-colors">
                    {t("projects.trending")}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-white mb-3">{t("footer.contact")}</p>
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
            <span>© 2026 Apex Estates. All rights reserved.</span>
            <span className="inline-flex items-center gap-1 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {t("footer.builtBy")}{" "}
              <span className="text-amber-400 font-bold">Shivam Kumar</span> ·
              MLH Claude Intern
            </span>
          </div>
        </div>
      </footer>

      {/* Floating AI Assistant */}
      <AICopilot onApply={handleAISubmit} t={t} lang={language} />

      {/* Settings Panel */}
      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onLogout={handleLogout}
        t={t}
      />
    </div>
  );
}

export default function Home() {
  return (
    <SettingsProvider>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </SettingsProvider>
  );
}
