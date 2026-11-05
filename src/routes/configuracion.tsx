import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  KeyRound,
  Landmark,
  LayoutPanelLeft,
  Plus,
  RotateCcw,
  Table2,
  Trash2,
  Type,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/hooks/use-session";
import { useSettings } from "@/hooks/use-settings";
import { updatePassword } from "@/lib/auth";
import { DEFAULT_TASAS_BASE, isReservedWord } from "@/lib/finscript/compiler";
import { DEFAULT_SOURCE } from "@/lib/finscript/samples";
import {
  DEFAULT_SETTINGS,
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  LOCALES,
  resetSettings,
  saveSettings,
  type Locale,
} from "@/lib/settings";
import { toast } from "sonner";

export const Route = createFileRoute("/configuracion")({
  head: () => ({
    meta: [
      { title: "Configuración · FinScript Compiler Web" },
      {
        name: "description",
        content:
          "Ajusta el editor, el formato de resultados, las tasas de referencia y tu cuenta en FinScript Compiler Web.",
      },
    ],
  }),
  component: SettingsPage,
});

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Type;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="panel p-5">
      <header className="mb-4 flex items-start gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
          <Icon className="size-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function ToggleRow({
  id,
  label,
  hint,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <Label htmlFor={id}>{label}</Label>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

interface TasaRow {
  nombre: string;
  valor: string;
}

const toRows = (tasas: Record<string, number>): TasaRow[] =>
  Object.entries(tasas).map(([nombre, valor]) => ({ nombre, valor: String(valor) }));

