'use client';

import { useState } from 'react';
import Link from 'next/link';
import "./navigation.css";
import { usePathname } from 'next/navigation';
import { useAuth } from "@/components/context/AuthContext";
import toast from "react-hot-toast";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: 'Startseite',        href: '/',               icon: 'home' },
  { label: 'Glücksrad',         href: '/wheel_of_fortune', icon: 'casino' },
  { label: 'Gericht erstellen', href: '/create_Meal',    icon: 'add_circle' },
  { label: 'Gerichte',          href: '/meal',           icon: 'restaurant_menu' },
  { label: 'Feedback',          href: '/feedback',       icon: 'feedback' },
  { label: 'Mein Profil',       href: '/profil',         icon: 'person' },
];

const adminItems: NavItem[] = [
  { label: 'Registrieren',       href: '/register',          icon: 'person_add' },
  { label: 'Benutzer verwalten', href: '/benutzer',          icon: 'manage_accounts' },
  { label: 'Feedback einsehen',  href: '/feedback/einsehen', icon: 'rate_review' },
];

export default function Navigation() {
  const pathname = usePathname();
  const { role, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success("Erfolgreich abgemeldet.");
  };

  const close = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <button
          className="hamburger-btn"
          onClick={() => setMobileOpen(true)}
          aria-label="Menü öffnen"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <span className="mobile-logo">Dreh &amp; Schmatz</span>
      </div>

      {/* Backdrop (mobile only) */}
      {mobileOpen && (
        <div className="sidebar-backdrop" onClick={close} aria-hidden="true" />
      )}

      {/* Sidebar */}
      <nav
        className={`sidebar${mobileOpen ? ' sidebar-open' : ''}`}
        aria-label="Hauptnavigation"
      >
        <div className="sidebar-header">
          <div className="sidebar-logo">Dreh &amp; Schmatz</div>
          <button className="sidebar-close-btn" onClick={close} aria-label="Menü schließen">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <ul className="sidebar-nav">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`nav-item${pathname === item.href ? ' active' : ''}`}
                onClick={close}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {role === 'ADMIN' && (
          <>
            <div className="sidebar-divider" />
            <div className="sidebar-section-label">ADMIN</div>
            <ul className="sidebar-nav">
              {adminItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`nav-item${pathname === item.href ? ' active' : ''}`}
                    onClick={close}
                  >
                    <span className="material-symbols-outlined" aria-hidden="true">
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        <button onClick={handleLogout} className="logout-btn" aria-label="Abmelden">
          <span className="material-symbols-outlined" aria-hidden="true">logout</span>
          Abmelden
        </button>
      </nav>
    </>
  );
}
