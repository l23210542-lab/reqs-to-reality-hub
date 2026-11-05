import { DEFAULT_TASAS_BASE } from "./finscript/compiler";
import { DEFAULT_SOURCE } from "./finscript/samples";

export const LOCALES = [
  { id: "es-MX", label: "México (1,234.56)" },
  { id: "es-ES", label: "España (1.234,56)" },
  { id: "en-US", label: "Estados Unidos (1,234.56)" },
] as const;

export type Locale = (typeof LOCALES)[number]["id"];

export const FONT_SIZE_MIN = 12;
export const FONT_SIZE_MAX = 20;

export interface Settings {
  editorFontSize: number;
  editorWordWrap: boolean;
  compileShortcut: boolean;
  autoCompile: boolean;
  plantilla: string;
  locale: Locale;
  confirmDelete: boolean;
  tasasBase: Record<string, number>;
}

export const DEFAULT_SETTINGS: Settings = {
  editorFontSize: 14,
  editorWordWrap: false,
  compileShortcut: true,
  autoCompile: false,
  plantilla: DEFAULT_SOURCE,
  locale: "es-MX",
  confirmDelete: true,
  tasasBase: DEFAULT_TASAS_BASE,
};

const KEY = "finscript.settings";
const listeners = new Set<() => void>();
let cache: Settings | null = null;

function sanitize(raw: unknown): Settings {
  const s = (raw && typeof raw === "object" ? raw : {}) as Partial<Record<keyof Settings, unknown>>;
  const d = DEFAULT_SETTINGS;
  const bool = (v: unknown, fallback: boolean) => (typeof v === "boolean" ? v : fallback);

  const fontSize = Number(s.editorFontSize);
  const tasas =
    s.tasasBase && typeof s.tasasBase === "object"
      ? Object.fromEntries(
          Object.entries(s.tasasBase as Record<string, unknown>).filter(
            ([k, v]) => /^[A-Z][A-Z0-9_]*$/.test(k) && typeof v === "number" && Number.isFinite(v),
          ) as [string, number][],
        )
      : d.tasasBase;

  return {
    editorFontSize: Number.isFinite(fontSize)
      ? Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, Math.round(fontSize)))
      : d.editorFontSize,
    editorWordWrap: bool(s.editorWordWrap, d.editorWordWrap),
    compileShortcut: bool(s.compileShortcut, d.compileShortcut),
    autoCompile: bool(s.autoCompile, d.autoCompile),
    plantilla: typeof s.plantilla === "string" ? s.plantilla : d.plantilla,
    locale: LOCALES.some((l) => l.id === s.locale) ? (s.locale as Locale) : d.locale,
    confirmDelete: bool(s.confirmDelete, d.confirmDelete),
    tasasBase: tasas,
  };
}

function notify() {
  listeners.forEach((l) => l());
}

export function getSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  if (!cache) {
    try {
      cache = sanitize(JSON.parse(window.localStorage.getItem(KEY) ?? "{}"));
    } catch {
      cache = DEFAULT_SETTINGS;
    }
  }
  return cache;
}

export function saveSettings(patch: Partial<Settings>) {
  cache = sanitize({ ...getSettings(), ...patch });
  window.localStorage.setItem(KEY, JSON.stringify(cache));
  notify();
}

export function resetSettings() {
  cache = DEFAULT_SETTINGS;
  window.localStorage.removeItem(KEY);
  notify();
}

export function subscribeSettings(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    cache = null;
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}
