"use client";

import React from "react";
import {
  Settings,
  X,
  Sun,
  Moon,
  Monitor,
  Globe,
  Type,
  LogOut,
  Palette,
  Languages,
} from "lucide-react";
import {
  useSettings,
  LANGUAGES,
  FONTS,
  ThemeMode,
  Language,
  FontFamily,
} from "./SettingsContext";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
  t: (key: string) => string;
}

export default function SettingsPanel({
  open,
  onClose,
  onLogout,
  t,
}: SettingsPanelProps) {
  const { theme, language, font, setTheme, setLanguage, setFont } =
    useSettings();

  if (!open) return null;

  const themeOptions: { key: ThemeMode; icon: React.ReactNode; label: string }[] = [
    { key: "light", icon: <Sun className="w-4 h-4" />, label: t("settings.light") },
    { key: "dark", icon: <Moon className="w-4 h-4" />, label: t("settings.dark") },
    { key: "system", icon: <Monitor className="w-4 h-4" />, label: t("settings.system") },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 z-[101] h-full w-full max-w-sm bg-white dark:bg-stone-900 shadow-2xl flex flex-col overflow-hidden animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-200 dark:border-stone-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-estate-600 to-estate-400 flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-stone-800 dark:text-white">
                {t("settings.title")}
              </h2>
              <p className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-widest">
                Apex Estates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
          >
            <X className="w-5 h-5 text-stone-600 dark:text-stone-300" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7">
          {/* ===== THEME ===== */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4 text-estate-500" />
              <span className="text-sm font-bold text-stone-700 dark:text-stone-200">
                {t("settings.theme")}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setTheme(opt.key)}
                  className={`flex flex-col items-center gap-2 py-3.5 rounded-2xl border-2 transition-all ${
                    theme === opt.key
                      ? "border-estate-500 bg-estate-50 dark:bg-estate-900/40 shadow-lg shadow-estate-500/15"
                      : "border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:border-stone-300 dark:hover:border-stone-600"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      theme === opt.key
                        ? "bg-estate-500 text-white"
                        : "bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300"
                    }`}
                  >
                    {opt.icon}
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      theme === opt.key
                        ? "text-estate-700 dark:text-estate-300"
                        : "text-stone-500 dark:text-stone-400"
                    }`}
                  >
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ===== LANGUAGE ===== */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Languages className="w-4 h-4 text-estate-500" />
              <span className="text-sm font-bold text-stone-700 dark:text-stone-200">
                {t("settings.language")}
              </span>
            </div>
            <div className="space-y-2">
              {LANGUAGES.map((l) => (
                <button
                  key={l.key}
                  onClick={() => setLanguage(l.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all ${
                    language === l.key
                      ? "border-estate-500 bg-estate-50 dark:bg-estate-900/40 shadow-lg shadow-estate-500/15"
                      : "border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:border-stone-300 dark:hover:border-stone-600"
                  }`}
                >
                  <span className="text-xl">{l.flag}</span>
                  <span
                    className={`text-sm font-bold ${
                      language === l.key
                        ? "text-estate-700 dark:text-estate-300"
                        : "text-stone-600 dark:text-stone-300"
                    }`}
                  >
                    {l.label}
                  </span>
                  {language === l.key && (
                    <span className="ml-auto w-5 h-5 rounded-full bg-estate-500 flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ===== FONT ===== */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Type className="w-4 h-4 text-estate-500" />
              <span className="text-sm font-bold text-stone-700 dark:text-stone-200">
                {t("settings.font")}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {FONTS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFont(f.key)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 transition-all ${
                    font === f.key
                      ? "border-estate-500 bg-estate-50 dark:bg-estate-900/40 shadow-lg shadow-estate-500/15"
                      : "border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:border-stone-300 dark:hover:border-stone-600"
                  }`}
                >
                  <span
                    className={`text-xl font-bold ${
                      font === f.key
                        ? "text-estate-600 dark:text-estate-300"
                        : "text-stone-600 dark:text-stone-300"
                    }`}
                    style={{ fontFamily: `'${f.label}', system-ui, sans-serif` }}
                  >
                    {f.sample}
                  </span>
                  <span
                    className={`text-[9px] font-semibold ${
                      font === f.key
                        ? "text-estate-600 dark:text-estate-300"
                        : "text-stone-400 dark:text-stone-500"
                    }`}
                  >
                    {f.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ===== FONT PREVIEW ===== */}
          <div className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl p-4">
            <p className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-2">
              Preview
            </p>
            <p
              className="text-lg font-bold text-stone-800 dark:text-white"
              style={{
                fontFamily: `'${FONTS.find((f) => f.key === font)?.label || "Poppins"}', system-ui, sans-serif`,
              }}
            >
              Find Your Dream Home With Apex Estates
            </p>
            <p
              className="text-sm text-stone-500 dark:text-stone-400 mt-1"
              style={{
                fontFamily: `'${FONTS.find((f) => f.key === font)?.label || "Poppins"}', system-ui, sans-serif`,
              }}
            >
              Curated luxury villas and apartments — verified listings, transparent pricing.
            </p>
          </div>
        </div>

        {/* Footer - Logout */}
        <div className="px-6 py-5 border-t border-stone-200 dark:border-stone-700">
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-rose-500/25 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <LogOut className="w-5 h-5" />
            {t("settings.logout")}
          </button>
        </div>
      </div>

    </>
  );
}
