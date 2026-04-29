"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useInView } from "../../hooks/useInView";

export function Hero() {
  const { ref, inView } = useInView();

  return (
    <section
      ref={ref}
      className="relative min-h-[85vh] flex items-center py-16 overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800"
    >
      <div
        className="absolute inset-0 opacity-10"
        style={{ backgroundImage: `radial-gradient(circle, #34D399 1px, transparent 1px)`, backgroundSize: "32px 32px" }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Colonne de gauche : Texte et CTAs */}
          <div className={`transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6">
              Vos clients WiFi,{" "}
              <span className="text-emerald-400">enregistrés et fidélisés</span>{" "}
              automatiquement
            </h1>

            <p className="text-lg text-blue-100 leading-relaxed mb-8 max-w-lg">
              Avant d'accéder à votre WiFi, vos clients laissent leur nom et leur numéro. Vous les retrouvez dans votre espace en ligne. Relancez-les par SMS. Aucune modification de votre routeur MikroTik.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link href="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-base transition-all hover:opacity-90 hover:scale-105 bg-emerald-400 text-slate-900">
                Créer mon compte gratuit <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-base text-white border border-white/20 hover:border-white/40 transition-all">
                Voir comment ça marche
              </a>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-blue-300/60">
              {["Fonctionne avec MikroTik", "Sans technicien", "Conforme ARCEP"].map(item => (
                <span key={item} className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-emerald-400/40" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Colonne de droite : Image statique du Dashboard */}
          <div className={`transition-all duration-700 delay-200 ${inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
            <div className="relative group">
              {/* Effet de halo derrière l'image */}
              <div className="absolute -inset-4 bg-emerald-400/10 rounded-[2rem] blur-2xl group-hover:bg-emerald-400/15 transition-all duration-700" />

              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900/50 backdrop-blur-sm">
                <img
                  src="/images/wifileads-dashboard-hero.png"
                  alt="Dashboard WiFiLeads"
                  className="w-full h-auto block transition-transform duration-700 group-hover:scale-[1.02]"
                />
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
