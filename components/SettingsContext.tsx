"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type ThemeMode = "light" | "dark" | "system";
export type Language = "en" | "hi" | "hinglish";
export type FontFamily = "poppins" | "inter" | "roboto" | "outfit" | "playfair";

export interface SettingsState {
  theme: ThemeMode;
  language: Language;
  font: FontFamily;
  setTheme: (t: ThemeMode) => void;
  setLanguage: (l: Language) => void;
  setFont: (f: FontFamily) => void;
}

const SETTINGS_KEY = "apex-settings";

const FONT_MAP: Record<FontFamily, string> = {
  poppins: "'Poppins', system-ui, sans-serif",
  inter: "'Inter', system-ui, sans-serif",
  roboto: "'Roboto', system-ui, sans-serif",
  outfit: "'Outfit', system-ui, sans-serif",
  playfair: "'Playfair Display', Georgia, serif",
};

export const LANG: Record<Language, Record<string, string>> = {
  en: {
    "nav.home": "Home",
    "nav.buy": "Buy",
    "nav.rent": "Rent",
    "nav.sell": "Sell",
    "nav.projects": "Projects",
    "nav.agents": "Agents",
    "nav.postMaker": "Post Maker",
    "hero.badge": "Luxury Real Estate · Lucknow",
    "hero.title1": "Find Your Dream",
    "hero.title2": "Home",
    "hero.title3": "With Apex Estates",
    "hero.desc": "Curated luxury villas, apartments and commercial spaces — everything on one trusted platform. Verified listings, transparent pricing.",
    "hero.stat1Label": "Properties Listed",
    "hero.stat2Label": "Client Rating",
    "hero.stat3Label": "Happy Families",
    "hero.cta": "Make Your Property Post",
    "maker.badge": "Free Tool",
    "maker.title": "Property Post Maker",
    "maker.desc": "Fill 4 details — logo, branding and contact are added automatically. Download ready-to-share social post.",
    "maker.createPost": "Create Your Property Post",
    "maker.createPostDesc": "Fill the 4 details — logo, branding and contact will be added automatically",
    "maker.download": "Download Ready-to-Share Post (PNG)",
    "maker.downloading": "Generating High-Res PNG...",
    "maker.downloadFor": "Download for",
    "maker.copyText": "Copy Property Text for WhatsApp",
    "maker.copied": "Copied to clipboard!",
    "maker.helper": "Logo · Contact · QR Auto-included",
    "maker.interiorDesign": "Interior Design",
    "maker.chooseStyle": "Choose Style",
    "maker.houseImage": "House Image",
    "maker.choosePhoto": "Choose Photo",
    "maker.highlights": "Highlights",
    "maker.highlightsHint": "Separate with dots — each dot becomes a tag/chip",
    "projects.featured": "Featured Projects",
    "projects.trending": "Trending Properties",
    "projects.makePost": "Make Post",
    "projects.copyLink": "Post banao iski copy",
    "cta.title": "Create Your Professional Property Post, For Free",
    "cta.desc": "Create ready-to-share creatives with logo + contact in seconds, and post on WhatsApp, Instagram or Facebook.",
    "cta.button": "Start Creating Now",
    "footer.brandDesc": "Luxury Living Defined. Verified listings, honest deals — since 2009.",
    "footer.quickLinks": "Quick Links",
    "footer.contact": "Contact",
    "footer.builtBy": "Built by",
    "settings.title": "Settings",
    "settings.theme": "Theme",
    "settings.language": "Language",
    "settings.font": "Font Style",
    "settings.light": "Light",
    "settings.dark": "Dark",
    "settings.system": "System",
    "settings.logout": "Logout",
    "settings.close": "Close",
    "ai.title": "Apex AI Assistant",
    "ai.subtitle": "Ask questions to create your post",
    "ai.greeting": "Hello! I'm Apex AI. I'll create your property post by asking a few questions. Shall we start?",
    "ai.reset": "Reset",
    "ai.done": "Done! Your post has been created. Check the poster preview — edit the form if you need changes.",
    "ai.thinking": "Thinking...",
    "ai.placeholder": "Type your answer...",
    "ai.stepProgress": "Step",
    "ai.of": "of",
    "ai.ready": "Post ready!",
    "login.secured": "Secured Portal",
    "login.login": "Login",
    "login.signup": "Sign Up",
    "login.fullName": "Full Name",
    "login.email": "Email",
    "login.password": "Password",
    "login.loginBtn": "Login & Continue",
    "login.signupBtn": "Create Account",
    "login.loginPlaceholder": "demo: apex123",
    "login.signupPlaceholder": "Create a password",
    "login.verifying": "Verifying...",
  },
  hi: {
    "nav.home": "होम",
    "nav.buy": "खरीदें",
    "nav.rent": "किराया",
    "nav.sell": "बेचें",
    "nav.projects": "प्रोजेक्ट",
    "nav.agents": "एजेंट",
    "nav.postMaker": "पोस्ट बनाएं",
    "hero.badge": "लक्ज़री रियल एस्टेट · लखनऊ",
    "hero.title1": "अपना सपनों का",
    "hero.title2": "घर",
    "hero.title3": "खोजें Apex Estates के साथ",
    "hero.desc": "चुनिंदा लक्ज़री विला, अपार्टमेंट और कमर्शियल स्पेस — सब कुछ एक भरोसेमंद प्लेटफॉर्म पर। सत्यापित लिस्टिंग, पारदर्शी मूल्य।",
    "hero.stat1Label": "लिस्टेड प्रॉपर्टी",
    "hero.stat2Label": "क्लाइंट रेटिंग",
    "hero.stat3Label": "खुश परिवार",
    "hero.cta": "अपना प्रॉपर्टी पोस्ट बनाएं",
    "maker.badge": "मुफ्त टूल",
    "maker.title": "प्रॉपर्टी पोस्ट मेकर",
    "maker.desc": "4 डिटेल्स भरें — लोगो, ब्रांडिंग और कॉन्टैक्ट अपने आप जुड़ जाते हैं। शेयर करने योग्य सोशल पोस्ट डाउनलोड करें।",
    "maker.createPost": "अपना प्रॉपर्टी पोस्ट बनाएं",
    "maker.createPostDesc": "4 डिटेल्स भरें — लोगो, ब्रांडिंग और कॉन्टैक्ट अपने आप जुड़ जाएंगे",
    "maker.download": "शेयर करने योग्य पोस्ट डाउनलोड करें (PNG)",
    "maker.downloading": "हाई-रेज़ PNG बन रहा है...",
    "maker.downloadFor": "डाउनलोड करें",
    "maker.copyText": "व्हाट्सऐप के लिए प्रॉपर्टी टेक्स्ट कॉपी करें",
    "maker.copied": "क्लिपबोर्ड पर कॉपी हो गया!",
    "maker.helper": "लोगो · कॉन्टैक्ट · QR ऑटो-शामिल",
    "maker.interiorDesign": "इंटीरियर डिज़ाइन",
    "maker.chooseStyle": "स्टाइल चुनें",
    "maker.houseImage": "हाउस इमेज",
    "maker.choosePhoto": "फोटो चुनें",
    "maker.highlights": "हाइलाइट्स",
    "maker.highlightsHint": "बिंदुओं से अलग करें — हर बिंदु एक टैग/चिप बनेगा",
    "projects.featured": "विशेष प्रोजेक्ट",
    "projects.trending": "ट्रेंडिंग प्रॉपर्टी",
    "projects.makePost": "पोस्ट बनाएं",
    "projects.copyLink": "इसकी कॉपी से पोस्ट बनाएं",
    "cta.title": "अपना प्रोफेशनल प्रॉपर्टी पोस्ट मुफ्त में बनाएं",
    "cta.desc": "सेकंड में लोगो + कॉन्टैक्ट के साथ शेयर करने योग्य क्रिएटिव बनाएं और WhatsApp, Instagram या Facebook पर पोस्ट करें।",
    "cta.button": "अभी बनाना शुरू करें",
    "footer.brandDesc": "लक्ज़री लिविंग डिफाइंड। सत्यापित लिस्टिंग, ईमानदार डील — 2009 से।",
    "footer.quickLinks": "त्वरित लिंक",
    "footer.contact": "संपर्क",
    "footer.builtBy": "बनाया",
    "settings.title": "सेटिंग्स",
    "settings.theme": "थीम",
    "settings.language": "भाषा",
    "settings.font": "फ़ॉन्ट स्टाइल",
    "settings.light": "लाइट",
    "settings.dark": "डार्क",
    "settings.system": "सिस्टम",
    "settings.logout": "लॉगआउट",
    "settings.close": "बंद करें",
    "ai.title": "Apex AI सहायक",
    "ai.subtitle": "पोस्ट बनाने के लिए सवाल पूछें",
    "ai.greeting": "नमस्ते! मैं Apex AI हूं। कुछ सवाल पूछकर आपका प्रॉपर्टी पोस्ट बना दूंगा। शुरू करें?",
    "ai.reset": "रीसेट",
    "ai.done": "हो गया! आपका पोस्ट बन गया। पोस्टर प्रीव्यू में देखें — बदलाव के लिए फॉर्म एडिट करें।",
    "ai.thinking": "सोच रहा हूं...",
    "ai.placeholder": "अपना जवाब लिखें...",
    "ai.stepProgress": "चरण",
    "ai.of": "में से",
    "ai.ready": "पोस्ट तैयार!",
    "login.secured": "सुरक्षित पोर्टल",
    "login.login": "लॉगिन",
    "login.signup": "साइन अप",
    "login.fullName": "पूरा नाम",
    "login.email": "ईमेल",
    "login.password": "पासवर्ड",
    "login.loginBtn": "लॉगिन करें",
    "login.signupBtn": "खाता बनाएं",
    "login.loginPlaceholder": "डेमो: apex123",
    "login.signupPlaceholder": "पासवर्ड बनाएं",
    "login.verifying": "जांच हो रही है...",
  },
  hinglish: {
    "nav.home": "Home",
    "nav.buy": "Kharido",
    "nav.rent": "Kiraye",
    "nav.sell": "Becho",
    "nav.projects": "Projects",
    "nav.agents": "Agents",
    "nav.postMaker": "Post Banao",
    "hero.badge": "Luxury Real Estate · Lucknow",
    "hero.title1": "Dhundo Apna",
    "hero.title2": "Ghar",
    "hero.title3": "Apex Estates Ke Saath",
    "hero.desc": "Chuninda luxury villas, apartments aur commercial spaces — sab kuch ek trusted platform par. Verified listings, transparent pricing.",
    "hero.stat1Label": "Properties Listed",
    "hero.stat2Label": "Client Rating",
    "hero.stat3Label": "Khush Families",
    "hero.cta": "Apna Property Post Banao",
    "maker.badge": "Free Tool",
    "maker.title": "Property Post Maker",
    "maker.desc": "4 details bharo — logo, branding aur contact apne aap add ho jata hai. Ready-to-share social post download karo.",
    "maker.createPost": "Apna Property Post Banao",
    "maker.createPostDesc": "4 details bharo — logo, branding aur contact apne aap add honge",
    "maker.download": "Ready-to-Share Post Download Karo (PNG)",
    "maker.downloading": "High-Res PNG Ban Raha Hai...",
    "maker.downloadFor": "Download Karo",
    "maker.copyText": "WhatsApp Ke Liye Property Text Copy Karo",
    "maker.copied": "Clipboard Par Copy Ho Gaya!",
    "maker.helper": "Logo · Contact · QR Auto-Included",
    "maker.interiorDesign": "Interior Design",
    "maker.chooseStyle": "Style Choose Karo",
    "maker.houseImage": "House Image",
    "maker.choosePhoto": "Photo Choose Karo",
    "maker.highlights": "Highlights",
    "maker.highlightsHint": "Dots se separate karein — har dot ek tag/chip banega",
    "projects.featured": "Featured Projects",
    "projects.trending": "Trending Properties",
    "projects.makePost": "Post Banao",
    "projects.copyLink": "Post banao iski copy",
    "cta.title": "Apna Professional Property Post Free Mein Banao",
    "cta.desc": "Seconds mein logo + contact ke saath ready-to-share creative banakar WhatsApp, Instagram ya Facebook par post karein.",
    "cta.button": "Abhi Banao",
    "footer.brandDesc": "Luxury Living Defined. Verified listings, honest deals — 2009 se.",
    "footer.quickLinks": "Quick Links",
    "footer.contact": "Contact",
    "footer.builtBy": "Banaya",
    "settings.title": "Settings",
    "settings.theme": "Theme Badlo",
    "settings.language": "Bhasha",
    "settings.font": "Font Style",
    "settings.light": "Light",
    "settings.dark": "Dark",
    "settings.system": "System",
    "settings.logout": "Logout",
    "settings.close": "Band Karo",
    "ai.title": "Apex AI Assistant",
    "ai.subtitle": "Sawaal-pochh kar post banao",
    "ai.greeting": "Namaste! Main Apex AI hoon. Sirf kuch sawaal poochh kar tumhara poora property post bana dunga. Shuru karte hain?",
    "ai.reset": "Reset",
    "ai.done": "Done! Tumhara post ban gaya. Poster preview mein dekho — agar kuch change karna ho toh form se edit kar lena.",
    "ai.thinking": "Soch raha hoon...",
    "ai.placeholder": "Apna jawab likho...",
    "ai.stepProgress": "Step",
    "ai.of": "mein se",
    "ai.ready": "Post ready!",
    "login.secured": "Secured Portal",
    "login.login": "Login",
    "login.signup": "Sign Up",
    "login.fullName": "Naam",
    "login.email": "Email",
    "login.password": "Password",
    "login.loginBtn": "Login Karo",
    "login.signupBtn": "Account Banao",
    "login.loginPlaceholder": "demo: apex123",
    "login.signupPlaceholder": "Password banao",
    "login.verifying": "Check ho raha hai...",
  },
};

