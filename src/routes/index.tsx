import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Flame, PhoneCall, Search, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DEX.AI — encontre empresas sem site para vender criação de sites" },
      {
        name: "description",
        content:
          "Pesquise estabelecimentos reais por nicho, cidade e bairro, veja quem não tem site e fale com o telefone verificado do Google.",
      },
      { property: "og:title", content: "DEX.AI — leads de empresas sem site" },
      {
        property: "og:description",
        content:
          "Prospecção de leads comerciais para quem vende sites: nicho, cidade, telefone, nota do Google e oportunidade.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main className="min-h-screen bg-background">
      <div
        className="pointer-events-none fixed inset-0 bg-cover bg-top"
        style={{ backgroundImage: "url(/hero-background.jpg)" }}
      />

      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="DEX.AI" className="glow-sm size-9 rounded-xl object-cover" />
          <span className="text-lg font-extrabold tracking-tight">DEX.AI</span>
        </div>
        <Link
          to="/auth"
          className="glow-sm rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          Entrar
        </Link>
      </header>

      <section className="relative mx-auto max-w-3xl px-5 pt-10 pb-16 text-center sm:pt-20">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <Flame className="size-3.5 text-alert" /> Dados reais do Google Places
        </span>
        <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
          Ache as empresas que <span className="text-gradient-blue">ainda não têm site</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
          Pesquise por nicho, cidade e bairro. O DEX.AI devolve só estabelecimentos com telefone,
          mostra nota e avaliações do Google e destaca quem está sem site — sua melhor oportunidade
          de venda.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/auth"
            className="glow w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 sm:w-auto"
          >
            Criar conta grátis
          </Link>
          <Link
            to="/auth"
            className="w-full rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold transition hover:bg-accent sm:w-auto"
          >
            Já tenho conta
          </Link>
        </div>

        <div className="mt-14 grid gap-4 text-left sm:grid-cols-3">
          {[
            {
              icon: Search,
              title: "Busca por nicho e região",
              text: "Barbearias, academias, clínicas, imobiliárias — na cidade e no bairro que você atende.",
            },
            {
              icon: PhoneCall,
              title: "Só leads com telefone",
              text: "Sem telefone não entra na base. Você fala com quem decide no mesmo dia.",
            },
            {
              icon: ShieldCheck,
              title: "Contato manual e responsável",
              text: "Um lead por vez, com confirmação. Nada de disparo em massa automático.",
            },
          ].map((item) => (
            <div key={item.title} className="card-surface p-5">
              <item.icon className="size-5 text-primary" />
              <h2 className="mt-3 text-sm font-semibold">{item.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>

        <ul className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {["Score de oportunidade", "Listas por campanha", "Modelos de mensagem", "Histórico de contatos"].map(
            (f) => (
              <li key={f} className="flex items-center gap-2">
                <Check className="size-4 text-success" /> {f}
              </li>
            ),
          )}
        </ul>
      </section>

      <footer className="relative border-t border-border py-8 text-center text-xs text-muted-foreground">
        DEX.AI · prospecção de clientes para quem cria sites
      </footer>
    </main>
  );
}
