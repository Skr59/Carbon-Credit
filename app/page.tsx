import Link from "next/link";
import { Leaf, Calculator, UserPlus, Shield, ArrowRight, BarChart3, Truck, Wallet, Plane } from "lucide-react";

const TOOLS = [
  {
    href: "/carbon-farmer",
    title: "Farmer Carbon Hub",
    desc: "Register your land, measure trees & vehicles, earn carbon credits and sell them on the marketplace.",
    icon: Leaf,
    cta: "Open Farmer Hub",
    color: "bg-green-600",
  },
  {
    href: "/carbon-credit",
    title: "Carbon Credit Calculator",
    desc: "Quickly calculate the carbon credits your land and trees generate — live market value included.",
    icon: Calculator,
    cta: "Open Calculator",
    color: "bg-emerald-600",
  },
  {
    href: "/drone",
    title: "Carbon Drone Survey",
    desc: "Pair a survey drone with your laptop or phone, watch its live camera and plan field missions.",
    icon: Plane,
    cta: "Open Drone Command",
    color: "bg-sky-600",
  },
  {
    href: "/admin",
    title: "Admin Panel",
    desc: "Administrator console — manage farmers, verification status and marketplace listings.",
    icon: Shield,
    cta: "Open Admin Panel",
    color: "bg-gray-900",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 18% 25%, rgba(255,255,255,.7) 0 1.5px, transparent 1.6px), radial-gradient(circle at 78% 60%, rgba(255,255,255,.5) 0 1.5px, transparent 1.6px)", backgroundSize: "30px 30px" }} />
        <div className="absolute -right-16 -top-16 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-10 w-64 h-64 bg-emerald-300/20 rounded-full blur-3xl" />
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-20 relative">
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 text-sm font-semibold mb-5 backdrop-blur">
            <Leaf className="w-4 h-4" /> Kisan Carbon Hub
          </div>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight max-w-2xl">
            Earn money by saving the planet
          </h1>
          <p className="mt-4 text-green-50 md:text-lg max-w-xl">
            Indian farmers — register your farmland, track trees and vehicles, and earn real carbon credits
            that you can sell on the digital marketplace.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/carbon-farmer"
              className="inline-flex items-center gap-2 bg-white text-green-700 font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-green-50 transition"
            >
              <UserPlus className="w-5 h-5" /> Register your farm
            </Link>
            <Link
              href="/carbon-credit"
              className="inline-flex items-center gap-2 border border-white/40 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/10 transition"
            >
              <BarChart3 className="w-5 h-5" /> Calculate credits
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl text-sm">
            {[
              { icon: Leaf, label: "Lands & trees tracked", value: "per account" },
              { icon: Truck, label: "Vehicles & pollution", value: "offset calculator" },
              { icon: Wallet, label: "Live digital market", value: "sell your credits" },
              { icon: Shield, label: "Private & secure", value: "only you see your data" },
            ].map((f) => (
              <div key={f.label} className="flex items-start gap-2.5 bg-white/10 rounded-2xl p-3 backdrop-blur">
                <f.icon className="w-5 h-5 shrink-0 text-green-100" />
                <div>
                  <div className="font-semibold leading-tight">{f.label}</div>
                  <div className="text-xs text-green-100/80">{f.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6">The platform</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {TOOLS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl hover:-translate-y-1 hover:border-green-200 transition-all duration-300 flex flex-col"
            >
              <div className={`w-12 h-12 rounded-xl ${t.color} flex items-center justify-center mb-4`}>
                <t.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900">{t.title}</h3>
              <p className="text-sm text-gray-500 mt-1.5 flex-1">{t.desc}</p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-600 mt-4 group-hover:gap-2.5 transition-all">
                {t.cta} <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
          <span>© 2026 Kisan Carbon Hub</span>
          <span className="text-xs text-gray-400">Built by Shivam Kumar</span>
        </div>
      </footer>
    </main>
  );
}