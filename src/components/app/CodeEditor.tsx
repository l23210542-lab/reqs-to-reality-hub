import { useMemo, useRef } from "react";
import type { CompileError } from "@/lib/finscript/types";

interface Props {
  value: string;
  onChange: (value: string) => void;
  errors: CompileError[];
  fontSize?: number;
  wordWrap?: boolean;
  /** Se invoca con Ctrl/⌘ + Enter. */
  onSubmit?: () => void;
}

export function CodeEditor({
  value,
  onChange,
  errors,
  fontSize = 14,
  wordWrap = false,
  onSubmit,
}: Props) {
  const gutterRef = useRef<HTMLDivElement>(null);
  const lines = useMemo(() => value.split("\n"), [value]);
  const errorLines = useMemo(() => new Set(errors.map((e) => e.line)), [errors]);
  const lineHeight = `${Math.round(fontSize * 1.7)}px`;

  return (
    <div className="relative flex h-full min-h-0 overflow-hidden rounded-b-lg bg-card">
      <div
        ref={gutterRef}
        className="select-none overflow-hidden border-r border-border bg-muted/40 py-3 text-right font-mono text-muted-foreground"
        style={{ fontSize: Math.max(10, fontSize - 2), lineHeight }}
      >
        {lines.map((_, i) => (
          <div
            key={i}
            className={`px-3 ${errorLines.has(i + 1) ? "bg-destructive/20 text-destructive" : ""}`}
          >
            {i + 1}
          </div>
        ))}
      </div>
      <textarea
        value={value}
        spellCheck={false}
        wrap={wordWrap ? "soft" : "off"}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (onSubmit && e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            onSubmit();
          }
        }}
        onScroll={(e) => {
          if (gutterRef.current) gutterRef.current.scrollTop = e.currentTarget.scrollTop;
        }}
        style={{ fontSize, lineHeight }}
        className={`h-full min-h-[22rem] flex-1 resize-none bg-transparent px-4 py-3 font-mono text-foreground outline-none placeholder:text-muted-foreground ${
          wordWrap ? "" : "overflow-x-auto whitespace-pre"
        }`}
        placeholder={"MONEDA: USD\nCAPITAL: 10000\nTASA_ANUAL: 12.5%\nPLAZO: 6 MESES"}
      />
    </div>
  );
}
