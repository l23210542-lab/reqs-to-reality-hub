import { compileLocally } from "./compiler";
import type { CompileError, CompileResult } from "./types";

const BACKEND_KEY = "finscript.backendUrl";

export function getBackendUrl(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(BACKEND_KEY) ?? "";
}

export function setBackendUrl(url: string) {
  if (typeof window === "undefined") return;
  if (url.trim()) window.localStorage.setItem(BACKEND_KEY, url.trim());
  else window.localStorage.removeItem(BACKEND_KEY);
}

interface BackendPayload {
  errors?: CompileError[];
  warnings?: CompileError[];
  tokens?: CompileResult["tokens"];
  symbols?: CompileResult["symbols"];
  symbol_table?: CompileResult["symbols"];
  addresses?: CompileResult["addresses"];
  address_table?: CompileResult["addresses"];
  ast?: CompileResult["ast"];
  amortization?: CompileResult["amortization"];
  summary?: CompileResult["summary"];
  logs?: string[];
}

/**
 * POST /api/compile hacia el backend FastAPI cuando hay una URL configurada.
 * Si no hay backend o la red falla, se usa el compilador local equivalente.
 */
export async function compileSource(sourceCode: string): Promise<CompileResult> {
  const base = getBackendUrl();
  if (!base) return compileLocally(sourceCode);

  const started = performance.now();
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/compile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source_code: sourceCode }),
    });
    const data = (await res.json()) as BackendPayload;
    const tiempoMs = Math.round((performance.now() - started) * 100) / 100;

    const errors = data.errors ?? [];
    const summary = data.summary ? { ...data.summary, tiempoMs } : null;

    return {
      ok: res.ok && errors.length === 0,
      errors: errors.map((e) => ({ kind: "sintactico", ...e })),
      warnings: data.warnings ?? [],
      tokens: data.tokens ?? [],
      symbols: data.symbols ?? data.symbol_table ?? [],
      addresses: data.addresses ?? data.address_table ?? [],
      ast: data.ast ?? null,
      amortization: data.amortization ?? [],
      summary,
      engine: "backend",
      logs: [
        `[http] POST ${base}/compile -> ${res.status} en ${tiempoMs} ms.`,
        ...(data.logs ?? []),
      ],
    };
  } catch (err) {
    const local = compileLocally(sourceCode);
    return {
      ...local,
      logs: [
        `[http] No se pudo contactar el backend (${(err as Error).message}). Se usó el compilador local.`,
        ...local.logs,
      ],
    };
  }
}
