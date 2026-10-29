import type {
  AddressRow,
  AmortizationRow,
  AstNode,
  CompileError,
  CompileResult,
  Symbol,
} from "./types";

const MONEDAS = ["USD", "MXN", "EUR"];
const METODOS = ["FRANCES", "ALEMAN"];

/** Valores simulados (% anual) de las tasas de referencia; no hay fuente de mercado real. */
const TASAS_BASE: Record<string, number> = { TIIE: 10.5, SOFR: 5.0 };

const KEYWORDS = [
  "MONEDA",
  "CAPITAL",
  "TASA_ANUAL",
  "PLAZO",
  "METODO",
  "COMISION",
  "IVA",
  "INFLACION_ESPERADA",
  "TASA_BASE",
  "SPREAD",
  "GRACIA_CAPITAL",
] as const;

type Keyword = (typeof KEYWORDS)[number];

interface Statement {
  key: Keyword;
  rawValue: string;
  line: number;
  column: number;
}

interface Token {
  type: string;
  value: string;
  line: number;
  column: number;
}

const round = (n: number) => Math.round(n * 100) / 100;

/** Fase 1 — Analizador léxico: convierte el texto en tokens. */
function lex(source: string): { tokens: Token[]; errors: CompileError[] } {
  const tokens: Token[] = [];
  const errors: CompileError[] = [];

  source.split("\n").forEach((rawLine, i) => {
    const line = i + 1;
    const withoutComment = rawLine.split("//")[0] ?? "";
    if (!withoutComment.trim()) return;

    const re = /"[^"]*"|[A-Za-z_][A-Za-z_0-9]*|\d+(?:\.\d+)?%?|:|;|\S/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(withoutComment)) !== null) {
      const value = m[0];
      const column = m.index + 1;
      let type = "IDENTIFICADOR";
      if (value === ":") type = "DOS_PUNTOS";
      else if (value === ";") type = "PUNTO_Y_COMA";
      else if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) type = "CADENA";
      else if (/^\d/.test(value)) type = value.endsWith("%") ? "PORCENTAJE" : "NUMERO";
      else if ((KEYWORDS as readonly string[]).includes(value.toUpperCase()))
        type = `KW_${value.toUpperCase()}`;
      else if (["MESES", "MES", "ANIOS"].includes(value.toUpperCase())) type = "UNIDAD";
      else if (MONEDAS.includes(value.toUpperCase())) type = "MONEDA_LIT";
      else if (METODOS.includes(value.toUpperCase())) type = "METODO_LIT";
      else if (Object.hasOwn(TASAS_BASE, value.toUpperCase())) type = "TASA_BASE_LIT";
      else if (!/^[A-Za-z_]/.test(value)) {
        type = "DESCONOCIDO";
        errors.push({
          line,
          column,
          message: `Símbolo no reconocido por el analizador léxico: "${value}".`,
          kind: "lexico",
        });
      }
      tokens.push({ type, value, line, column });
    }
  });

  return { tokens, errors };
}

/** Fase 2 — Analizador sintáctico: valida la forma `CLAVE: valor`. */
function parse(source: string): { statements: Statement[]; errors: CompileError[] } {
  const statements: Statement[] = [];
  const errors: CompileError[] = [];

  source.split("\n").forEach((rawLine, i) => {
    const line = i + 1;
    const text = rawLine.split("//")[0] ?? "";
    if (!text.trim()) return;

    const clean = text.trim().replace(/;$/, "");
    const colon = clean.indexOf(":");
    if (colon === -1) {
      errors.push({
        line,
        column: text.indexOf(clean.trim()) + 1,
        message: `Sentencia inválida: se esperaba "CLAVE: valor". Falta el separador ":".`,
        kind: "sintactico",
      });
      return;
    }

    const key = clean.slice(0, colon).trim().toUpperCase();
    const rawValue = clean.slice(colon + 1).trim();
    const column = text.indexOf(clean.slice(0, colon).trim()) + 1;

    if (!(KEYWORDS as readonly string[]).includes(key)) {
      errors.push({
        line,
        column,
        message: `Token desconocido "${key}". Claves válidas: ${KEYWORDS.join(", ")}.`,
        kind: "sintactico",
      });
      return;
    }
    if (!rawValue) {
      errors.push({
        line,
        column: colon + 2,
        message: `La declaración "${key}" no tiene valor asignado.`,
        kind: "sintactico",
      });
      return;
    }

    statements.push({ key: key as Keyword, rawValue, line, column });
  });

  return { statements, errors };
}

