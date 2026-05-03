"use client";
import { useInView } from "../../hooks/useInView";

export function HowItWorks() {
  const { ref, inView } = useInView();

  const steps = [
    {
      number: "01",
      title: "Ajoutez le code sur votre page MikroTik",
      description: "Copiez-collez une seule ligne dans votre fichier login.html MikroTik. Si vous n'êtes pas à l'aise, notre équipe le fait pour vous gratuitement. Moins de 10 minutes.",
      visual: (
        <div className="rounded-xl overflow-hidden shadow-lg" style={{ background: '#0F172A' }}>
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/10">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="w-3 h-3 rounded-full bg-green-400" />
            <span className="ml-4 text-xs text-slate-500 font-mono">captive-portal.html</span>
          </div>
          <div className="p-4 font-mono text-xs leading-relaxed">
            <span className="text-pink-400">&lt;script</span>
            <br />
            <span className="text-cyan-400 ml-4">src</span>
            <span className="text-white">=</span>
            <span className="text-amber-300">"https://app.wifileads.io/widget.js"</span>
            <br />
            <span className="text-cyan-400 ml-4">data-key</span>
            <span className="text-white">=</span>
            <span className="text-amber-300">"a1b2c3..."</span>
            <span className="text-pink-400">&gt;&lt;/script&gt;</span>
          </div>
          <div className="px-4 pb-3">
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium" style={{ background: 'rgba(52,211,153,0.15)', color: '#34D399' }}>
              ✓ C'est tout. Aucune autre configuration.
            </span>
          </div>
        </div>
      ),
    },
    {
      number: "02",
      title: "Le formulaire s'affiche",
      description: "Quand un client se connecte au WiFi, votre formulaire personnalisé apparaît automatiquement par-dessus son portail habituel. Aucune installation côté client.",
      visual: (
        <div className="relative">
          <div
            className="rounded-2xl overflow-hidden shadow-xl mx-auto w-48"
            style={{ border: '8px solid #0f172a', background: 'linear-gradient(160deg, #4c1d95, #6d28d9)' }}
          >
            <div className="p-3">
              <p className="text-white font-bold text-xs text-center mb-2">WiFi Zone</p>
              <div className="relative">
                <div className="opacity-30 space-y-1.5 mb-2">
                  <div className="bg-white rounded h-5 w-full opacity-80 text-center text-[8px] flex items-center justify-center text-gray-400">Code Ticket</div>
                  <div className="bg-green-600 rounded h-5 w-full text-center text-[8px] flex items-center justify-center text-white">→ CONNEXION</div>
                </div>
                <div className="bg-white rounded-xl p-2 shadow-lg">
                  <div className="flex items-center gap-1 mb-2">
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-[8px] text-slate-900">Café Le Palmier</p>
                      <p className="text-[6px] text-slate-400">Partagez vos coordonnées</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="border border-gray-200 rounded px-1.5 py-1 text-[7px] text-gray-400 bg-gray-50">votre nom</div>
                    <div className="border border-gray-200 rounded px-1.5 py-1 text-[7px] text-gray-400 bg-gray-50 flex gap-1">
                      <span>🇧🇯</span><span>+229...</span>
                    </div>
                    <div className="py-1.5 rounded text-center text-[8px] font-bold text-white" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                      Accéder au WiFi
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      number: "03",
      title: "Vos clients s'enregistrent, vous les retrouvez ici",
      description: "Chaque client qui se connecte laisse son nom et son numéro. Vous les consultez, exportez, et relancez par SMS depuis votre espace. C'est votre registre client.",
      visual: (
        <div className="rounded-xl overflow-hidden shadow-lg border border-white/10" style={{ background: '#0F172A' }}>
          <div className="border-b border-white/10 px-4 py-2 flex items-center gap-2" style={{ background: '#162032' }}>
            <div className="flex gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
            </div>
            <span className="text-[10px] text-slate-500 font-mono flex-1 text-center">app.wifileads.io/dashboard</span>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { label: "Contacts", value: "101", color: '#38BDF8' },
                { label: "Taux de retour", value: "45%", color: '#34D399' },
              ].map(kpi => (
                <div key={kpi.label} className="rounded-lg p-2" style={{ background: '#1E293B' }}>
                  <p className="text-[10px] text-slate-500">{kpi.label}</p>
                  <p className="font-headline font-bold text-base" style={{ color: kpi.color }}>{kpi.value}</p>
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              {["Kofi A.", "Adjoua M.", "Kwame B."].map((name, i) => (
                <div key={i} className="flex items-center justify-between text-[10px] py-1 border-b border-white/5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold" style={{ background: 'rgba(56,189,248,0.15)', color: '#38BDF8' }}>
                      {name[0]}
                    </div>
                    <span className="text-slate-300">{name}</span>
                  </div>
                  <span className="font-semibold" style={{ color: '#34D399' }}>✓ vérifié</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="how-it-works" ref={ref} className="py-24 bg-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className={`text-center mb-16 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block text-xs font-semibold tracking-widest uppercase mb-3 px-3 py-1 rounded-full" style={{ background: 'rgba(52,211,153,0.12)', color: '#34D399' }}>
            Comment ça marche
          </span>
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-white mb-4">
            Prêt à enregistrer vos premiers clients en moins de 10 minutes
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Vous installez une fois. Ensuite chaque client qui se connecte laisse automatiquement son contact, le premier jour, le centième jour, sans que vous ayez rien à faire.
          </p>
        </div>

        <div className="space-y-20">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`grid md:grid-cols-2 gap-12 items-center transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <div className={i % 2 === 1 ? 'md:order-2' : ''}>
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="font-headline text-5xl font-bold text-slate-500 opacity-60"
                  >
                    {step.number}
                  </span>
                </div>
                <h3 className="font-headline text-2xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-slate-400 leading-relaxed">{step.description}</p>
              </div>
              <div className={`${i % 2 === 1 ? 'md:order-1' : ''} flex justify-center`}>
                {step.visual}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
