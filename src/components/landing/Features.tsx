"use client";
import { useInView } from "../../hooks/useInView";
import { Sparkles, ShieldCheck, BarChart3, Plug } from "lucide-react";

const features = [
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "Votre formulaire créé par l'IA en 10 secondes",
    description:
      "Dites à l'IA ce que vous voulez collecter (nom, numéro, email, quartier) et elle construit le formulaire à votre place. Vous n'avez rien à configurer manuellement.",
    image: "/images/feat-form-editor.png",
    alt: "Création de formulaire par IA",
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "Seuls les vrais numéros entrent dans votre liste",
    description:
      "Avant d'accéder au WiFi, chaque client reçoit un code sur son téléphone et doit le saisir. Résultat\u00A0: votre liste ne contient que des numéros réels. Vous êtes aussi conforme aux exigences d'identification des abonnés imposées par l'ARCEP.",
    image: "/images/feat-double-opt.png",
    alt: "Vérification du numéro de téléphone",
  },
  {
    icon: <Plug className="w-6 h-6" />,
    title: "Compatible MikroTik, installé en moins de 10 minutes",
    description:
      "Vous copiez-collez un code dans votre page MikroTik, c'est tout. Si vous n'êtes pas à l'aise avec ça, notre équipe le fait pour vous gratuitement. Aucun technicien réseau nécessaire.",
    image: "/images/feat-integration.jpg",
    alt: "Installation sur routeur MikroTik",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Voyez exactement qui vient et qui revient",
    description:
      "Votre espace affiche combien de clients sont venus aujourd'hui, à quelle heure votre WiFi Zone est la plus active, et qui sont vos clients les plus fidèles. En un coup d'œil, tous les jours.",
    image: "/images/feat-clients.png",
    alt: "Tableau de bord des clients",
  },
];

export function Features() {
  const { ref, inView } = useInView();

  return (
    <section
      id="features"
      ref={ref}
      className="relative py-24 overflow-hidden bg-slate-900"
    >
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

      <div
        className="orb orb-1 bg-blue-900/35"
        style={{ width: 420, height: 420, top: "-80px", left: "-100px" }}
      />
      <div
        className="orb orb-2 bg-emerald-400/20"
        style={{ width: 360, height: 360, bottom: "10%", right: "-80px" }}
      />
      <div
        className="orb orb-3 bg-sky-400/10"
        style={{ width: 280, height: 280, top: "40%", left: "45%" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* En-tête */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span
            className="inline-block text-xs font-semibold tracking-widest uppercase mb-3 px-3 py-1 rounded-full bg-emerald-400/10 text-emerald-400"
          >
            Ce que vous obtenez
          </span>
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-white mb-4">
            Tout pour faire revenir vos clients
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Conçu pour les gérants de WiFi Zone au Bénin et au Togo, pas pour des informaticiens.
          </p>
        </div>

        {/* Liste des features */}
        <div className="space-y-24">
          {features.map((feature, i) => (
            <div
              key={i}
              className={`grid md:grid-cols-2 gap-12 items-center transition-all duration-700 ${
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {/* Texte */}
              <div className={i % 2 === 1 ? "md:order-2" : ""}>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 text-white bg-gradient-to-br from-blue-900 to-blue-600"
                >
                  {feature.icon}
                </div>
                <h3 className="font-headline text-2xl font-bold text-white mb-3">
                  {/* Mettre ARCEP en vert si présent */}
                  {feature.title.includes("ARCEP") ? (
                    <>
                      {feature.title.split("ARCEP")[0]}
                      <span className="text-emerald-400">ARCEP</span>
                      {feature.title.split("ARCEP")[1]}
                    </>
                  ) : (
                    feature.title
                  )}
                </h3>
                <p className="text-slate-400 leading-relaxed text-lg">
                  {/* Mettre ARCEP en vert dans la description aussi */}
                  {feature.description.includes("ARCEP") ? (
                    <>
                      {feature.description.split("ARCEP")[0]}
                      <span className="text-emerald-400 font-semibold">ARCEP</span>
                      {feature.description.split("ARCEP")[1]}
                    </>
                  ) : (
                    feature.description
                  )}
                </p>
              </div>

              {/* Image */}
              <div className={i % 2 === 1 ? "md:order-1" : ""}>
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
