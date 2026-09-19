export type CompileErrorKind = "lexico" | "sintactico" | "semantico";

export interface CompileError {
  line: number;
  column: number;
  message: string;
  kind: CompileErrorKind;
}

export interface Symbol {
  name: string;
  type: "MONEDA" | "DECIMAL" | "ENTERO" | "PORCENTAJE" | "ENUM";
  value: string | number;
  scope: string;
  line: number;
  mutable: boolean;
}

export interface AddressRow {
  name: string;
  offset: number;
  size: number;
  segment: string;
  reference: string;
}

export interface AstNode {
  type: string;
  value?: string | number;
  line?: number;
  children?: AstNode[];
}

export interface AmortizationRow {
  periodo: number;
  saldoInicial: number;
  cuota: number;
  interes: number;
  capital: number;
  saldoFinal: number;
}

export interface CompileSummary {
  moneda: string;
  capital: number;
  tasaAnual: number;
  tasaMensual: number;
  plazo: number;
  metodo: string;
  cuota: number;
  totalIntereses: number;
  totalPagado: number;
  tiempoMs: number;
}

export interface CompileResult {
  ok: boolean;
  errors: CompileError[];
  warnings: CompileError[];
  tokens: { type: string; value: string; line: number; column: number }[];
  symbols: Symbol[];
  addresses: AddressRow[];
  ast: AstNode | null;
  amortization: AmortizationRow[];
  summary: CompileSummary | null;
  engine: "local" | "backend";
  logs: string[];
}