const parsePercent = (raw: string) => Number(raw.replace("%", "").trim());

/** Convierte "N MESES" / "N ANIOS" a meses; null si el formato no es válido. */
function parseMonths(raw: string): number | null {
  const match = raw.match(/^(\d+(?:\.\d+)?)\s*(MESES|MES|ANIOS|AÑOS)?$/i);
  if (!match) return null;
  const n = Number(match[1]);
  const unit = (match[2] ?? "MESES").toUpperCase();
  return unit === "ANIOS" || unit === "AÑOS" ? n * 12 : n;
}

/** Fase 3 — Análisis semántico: tabla de símbolos + reglas financieras. */
function analyze(statements: Statement[]): {
  symbols: Symbol[];
  errors: CompileError[];
  warnings: CompileError[];
  values: Record<string, string | number>;
} {
  const errors: CompileError[] = [];
  const warnings: CompileError[] = [];
  const symbols: Symbol[] = [];
  const values: Record<string, string | number> = {};
  const seen = new Map<string, number>();

  const semanticError = (st: Statement, message: string) =>
    errors.push({ line: st.line, column: st.column, message, kind: "semantico" });
  const define = (st: Statement, type: Symbol["type"], value: string | number) => {
    values[st.key] = value;
    symbols.push({ name: st.key, type, value, scope: "contrato", line: st.line, mutable: false });
  };

  for (const st of statements) {
    if (seen.has(st.key)) {
      const first = seen.get(st.key)!;
      if (st.key === "MONEDA") {
        errors.push({
          line: st.line,
          column: st.column,
          message: `No se pueden mezclar monedas en un mismo contrato (ya declarada en la línea ${first}).`,
          kind: "semantico",
        });
      } else {
        errors.push({
          line: st.line,
          column: st.column,
          message: `Variable "${st.key}" redeclarada (ya definida en la línea ${first}).`,
          kind: "semantico",
        });
      }
      continue;
    }
    seen.set(st.key, st.line);

    switch (st.key) {
      case "MONEDA": {
        const v = st.rawValue.toUpperCase();
        if (!MONEDAS.includes(v)) {
          errors.push({
            line: st.line,
            column: st.column,
            message: `Moneda "${st.rawValue}" no soportada. Use: ${MONEDAS.join(", ")}.`,
            kind: "semantico",
          });
          break;
        }
        values["MONEDA"] = v;
        symbols.push({
          name: "MONEDA",
          type: "MONEDA",
          value: v,
          scope: "contrato",
          line: st.line,
          mutable: false,
        });
        break;
      }
      case "CAPITAL": {
        const n = Number(st.rawValue.replace(/[,_]/g, ""));
        if (Number.isNaN(n)) {
          errors.push({
            line: st.line,
            column: st.column,
            message: `CAPITAL debe ser numérico, se recibió "${st.rawValue}".`,
            kind: "semantico",
          });
          break;
        }
        if (n <= 0) {
          errors.push({
            line: st.line,
            column: st.column,
            message: `CAPITAL debe ser mayor que 0 (se recibió ${n}).`,
            kind: "semantico",
          });
          break;
        }
        values["CAPITAL"] = n;
        symbols.push({
          name: "CAPITAL",
          type: "DECIMAL",
          value: n,
          scope: "contrato",
          line: st.line,
          mutable: false,
        });
        break;
      }
      case "TASA_ANUAL": {
        const n = Number(st.rawValue.replace("%", "").trim());
        if (Number.isNaN(n)) {
          errors.push({
            line: st.line,
            column: st.column,
            message: `TASA_ANUAL debe ser un porcentaje válido, se recibió "${st.rawValue}".`,
            kind: "semantico",
          });
          break;
        }
        if (n < 0) {
          errors.push({
            line: st.line,
            column: st.column,
            message: `La tasa de interés no puede ser negativa (se recibió ${n}%).`,
            kind: "semantico",
          });
          break;
        }
        if (n > 100) {
          warnings.push({
            line: st.line,
            column: st.column,
            message: `Tasa anual inusualmente alta (${n}%). Verifique la unidad.`,
            kind: "semantico",
          });
        }
        values["TASA_ANUAL"] = n;
        symbols.push({
          name: "TASA_ANUAL",
          type: "PORCENTAJE",
          value: n,
          scope: "contrato",
          line: st.line,
          mutable: false,
        });
        break;
      }
      case "PLAZO": {
        const match = st.rawValue.match(/^(\d+(?:\.\d+)?)\s*(MESES|MES|ANIOS|AÑOS)?$/i);
        if (!match) {
          errors.push({
            line: st.line,
            column: st.column,
            message: `PLAZO inválido "${st.rawValue}". Formato esperado: "12 MESES".`,
            kind: "semantico",
          });
          break;
        }
        let n = Number(match[1]);
        const unit = (match[2] ?? "MESES").toUpperCase();
        if (unit === "ANIOS" || unit === "AÑOS") n *= 12;
        if (!Number.isInteger(n) || n <= 0) {
          errors.push({
            line: st.line,
            column: st.column,
            message: `PLAZO debe ser un número entero de meses mayor que 0.`,
            kind: "semantico",
          });
          break;
        }
        if (n > 480) {
          warnings.push({
            line: st.line,
            column: st.column,
            message: `Plazo de ${n} meses supera 40 años.`,
            kind: "semantico",
          });
        }
        values["PLAZO"] = n;
        symbols.push({
          name: "PLAZO",
          type: "ENTERO",
          value: n,
          scope: "contrato",
          line: st.line,
          mutable: false,
        });
        break;
      }
      case "METODO": {
        const v = st.rawValue.toUpperCase();
        if (!METODOS.includes(v)) {
          errors.push({
            line: st.line,
            column: st.column,
            message: `METODO "${st.rawValue}" no válido. Use: ${METODOS.join(", ")}.`,
            kind: "semantico",
          });
          break;
        }
        values["METODO"] = v;
        symbols.push({
          name: "METODO",
          type: "ENUM",
          value: v,
          scope: "contrato",
          line: st.line,
          mutable: false,
        });
        break;
      }
      case "COMISION": {
        const n = Number(st.rawValue.replace("%", "").trim());
        if (Number.isNaN(n) || n < 0) {
          errors.push({
            line: st.line,
            column: st.column,
            message: `COMISION debe ser un porcentaje mayor o igual a 0.`,
            kind: "semantico",
          });
          break;
        }
        if (n >= 100) {
          semanticError(st, `COMISION debe ser menor que 100% (se recibió ${n}%).`);
          break;
        }
        values["COMISION"] = n;
        symbols.push({
          name: "COMISION",
          type: "PORCENTAJE",
          value: n,
          scope: "contrato",
          line: st.line,
          mutable: false,
        });
        break;
      }
      case "IVA": {
        const n = parsePercent(st.rawValue);
        if (Number.isNaN(n)) {
          semanticError(st, `IVA debe ser un porcentaje válido, se recibió "${st.rawValue}".`);
          break;
        }
        if (n < 0) {
          semanticError(st, `IVA debe ser mayor o igual a 0 (se recibió ${n}%).`);
          break;
        }
        define(st, "PORCENTAJE", n);
        break;
      }
      case "INFLACION_ESPERADA": {
        const n = parsePercent(st.rawValue);
        if (Number.isNaN(n)) {
          semanticError(
            st,
            `INFLACION_ESPERADA debe ser un porcentaje válido, se recibió "${st.rawValue}".`,
          );
          break;
        }
        define(st, "PORCENTAJE", n);
        break;
      }
      case "SPREAD": {
        const n = parsePercent(st.rawValue);
        if (Number.isNaN(n)) {
          semanticError(st, `SPREAD debe ser un porcentaje válido, se recibió "${st.rawValue}".`);
          break;
        }
        define(st, "PORCENTAJE", n);
        break;
      }
      case "TASA_BASE": {
        const v = st.rawValue
          .replace(/^"(.*)"$/, "$1")
          .trim()
          .toUpperCase();
        if (!Object.hasOwn(TASAS_BASE, v)) {
          semanticError(
            st,
            `Tasa base "${v}" no soportada. Use: ${Object.keys(TASAS_BASE).join(", ")}.`,
          );
          break;
        }
        define(st, "ENUM", v);
        break;
      }
      case "GRACIA_CAPITAL": {
        const n = parseMonths(st.rawValue);
        if (n === null) {
          semanticError(
            st,
            `GRACIA_CAPITAL inválido "${st.rawValue}". Formato esperado: "3 MESES".`,
          );
          break;
        }
        if (!Number.isInteger(n) || n < 0) {
          semanticError(st, `GRACIA_CAPITAL debe ser un número entero de meses mayor o igual a 0.`);
          break;
        }
        define(st, "ENTERO", n);
        break;
      }
    }
  }

  const lastLine = seen.size ? Math.max(...seen.values()) : 1;
  const tasaFija = seen.has("TASA_ANUAL");
  const usaBase = seen.has("TASA_BASE");
  const usaSpread = seen.has("SPREAD");

  if (tasaFija && (usaBase || usaSpread)) {
    const variableKey = usaBase ? "TASA_BASE" : "SPREAD";
    errors.push({
      line: seen.get(variableKey)!,
      column: 1,
      message: `Defina TASA_ANUAL o la combinación TASA_BASE + SPREAD, no ambas (TASA_ANUAL está en la línea ${seen.get("TASA_ANUAL")}).`,
      kind: "semantico",
    });
  } else if (usaBase !== usaSpread) {
    const present = usaBase ? "TASA_BASE" : "SPREAD";
    const missing = usaBase ? "SPREAD" : "TASA_BASE";
    errors.push({
      line: seen.get(present)!,
      column: 1,
      message: `TASA_BASE y SPREAD deben declararse juntas: falta "${missing}".`,
      kind: "semantico",
    });
  } else if (usaBase && "TASA_BASE" in values && "SPREAD" in values) {
    const base = TASAS_BASE[String(values["TASA_BASE"])]!;
    const tasa = Math.round((base + Number(values["SPREAD"])) * 10000) / 10000;
    const line = seen.get("SPREAD")!;
    if (tasa < 0) {
      errors.push({
        line,
        column: 1,
        message: `La tasa resultante TASA_BASE + SPREAD no puede ser negativa (${tasa}%).`,
        kind: "semantico",
      });
    } else {
      if (tasa > 100) {
        warnings.push({
          line,
          column: 1,
          message: `Tasa anual resultante inusualmente alta (${tasa}%). Verifique el SPREAD.`,
          kind: "semantico",
        });
      }
      values["TASA_ANUAL"] = tasa;
      symbols.push({
        name: "TASA_ANUAL",
        type: "PORCENTAJE",
        value: tasa,
        scope: "derivada",
        line,
        mutable: false,
      });
    }
  }

  if ("GRACIA_CAPITAL" in values && "PLAZO" in values) {
    const gracia = Number(values["GRACIA_CAPITAL"]);
    const plazo = Number(values["PLAZO"]);
    if (gracia >= plazo) {
      errors.push({
        line: seen.get("GRACIA_CAPITAL")!,
        column: 1,
        message: `GRACIA_CAPITAL (${gracia} meses) debe ser menor que PLAZO (${plazo} meses).`,
        kind: "semantico",
      });
    }
  }

  for (const required of ["MONEDA", "CAPITAL", "PLAZO"]) {
    if (!(required in values)) {
      errors.push({
        line: lastLine,
        column: 1,
        message: `Declaración obligatoria ausente: "${required}".`,
        kind: "semantico",
      });
    }
  }
  if (!usaBase && !usaSpread && !("TASA_ANUAL" in values)) {
    errors.push({
      line: lastLine,
      column: 1,
      message: `Declaración obligatoria ausente: "TASA_ANUAL" (o la combinación TASA_BASE + SPREAD).`,
      kind: "semantico",
    });
  }

  return { symbols, errors, warnings, values };
}

