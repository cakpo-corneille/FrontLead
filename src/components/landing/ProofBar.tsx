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

  const stats = [
    { value: 10000, suffix: "+", label: "Leads collectés", icon: "👥", img: undefined },
    { value: 96, suffix: "%", label: "Taux de retour moyen", icon: "📈", img: undefined },
    { value: 15, suffix: "+", label: "Modèles de routeurs", icon: null, img: "/images/mikrotik-router.png" },
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
        className="py-16 border-y border-white/5"
        style={{ background: '#1E293B' }}
      >
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="flex justify-center mb-3 items-center">
                  {stat.img
                    ? (
                      <div className="rounded-2xl flex items-center justify-center" style={{ background: '#1E3A8A', width: '105px', height: '105px' }}>
                        <img src={stat.img} alt={stat.label} className="object-contain drop-shadow-lg" style={{ width: '84px', height: '84px' }} />
                      </div>
                    )
                    : <span className="text-3xl">{stat.icon}</span>
                  }
                </div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-slate-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marquee band — fond sombre */}
      <div className="py-5" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #0d2040 50%, #0F172A 100%)' }}>
        <p className="text-center text-xs text-slate-500 mb-4 px-4">
          Compatible avec les systèmes les plus utilisés en Afrique de l'Ouest
        </p>

        <div className="relative overflow-hidden">
          <div
            className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to right, #0F172A, transparent)' }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to left, #0F172A, transparent)' }}
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
