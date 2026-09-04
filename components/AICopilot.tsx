"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Bot,
  Send,
  Sparkles,
  X,
  Loader,
  Home as HomeIcon,
  Zap,
  Wand2,
  Lightbulb,
} from "lucide-react";
import { PropertyData } from "./InputPanel";
import { Language } from "./SettingsContext";

export type ListingType = "buy" | "rent" | "sell" | "agent";

interface AICopilotProps {
  onApply: (data: PropertyData, listingType: ListingType) => void;
  t: (key: string) => string;
  lang: Language;
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
      "Great! Kaunsi category hai — Buy, Rent, Sell ya koi special? (e.g. `buy 4 bhk luxury villa`)",
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
    prompt: "Price/rent kitna hai? (e.g. `₹2.5 Cr onwards`)",
    hint: "Type the price",
  },
  {
    key: "highlights",
    prompt:
      "Highlights kya hai? Akshar ko `·` se separate karein. (e.g. `3000 sq.ft · Corner plot · Ready to move`)",
    hint: "Separate with · dots",
  },
];

const TYPE_META: Record<ListingType, { ignore: RegExp; label: string }> = {
  buy: { ignore: /\bbuy\b|\bsale\b|\bkhareed/i, label: "buy" },
  rent: { ignore: /\brent\b|\bkraye/i, label: "rent" },
  sell: { ignore: /\bsell\b|\bbech/i, label: "sell" },
  agent: { ignore: /\bagent\b|\brealtor|\bconsultant/i, label: "agent" },
};

const AI_SUGGESTIONS: Record<Language, string[]> = {
  en: [
    "4 BHK luxury villa in Golf City",
    "Sell my apartment in Gomti Nagar",
    "Rent a 3BHK near Hazratganj",
    "Agent post for premium consultant",
  ],
  hi: [
    "गोल्फ सिटी में 4 बीएचके लक्ज़री विला",
    "गोमती नगर में अपार्टमेंट बेचें",
    "हज़रतगंज के पास 3बीएचके किराया",
    "प्रीमियम कंसल्टेंट के लिए एजेंट पोस्ट",
  ],
  hinglish: [
    "Golf City mein 4 BHK luxury villa",
    "Gomti Nagar mein apartment becho",
    "Hazratganj ke paas 3BHK kiraye",
    "Premium consultant ke liye agent post",
  ],
};

export default function AICopilot({ onApply, t, lang }: AICopilotProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "bot",
      text: t("ai.greeting"),
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && step < QUESTIONS.length) {
      const t2 = setTimeout(() => {
        setMessages((m) => [
          ...m,
          { role: "bot", text: QUESTIONS[step].prompt },
        ]);
      }, 500);
      return () => clearTimeout(t2);
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
          title: next.title || "Luxury Property",
          location: next.location || "Lucknow, UP",
          price: next.price || "₹ On Request",
          highlights: next.highlights || "Premium · Verified · Ready to move",
        };
        onApply(data, listingType);
        setMessages((m) => [
          ...m,
          {
            role: "bot",
            text: t("ai.done"),
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
        text: t("ai.greeting"),
      },
    ]);
    setTimeout(askQuestion, 400);
  };

  const suggestions = AI_SUGGESTIONS[lang] || AI_SUGGESTIONS.en;

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
          <div className="relative">
            <Bot className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border border-white animate-ping" />
          </div>
        )}
        {!open && <span className="text-sm">AI Mode</span>}
        {!open && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-white" />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] max-w-sm bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden flex flex-col animate-fade-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-estate-700 via-estate-600 to-estate-500 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center relative">
              <Bot className="w-5 h-5 text-amber-300" />
              <Zap className="absolute -top-1 -right-1 w-3 h-3 text-amber-300" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-white text-sm flex items-center gap-1.5">
                {t("ai.title")}
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              </p>
              <p className="text-[10px] text-estate-100">
                {t("ai.subtitle")}
              </p>
            </div>
            <button
              onClick={startOver}
              className="text-[10px] font-bold bg-white/15 text-white px-2.5 py-1 rounded-lg hover:bg-white/25 transition"
            >
              {t("ai.reset")}
            </button>
          </div>

          {/* Suggestions */}
          {step === 0 && messages.length <= 1 && (
            <div className="px-4 pt-3 flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-estate-700 dark:text-estate-300 bg-estate-50 dark:bg-estate-900/40 border border-estate-200 dark:border-estate-700 px-3 py-1.5 rounded-full hover:bg-estate-100 dark:hover:bg-estate-800/40 transition-all"
                >
                  <Lightbulb className="w-3 h-3 text-amber-500" />
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          <div
            ref={bodyRef}
            className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[360px] bg-stone-50 dark:bg-stone-800/50"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                } animate-fade-in`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-estate-600 text-white rounded-br-sm"
                      : "bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-stone-700 dark:text-stone-200 rounded-bl-sm shadow-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-stone-500 dark:text-stone-400 rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex items-center gap-2 text-sm">
                  <Loader className="w-4 h-4 animate-spin text-estate-500" />
                  {t("ai.thinking")}
                </div>
              </div>
            )}
          </div>

          {/* Progress */}
          <div className="px-4 pt-1">
            <div className="h-1.5 bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-estate-500 to-amber-400 transition-all duration-500"
                style={{
                  width: `${(Math.min(step, QUESTIONS.length) / QUESTIONS.length) * 100}%`,
                }}
              />
            </div>
            <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1">
              {step < QUESTIONS.length
                ? `${t("ai.stepProgress")} ${step + 1} ${t("ai.of")} ${QUESTIONS.length}`
                : `${t("ai.ready")} 🎉`}
            </p>
          </div>

          {/* Input */}
          <div className="p-3 border-t border-stone-100 dark:border-stone-700 flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
              placeholder={
                step < QUESTIONS.length
                  ? QUESTIONS[step].hint
                  : "/reset"
              }
              className="flex-1 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 dark:text-white placeholder-stone-400 focus:outline-none focus:border-estate-500 focus:ring-2 focus:ring-estate-500/20 transition"
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
