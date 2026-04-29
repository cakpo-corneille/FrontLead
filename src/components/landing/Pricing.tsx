"use client";
import Link from "next/link";
import { Check, Zap, ShieldCheck } from "lucide-react";
import { useInView } from "../../hooks/useInView";

const plans = [
  {
    name: "Starter",
    price: "2 500",
    period: "FCFA/mois",
    description: "Pour tester WiFiLeads sur votre WiFi Zone",
    cta: "Commencer gratuitement",
    href: "/signup",
    popular: false,
    urgency: null,
    note: "7 jours gratuits",
    features: [
      "1 point d'accès MikroTik ou UniFi",
      "Jusqu'à 200 clients enregistrés par mois",
      "Formulaire avec nom et téléphone",
      "Registre abonnés conforme ARCEP",
      "Téléchargement de vos contacts (CSV)",
      "Tableau de bord simple",
    ],
  },
  {
    name: "Pro",
    price: "5 000",
    period: "FCFA/mois",
    description: "Pour fidéliser vos clients et faire revenir plus de monde",
    cta: "Passer au Pro",
    href: "/signup",
    popular: true,
    urgency: "Recommandé pour être conforme ARCEP 2026",
    note: null,
    features: [
      "3 points d'accès WiFi",
      "Tous vos WiFi-Zone dans un seul espace",
      "Formulaire avec votre logo et vos couleurs",
      "Registre abonnés conforme ARCEP",
      "Vérification du numéro de téléphone (OTP)",
      "Statistiques détaillées de vos clients",
      "Assistance par WhatsApp",
    ],
  },
  {
    name: "Business",
    price: "10 000",
    period: "FCFA/mois",
    description: "Pour les chaînes, hôtels et exploitants multi-sites",
    cta: "Passer au Business",
    href: "/signup",
    popular: false,
    urgency: null,
    note: null,
    features: [
      "Points d'accès WiFi illimités",
      "Tous vos WiFi-Zone dans un seul espace",
      "Formulaire avec votre logo et vos couleurs",
      "Registre abonnés conforme ARCEP",
      "Vérification du numéro de téléphone (OTP)",
      "Statistiques détaillées de vos clients",
      "Campagnes email illimitées vers vos clients",
      "Agent IA marketing (crée vos messages automatiquement)",
      "Assistance prioritaire par WhatsApp",
    ],
  },
];

export function Pricing() {
  const { ref, inView } = useInView();

  return (
    <section id="pricing" ref={ref} className="py-24 bg-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        <div
          className={`text-center mb-16 transition-all duration-700 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span
            className="inline-block text-xs font-semibold tracking-widest uppercase mb-3 px-3 py-1 rounded-full bg-emerald-400/15 text-emerald-400"
          >
            Tarifs
          </span>
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-white mb-4">
            Simple, en FCFA, sans surprise
          </h2>
          <p className="text-blue-200 text-lg max-w-xl mx-auto">
            Annulez à tout moment. Aucuns frais cachés.
          </p>

          <div
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-sky-500/10 text-sky-400 border border-sky-500/25"
          >
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            Tous les plans incluent le registre d'abonnés exigé par l'ARCEP depuis janvier 2026
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-2xl p-8 transition-all duration-700 ${
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              } ${
                plan.popular
                  ? "shadow-2xl bg-gradient-to-br from-blue-900 to-blue-600"
                  : "border border-slate-800 bg-slate-900"
              }`}
              style={{
                transitionDelay: `${i * 100}ms`,
              }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-400 text-slate-900"
                  >
                    <Zap className="w-3 h-3" />
                    Le plus choisi
                  </span>
                </div>
              )}

              {plan.urgency && (
                <div
                  className="mb-5 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 bg-blue-500/15 text-blue-300"
                >
                  <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                  {plan.urgency}
                </div>
              )}

              <div className="mb-5">
                <h3 className="font-headline text-xl font-bold mb-1 text-white">
                  {plan.name}
                </h3>
                <p className={`text-sm ${plan.popular ? "text-blue-200" : "text-slate-400"}`}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="font-headline text-4xl font-bold text-white">
                    {plan.price}
                  </span>
                  <span className={`text-sm ${plan.popular ? "text-blue-200" : "text-slate-400"}`}>
                    {plan.period}
                  </span>
                </div>
                {plan.note && (
                  <p className="text-xs mt-1 text-emerald-400">
                    {plan.note}
                  </p>
                )}
              </div>

              <Link
                href={plan.href}
                className={`block w-full text-center py-3 rounded-xl font-semibold text-sm mb-8 transition-all hover:opacity-90 ${plan.popular ? "bg-emerald-400 text-slate-900" : "bg-transparent text-sky-400 border border-sky-400"}`}
              >
                {plan.cta}
              </Link>

              <ul className="space-y-3">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <Check
                      className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.popular ? "text-emerald-400" : "text-blue-400"}`}
                    />
                    <span
                      className={`text-sm leading-snug ${
                        plan.popular ? "text-blue-100" : "text-slate-300"
                      }`}
                    >
                      {feature.includes("ARCEP") || feature.includes("IA") ? (
                        <span>
                          {feature.split(/(ARCEP|IA)/).map((part, k) =>
                            part === "ARCEP" || part === "IA" ? (
                              <span key={k} className="text-emerald-400 font-semibold">
                                {part}
                              </span>
                            ) : (
                              part
                            )
                          )}
                        </span>
                      ) : (
                        feature
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <div
            className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-900/50 border border-white/5 backdrop-blur-sm transition-all duration-700 ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: '400ms' }}
          >
            <div className="w-8 h-8 rounded-full bg-emerald-400/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.438 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
            <p className="text-slate-400 text-sm">
              Un doute sur le plan ?{" "}
              <a
                href="https://wa.me/22964861850"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 font-semibold hover:underline"
              >
                Écrivez-nous sur WhatsApp
              </a>{" "}
              — réponse rapide.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