/** Fase 4a — Tabla de direcciones simulada. */
function buildAddressTable(symbols: Symbol[]): AddressRow[] {
  const sizeOf: Record<Symbol["type"], number> = {
    MONEDA: 4,
    DECIMAL: 8,
    ENTERO: 4,
    PORCENTAJE: 8,
    ENUM: 4,
  };
  let offset = 0;
  return symbols.map((s, i) => {
    const size = sizeOf[s.type];
    const row: AddressRow = {
      name: s.name,
      offset,
      size,
      segment: s.type === "MONEDA" || s.type === "ENUM" ? ".rodata" : ".data",
      reference: `R${String(i).padStart(2, "0")}@0x${offset.toString(16).padStart(4, "0")}`,
    };
    offset += size;
    return row;
  });
}

function buildAst(statements: Statement[], values: Record<string, string | number>): AstNode {
  return {
    type: "ContratoPrestamo",
    children: statements.map((st) => ({
      type: "Declaracion",
      value: st.key,
      line: st.line,
      children: [
        {
          type:
            st.key === "MONEDA" || st.key === "METODO" || st.key === "TASA_BASE"
              ? "Literal"
              : "ValorNumerico",
          value: values[st.key] ?? st.rawValue,
          line: st.line,
        },
      ],
    })),
  };
}

