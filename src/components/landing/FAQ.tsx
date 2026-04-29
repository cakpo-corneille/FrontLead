"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useInView } from "../../hooks/useInView";

const faqs = [
  {
    q: "Est-ce que WiFiLeads m'aide à être en règle avec l'ARCEP ?",
    a: "Oui, c'est même l'un des avantages principaux. Depuis janvier 2026, l'ARCEP Bénin exige que tout exploitant de WiFi Zone identifie ses abonnés. WiFiLeads collecte automatiquement le nom, le numéro et l'email de chaque utilisateur via un formulaire vérifié par OTP. Vous avez ainsi un registre complet et à jour, prêt à présenter en cas de contrôle.",
  },
  {
    q: "Est-ce que ça marche avec mon routeur MikroTik ?",
    a: "Oui, MikroTik est le système le plus utilisé au Bénin et nous l'avons testé en priorité. L'intégration se fait en ajoutant notre domaine à la liste blanche (Walled Garden) de votre portail captif, puis en collant le snippet dans votre page HTML. Moins de 5 minutes.",
  },
  {
    q: "Mes clients doivent-ils installer quelque chose ?",
    a: "Non, absolument rien. Le widget apparaît directement dans le navigateur de vos clients quand ils se connectent au WiFi. Pas d'application, pas de téléchargement, pas de compte à créer.",
  },
  {
    q: "Que se passe-t-il si un client refuse de remplir le formulaire ?",
    a: "Vous pouvez configurer WiFiLeads pour donner un accès limité (ex : 10 minutes) sans remplir le formulaire, ou bloquer l'accès complètement jusqu'à soumission. Le choix vous appartient dans les paramètres de configuration.",
  },
  {
    q: "Est-il légal de collecter ces données client ?",
    a: "Oui. En Afrique de l'Ouest, la collecte de données dans le cadre d'un accès WiFi est encadrée et même encouragée par l'ARCEP (au Bénin comme au Togo). WiFiLeads affiche automatiquement une mention de consentement visible dans le formulaire. Vos clients savent ce qu'ils acceptent. Vous êtes protégé.",
  },
  {
    q: "Puis-je personnaliser le formulaire avec mon logo et mes couleurs ?",
    a: "Absolument. Chaque plan inclut la personnalisation du logo, du nom de l'établissement, des couleurs et des champs du formulaire. Le plan Business inclut en plus le white label complet (suppression de la mention WiFiLeads).",
  },
  {
    q: "Mes données sont-elles stockées en sécurité ?",
    a: "Toutes les données sont chiffrées en transit (HTTPS) et au repos. Nous utilisons des serveurs en Europe (OVH) avec des sauvegardes quotidiennes. Vous pouvez exporter ou supprimer vos données à tout moment depuis le dashboard.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const { ref, inView } = useInView();

  return (
    <section id="faq" ref={ref} className="py-24 bg-slate-900 border-t border-white/5 relative overflow-hidden">
      <div
        className="absolute top-0 left-1/4 w-64 h-64 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"
      />
      <div
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none"
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
        <div className={`text-center mb-16 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block text-xs font-semibold tracking-widest uppercase mb-3 px-3 py-1 rounded-full bg-emerald-400/10 text-emerald-400">
            FAQ
          </span>
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-white mb-4">
            Questions fréquentes
          </h2>
          <p className="text-slate-400">Toutes vos questions, répondues honnêtement.</p>
        </div>

        <div className={`space-y-3 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/10 overflow-hidden bg-slate-900"
            >
              <button
                className="w-full flex items-center justify-between p-6 text-left transition-colors hover:bg-white/5"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-headline font-semibold text-white pr-4">{faq.q}</span>
                <ChevronDown
                  className="w-5 h-5 text-slate-500 flex-shrink-0 transition-transform duration-300"
                  style={{ transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>
              {open === i && (
                <div className="px-6 pb-6 border-t border-white/5 pt-4">
                  <p className="text-slate-400 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
