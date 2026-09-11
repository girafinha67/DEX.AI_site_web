import { createFileRoute } from "@tanstack/react-router";
import { ListChecks, Plus, Trash2 } from "lucide-react";
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
import { useCreateList, useDeleteList, useLeads, useListLeads, useLists } from "@/hooks/useProsviaData";

export const Route = createFileRoute("/_authenticated/listas")({
  head: () => ({
    meta: [
      { title: "Listas — DEX.AI" },
      { name: "description", content: "Organize leads em listas; um lead pode estar em várias." },
      { property: "og:title", content: "Listas — DEX.AI" },
      { property: "og:description", content: "Agrupe seus leads por campanha, cidade ou nicho." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ListsPage,
});

function ListsPage() {
  const { data: lists = [] } = useLists();
  const { data: listLeads = [] } = useListLeads();
  const { data: leads = [] } = useLeads();
  const createList = useCreateList();
  const deleteList = useDeleteList();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  function submit() {
    if (!name.trim()) {
      toast.error("Dê um nome para a lista");
      return;
    }
    createList.mutate(
      { name: name.trim(), description: description.trim() || null },
      {
        onSuccess: () => {
          setName("");
          setDescription("");
          setOpen(false);
        },
      },
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Listas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Um mesmo lead pode participar de várias listas ao mesmo tempo.
          </p>
        </div>
        <Button className="glow-sm" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Nova lista
        </Button>
      </div>

      {lists.length === 0 ? (
        <div className="card-surface flex flex-col items-center px-6 py-12 text-center">
          <ListChecks className="size-8 text-muted-foreground" />
          <h2 className="mt-3 text-sm font-semibold">Nenhuma lista criada</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Crie listas como "Barbearias sem site" e adicione leads pela tela Meus Leads.
          </p>
          <Button className="glow-sm mt-4" size="sm" onClick={() => setOpen(true)}>
            Criar primeira lista
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {lists.map((list) => {
            const memberIds = listLeads.filter((r) => r.list_id === list.id).map((r) => r.lead_id);
            const members = leads.filter((l) => memberIds.includes(l.id));
            return (
              <article key={list.id} className="card-surface p-4">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold">{list.name}</h3>
                    <p className="text-xs text-muted-foreground">{members.length} leads</p>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => deleteList.mutate(list.id)}>
                    <Trash2 className="size-4 text-muted-foreground" />
                  </Button>
                </div>
                {list.description && (
                  <p className="mt-2 text-sm text-muted-foreground">{list.description}</p>
                )}
                <ul className="mt-3 space-y-1 text-sm">
                  {members.slice(0, 5).map((m) => (
                    <li key={m.id} className="truncate text-muted-foreground">
                      {m.name} · {m.phone}
                    </li>
                  ))}
                  {members.length > 5 && (
                    <li className="text-xs text-muted-foreground">
                      +{members.length - 5} outros leads
                    </li>
                  )}
                </ul>
              </article>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova lista</DialogTitle>
            <DialogDescription>Agrupe leads por campanha, cidade ou nicho.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="list-name">Nome</Label>
              <Input
                id="list-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Barbearias sem site — Campinas"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="list-desc">Descrição (opcional)</Label>
              <Textarea
                id="list-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button className="glow-sm" onClick={submit} disabled={createList.isPending}>
              Criar lista
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
