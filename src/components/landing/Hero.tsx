"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";
import { useInView } from "../../hooks/useInView";

const PHASES = [
  { duration: 3200, label: "Portail actuel", caption: "Le portail captif de votre routeur WiFi" },
  { duration: 3200, label: "Avec WiFiLeads", caption: "✦ L'overlay WiFiLeads s'affiche par-dessus" },
  { duration: 4000, label: "Vos leads",       caption: "✦ Les données arrivent dans votre dashboard" },
];

function PhoneShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative w-[240px] h-[490px] rounded-[32px] overflow-hidden shadow-2xl flex-shrink-0"
      style={{ border: "10px solid #0f172a" }}
    >
      {children}
    </div>
  );
}

function BeforePanel() {
  return (
    <div className="absolute inset-0 flex flex-col items-center p-4 gap-2.5 overflow-hidden"
      style={{ background: "linear-gradient(160deg,#4c1d95 0%,#5b21b6 40%,#6d28d9 100%)" }}>
      <p className="text-white font-bold text-base tracking-wide mt-1">WiFi Zone</p>
      <div className="flex gap-2">
        <button className="px-3 py-1.5 rounded-md bg-white/20 border border-white/30 text-white text-[10px] font-semibold">≡ TICKET</button>
        <button className="px-3 py-1.5 rounded-md bg-white/10 border border-white/20 text-white/70 text-[10px]">○ COMPTE</button>
      </div>
      <p className="text-white/80 text-[9px] text-center leading-relaxed">Entrez le code du Ticket puis cliquez sur CONNEXION</p>
      <input className="w-full rounded-md border-0 py-2 px-3 text-[11px] text-center text-gray-400 bg-white outline-none" placeholder="Code Ticket" readOnly />
      <div className="w-full bg-green-600 rounded-md py-2 text-white text-[11px] font-bold text-center">→ CONNEXION</div>
      <div className="w-full bg-amber-400 rounded-md py-2 text-amber-900 text-[11px] font-bold text-center">NOS TARIFS</div>
      <div className="w-full rounded-lg overflow-hidden bg-white/10 p-2">
        <p className="text-white text-[10px] font-bold text-center mb-1.5">Tickets</p>
        <table className="w-full text-[9px]">
          <thead>
            <tr className="bg-white/20">
              {["DURÉE","VALIDITÉ","PRIX"].map(h => (
                <th key={h} className="py-1 px-1 text-white font-semibold text-center">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[["4 Heures","12 Heures","100 FCFA"],["1 Jour","24 Heures","200 FCFA"],["3 Jours","5 Jours","500 FCFA"],["7 Jours","1 Semaine","1000 FCFA"]].map(([d,v,p]) => (
              <tr key={d} className="border-b border-white/10">
                <td className="py-1 px-1 text-white/90 text-center">{d}</td>
                <td className="py-1 px-1 text-white/90 text-center">{v}</td>
                <td className="py-1 px-1 text-amber-300 font-semibold text-center">{p}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-white/30 text-[8px] mt-auto pb-6">Copyright © 2024</p>
    </div>
  );
}

function AfterPanel() {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-3"
      style={{ background: "linear-gradient(160deg,#4c1d95 0%,#5b21b6 40%,#6d28d9 100%)" }}>
      <div className="absolute inset-0 bg-[rgba(15,7,40,0.55)]" />
      <div className="relative bg-white rounded-2xl p-4 w-full max-w-[210px] shadow-xl mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
              <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-bold text-slate-900 leading-tight">Business CAKPO</p>
            <p className="text-[9px] text-slate-400 leading-snug">Partagez vos coordonnées pour profiter du WiFi gratuit</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div>
            <label className="text-[10px] text-gray-700 font-semibold">Nom <span className="text-red-500">*</span></label>
            <div className="mt-0.5 border border-gray-200 rounded-lg py-1.5 px-2.5 text-[10px] text-gray-400 bg-gray-50">votre nom</div>
          </div>
          <div>
            <label className="text-[10px] text-gray-700 font-semibold">Téléphone <span className="text-red-500">*</span></label>
            <div className="mt-0.5 border border-gray-200 rounded-lg py-1.5 px-2.5 text-[10px] text-gray-400 bg-gray-50 flex items-center gap-1.5">
              <span>🇧🇯</span><span>+229 ...</span>
            </div>
          </div>
          <button className="w-full py-2 rounded-xl text-white text-[11px] font-bold text-center mt-1"
            style={{ background: "linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)" }}>
            Valider mes informations
          </button>
          <p className="text-[8px] text-gray-400 text-center">Propulsé par <strong>WiFiLeads</strong></p>
        </div>
      </div>
    </div>
  );
}

function DashboardPanel() {
  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-2xl">
      <img src="/wifileads-dashboard-hero.png" alt="Dashboard WiFiLeads" className="w-full block" />
    </div>
  );
}

function HeroVisual() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase(p => (p + 1) % PHASES.length);
    }, PHASES[phase].duration);
    return () => clearTimeout(timer);
  }, [phase]);

  const labelColors = ["#a78bfa", "#34D399", "#38BDF8"];

  return (
    <div className="flex flex-col items-center gap-4 select-none">

      {/* Étiquettes de phase */}
      <div className="flex items-center gap-2 text-xs">
        {PHASES.map((p, i) => (
          <span key={i} className="flex items-center gap-2">
            <span
              className="px-3 py-1 rounded-full font-medium transition-all duration-500"
              style={{
                background: phase === i ? `${labelColors[i]}22` : "rgba(0,0,0,0.1)",
                color: phase === i ? labelColors[i] : "#475569",
              }}
            >
              {p.label}
            </span>
            {i < PHASES.length - 1 && <span className="text-slate-600">→</span>}
          </span>
        ))}
      </div>

      {/* Zone d'affichage */}
      <div className="relative flex items-center justify-center" style={{ minHeight: 620, width: "100%" }}>

        {/* Phase 0 : portail captif */}
        <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-700"
          style={{ opacity: phase === 0 ? 1 : 0, pointerEvents: phase === 0 ? "auto" : "none" }}>
          <PhoneShell><BeforePanel /></PhoneShell>
        </div>

        {/* Phase 1 : overlay WiFiLeads */}
        <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-700"
          style={{ opacity: phase === 1 ? 1 : 0, pointerEvents: phase === 1 ? "auto" : "none" }}>
          <PhoneShell><AfterPanel /></PhoneShell>
        </div>

        {/* Phase 2 : dashboard */}
        <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-700"
          style={{ opacity: phase === 2 ? 1 : 0, pointerEvents: phase === 2 ? "auto" : "none" }}>
          <DashboardPanel />
        </div>

      </div>

      {/* Indicateurs de progression */}
      <div className="flex gap-2">
        {PHASES.map((_, i) => (
          <span
            key={i}
            className="h-1.5 rounded-full transition-all duration-500"
            style={{
              width: phase === i ? "24px" : "8px",
              background: phase === i ? labelColors[i] : "rgba(255,255,255,0.2)",
            }}
          />
        ))}
      </div>

      {/* Légende */}
      <p className="text-[11px] text-slate-400 text-center transition-all duration-500">
        {PHASES[phase].caption}
      </p>
    </div>
  );
}

