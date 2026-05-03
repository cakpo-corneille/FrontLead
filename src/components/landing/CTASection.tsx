"use client";
import Link from "next/link";
import { ArrowRight, MessageCircle, Wifi } from "lucide-react";
import { useInView } from "../../hooks/useInView";

export function CTASection() {
  const { ref, inView } = useInView();

  return (
    <section
      ref={ref}
      className="py-24 relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800"
    >
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle, #34D399 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div
        className={`max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10 transition-all duration-700 ${
          inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Icône */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8 bg-emerald-400/20 border border-emerald-400/30"
        >
          <Wifi className="w-8 h-8 text-green-400" />
        </div>

        {/* Titre */}
        <h2 className="font-headline text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
          Votre prochain client entre déjà
          <br />
          <span className="text-emerald-400">dans votre WiFi Zone.</span>
        </h2>

        {/* Sous-titre avec mention ARCEP */}
        <p className="text-blue-200 text-xl mb-3 max-w-2xl mx-auto">
          Ne le laissez plus repartir sans son contact.
        </p>
        <p className="text-blue-300 text-base mb-10 max-w-xl mx-auto">
          Vos données seront dans un registre conforme{" "}
          <span className="text-emerald-400 font-semibold">ARCEP</span>{" "}
          dès le premier client enregistré.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl font-bold text-base transition-all hover:opacity-90 hover:scale-105 bg-emerald-400 text-slate-900"
          >
            Enregistrer mes premiers clients
            <ArrowRight className="w-5 h-5" />
          </Link>

          <a
            href="https://wa.me/22964861850"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl font-bold text-base text-white border border-white/20 hover:border-white/40 transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            Nous écrire sur WhatsApp
          </a>
        </div>

        {/* Rassurances */}
        <p className="text-blue-300 text-sm mt-6">
          Aucune carte bancaire · Fonctionne avec MikroTik · On vous aide sur WhatsApp
        </p>
      </div>
    </section>
  );
}
