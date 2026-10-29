import {
  AlertTriangle,
  CheckCircle2,
  CircleSlash,
  Cpu,
  Hash,
  Landmark,
  Percent,
  TrendingDown,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AstNode, CompileResult, CompileSummary } from "@/lib/finscript/types";

const money = (n: number, moneda: string) =>
  `${n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${moneda}`;

function AstTree({ node, depth = 0 }: { node: AstNode; depth?: number }) {
  return (
    <div className="font-mono text-xs" style={{ paddingLeft: depth * 16 }}>
      <span className="text-code-keyword">{node.type}</span>
      {node.value !== undefined && (
        <>
          <span className="text-muted-foreground"> · </span>
          <span className="text-code-number">{String(node.value)}</span>
        </>
      )}
      {node.line !== undefined && (
        <span className="text-code-comment"> {`// línea ${node.line}`}</span>
      )}
      {node.children?.map((child, i) => (
        <AstTree key={i} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

interface Kpi {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  highlight?: boolean;
}

function buildKpis(summary: CompileSummary): Kpi[] {
  const { moneda } = summary;
  const kpis: Kpi[] = [
    {
      icon: Wallet,
      label: "Cuota mensual",
      value: money(summary.cuota, moneda),
      ...((summary.graciaMeses ?? 0) > 0 && {
        hint: `Tras ${summary.graciaMeses} mes(es) de gracia`,
      }),
    },
    { icon: Percent, label: "Tasa mensual", value: `${summary.tasaMensual}%` },
    { icon: Hash, label: "Total intereses", value: money(summary.totalIntereses, moneda) },
  ];
  if (summary.cat != null) {
    kpis.push({
      icon: Landmark,
      label: "CAT (Costo Anual Total)",
      value: `${summary.cat.toFixed(2)}%`,
      highlight: true,
      ...(summary.costoTotal != null && {
        hint: `Costo total: ${money(summary.costoTotal, moneda)}`,
      }),
    });
  }
  if (summary.tasaReal != null) {
    kpis.push({
      icon: TrendingDown,
      label: "Tasa de interés real",
      value: `${summary.tasaReal.toFixed(2)}%`,
      hint: `Nominal ${summary.tasaAnual}% ajustada por inflación (Fisher)`,
      highlight: true,
    });
  }
  kpis.push({ icon: Cpu, label: "Compilación", value: `${summary.tiempoMs} ms` });
  return kpis;
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
      <CircleSlash className="size-6" />
      {label}
    </div>
  );
}

export function ResultsPanel({ result }: { result: CompileResult | null }) {
  const moneda = result?.summary?.moneda ?? "";

  return (
    <Tabs defaultValue="tabla" className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2">
        <TabsList className="bg-muted/60">
          <TabsTrigger value="tabla">Resultados (Tabla)</TabsTrigger>
          <TabsTrigger value="consola">
            Consola/Errores
            {result && result.errors.length > 0 && (
              <span className="ml-2 rounded bg-destructive px-1.5 text-[10px] text-destructive-foreground">
                {result.errors.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="simbolos">Tabla de Símbolos</TabsTrigger>
          <TabsTrigger value="direcciones">Direcciones</TabsTrigger>
          <TabsTrigger value="ast">AST</TabsTrigger>
          <TabsTrigger value="tokens">Tokens</TabsTrigger>
        </TabsList>
        {result && (
          <Badge variant={result.ok ? "default" : "destructive"} className="gap-1">
            {result.ok ? <CheckCircle2 className="size-3" /> : <AlertTriangle className="size-3" />}
            {result.ok ? "HTTP 200" : "HTTP 400"}
            <span className="opacity-70">
              · {result.engine === "backend" ? "backend" : "compilador local"}
            </span>
          </Badge>
        )}
      </div>

      <div className="min-h-0 flex-1">
        <TabsContent value="tabla" className="m-0 h-full">
          {result?.ok && result.summary ? (
            <ScrollArea className="h-full">
              <div className="space-y-4 p-4">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {buildKpis(result.summary).map((kpi) => (
                    <div
                      key={kpi.label}
                      className={`panel p-3 ${kpi.highlight ? "border-primary/50 bg-primary/5" : ""}`}
                    >
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <kpi.icon className="size-3.5" /> {kpi.label}
                      </div>
                      <p className="mt-1 font-mono text-lg text-foreground">{kpi.value}</p>
                      {kpi.hint && (
                        <p className="mt-0.5 text-[11px] text-muted-foreground">{kpi.hint}</p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="panel h-56 p-3">
                  <p className="mb-2 text-xs text-muted-foreground">
                    Saldo insoluto por periodo ({result.summary.metodo})
                  </p>
                  <ResponsiveContainer width="100%" height="85%">
                    <AreaChart data={result.amortization}>
                      <defs>
                        <linearGradient id="saldo" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.5} />
                          <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="var(--color-border)" vertical={false} />
                      <XAxis
                        dataKey="periodo"
                        stroke="var(--color-muted-foreground)"
                        fontSize={11}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="var(--color-muted-foreground)"
                        fontSize={11}
                        tickLine={false}
                      />
                      <ChartTooltip
                        contentStyle={{
                          background: "var(--color-popover)",
                          border: "1px solid var(--color-border)",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="saldoFinal"
                        stroke="var(--color-chart-1)"
                        fill="url(#saldo)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="panel overflow-hidden">
                  {(result.summary.graciaMeses ?? 0) > 0 && (
                    <div className="flex items-center gap-2 border-b border-border px-3 py-2 text-xs text-muted-foreground">
                      <Badge
                        variant="outline"
                        className="border-warning/50 bg-warning/10 text-warning"
                      >
                        Gracia
                      </Badge>
                      Meses 1–{result.summary.graciaMeses}: solo se pagan intereses; el saldo no
                      disminuye.
                    </div>
                  )}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead className="text-right">Saldo inicial</TableHead>
                        <TableHead className="text-right">Cuota</TableHead>
                        <TableHead className="text-right">Interés</TableHead>
                        <TableHead className="text-right">Capital</TableHead>
                        <TableHead className="text-right">Saldo final</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="font-mono text-xs">
                      {result.amortization.map((row) => (
                        <TableRow
                          key={row.periodo}
                          className={row.gracia ? "bg-warning/5 hover:bg-warning/10" : undefined}
                        >
                          <TableCell>
                            <span className="inline-flex items-center gap-2">
                              {row.periodo}
                              {row.gracia && (
                                <Badge
                                  variant="outline"
                                  className="border-warning/50 bg-warning/10 px-1.5 py-0 text-[10px] text-warning"
                                >
                                  Gracia
                                </Badge>
                              )}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            {row.saldoInicial.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right text-primary">
                            {row.cuota.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">{row.interes.toFixed(2)}</TableCell>
                          <TableCell className="text-right">{row.capital.toFixed(2)}</TableCell>
                          <TableCell className="text-right">{row.saldoFinal.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </ScrollArea>
          ) : (
            <EmptyState
              label={
                result
                  ? "La compilación falló. Revisa la pestaña Consola/Errores."
                  : "Compila un contrato para ver la tabla de amortización."
              }
            />
          )}
        </TabsContent>

        <TabsContent value="consola" className="m-0 h-full">
          <ScrollArea className="h-full">
            <div className="space-y-2 p-4 font-mono text-xs">
              {!result && <EmptyState label="Sin ejecuciones todavía." />}
              {result?.errors.map((e, i) => (
                <div
                  key={`e-${i}`}
                  className="rounded border border-destructive/40 bg-destructive/10 p-2 text-destructive"
                >
                  <span className="uppercase opacity-80">[{e.kind}]</span> línea {e.line}, columna{" "}
                  {e.column}: {e.message}
                </div>
              ))}
              {result?.warnings.map((w, i) => (
                <div
                  key={`w-${i}`}
                  className="rounded border border-warning/40 bg-warning/10 p-2 text-warning"
                >
                  [advertencia] línea {w.line}: {w.message}
                </div>
              ))}
              {result?.logs.map((l, i) => (
                <div key={`l-${i}`} className="text-muted-foreground">
                  {l}
                </div>
              ))}
              {result?.ok && (
                <div className="text-primary">
                  [compilador] Compilación exitosa sin errores. Código objetivo generado.
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="simbolos" className="m-0 h-full">
          {result?.symbols.length ? (
            <ScrollArea className="h-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Identificador</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Ámbito</TableHead>
                    <TableHead>Línea</TableHead>
                    <TableHead>Mutable</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="font-mono text-xs">
                  {result.symbols.map((s) => (
                    <TableRow key={s.name}>
                      <TableCell className="text-code-keyword">{s.name}</TableCell>
                      <TableCell>{s.type}</TableCell>
                      <TableCell className="text-code-number">{String(s.value)}</TableCell>
                      <TableCell>{s.scope}</TableCell>
                      <TableCell>{s.line}</TableCell>
                      <TableCell>{s.mutable ? "sí" : "no"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          ) : (
            <EmptyState label="La tabla de símbolos se construye al compilar." />
          )}
        </TabsContent>

        <TabsContent value="direcciones" className="m-0 h-full">
          {result?.addresses.length ? (
            <ScrollArea className="h-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Variable</TableHead>
                    <TableHead>Offset</TableHead>
                    <TableHead>Tamaño</TableHead>
                    <TableHead>Segmento</TableHead>
                    <TableHead>Referencia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="font-mono text-xs">
                  {result.addresses.map((a) => (
                    <TableRow key={a.name}>
                      <TableCell className="text-code-keyword">{a.name}</TableCell>
                      <TableCell>0x{a.offset.toString(16).padStart(4, "0")}</TableCell>
                      <TableCell>{a.size} bytes</TableCell>
                      <TableCell>{a.segment}</TableCell>
                      <TableCell className="text-code-number">{a.reference}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          ) : (
            <EmptyState label="La tabla de direcciones se genera al compilar." />
          )}
        </TabsContent>

        <TabsContent value="ast" className="m-0 h-full">
          {result?.ast ? (
            <ScrollArea className="h-full">
              <div className="p-4">
                <AstTree node={result.ast} />
                <pre className="mt-4 overflow-x-auto rounded border border-border bg-muted/40 p-3 font-mono text-[11px] text-muted-foreground">
                  {JSON.stringify(result.ast, null, 2)}
                </pre>
              </div>
            </ScrollArea>
          ) : (
            <EmptyState label="Sin AST: el análisis sintáctico no se completó." />
          )}
        </TabsContent>

        <TabsContent value="tokens" className="m-0 h-full">
          {result?.tokens.length ? (
            <ScrollArea className="h-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Tipo de token</TableHead>
                    <TableHead>Lexema</TableHead>
                    <TableHead>Línea</TableHead>
                    <TableHead>Columna</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="font-mono text-xs">
                  {result.tokens.map((t, i) => (
                    <TableRow key={i}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell className="text-code-keyword">{t.type}</TableCell>
                      <TableCell className="text-code-string">{t.value}</TableCell>
                      <TableCell>{t.line}</TableCell>
                      <TableCell>{t.column}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          ) : (
            <EmptyState label="Los tokens del analizador léxico aparecen aquí." />
          )}
        </TabsContent>
      </div>
    </Tabs>
  );
}
