import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FileCode2, Loader2, Trash2, PenLine } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { deleteContract, listContracts, type Contract } from "@/lib/contracts";
import { toast } from "sonner";

export const Route = createFileRoute("/contratos")({
  head: () => ({
    meta: [
      { title: "Mis contratos · FinScript Compiler Web" },
      {
        name: "description",
        content:
          "Consulta, edita y elimina los contratos FinScript guardados en tu cuenta antes de volver a compilarlos.",
      },
      { property: "og:title", content: "Mis contratos · FinScript Compiler Web" },
      {
        property: "og:description",
        content: "Listado de contratos de préstamo guardados con su código fuente FinScript.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContractsPage,
});

function ContractsPage() {
  const navigate = useNavigate();
  const { session, ready } = useSession();
  const [rows, setRows] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ready && !session) navigate({ to: "/auth" });
  }, [ready, session, navigate]);

  const refresh = async () => {
    try {
      setRows(await listContracts());
    } catch (err) {
      toast.error(`No se pudieron cargar los contratos: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) void refresh();
  }, [session]);

  const remove = async (id: string) => {
    try {
      await deleteContract(id);
      toast.success("Contrato eliminado");
      await refresh();
    } catch (err) {
      toast.error(`No se pudo eliminar: ${(err as Error).message}`);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl p-6">
        <header className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight">Mis contratos</h1>
          <p className="text-sm text-muted-foreground">
            Registros de la tabla <span className="font-mono">contratos</span>: id, user_id, título,
            código fuente y fecha de creación.
          </p>
        </header>

        {loading ? (
          <div className="panel flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Cargando contratos…
          </div>
        ) : rows.length === 0 ? (
          <div className="panel flex flex-col items-center gap-3 p-10 text-center">
            <FileCode2 className="size-7 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Aún no has guardado contratos. Crea uno en el playground.
            </p>
            <Button onClick={() => navigate({ to: "/" })}>Nuevo contrato</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => (
              <div key={row.id} className="panel p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{row.titulo}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      id {row.id.slice(0, 8)} · creado{" "}
                      {new Date(row.created_at).toLocaleString("es-MX")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={() => navigate({ to: "/", search: { contrato: row.id } })}
                    >
                      <PenLine className="size-4" /> Abrir
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-2 text-destructive"
                      onClick={() => void remove(row.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
                <pre className="mt-3 max-h-40 overflow-auto rounded border border-border bg-muted/40 p-3 font-mono text-[11px] text-muted-foreground">
                  {row.codigo_fuente}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
