import { useNavigate } from "@tanstack/react-router";

import { NAV_ITEMS } from "@/components/app/nav";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useLeads, useLists, useTemplates } from "@/hooks/useProsviaData";

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const { data: leads } = useLeads();
  const { data: lists } = useLists();
  const { data: templates } = useTemplates();

  function go(to: string) {
    onOpenChange(false);
    navigate({ to });
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Buscar leads, listas, modelos ou páginas..." />
      <CommandList>
        <CommandEmpty>Nada encontrado.</CommandEmpty>
        <CommandGroup heading="Ir para">
          {NAV_ITEMS.map((item) => (
            <CommandItem key={item.to} value={`ir para ${item.label}`} onSelect={() => go(item.to)}>
              <item.icon className="size-4" />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>

        {(leads ?? []).length > 0 && (
          <CommandGroup heading="Leads">
            {(leads ?? []).slice(0, 8).map((lead) => (
              <CommandItem
                key={lead.id}
                value={`lead ${lead.name} ${lead.city}`}
                onSelect={() => go("/meus-leads")}
              >
                {lead.name}
                <span className="ml-auto text-xs text-muted-foreground">
                  {lead.city}/{lead.state}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {(lists ?? []).length > 0 && (
          <CommandGroup heading="Listas">
            {(lists ?? []).slice(0, 6).map((list) => (
              <CommandItem key={list.id} value={`lista ${list.name}`} onSelect={() => go("/listas")}>
                {list.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {(templates ?? []).length > 0 && (
          <CommandGroup heading="Modelos de mensagem">
            {(templates ?? []).slice(0, 6).map((t) => (
              <CommandItem key={t.id} value={`modelo ${t.title}`} onSelect={() => go("/mensagens")}>
                {t.title}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