export const LANGUAGES: { key: Language; label: string; flag: string }[] = [
  { key: "en", label: "English", flag: "🇬🇧" },
  { key: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { key: "hinglish", label: "Hinglish", flag: "🇮🇳" },
];

export const FONTS: { key: FontFamily; label: string; sample: string }[] = [
  { key: "poppins", label: "Poppins", sample: "Aa" },
  { key: "inter", label: "Inter", sample: "Aa" },
  { key: "roboto", label: "Roboto", sample: "Aa" },
  { key: "outfit", label: "Outfit", sample: "Aa" },
  { key: "playfair", label: "Playfair", sample: "Aa" },
];

export const FONT_CSS_URLS: Record<FontFamily, string> = {
  poppins:
    "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap",
  inter:
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap",
  roboto:
    "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap",
  outfit:
    "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap",
  playfair:
    "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&display=swap",
};

const SettingsContext = createContext<SettingsState | undefined>(undefined);

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}

export function t(key: string, lang: Language): string {
  return LANG[lang]?.[key] || LANG.en[key] || key;
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function loadSettings(): Omit<SettingsState, "setTheme" | "setLanguage" | "setFont"> {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        theme: parsed.theme || "light",
        language: parsed.language || "en",
        font: parsed.font || "poppins",
      };
    }
  } catch {}
  return { theme: "light", language: "en", font: "poppins" };
}

