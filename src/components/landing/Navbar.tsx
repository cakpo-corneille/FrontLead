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
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center">
        {/* Logo group */}
        <div className="flex-1 flex justify-start">
          <a href="#" className="flex items-center gap-2">
            <img
              src="/images/wifileads-logo-nobg.png"
              alt="WiFiLeads"
              className="w-9 h-9 object-contain"
            />
            <span className="font-headline font-bold tracking-tight" style={{ fontSize: "1.3rem", lineHeight: 1 }}>
              <span style={{ color: "#34D399" }}>WiFi</span>
              <span style={{ color: "#38BDF8" }}>Leads</span>
            </span>
          </a>
        </div>

        {/* Navigation links (Desktop - Centered) */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Action buttons group (Desktop - Right) */}
        <div className="hidden md:flex items-center gap-6 flex-1 justify-end">
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

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-white ml-auto"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {menuOpen && (
        <div
          className="md:hidden fixed left-0 right-0 top-[72px] p-4 flex flex-col gap-4 border-t border-white/10 overflow-y-auto safe-pb"
          style={{
            backgroundColor: "#0F172A",
            maxHeight: "calc(100vh - 72px)",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {links.map(l => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-white/80 py-3"
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-white/80 py-3 text-center"
            >
              Connexion
            </Link>
            <Link
              href="/signup"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-semibold py-3 rounded-lg text-center"
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
