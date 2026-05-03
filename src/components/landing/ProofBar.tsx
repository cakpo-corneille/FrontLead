"use client";
import { useInView } from "../../hooks/useInView";
import { useEffect, useState, useRef } from "react";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView(0.5);
  const started = useRef(false);

  useEffect(() => {
    if (inView && !started.current) {
      started.current = true;
      const duration = 1500;
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(eased * target));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }
  }, [inView, target]);

  return (
    <span ref={ref as React.RefObject<HTMLSpanElement>} className="font-headline text-4xl font-bold text-white">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

const routers = [
  { name: "MikroTik", dot: "#ef4444" },
  { name: "Ubiquiti UniFi", dot: "#3b82f6" },
  { name: "pfSense", dot: "#8b5cf6" },
  { name: "TP-Link", dot: "#f59e0b" },
  { name: "Cisco Meraki", dot: "#10b981" },
  { name: "OpenWRT", dot: "#ec4899" },
  { name: "DD-WRT", dot: "#06b6d4" },
  { name: "GL.iNet", dot: "#84cc16" },
];

export function ProofBar() {
  const { ref, inView } = useInView();

  const stats: Array<{
    value: number;
    suffix: string;
    title: string;
    label: string;
    icon: string;
    color: string;
  }> = [
    {
      value: 10,
      suffix: " min",
      title: "Installation sur votre MikroTik",
      label: "Le code à coller est prêt en moins de 10 minutes, sans technicien",
      icon: "📡",
      color: "from-blue-600 to-indigo-600",
    },
    {
      value: 100,
      suffix: "%",
      title: "Conforme à la loi ARCEP 2026",
      label: "Identité de chaque client vérifiée par SMS, comme l'exige le régulateur",
      icon: "🛡️",
      color: "from-emerald-500 to-teal-600",
    },
    {
      value: 7,
      suffix: " jours",
      title: "Essai gratuit, sans carte bancaire",
      label: "Testez avec vos vrais clients. Vous payez seulement si ça marche pour vous",
      icon: "🎁",
      color: "from-amber-500 to-orange-600",
    },
  ];

  return (
    <>
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee 22s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Stats section — fond clair */}
      <section
        ref={ref}
        className="py-16 border-y border-white/5 bg-slate-800"
      >
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-12">
            <h2 className="font-headline text-2xl sm:text-3xl font-bold text-white mb-2">
              Conçu pour les WiFi Zones du Bénin et du Togo
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Trois choses concrètes que vous obtenez dès le premier jour
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="flex justify-center mb-6 items-center">
                  <div
                    className={`rounded-3xl flex items-center justify-center bg-gradient-to-br ${stat.color} w-[100px] h-[100px] shadow-lg shadow-indigo-500/10 border border-white/10 text-white`}
                  >
                    <span className="text-5xl">{stat.icon}</span>
                  </div>
                </div>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-white text-base font-semibold mb-1">{stat.title}</p>
                <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marquee band — fond sombre */}
      <div className="py-5 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <p className="text-center text-xs text-slate-500 mb-4 px-4">
          Marche avec les routeurs WiFi les plus utilisés au Bénin et au Togo
        </p>

        <div className="relative overflow-hidden">
          <div
            className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none bg-gradient-to-r from-slate-900 to-transparent"
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none bg-gradient-to-l from-slate-900 to-transparent"
          />

          <div className="marquee-track">
            {[...routers, ...routers].map((r, i) => (
              <div key={i} className="flex items-center gap-2 mx-8 whitespace-nowrap">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: r.dot, opacity: 0.8 }}
                />
                <span className="text-slate-300 text-sm font-medium tracking-wide">
                  {r.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
