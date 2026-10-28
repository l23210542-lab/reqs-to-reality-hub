import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export interface Session {
  id: string;
  email: string;
}

export function toSession(user: User | null | undefined): Session | null {
  return user ? { id: user.id, email: user.email ?? "" } : null;
}

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return toSession(data.session?.user);
}

export async function signIn(email: string, password: string): Promise<Session> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return toSession(data.user)!;
}

/** Devuelve null si el proyecto exige confirmar el correo antes de iniciar sesión. */
export async function signUp(email: string, password: string): Promise<Session | null> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${window.location.origin}/` },
  });
  if (error) throw error;
  return data.session ? toSession(data.user) : null;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
