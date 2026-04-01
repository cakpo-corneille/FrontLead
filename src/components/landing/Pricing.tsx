"use client";
import { Check, Zap } from "lucide-react";
import { useInView } from "../../hooks/useInView";

const plans = [
  {
    name: "Starter",
    price: "Gratuit",
    period: "",
    description: "Pour tester WiFiLeads sur votre commerce",
    cta: "Commencer gratuitement",
    ctaStyle: "border",
    features: [
      "1 point d'accès WiFi",
      "Jusqu'à 100 leads/mois",
      "Formulaire par défaut",
      "Dashboard basique",
      "Export CSV",
    ],
    popular: false,
  },
  {
    name: "Pro",
    price: "4 900",
    period: "FCFA/mois",
    description: "Pour les commerçants qui veulent aller plus loin",
    cta: "Démarrer le Pro",
    ctaStyle: "solid",
    features: [
      "3 points d'accès WiFi",
      "Leads illimités",
      "Form Builder IA",
      "Double opt-in inclus",
      "Analytics avancées",
      "Campagnes SMS (100/mois)",
      "Support prioritaire",
    ],
    popular: true,
  },
  {
    name: "Business",
    price: "14 900",
    period: "FCFA/mois",
    description: "Pour les chaînes et les hôtels multi-sites",
    cta: "Contacter l'équipe",
    ctaStyle: "border",
    features: [
      "Points d'accès illimités",
      "Multi-sites centralisés",
      "API complète",
      "Intégration CRM/WhatsApp",
      "Campagnes SMS illimitées",
      "White label disponible",
      "Account manager dédié",
      "SLA 99.9%",
    ],
    popular: false,
  },
];

export function Pricing() {
  const { ref, inView } = useInView();

  return (
    <section id="pricing" ref={ref} className="py-24" style={{ background: '#1E293B' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className={`text-center mb-16 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block text-xs font-semibold tracking-widest uppercase mb-3 px-3 py-1 rounded-full" style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34D399' }}>
            Tarifs
          </span>
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-white mb-4">
            Des prix pensés pour l'Afrique de l'Ouest
          </h2>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">
            Payez en FCFA, annulez quand vous voulez. Aucune surprise sur votre facture.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-2xl p-8 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${
                plan.popular
                  ? 'shadow-2xl scale-105'
                  : 'border border-slate-800 shadow-sm'
              }`}
              style={{
                background: plan.popular ? 'linear-gradient(135deg, #1E3A8A 0%, #2563eb 100%)' : '#0F172A',
                transitionDelay: `${i * 100}ms`,
              }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold"
                    style={{ background: '#34D399', color: '#0F172A' }}
                  >
                    <Zap className="w-3 h-3" />
                    Le plus populaire
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3
                  className={`font-headline text-xl font-bold mb-1 ${plan.popular ? 'text-white' : 'text-white'}`}
                >
                  {plan.name}
                </h3>
                <p className={`text-sm ${plan.popular ? 'text-blue-200' : 'text-slate-400'}`}>{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className={`font-headline text-4xl font-bold ${plan.popular ? 'text-white' : 'text-white'}`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={`text-sm ${plan.popular ? 'text-blue-200' : 'text-slate-400'}`}>
                      {plan.period}
                    </span>
                  )}
                </div>
              </div>

              <a
                href="#"
                className={`block w-full text-center py-3 rounded-xl font-semibold text-sm mb-8 transition-all hover:opacity-90 ${
                  plan.popular
                    ? 'text-slate-900'
                    : plan.ctaStyle === 'solid'
                    ? 'text-white'
                    : 'border border-current'
                }`}
                style={{
                  background: plan.popular
                    ? '#34D399'
                    : plan.ctaStyle === 'solid'
                    ? '#1E3A8A'
                    : 'transparent',
                  color: plan.popular
                    ? '#0F172A'
                    : plan.ctaStyle === 'solid'
                    ? 'white'
                    : '#38BDF8',
                  borderColor: plan.ctaStyle !== 'solid' && !plan.popular ? '#38BDF8' : undefined,
                }}
              >
                {plan.cta}
              </a>

              <ul className="space-y-3">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3">
                    <Check
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: plan.popular ? '#34D399' : '#60A5FA' }}
                    />
                    <span className={`text-sm ${plan.popular ? 'text-blue-100' : 'text-slate-300'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
