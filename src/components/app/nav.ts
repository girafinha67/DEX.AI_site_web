import {
  History,
  LayoutDashboard,
  ListChecks,
  MessageSquare,
  Search,
  Send,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";

export type NavItem = {
  to:
    | "/dashboard"
    | "/procurar-clientes"
    | "/meus-leads"
    | "/mensagens"
    | "/enviar-mensagens"
    | "/historico"
    | "/listas"
    | "/planos"
    | "/configuracoes";
  label: string;
  icon: typeof LayoutDashboard;
};

export const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/procurar-clientes", label: "Procurar Clientes", icon: Search },
  { to: "/meus-leads", label: "Meus Leads", icon: Users },
  { to: "/mensagens", label: "Mensagens", icon: MessageSquare },
  { to: "/enviar-mensagens", label: "Enviar Mensagens", icon: Send },
  { to: "/historico", label: "Histórico de Contatos", icon: History },
  { to: "/listas", label: "Listas", icon: ListChecks },
  { to: "/planos", label: "Planos", icon: Sparkles },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
];
