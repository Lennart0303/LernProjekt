// src/components/utils/authUtils.ts
import toast from "react-hot-toast";

export async function handleAuthError(
  response: Response,
  login: (token: string) => void,
  logout: () => void
): Promise<boolean> {
  if (response.status === 401 || response.status === 403) {
    const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (r.ok) {
      const { accessToken } = await r.json();
      login(accessToken);
      return false;
    } else {
      logout();
      toast.error("Sitzung abgelaufen – bitte neu anmelden.");
      window.location.href = "/";
      return true;
    }
  }
  return false;
}
