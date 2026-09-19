import { useMemo, useRef } from "react";
import type { CompileError } from "@/lib/finscript/types";

interface Props {
  value: string;
  onChange: (value: string) => void;
  errors: CompileError[];
}

export function CodeEditor({ value, onChange, errors }: Props) {
  const gutterRef = useRef<HTMLDivElement>(null);
  const lines = useMemo(() => value.split("\n"), [value]);
  const errorLines = useMemo(() => new Set(errors.map((e) => e.line)), [errors]);

  return (
    <div className="relative flex h-full min-h-0 overflow-hidden rounded-b-lg bg-card">
      <div
        ref={gutterRef}
        className="select-none overflow-hidden border-r border-border bg-muted/40 py-3 text-right font-mono text-xs leading-6 text-muted-foreground"
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
        onChange={(e) => onChange(e.target.value)}
        onScroll={(e) => {
          if (gutterRef.current) gutterRef.current.scrollTop = e.currentTarget.scrollTop;
        }}
        className="h-full min-h-[22rem] flex-1 resize-none bg-transparent px-4 py-3 font-mono text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground"
        placeholder={"MONEDA: USD\nCAPITAL: 10000\nTASA_ANUAL: 12.5%\nPLAZO: 6 MESES"}
      />
    </div>
  );
}
