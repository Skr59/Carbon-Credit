"use client";

import { useState, useEffect, useCallback } from "react";

const SLIDES = [
  { src: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1920&q=70", alt: "Green farmland at sunrise" },
  { src: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1920&q=70", alt: "Indian farmer in field" },
  { src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1920&q=70", alt: "Sunlit forest trees" },
  { src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1920&q=70", alt: "Misty green landscape" },
];

export default function HeroSlider({ children }: { children: React.ReactNode }) {
  const [idx, setIdx] = useState(0);
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  const next = useCallback(() => setIdx((i) => (i + 1) % SLIDES.length), []);

  useEffect(() => {
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next]);

  return (
    <section className="relative text-white overflow-hidden min-h-[560px] flex items-center">
      <div className="absolute inset-0" aria-hidden="true">
        {SLIDES.map((s, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${i === idx ? "opacity-100" : "opacity-0"}`}
          >
            {!failed[i] ? (
              <img
                src={s.src}
                alt={s.alt}
                onError={() => setFailed((f) => ({ ...f, [i]: true }))}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-green-700 via-green-600 to-emerald-500" />
            )}
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/25" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 18% 25%, rgba(255,255,255,.7) 0 1.5px, transparent 1.6px), radial-gradient(circle at 78% 60%, rgba(255,255,255,.5) 0 1.5px, transparent 1.6px)", backgroundSize: "30px 30px" }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 md:py-20 w-full">
        {children}
      </div>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${i === idx ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/70"}`}
          />
        ))}
      </div>
    </section>
  );
}