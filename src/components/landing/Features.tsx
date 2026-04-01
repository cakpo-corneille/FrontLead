"use client";
import { useInView } from "../../hooks/useInView";
import { Sparkles, ShieldCheck, BarChart3, Plug } from "lucide-react";

const features = [
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "Form Builder propulsé par l'IA",
    description: "Décrivez votre commerce en une phrase, l'IA génère un formulaire personnalisé en quelques secondes. Champs texte, email, téléphone, menu déroulant, tout est configurable.",
    image: "/feat-form-editor.png",
    alt: "Éditeur de formulaire IA",
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "Double opt-in intégré",
    description: "Chaque contact est vérifié par SMS ou email avant d'entrer dans votre base. Vous obtenez des données réelles, pas des faux numéros.",
    image: "/feat-double-opt.png",
    alt: "Configuration double opt-in",
  },
  {
    icon: <Plug className="w-6 h-6" />,
    title: "Intégration en 5 minutes",
    description: "Compatible MikroTik, UniFi, pfSense et 12 autres systèmes. Un snippet, une clé API. Pas besoin de technicien réseau.",
    image: "/feat-integration.jpg",
    alt: "Guide d'intégration portail captif",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Analytics en temps réel",
    description: "Tableau de bord complet avec KPIs, taux de retour par client, activité horaire, et exportation CSV. Sachez exactement qui vient et à quelle fréquence.",
    image: "/feat-clients.png",
    alt: "Liste des clients et leads",
  },
];

export function Features() {
  const { ref, inView } = useInView();

  return (
    <section id="features" ref={ref} className="relative py-24 overflow-hidden" style={{ background: '#0F172A' }}>
      <style>{`
        @keyframes orb-float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(40px, -60px) scale(1.1); }
          66%       { transform: translate(-30px, 30px) scale(0.95); }
        }
        @keyframes orb-float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40%       { transform: translate(-50px, 40px) scale(1.08); }
          70%       { transform: translate(35px, -35px) scale(0.92); }
        }
        @keyframes orb-float-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(25px, 55px) scale(1.05); }
        }
        .orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }
        .orb-1 { animation: orb-float-1 14s ease-in-out infinite; }
        .orb-2 { animation: orb-float-2 18s ease-in-out infinite; }
        .orb-3 { animation: orb-float-3 22s ease-in-out infinite; }
      `}</style>

      <div className="orb orb-1" style={{ width: 420, height: 420, top: '-80px', left: '-100px', background: 'rgba(30,58,138,0.35)' }} />
      <div className="orb orb-2" style={{ width: 360, height: 360, bottom: '10%', right: '-80px', background: 'rgba(52,211,153,0.18)' }} />
      <div className="orb orb-3" style={{ width: 280, height: 280, top: '40%', left: '45%', background: 'rgba(56,189,248,0.12)' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className={`text-center mb-16 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block text-xs font-semibold tracking-widest uppercase mb-3 px-3 py-1 rounded-full" style={{ background: 'rgba(52,211,153,0.12)', color: '#34D399' }}>
            Fonctionnalités
          </span>
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-white mb-4">
            Tout ce qu'il vous faut pour transformer votre WiFi
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Une plateforme conçue pour les commerçants d'Afrique de l'Ouest, pas pour des équipes IT multinationaux.
          </p>
        </div>

        <div className="space-y-24">
          {features.map((feature, i) => (
            <div
              key={i}
              className={`grid md:grid-cols-2 gap-12 items-center transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className={i % 2 === 1 ? 'md:order-2' : ''}>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 text-white"
                  style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #2563eb 100%)' }}
                >
                  {feature.icon}
                </div>
                <h3 className="font-headline text-2xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed text-lg mb-6">{feature.description}</p>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 text-sm font-semibold transition-colors"
                  style={{ color: '#34D399' }}
                >
                  En savoir plus →
                </a>
              </div>

              <div className={`${i % 2 === 1 ? 'md:order-1' : ''}`}>
                <div className="rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={feature.image}
                    alt={feature.alt}
                    className="w-full object-cover object-top"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
