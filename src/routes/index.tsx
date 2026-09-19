import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FolderOpen, Play, Save, Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { CodeEditor } from "@/components/app/CodeEditor";
import { ResultsPanel } from "@/components/app/ResultsPanel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useSession } from "@/hooks/use-session";
import { compileSource } from "@/lib/finscript/api";
import { DEFAULT_SOURCE, SAMPLES } from "@/lib/finscript/samples";
import type { CompileResult } from "@/lib/finscript/types";
import {
  insertContract,
  listContracts,
  updateContract,
  type Contract,
} from "@/lib/contracts";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Playground · FinScript Compiler Web" },
      {
        name: "description",
        content:
          "Escribe reglas de préstamos en FinScript, compílalas y revisa la tabla de amortización, la tabla de símbolos y el AST.",
      },
      { property: "og:title", content: "Playground · FinScript Compiler Web" },
      {
        property: "og:description",
        content:
          "Editor dividido con compilación en 4 fases: léxico, sintáctico, semántico y generación de código.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Playground,
  validateSearch: (search: Record<string, unknown>) => ({
    contrato: typeof search.contrato === "string" ? search.contrato : undefined,
  }),
});

function Playground() {
  const navigate = useNavigate();
  const { session, ready } = useSession();
  const { contrato } = Route.useSearch();

  const [sourceCode, setSourceCode] = useState(DEFAULT_SOURCE);
  const [compiledResults, setCompiledResults] = useState<CompileResult | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [errors, setErrors] = useState<CompileResult["errors"]>([]);
  const [titulo, setTitulo] = useState("Contrato sin título");
  const [contractId, setContractId] = useState<string | null>(null);
  const [saved, setSaved] = useState<Contract[]>([]);
  const [saveOpen, setSaveOpen] = useState(false);

  useEffect(() => {
    if (ready && !session) navigate({ to: "/auth" });
  }, [ready, session, navigate]);

  useEffect(() => {
    if (!session) return;
    setSaved(listContracts(session.id));
  }, [session, saveOpen]);

  useEffect(() => {
    if (!contrato || !session) return;
    const row = listContracts(session.id).find((c) => c.id === contrato);
    if (row) {
      setContractId(row.id);
      setTitulo(row.titulo);
      setSourceCode(row.codigo_fuente);
    }
  }, [contrato, session]);

  const handleCompile = async () => {
    setIsCompiling(true);
    try {
      const result = await compileSource(sourceCode);
      setCompiledResults(result);
      setErrors(result.errors);
      if (result.ok) toast.success(`Compilado en ${result.summary?.tiempoMs ?? 0} ms`);
      else toast.error(`${result.errors.length} error(es) de compilación`);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleSave = () => {
    if (!session) return;
    if (contractId) {
      updateContract(contractId, { titulo, codigo_fuente: sourceCode });
      toast.success("Contrato actualizado");
    } else {
      const row = insertContract(session.id, titulo, sourceCode);
      setContractId(row.id);
      toast.success("Contrato guardado");
    }
    setSaveOpen(false);
  };

  const loadContract = (row: Contract) => {
    setContractId(row.id);
    setTitulo(row.titulo);
    setSourceCode(row.codigo_fuente);
    setCompiledResults(null);
    setErrors([]);
    toast.success(`Cargado: ${row.titulo}`);
  };

  return (
    <AppShell>
      <div className="flex h-screen flex-col">
        <header className="flex flex-wrap items-center gap-2 border-b border-border bg-card/60 px-4 py-3">
          <div className="mr-auto min-w-0">
            <h1 className="truncate text-sm font-semibold tracking-tight">{titulo}</h1>
            <p className="text-xs text-muted-foreground">
              {contractId ? "Contrato guardado" : "Borrador no guardado"} · FinScript DSL
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Sparkles className="size-4" /> Ejemplos
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {SAMPLES.map((s) => (
                <DropdownMenuItem
                  key={s.id}
                  onClick={() => {
                    setSourceCode(s.code);
                    setCompiledResults(null);
                    setErrors([]);
                  }}
                  className="flex flex-col items-start"
                >
                  <span>{s.title}</span>
                  <span className="text-xs text-muted-foreground">{s.description}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <FolderOpen className="size-4" /> Cargar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {saved.length === 0 && (
                <DropdownMenuItem disabled>Sin contratos guardados</DropdownMenuItem>
              )}
              {saved.map((row) => (
                <DropdownMenuItem key={row.id} onClick={() => loadContract(row)}>
                  {row.titulo}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Save className="size-4" /> Guardar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Guardar contrato</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Label htmlFor="titulo">Título</Label>
                <Input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
                <Button onClick={handleSave} className="w-full">
                  {contractId ? "Actualizar contrato" : "Guardar contrato"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </header>

        <ResizablePanelGroup direction="horizontal" className="min-h-0 flex-1">
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
                <span className="font-mono text-xs text-muted-foreground">
                  contrato.finscript
                </span>
                <Button size="sm" onClick={handleCompile} disabled={isCompiling} className="gap-2">
                  {isCompiling ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Play className="size-4" />
                  )}
                  Compilar contrato
                </Button>
              </div>
              <div className="min-h-0 flex-1">
                <CodeEditor value={sourceCode} onChange={setSourceCode} errors={errors} />
              </div>
              <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
                Claves soportadas:{" "}
                <span className="font-mono text-code-keyword">
                  MONEDA, CAPITAL, TASA_ANUAL, PLAZO, METODO, COMISION
                </span>
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50} minSize={30}>
            <ResultsPanel result={compiledResults} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </AppShell>
  );
}