/** Fase 4b — Generación de código objetivo: flujo de caja mes a mes. */
function generate(values: Record<string, string | number>): {
  amortization: AmortizationRow[];
  cuota: number;
  totalIntereses: number;
  /** Interés exacto (sin redondeo) de cada periodo, para el cálculo del CAT. */
  interesesPeriodo: number[];
  /** Cuota exacta (sin redondeo) de cada periodo, para el cálculo del CAT. */
  cuotasPeriodo: number[];
} {
  const capital = Number(values["CAPITAL"]);
  const tasaAnual = Number(values["TASA_ANUAL"]);
  const plazo = Number(values["PLAZO"]);
  const metodo = String(values["METODO"] ?? "FRANCES");
  const gracia = Number(values["GRACIA_CAPITAL"] ?? 0);
  const i = tasaAnual / 100 / 12;
  const periodosAmortizacion = plazo - gracia;

  const rows: AmortizationRow[] = [];
  const interesesPeriodo: number[] = [];
  const cuotasPeriodo: number[] = [];
  let saldo = capital;
  let totalIntereses = 0;
  let cuotaBase = 0;

  const push = (p: number, cuota: number, interes: number, abono: number, saldoFinal: number) => {
    rows.push({
      periodo: p,
      saldoInicial: round(saldo),
      cuota: round(cuota),
      interes: round(interes),
      capital: round(abono),
      saldoFinal: round(saldoFinal),
      gracia: p <= gracia,
    });
    interesesPeriodo.push(interes);
    cuotasPeriodo.push(cuota);
    totalIntereses += interes;
    saldo = saldoFinal;
  };

  for (let p = 1; p <= gracia; p++) {
    const interes = saldo * i;
    push(p, interes, interes, 0, saldo);
  }

  if (metodo === "ALEMAN") {
    const amortConstante = capital / periodosAmortizacion;
    for (let p = gracia + 1; p <= plazo; p++) {
      const interes = saldo * i;
      const saldoFinal = p === plazo ? 0 : saldo - amortConstante;
      push(p, amortConstante + interes, interes, amortConstante, saldoFinal);
    }
    cuotaBase = rows[gracia]?.cuota ?? 0;
  } else {
    cuotaBase =
      i === 0
        ? capital / periodosAmortizacion
        : (capital * i) / (1 - Math.pow(1 + i, -periodosAmortizacion));
    for (let p = gracia + 1; p <= plazo; p++) {
      const interes = saldo * i;
      const abono = cuotaBase - interes;
      const saldoFinal = p === plazo ? 0 : saldo - abono;
      push(p, cuotaBase, interes, abono, saldoFinal);
    }
  }

  return {
    amortization: rows,
    cuota: round(cuotaBase),
    totalIntereses: round(totalIntereses),
    interesesPeriodo,
    cuotasPeriodo,
  };
}

