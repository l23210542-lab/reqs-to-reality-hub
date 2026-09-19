/**
 * Sesión de usuario local (prototipo). Sustituible por autenticación real:
 * mantiene la misma forma de sesión { id, email }.
 */
export interface Session {
  id: string;
  email: string;
}

const KEY = "finscript.session";

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function signIn(email: string): Session {
  const session: Session = { id: `user-${btoa(email).replace(/=/g, "")}`, email };
  window.localStorage.setItem(KEY, JSON.stringify(session));
  window.dispatchEvent(new Event("finscript-auth"));
  return session;
}

export function signOut() {
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("finscript-auth"));
}
