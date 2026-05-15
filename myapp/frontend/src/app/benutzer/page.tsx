"use client"
import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";

import Navigation from "@/components/Navigation/page";
import { useAuth } from "@/components/context/AuthContext";
import { handleAuthError } from "@/components/utils/page";
import { AdminGuard } from "@/components/context/AdminGuard";
import "./benutzer.css";

interface User {
    id: number;
    username: string;
    role: string;
}

function getUsernameFromToken(token: string | null): string | null {
    if (!token) return null;
    try {
        return jwtDecode<{ sub: string }>(token).sub ?? null;
    } catch { return null; }
}

export default function BenutzerVerwalten() {
    const { accessToken, login, logout } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const currentUsername = getUsernameFromToken(accessToken);

    const fetchUsers = useCallback(() => {
        if (!accessToken) return;
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
            credentials: "include",
            headers: { Authorization: `Bearer ${accessToken}` },
        })
            .then(res => handleAuthError(res, login, logout).then(aborted => {
                if (aborted) return Promise.reject("Auth-Abbruch");
                if (!res.ok) { toast.error(`Fehler (Code ${res.status})`); return Promise.reject("API-Fehler"); }
                return res.json() as Promise<User[]>;
            }))
            .then(setUsers)
            .catch(err => {
                if (err !== "Auth-Abbruch" && err !== "API-Fehler") console.error(err);
            });
    }, [accessToken, login, logout]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleDelete = async (user: User) => {
        if (!accessToken) return;
        if (!window.confirm(`Benutzer "${user.username}" wirklich löschen?`)) return;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user.id}`, {
            method: "DELETE",
            credentials: "include",
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.status === 204) {
            toast.success(`${user.username} wurde gelöscht`);
            fetchUsers();
        } else {
            toast.error(`Fehler beim Löschen (Code ${res.status})`);
        }
    };

    const handleRoleChange = async (user: User, newRole: string) => {
        if (!accessToken) return;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user.id}/role`, {
            method: "PATCH",
            credentials: "include",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ role: newRole }),
        });
        if (res.ok) {
            toast.success(`Rolle von ${user.username} auf ${newRole} geändert`);
            fetchUsers();
        } else {
            toast.error(`Fehler beim Ändern der Rolle (Code ${res.status})`);
        }
    };

    return (
        <AdminGuard>
            <div className="app-shell">
                <Navigation />
                <main id="main-content" className="app-main">
                    {/* Hero */}
                    <div className="hero">
                        <div>
                            <h1>Benutzerverwaltung</h1>
                            <p>Verwalte Rollen und Accounts aller Benutzer.</p>
                        </div>
                    </div>

                    <div className="benutzer-table-wrapper">
                        <table className="benutzer-table">
                            <thead>
                                <tr>
                                    <th>Benutzername</th>
                                    <th>Rolle</th>
                                    <th>Aktionen</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => {
                                    const isSelf = user.username === currentUsername;
                                    return (
                                        <tr key={user.id}>
                                            <td>
                                                {user.username}
                                                {isSelf && <span className="self-badge">Du</span>}
                                            </td>
                                            <td>
                                                <select
                                                    value={user.role}
                                                    disabled={isSelf}
                                                    onChange={e => handleRoleChange(user, e.target.value)}
                                                    className="role-select"
                                                >
                                                    <option value="USER">USER</option>
                                                    <option value="ADMIN">ADMIN</option>
                                                </select>
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() => handleDelete(user)}
                                                    disabled={isSelf}
                                                    className="delete-button"
                                                >
                                                    Löschen
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </AdminGuard>
    );
}
