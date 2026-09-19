export const DEFAULT_SOURCE = `// Contrato de préstamo en FinScript
MONEDA: USD
CAPITAL: 10000
TASA_ANUAL: 12.5%
PLAZO: 6 MESES
METODO: FRANCES
`;

export interface Sample {
  id: string;
  title: string;
  description: string;
  code: string;
}

export const SAMPLES: Sample[] = [
  {
    id: "frances",
    title: "Sistema francés",
    description: "Cuota fija, 6 meses en USD",
    code: DEFAULT_SOURCE,
  },
  {
    id: "aleman",
    title: "Sistema alemán",
    description: "Amortización constante, 12 meses en MXN",
    code: `MONEDA: MXN
CAPITAL: 250000
TASA_ANUAL: 18%
PLAZO: 12 MESES
METODO: ALEMAN
`,
  },
  {
    id: "error-semantico",
    title: "Error semántico",
    description: "Tasa negativa y mezcla de monedas",
    code: `MONEDA: USD
MONEDA: EUR
CAPITAL: 5000
TASA_ANUAL: -3%
PLAZO: 24 MESES
`,
  },
  {
    id: "error-sintactico",
    title: "Error sintáctico",
    description: "Falta el separador de dos puntos",
    code: `MONEDA USD
CAPITAL: 8000
TASA_ANUL: 9%
PLAZO: 18 MESES
`,
  },
];
