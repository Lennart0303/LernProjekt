// src/components/utils/authUtils.ts
export async function handleAuthError(
  response: Response,
  login: (token: string) => void,
  logout: () => void
): Promise<boolean> {
  if (response.status === 401 || response.status === 403) {
    // 1) Versuche Token-Refresh
    const r = await fetch("https://localhost:8443/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (r.ok) {
      // 2a) Zugangstoken erneuern
      const { accessToken } = await r.json();
      login(accessToken);           // im Context
      return false;
    } else {
      // 2b) Refresh fehlgeschlagen → Logout
      logout();
      window.location.href = "/";
      return true;
    }
  }
  return false;
}
