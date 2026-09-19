import { useEffect, useState } from "react";
import { getSession, type Session } from "@/lib/auth";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setSession(getSession());
    sync();
    setReady(true);
    window.addEventListener("finscript-auth", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("finscript-auth", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { session, ready };
}
