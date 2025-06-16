export function handleAuthError(response: Response) {
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem("jwt");
    window.location.href = "/";
    return true; // Fehler wurde behandelt
  }
  return false; // Kein Auth-Fehler
}