export function Hero() {
  const { ref, inView } = useInView();

  return (
    <section
      ref={ref}
      className="relative min-h-[95vh] flex items-center pt-20 pb-16 overflow-hidden"
      style={{ background: "linear-gradient(135deg,#0F172A 0%,#1E3A8A 60%,#1e40af 100%)" }}
    >
      <div
        className="absolute inset-0 opacity-10"
        style={{ backgroundImage: `radial-gradient(circle, #34D399 1px, transparent 1px)`, backgroundSize: "32px 32px" }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">

          <div className={`transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
              style={{ background: "rgba(52,211,153,0.15)", color: "#34D399", border: "1px solid rgba(52,211,153,0.3)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              Pour les commerces en Afrique de l'Ouest
            </div>

            <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6">
              Chaque connexion WiFi est{" "}
              <span style={{ color: "#34D399" }}>un lead</span>
            </h1>

            <p className="text-lg text-blue-100 leading-relaxed mb-8 max-w-lg">
              Un seul snippet dans votre portail captif. Vos visiteurs WiFi remplissent votre formulaire. Leurs données arrivent dans votre dashboard, sans rien changer à votre routeur.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Link href="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-base transition-all hover:opacity-90 hover:scale-105"
                style={{ background: "#34D399", color: "#0F172A" }}>
                Créer mon compte gratuit <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-base text-white border border-white/20 hover:border-white/40 transition-all">
                Voir comment ça marche
              </a>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-blue-200">
              {["Sans carte bancaire", "Prêt en 2 minutes", "Annulable à tout moment"].map(item => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />{item}
                </span>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-blue-300 mb-3">Compatible avec</p>
              <div className="flex flex-wrap gap-2">
                {["MikroTik", "UniFi", "pfSense", "TP-Link"].map(r => (
                  <span key={r} className="px-3 py-1 rounded-md text-xs font-medium text-blue-200 border border-white/10 bg-white/5">{r}</span>
                ))}
              </div>
            </div>
          </div>

          <div className={`transition-all duration-700 delay-200 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <HeroVisual />
          </div>

        </div>
      </div>
    </section>
  );
}
