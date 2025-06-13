'use client';

import Link from 'next/link';
import "./navigation.css";
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Startseite', href: '/' },
    { label: 'Glücksrad', href: '/wheel_of_fortune' },
    { label: 'Gericht erstellen', href: '/create_Meal' },
    { label: 'Gerichte', href: '/meal' },
    {label: 'Feedback', href: '/feedback'}
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
      </ul>
    </nav>
  );
}
