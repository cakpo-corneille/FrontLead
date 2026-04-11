"use client";
import Link from "next/link";
import { ArrowRight, Wifi } from "lucide-react";
import { useInView } from "../../hooks/useInView";

export function CTASection() {
  const { ref, inView } = useInView();

  return (
    <section
      ref={ref}
      className="py-24 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 60%, #1e40af 100%)' }}
    >
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle, #34D399 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div
        className={`max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8"
          style={{ background: 'rgba(52,211,153,0.2)', border: '1px solid rgba(52,211,153,0.3)' }}
        >
          <Wifi className="w-8 h-8 text-green-400" />
        </div>

        <h2 className="font-headline text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          Votre prochain client entre déjà
          <br />
          <span style={{ color: '#34D399' }}>dans votre établissement.</span>
        </h2>

        <p className="text-blue-200 text-xl mb-10 max-w-2xl mx-auto">
          Ne le laissez plus repartir sans son contact. Commencez gratuitement aujourd'hui.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl font-bold text-base transition-all hover:opacity-90 hover:scale-105"
            style={{ background: '#34D399', color: '#0F172A' }}
          >
            Créer mon compte gratuit
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#faq"
            className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl font-bold text-base text-white border border-white/20 hover:border-white/40 transition-all"
          >
            Lire la FAQ
          </a>
        </div>

        <p className="text-blue-300 text-sm mt-6">
          Aucune carte bancaire · Installation en 5 minutes · Support en français
        </p>
      </div>
    </section>
  );
}