function saveSettings(s: { theme: ThemeMode; language: Language; font: FontFamily }) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {}
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState(loadSettings);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSettings(loadSettings());
  }, []);

  const resolved = mounted && settings.theme === "system" ? getSystemTheme() : settings.theme;

  useEffect(() => {
    const root = document.documentElement;
    if (resolved === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [resolved]);

  useEffect(() => {
    const url = FONT_CSS_URLS[settings.font];
    if (!url) return;
    const existing = document.getElementById("apex-font-link") as HTMLLinkElement | null;
    if (existing) {
      existing.href = url;
    } else {
      const link = document.createElement("link");
      link.id = "apex-font-link";
      link.rel = "stylesheet";
      link.href = url;
      document.head.appendChild(link);
    }
  }, [settings.font]);

  useEffect(() => {
    document.body.style.fontFamily = FONT_MAP[settings.font];
  }, [settings.font]);

  const setTheme = useCallback((theme: ThemeMode) => {
    setSettings((s) => {
      const next = { ...s, theme };
      saveSettings(next);
      return next;
    });
  }, []);

  const setLanguage = useCallback((language: Language) => {
    setSettings((s) => {
      const next = { ...s, language };
      saveSettings(next);
      return next;
    });
  }, []);

  const setFont = useCallback((font: FontFamily) => {
    setSettings((s) => {
      const next = { ...s, font };
      saveSettings(next);
      return next;
    });
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        theme: settings.theme,
        language: settings.language,
        font: settings.font,
        setTheme,
        setLanguage,
        setFont,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
