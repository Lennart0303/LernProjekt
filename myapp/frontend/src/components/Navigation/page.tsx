'use client';

import Link from 'next/link';
import "./navigation.css";
import { usePathname } from 'next/navigation';
import { useAuth } from "@/components/context/AuthContext";

export default function Navigation() {
  const pathname = usePathname();
  const { role } = useAuth();

  const navItems = [
    { label: 'Startseite', href: '/' },
    { label: 'Glücksrad', href: '/wheel_of_fortune' },
    { label: 'Gericht erstellen', href: '/create_Meal' },
    { label: 'Gerichte', href: '/meal' },
    { label: 'Feedback', href: '/feedback' }
  ];

  const adminItems = [
    { label: 'Registrieren', href: '/register' },
    { label: 'Benutzer verwalten', href: '/benutzer' },
    { label: 'Feedback einsehen', href: '/feedback/einsehen' },
  ];

  return (
    <nav className="navigation">
      <ul>
        {navItems.map(({ label, href }) => (
          <li key={href}>
            <Link
              href={href}
              className={pathname === href ? 'active' : ''}
            >
              {label}
            </Link>
          </li>
        ))}
        {role === 'ADMIN' && adminItems.map(({ label, href }) => (
          <li key={href}>
            <Link href={href} className={pathname === href ? 'active' : ''}>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
