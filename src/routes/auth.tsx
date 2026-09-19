import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Terminal } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signIn } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acceso · FinScript Compiler Web" },
      {
        name: "description",
        content:
          "Inicia sesión o regístrate para guardar y compilar tus contratos de préstamo escritos en FinScript.",
      },
      { property: "og:title", content: "Acceso · FinScript Compiler Web" },
      {
        property: "og:description",
        content: "Accede al playground de compilación de contratos financieros FinScript.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@") || password.length < 6) {
      toast.error("Ingresa un correo válido y una contraseña de 6 caracteres o más.");
      return;
    }
    signIn(email);
    toast.success(mode === "login" ? "Sesión iniciada" : "Cuenta creada");
    navigate({ to: "/" });
  };

  return (
    <div className="grid-backdrop flex min-h-screen items-center justify-center px-4">
      <div className="panel w-full max-w-sm p-6">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Terminal className="size-5" />
          </div>
          <div>
            <p className="font-semibold tracking-tight">FinScript Compiler Web</p>
            <p className="text-xs text-muted-foreground">Prototipo académico de compiladores</p>
          </div>
        </div>

        <Tabs value={mode} onValueChange={setMode} className="mb-5">
          <TabsList className="w-full">
            <TabsTrigger value="login" className="flex-1">
              Iniciar sesión
            </TabsTrigger>
            <TabsTrigger value="signup" className="flex-1">
              Registrarme
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-1.5">
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="analista@banco.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" className="w-full">
            {mode === "login" ? "Entrar al playground" : "Crear cuenta"}
          </Button>
        </form>

        <p className="mt-4 text-xs text-muted-foreground">
          Sesión de prototipo: se guarda en este navegador. Al conectar la base de datos se
          reemplaza por autenticación real sin cambiar esta pantalla.
        </p>
      </div>
    </div>
  );
}
