"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { label: "Comment ça marche", href: "#how-it-works" },
    { label: "Fonctionnalités", href: "#features" },
    { label: "Tarifs", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <nav
      className="sticky top-0 z-50 w-full shrink-0"
      style={{ height: "72px", backgroundColor: "#0F172A" }}
    >
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">

        <style>{`
          @keyframes logo-shine {
            0%   { transform: translateX(-120%) skewX(-20deg); opacity: 0; }
            10%  { opacity: 1; }
            90%  { opacity: 1; }
            100% { transform: translateX(220%) skewX(-20deg); opacity: 0; }
          }
          .logo-shine-wrap {
            position: relative;
            overflow: hidden;
            display: inline-block;
          }
          .logo-shine-wrap::after {
            content: '';
            position: absolute;
            top: 0; left: 0;
            width: 35%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent);
            animation: logo-shine 3.5s ease-in-out infinite;
            pointer-events: none;
          }
        `}</style>
        <a href="#" className="flex items-center gap-2">
          <img
            src="/images/wifileads-logo-nobg.png"
            alt="WiFiLeads"
            className="w-9 h-9 object-contain"
          />
          <span className="logo-shine-wrap" style={{ fontFamily: "'Bubblegum Sans', cursive", fontSize: "1.3rem", lineHeight: 1 }}>
            <span style={{ color: "#34D399" }}>WiFi</span>
            <span style={{ color: "#38BDF8" }}>Leads</span>
          </span>
        </a>

        <div className="hidden md:flex items-center gap-7">
          {links.map(l => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              {l.label}
            </a>
          ))}
          <Link
            href="/login"
            className="text-sm font-medium text-white/80 hover:text-white transition-colors"
          >
            Connexion
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold px-5 py-2 rounded-lg transition-all hover:brightness-110"
            style={{ background: "#34D399", color: "#0F172A" }}
          >
            Essai gratuit
          </Link>
        </div>

        <button
          className="md:hidden p-2 text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {menuOpen && (
        <div
          className="md:hidden absolute top-full left-0 right-0 p-4 flex flex-col gap-4 border-t border-white/10"
          style={{ backgroundColor: "#0F172A" }}
        >
          {links.map(l => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-white/80 py-2"
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
            <Link href="/login" className="text-sm font-medium text-white/80 py-2 text-center">
              Connexion
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold py-2 rounded-lg text-center"
              style={{ background: "#34D399", color: "#0F172A" }}
            >
              Essai gratuit
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
