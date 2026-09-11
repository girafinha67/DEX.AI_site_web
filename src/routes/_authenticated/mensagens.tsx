import { createFileRoute } from "@tanstack/react-router";
import { MessageSquarePlus, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDeleteTemplate, useSaveTemplate, useTemplates } from "@/hooks/useProsviaData";
import { TEMPLATE_VARIABLES } from "@/lib/prosvia";

export const Route = createFileRoute("/_authenticated/mensagens")({
  head: () => ({
    meta: [
      { title: "Mensagens — DEX.AI" },
      { name: "description", content: "Biblioteca de modelos de mensagem personalizáveis." },
      { property: "og:title", content: "Mensagens — DEX.AI" },
      { property: "og:description", content: "Crie modelos reutilizáveis para abordar empresas." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Messages,
});

function Messages() {
  const { data: templates = [] } = useTemplates();
  const saveTemplate = useSaveTemplate();
  const deleteTemplate = useDeleteTemplate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<{ id?: string; title: string; body: string; tag: string }>({
    title: "",
    body: "",
    tag: "",
  });

  const visible = templates.filter((t) =>
    `${t.title} ${t.body} ${t.tag ?? ""}`.toLowerCase().includes(query.toLowerCase()),
  );

  function openNew() {
    setDraft({ title: "", body: "", tag: "" });
    setOpen(true);
  }

  function save() {
    if (!draft.title.trim() || !draft.body.trim()) {
      toast.error("Preencha título e mensagem");
      return;
    }
    saveTemplate.mutate(
      {
        ...(draft.id ? { id: draft.id } : {}),
        title: draft.title.trim(),
        body: draft.body.trim(),
        tag: draft.tag.trim() || null,
      },
      { onSuccess: () => setOpen(false) },
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Mensagens</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Modelos reutilizáveis que se personalizam com os dados de cada empresa.
          </p>
        </div>
        <Button className="glow-sm" onClick={openNew}>
          <Plus className="size-4" /> Novo modelo
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar modelo"
          className="pl-9"
        />
      </div>

      {templates.length === 0 ? (
        <div className="card-surface flex flex-col items-center px-6 py-12 text-center">
          <MessageSquarePlus className="size-8 text-muted-foreground" />
          <h2 className="mt-3 text-sm font-semibold">Nenhum modelo criado</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Crie um modelo com variáveis como {"{{empresa}}"} e {"{{cidade}}"} para agilizar seus contatos.
          </p>
          <Button className="glow-sm mt-4" size="sm" onClick={openNew}>
            Criar primeiro modelo
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {visible.map((t) => (
            <article key={t.id} className="card-surface p-4">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold">{t.title}</h3>
                  {t.tag && <p className="text-xs text-primary">{t.tag}</p>}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setDraft({ id: t.id, title: t.title, body: t.body, tag: t.tag ?? "" });
                    setOpen(true);
                  }}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => deleteTemplate.mutate(t.id)}>
                  <Trash2 className="size-4 text-muted-foreground" />
                </Button>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{t.body}</p>
            </article>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{draft.id ? "Editar modelo" : "Novo modelo"}</DialogTitle>
            <DialogDescription>
              Use as variáveis abaixo — elas são trocadas pelos dados de cada empresa.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="Primeira abordagem — sem site"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tag">Etiqueta (opcional)</Label>
              <Input
                id="tag"
                value={draft.tag}
                onChange={(e) => setDraft({ ...draft, tag: e.target.value })}
                placeholder="Abordagem inicial"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="body">Mensagem</Label>
              <Textarea
                id="body"
                rows={7}
                value={draft.body}
                onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                placeholder="Olá, {{empresa}}! Vi que vocês atendem em {{cidade}} e ainda não têm site..."
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {TEMPLATE_VARIABLES.map((v) => (
                <button
                  key={v.token}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, body: `${d.body}${v.token}` }))}
                  className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-primary"
                >
                  {v.token}
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button className="glow-sm" onClick={save} disabled={saveTemplate.isPending}>
              Salvar modelo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
