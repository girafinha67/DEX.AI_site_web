import { createFileRoute } from "@tanstack/react-router";
import { Download, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import {
  useBlockedNumbers,
  useBlockNumber,
  useProfile,
  useSendRules,
  useUnblockNumber,
  useUpdateProfile,
  useUpdateSendRules,
} from "@/hooks/useProsviaData";
import { deleteMyAccount, exportMyData } from "@/lib/account.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — DEX.AI" },
      { name: "description", content: "Perfil, regras de envio e privacidade da sua conta." },
      { property: "og:title", content: "Configurações — DEX.AI" },
      { property: "og:description", content: "Ajuste perfil, envios e privacidade." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: rules } = useSendRules();
  const updateProfile = useUpdateProfile();
  const updateRules = useUpdateSendRules();
  const { data: blocked = [] } = useBlockedNumbers();
  const blockNumber = useBlockNumber();
  const unblockNumber = useUnblockNumber();

  const [fullName, setFullName] = useState("");
  const [workspace, setWorkspace] = useState("");
  const [minInterval, setMinInterval] = useState(7);
  const [dailyLimit, setDailyLimit] = useState(30);
  const [from, setFrom] = useState("09:00");
  const [to, setTo] = useState("18:00");
  const [retention, setRetention] = useState(180);
  const [newNumber, setNewNumber] = useState("");
  const [exporting, setExporting] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const payload = await exportMyData({});
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dexai-meus-dados-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Download dos seus dados iniciado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível exportar seus dados");
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    if (deleteText.trim() !== "EXCLUIR") {
      toast.error('Digite EXCLUIR para confirmar');
      return;
    }
    setDeleting(true);
    try {
      await deleteMyAccount({ data: { confirm: "EXCLUIR" } });
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível excluir a conta");
      setDeleting(false);
    }
  }

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setWorkspace(profile.workspace_name ?? "");
    }
  }, [profile]);

  useEffect(() => {
    if (rules) {
      setMinInterval(rules.min_interval_days ?? 7);
      setDailyLimit(rules.daily_limit ?? 30);
      setFrom((rules.allowed_from ?? "09:00").slice(0, 5));
      setTo((rules.allowed_to ?? "18:00").slice(0, 5));
      setRetention(rules.retention_days ?? 180);
    }
  }, [rules]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Configurações</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ajuste seu perfil, as regras de contato e a privacidade dos dados.
        </p>
      </div>

      <Tabs defaultValue="perfil">
        <TabsList>
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="envio">Regras de envio</TabsTrigger>
          <TabsTrigger value="privacidade">Privacidade e LGPD</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil" className="mt-4">
          <div className="card-surface max-w-lg space-y-4 p-5">
            <div className="space-y-1.5">
              <Label htmlFor="name">Seu nome</Label>
              <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="workspace">Nome do workspace</Label>
              <Input id="workspace" value={workspace} onChange={(e) => setWorkspace(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" value={user?.email ?? ""} disabled />
            </div>
            <Button
              className="glow-sm"
              disabled={updateProfile.isPending}
              onClick={() =>
                updateProfile.mutate({
                  full_name: fullName.trim(),
                  workspace_name: workspace.trim() || "Meu workspace",
                })
              }
            >
              Salvar perfil
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="envio" className="mt-4">
          <div className="card-surface max-w-lg space-y-4 p-5">
            <p className="text-sm text-muted-foreground">
              O DEX.AI nunca envia em massa: cada mensagem sai com a sua confirmação.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="interval">Intervalo mínimo entre contatos (dias)</Label>
                <Input
                  id="interval"
                  type="number"
                  min={0}
                  value={minInterval}
                  onChange={(e) => setMinInterval(Number(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="daily">Limite diário de mensagens</Label>
                <Input
                  id="daily"
                  type="number"
                  min={1}
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(Number(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="from">Enviar a partir de</Label>
                <Input id="from" type="time" value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="to">Enviar até</Label>
                <Input id="to" type="time" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
            </div>
            <Button
              className="glow-sm"
              disabled={updateRules.isPending}
              onClick={() =>
                updateRules.mutate({
                  min_interval_days: minInterval,
                  daily_limit: dailyLimit,
                  allowed_from: from,
                  allowed_to: to,
                })
              }
            >
              Salvar regras
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="privacidade" className="mt-4 space-y-4">
          <div className="card-surface max-w-lg space-y-4 p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="size-4 text-success" /> Retenção de dados
            </h2>
            <p className="text-sm text-muted-foreground">
              Definimos por quanto tempo o histórico de contatos fica guardado na sua base.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="retention">Manter histórico por (dias)</Label>
              <Input
                id="retention"
                type="number"
                min={7}
                value={retention}
                onChange={(e) => setRetention(Number(e.target.value))}
              />
            </div>
            <Button
              className="glow-sm"
              disabled={updateRules.isPending}
              onClick={() => updateRules.mutate({ retention_days: retention })}
            >
              Salvar retenção
            </Button>
          </div>

          <div className="card-surface max-w-lg space-y-3 p-5">
            <h2 className="text-sm font-semibold">Baixar meus dados</h2>
            <p className="text-sm text-muted-foreground">
              Gere um arquivo com tudo o que guardamos: perfil, leads, listas, modelos, histórico,
              pesquisas e regras de envio.
            </p>
            <Button variant="outline" onClick={handleExport} disabled={exporting}>
              <Download className="size-4" /> Baixar meus dados (JSON)
            </Button>
          </div>

          <div className="card-surface max-w-lg space-y-3 p-5">
            <h2 className="text-sm font-semibold">Números que não querem contato</h2>
            <p className="text-sm text-muted-foreground">
              Quem pedir para não ser contatado entra aqui e fica fora dos envios.
            </p>
            <div className="flex gap-2">
              <Input
                value={newNumber}
                onChange={(e) => setNewNumber(e.target.value)}
                placeholder="(19) 99999-0000"
              />
              <Button
                variant="outline"
                onClick={() => {
                  if (!newNumber.trim()) {
                    toast.error("Informe um telefone");
                    return;
                  }
                  blockNumber.mutate(
                    { phone: newNumber.trim() },
                    { onSuccess: () => setNewNumber("") },
                  );
                }}
              >
                <Plus className="size-4" /> Adicionar
              </Button>
            </div>
            {blocked.length > 0 && (
              <ul className="divide-y divide-border text-sm">
                {blocked.map((b) => (
                  <li key={b.id} className="flex items-center gap-2 py-2">
                    <span>{b.phone}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="ml-auto"
                      onClick={() => unblockNumber.mutate(b.id)}
                    >
                      <Trash2 className="size-4 text-muted-foreground" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card-surface max-w-lg space-y-3 border-destructive/40 p-5">
            <h2 className="text-sm font-semibold text-destructive">Zona de risco</h2>
            <p className="text-sm text-muted-foreground">
              Excluir a conta remove definitivamente seu acesso e todos os dados: leads, listas,
              modelos, histórico e pesquisas. Não há como desfazer.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-delete">Digite EXCLUIR para confirmar</Label>
              <Input
                id="confirm-delete"
                value={deleteText}
                onChange={(e) => setDeleteText(e.target.value)}
                placeholder="EXCLUIR"
              />
            </div>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              <Trash2 className="size-4" /> Excluir minha conta
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
