import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Gift, LogOut, Menu, Search as SearchIcon } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { CommandPalette } from "@/components/app/CommandPalette";
import { NAV_ITEMS } from "@/components/app/nav";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useLeads, useProfile, useSearches, useTemplates } from "@/hooks/useProsviaData";
import { supabase } from "@/integrations/supabase/client";
import { planById } from "@/lib/prosvia";
import { cn } from "@/lib/utils";

function LimitBar({ label, used, total }: { label: string; used: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{label}</span>
        <span className="font-medium text-foreground">
          {used}/{total}
        </span>
      </div>
      <Progress value={pct} className="h-1.5" />
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: leads } = useLeads();
  const { data: searches } = useSearches(200);
  const { data: templates } = useTemplates();
  const navigate = useNavigate();

  const plan = planById(profile?.plan);
  const today = new Date().toDateString();
  const searchesToday = (searches ?? []).filter(
    (s) => new Date(s.created_at).toDateString() === today,
  ).length;

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <Link to="/dashboard" onClick={onNavigate} className="flex items-center gap-2 px-1 py-1">
        <img src="/logo.png" alt="DEX.AI" className="glow-sm size-9 rounded-xl object-cover" />
        <span className="min-w-0">
          <span className="block truncate text-sm font-extrabold tracking-tight">DEX.AI</span>
          <span className="block truncate text-[11px] text-muted-foreground">
            {profile?.workspace_name ?? "Workspace"}
          </span>
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_0_0_0_1px_oklch(0.55_0.24_292/0.35)]"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
              )}
            >
              <item.icon className={cn("size-4", active && "text-primary")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3">
        <div className="rounded-xl border border-sidebar-border bg-card p-3">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
              {(profile?.full_name || user?.email || "P").slice(0, 1).toUpperCase()}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-xs font-semibold">
                {profile?.full_name || "Sua conta"}
              </span>
              <span className="block truncate text-[11px] text-muted-foreground">
                {user?.email}
              </span>
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-sidebar-border bg-card p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">Plano {plan.name}</span>
            <Link
              to="/planos"
              onClick={onNavigate}
              className="text-[11px] font-semibold text-primary hover:underline"
            >
              Ver planos
            </Link>
          </div>
          <div className="mt-2.5 space-y-2">
            <LimitBar label="Pesquisas hoje" used={searchesToday} total={plan.limits.searchesPerDay} />
            <LimitBar label="Leads salvos" used={leads?.length ?? 0} total={plan.limits.savedLeads} />
            <LimitBar label="Modelos" used={templates?.length ?? 0} total={plan.limits.templates} />
          </div>
        </div>

        <div className="rounded-xl border border-primary/30 bg-primary/10 p-3">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Gift className="size-4 text-primary" /> Indique e ganhe
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Ganhe 1 mês de Pro para cada amigo que assinar.
          </p>
        </div>

        <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={signOut}>
          <LogOut className="mr-2 size-4" /> Sair
        </Button>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[272px] border-r border-sidebar-border bg-sidebar lg:block">
        <SidebarContent />
      </aside>

      <div className="lg:pl-[272px]">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur lg:justify-end">
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] border-sidebar-border bg-sidebar p-0">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SidebarContent onNavigate={() => setDrawerOpen(false)} />
            </SheetContent>
          </Sheet>

          <span className="flex items-center gap-2 text-sm font-extrabold lg:hidden">DEX.AI</span>

          <Button
            variant="outline"
            className="ml-auto gap-2 text-muted-foreground lg:ml-0"
            onClick={() => setPaletteOpen(true)}
          >
            <SearchIcon className="size-4" />
            <span className="hidden sm:inline">Buscar</span>
            <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] sm:inline">
              ⌘K
            </kbd>
          </Button>
        </header>

        <main className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6">{children}</main>
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
