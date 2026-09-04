"use client";

import React, { useState } from "react";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  Home as HomeIcon,
  BadgeCheck,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Phone,
  MapPin,
} from "lucide-react";

const DEMO_PASSWORD = "apex123";
const STORAGE_KEY = "apex-auth";

interface LoginScreenProps {
  onLogin: () => void;
  t: (key: string) => string;
}

export default function LoginScreen({ onLogin, t }: LoginScreenProps) {
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

      {/* Decorative floating elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-estate-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md px-4 py-10">
        {/* Main Card */}
        <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl rounded-[2rem] shadow-2xl p-8 border border-white/20 dark:border-stone-700/50">
          {/* Logo */}
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-estate-600 to-estate-400 flex items-center justify-center shadow-xl shadow-estate-500/30">
              <HomeIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="mt-4 text-2xl font-black text-stone-800 dark:text-white">
              Apex <span className="text-amber-500">Estates</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400 dark:text-stone-500 mt-1">
              Luxury Living Defined
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" /> {t("login.secured")}
            </div>
          </div>

          {/* Toggle */}
          <div className="mt-6 grid grid-cols-2 gap-1 bg-stone-100 dark:bg-stone-800 rounded-xl p-1">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError("");
                }}
                className={`py-2.5 rounded-lg text-sm font-bold transition-all ${
                  mode === m
                    ? "bg-white dark:bg-stone-700 shadow text-estate-700 dark:text-estate-300"
                    : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                }`}
              >
                {mode === "login" ? t("login.login") : t("login.signup")}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                  {t("login.fullName")}
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-estate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Shivam Kumar"
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-stone-800 dark:text-white placeholder-stone-400 focus:outline-none focus:border-estate-500 focus:ring-2 focus:ring-estate-500/20 transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                {t("login.email")}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-estate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-stone-800 dark:text-white placeholder-stone-400 focus:outline-none focus:border-estate-500 focus:ring-2 focus:ring-estate-500/20 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                {t("login.password")}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-estate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    mode === "login"
                      ? t("login.loginPlaceholder")
                      : t("login.signupPlaceholder")
                  }
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl py-2.5 pl-10 pr-11 text-sm text-stone-800 dark:text-white placeholder-stone-400 focus:outline-none focus:border-estate-500 focus:ring-2 focus:ring-estate-500/20 transition"
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
              <p className="text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-900/30 border border-rose-100 dark:border-rose-800/50 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-estate-600 to-estate-500 hover:from-estate-700 hover:to-estate-600 text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-estate-500/25 transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t("login.verifying")}
                </div>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  {mode === "login"
                    ? t("login.loginBtn")
                    : t("login.signupBtn")}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Features */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { icon: <Sparkles className="w-4 h-4" />, label: "AI Powered" },
              { icon: <Phone className="w-4 h-4" />, label: "24/7 Support" },
              { icon: <MapPin className="w-4 h-4" />, label: "500+ Listings" },
            ].map((f) => (
              <div
                key={f.label}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700"
              >
                <div className="text-estate-500">{f.icon}</div>
                <span className="text-[9px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  {f.label}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-5 text-center text-[11px] text-stone-400 dark:text-stone-500 flex items-center justify-center gap-1">
            <BadgeCheck className="w-3.5 h-3.5 text-estate-500" />
            Built by{" "}
            <span className="font-bold text-estate-700 dark:text-estate-300">
              Shivam Kumar
            </span>{" "}
            · MLH Claude Intern
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