/**
 * Tasa mensual r que iguala el monto neto recibido con los pagos:
 * neto = Σ pagos[t] / (1 + r)^(t+1). Se resuelve por bisección.
 */
function tirMensual(neto: number, pagos: number[]): number {
  const vpn = (r: number) =>
    pagos.reduce((acc, pago, t) => acc + pago / Math.pow(1 + r, t + 1), 0) - neto;
  if (vpn(0) <= 0) return 0;
  let lo = 0;
  let hi = 1;
  while (vpn(hi) > 0 && hi < 1e6) hi *= 2;
  for (let k = 0; k < 200 && hi - lo > 1e-14; k++) {
    const mid = (lo + hi) / 2;
    if (vpn(mid) > 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** Costos del crédito: comisión de apertura, IVA sobre intereses, CAT y tasa real (Fisher). */
function computeCosts(
  values: Record<string, string | number>,
  interesesPeriodo: number[],
  cuotasPeriodo: number[],
) {
  const capital = Number(values["CAPITAL"]);
  const tasaAnual = Number(values["TASA_ANUAL"]);
  const comisionPct = Number(values["COMISION"] ?? 0);
  const ivaPct = Number(values["IVA"] ?? 0);

  const totalIntereses = interesesPeriodo.reduce((a, b) => a + b, 0);
  const comision = (capital * comisionPct) / 100;
  const ivaIntereses = (totalIntereses * ivaPct) / 100;
  const costoTotal = totalIntereses + comision + ivaIntereses;

  const pagos = cuotasPeriodo.map((cuota, t) => cuota + (interesesPeriodo[t]! * ivaPct) / 100);
  const r = tirMensual(capital - comision, pagos);
  const cat = (Math.pow(1 + r, 12) - 1) * 100;

  const tasaReal =
    "INFLACION_ESPERADA" in values
      ? ((1 + tasaAnual / 100) / (1 + Number(values["INFLACION_ESPERADA"]) / 100) - 1) * 100
      : null;

  return {
    comision: round(comision),
    ivaIntereses: round(ivaIntereses),
    costoTotal: round(costoTotal),
    cat: round(cat),
    tasaReal: tasaReal === null ? null : Math.round(tasaReal * 10000) / 10000,
  };
}

/** Orquesta las 4 fases del compilador (fallback local del backend FastAPI). */
export function compileLocally(source: string): CompileResult {
  const start = performance.now();
  const logs: string[] = [];

  const { tokens, errors: lexErrors } = lex(source);
  logs.push(`[lexer] ${tokens.length} tokens reconocidos, ${lexErrors.length} error(es).`);

  const { statements, errors: parseErrors } = parse(source);
  logs.push(
    `[parser] ${statements.length} sentencia(s) válida(s), ${parseErrors.length} error(es).`,
  );

  const structural = [...lexErrors, ...parseErrors].sort((a, b) => a.line - b.line);
  if (structural.length) {
    logs.push("[compilador] Abortado en fase sintáctica. No se generó código objetivo.");
    return {
      ok: false,
      errors: structural,
      warnings: [],
      tokens,
      symbols: [],
      addresses: [],
      ast: null,
      amortization: [],
      summary: null,
      engine: "local",
      logs,
    };
  }

  const { symbols, errors: semErrors, warnings, values } = analyze(statements);
  logs.push(
    `[semantico] Tabla de símbolos con ${symbols.length} entrada(s), ${semErrors.length} error(es), ${warnings.length} advertencia(s).`,
  );

  if (semErrors.length) {
    logs.push("[compilador] Abortado en análisis semántico (HTTP 400 simulado).");
    return {
      ok: false,
      errors: semErrors.sort((a, b) => a.line - b.line),
      warnings,
      tokens,
      symbols,
      addresses: buildAddressTable(symbols),
      ast: buildAst(statements, values),
      amortization: [],
      summary: null,
      engine: "local",
      logs,
    };
  }

  const addresses = buildAddressTable(symbols);
  const ast = buildAst(statements, values);
  const { amortization, cuota, totalIntereses, interesesPeriodo, cuotasPeriodo } = generate(values);
  const costs = computeCosts(values, interesesPeriodo, cuotasPeriodo);
  const graciaMeses = Number(values["GRACIA_CAPITAL"] ?? 0);
  const tiempoMs = Math.round((performance.now() - start) * 100) / 100;
  logs.push(
    `[codegen] ${amortization.length} periodo(s) generados (${graciaMeses} de gracia) en ${tiempoMs} ms.`,
  );
  logs.push(
    `[codegen] CAT ${costs.cat}% · costo total ${costs.costoTotal}` +
      (costs.tasaReal === null ? "." : ` · tasa real ${costs.tasaReal}%.`),
  );

  return {
    ok: true,
    errors: [],
    warnings,
    tokens,
    symbols,
    addresses,
    ast,
    amortization,
    summary: {
      moneda: String(values["MONEDA"]),
      capital: Number(values["CAPITAL"]),
      tasaAnual: Number(values["TASA_ANUAL"]),
      tasaMensual: Math.round((Number(values["TASA_ANUAL"]) / 12) * 10000) / 10000,
      plazo: Number(values["PLAZO"]),
      metodo: String(values["METODO"] ?? "FRANCES"),
      cuota,
      totalIntereses,
      totalPagado: round(Number(values["CAPITAL"]) + totalIntereses),
      tiempoMs,
      graciaMeses,
      ...costs,
    },
    engine: "local",
    logs,
  };
}
