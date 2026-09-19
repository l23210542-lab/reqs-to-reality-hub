/**
 * CRUD de contratos (tabla `contratos`: id, user_id, titulo, codigo_fuente, created_at).
 * Implementado sobre almacenamiento local del navegador; al conectar la base de
 * datos, estas funciones se reemplazan por llamadas equivalentes al backend.
 */

export interface Contract {
  id: string;
  user_id: string;
  titulo: string;
  codigo_fuente: string;
  created_at: string;
  updated_at: string;
}

const KEY = "finscript.contratos";

function readAll(): Contract[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as Contract[];
  } catch {
    return [];
  }
}

function writeAll(rows: Contract[]) {
  window.localStorage.setItem(KEY, JSON.stringify(rows));
}

export function listContracts(userId: string): Contract[] {
  return readAll()
    .filter((c) => c.user_id === userId)
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export function getContract(id: string): Contract | undefined {
  return readAll().find((c) => c.id === id);
}

export function insertContract(
  userId: string,
  titulo: string,
  codigoFuente: string,
): Contract {
  const now = new Date().toISOString();
  const row: Contract = {
    id: crypto.randomUUID(),
    user_id: userId,
    titulo,
    codigo_fuente: codigoFuente,
    created_at: now,
    updated_at: now,
  };
  writeAll([...readAll(), row]);
  return row;
}

export function updateContract(
  id: string,
  patch: Partial<Pick<Contract, "titulo" | "codigo_fuente">>,
): Contract | undefined {
  const rows = readAll();
  const idx = rows.findIndex((c) => c.id === id);
  if (idx === -1) return undefined;
  const current = rows[idx]!;
  const next: Contract = { ...current, ...patch, updated_at: new Date().toISOString() };
  rows[idx] = next;
  writeAll(rows);
  return next;
}

export function deleteContract(id: string) {
  writeAll(readAll().filter((c) => c.id !== id));
}