function SettingsPage() {
  const navigate = useNavigate();
  const { session, ready } = useSession();
  const settings = useSettings();

  const [plantilla, setPlantilla] = useState(settings.plantilla);
  const [tasas, setTasas] = useState<TasaRow[]>(toRows(settings.tasasBase));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (ready && !session) navigate({ to: "/auth" });
  }, [ready, session, navigate]);

  useEffect(() => setPlantilla(settings.plantilla), [settings.plantilla]);
  useEffect(() => setTasas(toRows(settings.tasasBase)), [settings.tasasBase]);

  const saveTasas = () => {
    const result: Record<string, number> = {};
    for (const { nombre, valor } of tasas) {
      const name = nombre.trim().toUpperCase();
      if (!/^[A-Z][A-Z0-9_]*$/.test(name)) {
        toast.error(`Nombre de tasa inválido "${nombre}". Usa letras, números y "_" sin espacios.`);
        return;
      }
      if (isReservedWord(name)) {
        toast.error(`"${name}" es una palabra reservada de FinScript.`);
        return;
      }
      if (name in result) {
        toast.error(`La tasa "${name}" está repetida.`);
        return;
      }
      const n = Number(valor.replace("%", "").trim());
      if (valor.trim() === "" || !Number.isFinite(n) || n < 0) {
        toast.error(`El valor de "${name}" debe ser un porcentaje mayor o igual a 0.`);
        return;
      }
      result[name] = n;
    }
    saveSettings({ tasasBase: result });
    toast.success("Tasas de referencia guardadas");
  };

  const savePassword = async () => {
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }
    setSavingPassword(true);
    try {
      await updatePassword(password);
      setPassword("");
      setConfirmPassword("");
      toast.success("Contraseña actualizada");
    } catch (err) {
      toast.error(`No se pudo cambiar la contraseña: ${(err as Error).message}`);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-4 p-6">
        <header className="mb-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Configuración</h1>
            <p className="text-sm text-muted-foreground">
              Las preferencias se guardan en este navegador y se aplican al instante.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              resetSettings();
              toast.success("Configuración restablecida");
            }}
          >
            <RotateCcw className="size-4" /> Restablecer todo
          </Button>
        </header>

        <Section
          icon={Type}
          title="Editor"
          description="Cómo se ve y se comporta el área de código."
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Tamaño de letra</Label>
              <span className="font-mono text-xs text-muted-foreground">
                {settings.editorFontSize}px
              </span>
            </div>
            <Slider
              min={FONT_SIZE_MIN}
              max={FONT_SIZE_MAX}
              step={1}
              value={[settings.editorFontSize]}
              onValueChange={([v]) => v !== undefined && saveSettings({ editorFontSize: v })}
            />
          </div>
          <ToggleRow
            id="wrap"
            label="Ajuste de línea"
            hint="Parte las líneas largas en varias. Desactivado, los números de línea siempre coinciden."
            checked={settings.editorWordWrap}
            onChange={(v) => saveSettings({ editorWordWrap: v })}
          />
          <ToggleRow
            id="shortcut"
            label="Compilar con Ctrl + Enter"
            hint="Atajo de teclado dentro del editor (⌘ + Enter en Mac)."
            checked={settings.compileShortcut}
            onChange={(v) => saveSettings({ compileShortcut: v })}
          />
        </Section>

        <Section
          icon={LayoutPanelLeft}
          title="Playground"
          description="Comportamiento al crear y abrir contratos."
        >
          <ToggleRow
            id="autocompile"
            label="Compilar automáticamente al abrir"
            hint="Compila en cuanto cargas un contrato guardado o un ejemplo."
            checked={settings.autoCompile}
            onChange={(v) => saveSettings({ autoCompile: v })}
          />
          <ToggleRow
            id="confirm-delete"
            label="Confirmar antes de eliminar"
            hint="Pide confirmación al borrar un contrato en «Mis contratos»."
            checked={settings.confirmDelete}
            onChange={(v) => saveSettings({ confirmDelete: v })}
          />
          <div className="space-y-2">
            <Label htmlFor="plantilla">Contrato inicial</Label>
            <p className="text-xs text-muted-foreground">
              Texto con el que arranca el editor al abrir el Playground sin un contrato.
            </p>
            <Textarea
              id="plantilla"
              value={plantilla}
              onChange={(e) => setPlantilla(e.target.value)}
              spellCheck={false}
              className="min-h-40 font-mono text-xs"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={plantilla === settings.plantilla}
                onClick={() => {
                  saveSettings({ plantilla });
                  toast.success("Contrato inicial guardado");
                }}
              >
                Guardar contrato inicial
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  saveSettings({ plantilla: DEFAULT_SOURCE });
                  toast.success("Contrato inicial restablecido");
                }}
              >
                Usar el predeterminado
              </Button>
            </div>
          </div>
        </Section>

        <Section
          icon={Table2}
          title="Resultados"
          description="Formato de los montos en la tabla de amortización y los indicadores."
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label>Formato regional</Label>
              <p className="text-xs text-muted-foreground">Separadores de miles y decimales.</p>
            </div>
            <Select
              value={settings.locale}
              onValueChange={(v) => saveSettings({ locale: v as Locale })}
            >
              <SelectTrigger className="w-60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOCALES.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Section>

        <Section
          icon={Landmark}
          title="Tasas de referencia"
          description="Valores (% anual) que usa TASA_BASE en el compilador local. Se suman al SPREAD del contrato."
        >
          <div className="space-y-2">
            {tasas.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Sin tasas: los contratos con TASA_BASE no compilarán.
              </p>
            )}
            {tasas.map((row, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  aria-label="Nombre de la tasa"
                  value={row.nombre}
                  placeholder="TIIE"
                  className="w-40 font-mono uppercase"
                  onChange={(e) =>
                    setTasas(
                      tasas.map((r, i) => (i === idx ? { ...r, nombre: e.target.value } : r)),
                    )
                  }
                />
                <div className="relative w-32">
                  <Input
                    aria-label="Valor de la tasa"
                    value={row.valor}
                    inputMode="decimal"
                    placeholder="10.5"
                    className="pr-7 font-mono"
                    onChange={(e) =>
                      setTasas(
                        tasas.map((r, i) => (i === idx ? { ...r, valor: e.target.value } : r)),
                      )
                    }
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    %
                  </span>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Eliminar ${row.nombre}`}
                  className="text-destructive"
                  onClick={() => setTasas(tasas.filter((_, i) => i !== idx))}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => setTasas([...tasas, { nombre: "", valor: "" }])}
            >
              <Plus className="size-4" /> Agregar tasa
            </Button>
            <Button size="sm" onClick={saveTasas}>
              Guardar tasas
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                saveSettings({ tasasBase: DEFAULT_TASAS_BASE });
                toast.success("Tasas restablecidas");
              }}
            >
              Restablecer (
              {Object.entries(DEFAULT_SETTINGS.tasasBase)
                .map(([k, v]) => `${k} ${v}%`)
                .join(", ")}
              )
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Si el compilador del backend está activo (VITE_API_URL), estas tasas no se le envían.
          </p>
        </Section>

        <Section icon={KeyRound} title="Cuenta" description={session?.email ?? ""}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="new-password">Nueva contraseña</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">Confirmar contraseña</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <Button
            size="sm"
            disabled={savingPassword || !password}
            onClick={() => void savePassword()}
          >
            Cambiar contraseña
          </Button>
        </Section>
      </div>
    </AppShell>
  );
}
