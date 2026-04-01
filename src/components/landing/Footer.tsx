export function Footer() {
  return (
    <footer style={{ background: '#0F172A' }} className="py-12">
      <style>{`
        @keyframes footer-logo-shine {
          0%   { transform: translateX(-120%) skewX(-20deg); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateX(220%) skewX(-20deg); opacity: 0; }
        }
        .footer-logo-shine-wrap {
          position: relative;
          overflow: hidden;
          display: inline-block;
        }
        .footer-logo-shine-wrap::after {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 35%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent);
          animation: footer-logo-shine 3.5s ease-in-out infinite;
          pointer-events: none;
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <a href="#" className="flex items-center gap-2 mb-3">
              <img
                src="/wifileads-logo-nobg.png"
                alt="WiFiLeads"
                className="w-9 h-9 object-contain"
              />
              <span className="footer-logo-shine-wrap" style={{ fontFamily: "'Bubblegum Sans', cursive", fontSize: "1.3rem", lineHeight: 1 }}>
                <span style={{ color: "#34D399" }}>WiFi</span>
                <span style={{ color: "#38BDF8" }}>Leads</span>
              </span>
            </a>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              La solution de WiFi marketing conçue pour les commerçants d'Afrique de l'Ouest. Collectez des leads, fidélisez vos clients.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Produit</h4>
            <ul className="space-y-2">
              {["Fonctionnalités", "Tarifs", "Intégrations", "Changelog"].map(item => (
                <li key={item}>
                  <a href="#" className="text-slate-400 text-sm hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Entreprise</h4>
            <ul className="space-y-2">
              {["À propos", "Blog", "Contact", "Mentions légales"].map(item => (
                <li key={item}>
                  <a href="#" className="text-slate-400 text-sm hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">© 2026 WiFiLeads. Tous droits réservés.</p>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Tous les systèmes opérationnels
          </div>
        </div>
      </div>
    </footer>
  );
}
