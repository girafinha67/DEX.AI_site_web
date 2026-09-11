import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar no DEX.AI" },
      { name: "description", content: "Acesse sua base de leads comerciais no DEX.AI." },
      { property: "og:title", content: "Entrar no DEX.AI" },
      { property: "og:description", content: "Acesse sua base de leads comerciais no DEX.AI." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "signup" && password.length < 8) {
      toast.error("A senha precisa ter no mínimo 8 caracteres");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (error) throw error;
        toast.success("Conta criada! Você já pode começar.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível continuar");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) {
      setLoading(false);
      toast.error("Não foi possível entrar com o Google");
      return;
    }
    // Supabase redirects the browser to Google and back; no local navigation needed here.
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-5 py-12">
      <div className="pointer-events-none fixed inset-x-0 top-[-25%] mx-auto h-[400px] max-w-xl rounded-full bg-primary/25 blur-[130px]" />
      <div className="card-surface relative w-full max-w-md p-7">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="DEX.AI" className="glow-sm size-9 rounded-xl object-cover" />
          <span className="text-lg font-extrabold tracking-tight">DEX.AI</span>
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">
          {mode === "login" ? "Entrar na sua conta" : "Criar sua conta"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Prospecção de empresas sem site, com dados reais do Google.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label htmlFor="name">Seu nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ana Ribeiro"
                required
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo de 8 caracteres"
              minLength={8}
              required
            />
          </div>
          <Button type="submit" className="glow-sm w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {mode === "login" ? "Entrar" : "Criar conta"}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> ou <span className="h-px flex-1 bg-border" />
        </div>

        <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={loading}>
          Continuar com Google
        </Button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "login" ? "Ainda não tem conta?" : "Já tem uma conta?"}{" "}
          <button
            type="button"
            className="font-semibold text-primary hover:underline"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
          >
            {mode === "login" ? "Criar agora" : "Entrar"}
          </button>
        </p>
      </div>
    </main>
  );
}
