'use client';

import { useEffect, useState, useCallback } from 'react';
import Navigation from '@/components/Navigation/page';
import { useAuth } from '@/components/context/AuthContext';
import { handleAuthError } from '@/components/utils/page';
import { AdminGuard } from '@/components/context/AdminGuard';
import './dashboard.css';

interface DashboardStats {
  totalUsers: number;
  totalMeals: number;
  totalFeedback: number;
  totalVisits: number;
  weeklyVisits: number;
}

interface StatCardProps {
  icon: string;
  label: string;
  value: number | null;
  sub?: string;
}

function StatCardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-header">
        <div className="skeleton-line skeleton-icon" />
        <div className="skeleton-line skeleton-label" />
      </div>
      <div className="skeleton-line skeleton-value" />
      <div className="skeleton-line skeleton-sub" />
    </div>
  );
}

function StatCard({ icon, label, value, sub }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="material-symbols-outlined stat-icon" aria-hidden="true">{icon}</span>
        <span className="stat-label">{label}</span>
      </div>
      <div className="stat-value">
        {value === null ? '–' : value.toLocaleString('de-DE')}
      </div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const { accessToken, login, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(() => {
    if (!accessToken) return;
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard`, {
      credentials: 'include',
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(res => handleAuthError(res, login, logout).then(aborted => {
        if (aborted) return Promise.reject('Auth-Abbruch');
        if (!res.ok) return Promise.reject('API-Fehler');
        return res.json() as Promise<DashboardStats>;
      }))
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        if (err !== 'Auth-Abbruch' && err !== 'API-Fehler') console.error(err);
        setLoading(false);
      });
  }, [accessToken, login, logout]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return (
    <AdminGuard>
      <div className="app-shell">
        <Navigation />
        <main id="main-content" className="app-main">
          <div className="hero">
            <div>
              <h1>Dashboard</h1>
              <p>Übersicht über alle wichtigen Kennzahlen der App.</p>
            </div>
          </div>

          {loading ? (
            <>
              <p className="dashboard-section-title">Inhalte</p>
              <div className="dashboard-grid">
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </div>
              <p className="dashboard-section-title">Seitenaufrufe</p>
              <div className="dashboard-grid">
                <StatCardSkeleton />
                <StatCardSkeleton />
              </div>
            </>
          ) : (
            <>
              <p className="dashboard-section-title">Inhalte</p>
              <div className="dashboard-grid">
                <StatCard
                  icon="group"
                  label="Benutzer"
                  value={stats?.totalUsers ?? null}
                  sub="registrierte Accounts"
                />
                <StatCard
                  icon="restaurant_menu"
                  label="Gerichte"
                  value={stats?.totalMeals ?? null}
                  sub="insgesamt erstellt"
                />
                <StatCard
                  icon="rate_review"
                  label="Feedbacks"
                  value={stats?.totalFeedback ?? null}
                  sub="eingegangene Beiträge"
                />
              </div>

              <p className="dashboard-section-title">Seitenaufrufe</p>
              <div className="dashboard-grid">
                <StatCard
                  icon="bar_chart"
                  label="Aufrufe gesamt"
                  value={stats?.totalVisits ?? null}
                  sub="seit Tracking-Start"
                />
                <StatCard
                  icon="trending_up"
                  label="Diese Woche"
                  value={stats?.weeklyVisits ?? null}
                  sub="letzte 7 Tage"
                />
              </div>
            </>
          )}
        </main>
      </div>
    </AdminGuard>
  );
}
