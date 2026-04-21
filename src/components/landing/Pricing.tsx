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
    <section id="pricing" ref={ref} className="py-24" style={{ background: "#1E293B" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        <div
          className={`text-center mb-16 transition-all duration-700 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span
            className="inline-block text-xs font-semibold tracking-widest uppercase mb-3 px-3 py-1 rounded-full"
            style={{ background: "rgba(52, 211, 153, 0.15)", color: "#34D399" }}
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
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium"
            style={{
              background: "rgba(239,68,68,0.12)",
              color: "#f87171",
              border: "1px solid rgba(239,68,68,0.25)",
            }}
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
                  ? "shadow-2xl"
                  : "border border-slate-800"
              }`}
              style={{
                background: plan.popular
                  ? "linear-gradient(135deg, #1E3A8A 0%, #2563eb 100%)"
                  : "#0F172A",
                transitionDelay: `${i * 100}ms`,
              }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold"
                    style={{ background: "#34D399", color: "#0F172A" }}
                  >
                    <Zap className="w-3 h-3" />
                    Le plus choisi
                  </span>
                </div>
              )}

              {plan.urgency && (
                <div
                  className="mb-5 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2"
                  style={{ background: "rgba(239,68,68,0.15)", color: "#fca5a5" }}
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
                  <p className="text-xs mt-1" style={{ color: "#34D399" }}>
                    {plan.note}
                  </p>
                )}
              </div>

              <Link
                href={plan.href}
                className="block w-full text-center py-3 rounded-xl font-semibold text-sm mb-8 transition-all hover:opacity-90"
                style={{
                  background: plan.popular ? "#34D399" : "transparent",
                  color: plan.popular ? "#0F172A" : "#38BDF8",
                  border: plan.popular ? "none" : "1px solid #38BDF8",
                }}
              >
                {plan.cta}
              </Link>

              <ul className="space-y-3">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <Check
                      className="w-4 h-4 flex-shrink-0 mt-0.5"
                      style={{ color: plan.popular ? "#34D399" : "#60A5FA" }}
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
                              <span key={k} style={{ color: "#34D399", fontWeight: 600 }}>
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

        <p className="text-center text-slate-500 text-sm mt-10">
          Vous ne savez pas quel plan choisir ?{" "}
          <a
            href="https://wa.me/22964861850"
            target="_blank"
            rel="noreferrer"
            className="underline"
            style={{ color: "#34D399" }}
          >
            Écrivez-nous sur WhatsApp
          </a>{" "}
          — on vous répond rapidement.
        </p>
      </div>
    </section>
  );
}
