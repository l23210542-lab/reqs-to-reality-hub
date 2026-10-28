import { compileLocally } from "./compiler";
import type { CompileError, CompileResult } from "./types";

export function getBackendUrl(): string {
  return (import.meta.env.VITE_API_URL ?? "").trim().replace(/\/$/, "");
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
 * POST {VITE_API_URL}/compile hacia el backend FastAPI.
 * Sin VITE_API_URL se usa el compilador local equivalente.
 */
export async function compileSource(sourceCode: string): Promise<CompileResult> {
  const base = getBackendUrl();
  if (!base) return compileLocally(sourceCode);

  const started = performance.now();
  try {
    const res = await fetch(`${base}/compile`, {
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
      errors: errors.map((e) => ({ ...e, kind: e.kind ?? "sintactico" })),
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
    const message = `No se pudo contactar el backend en ${base}: ${(err as Error).message}`;
    return {
      ok: false,
      errors: [{ line: 1, column: 1, message, kind: "sintactico" }],
      warnings: [],
      tokens: [],
      symbols: [],
      addresses: [],
      ast: null,
      amortization: [],
      summary: null,
      engine: "backend",
      logs: [`[http] ${message}`],
    };
  }
}
