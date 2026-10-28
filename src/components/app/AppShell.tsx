import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { FileCode2, FilePlus2, LogOut, Terminal } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth";
import { useSession } from "@/hooks/use-session";
import { toast } from "sonner";

const nav = [
  { to: "/", label: "Nuevo contrato", icon: FilePlus2 },
  { to: "/contratos", label: "Mis contratos", icon: FileCode2 },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { session } = useSession();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-4 md:flex">
        <div className="mb-8 flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Terminal className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-sidebar-foreground">
              FinScript
            </p>
            <p className="text-xs text-muted-foreground">Compiler Web</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {nav.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60"
                }`}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-2 border-t border-sidebar-border pt-4">
          {session ? (
            <>
              <p className="truncate px-3 text-xs text-muted-foreground">{session.email}</p>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-muted-foreground"
                onClick={async () => {
                  try {
                    await signOut();
                    navigate({ to: "/auth" });
                  } catch (err) {
                    toast.error((err as Error).message);
                  }
                }}
              >
                <LogOut className="size-4" /> Cerrar sesión
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
              <Link to="/auth">Iniciar sesión</Link>
            </Button>
          )}
        </div>
      </aside>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
