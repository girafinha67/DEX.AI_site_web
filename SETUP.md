# DEX.AI — código-fonte completo

Este repositório contém o código-fonte completo do projeto (frontend + backend + banco).

## Como rodar localmente

```sh
npm install
npm run dev
```

## Arquivos NÃO incluídos de propósito (são gerados automaticamente)

- **`bun.lock`** — lockfile de dependências. Rode `npm install` (ou `bun install`)
  para gerar o seu.
- **`public/favicon.ico`** — arquivo binário; adicione o seu ícone ou gere um novo.
- **`src/routeTree.gen.ts`** — gerado automaticamente pelo plugin do TanStack Router
  a partir da pasta `src/routes/` assim que você rodar `npm run dev` ou `npm run build`.
  Nunca edite esse arquivo manualmente.

## Variáveis de ambiente necessárias (Netlify ou outro host)

- `VITE_SUPABASE_URL` / `SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — usada apenas no servidor (operações admin/LGPD).
- `GOOGLE_PLACES_API_KEY` — sem ela, a busca de empresas não funciona.
- `CRON_SECRET` (e opcionalmente `CRON_SECRET_PREVIOUS`) — se algum job agendado
  usar `authenticateCronRequest`.

## Antes de rodar em produção

1. Configure as variáveis de ambiente acima diretamente no painel do seu host
   (ex.: Netlify → Site settings → Environment variables).
2. O banco (Supabase) já está provisionado com todas as tabelas e políticas de
   RLS (Row Level Security) isolando os dados por usuário — veja
   `supabase/migrations/`.
3. O login com Google usa o OAuth nativo do Supabase
   (`supabase.auth.signInWithOAuth`) — habilite o provedor Google em
   Supabase → Authentication → Providers e configure a URL de redirecionamento
   do seu domínio (ex.: `https://seudominio.com/dashboard`).
4. Revisão de segurança já aplicada nesta versão:
   - Regras de envio (limite diário, horário permitido, intervalo mínimo entre
     contatos) e lista de bloqueio validadas **no servidor**, não só na tela
     (`src/lib/contacts.functions.ts`).
   - Exportação de dados (LGPD) e exclusão de conta reais, com a exclusão
     exigindo confirmação literal "EXCLUIR" e revalidando a identidade do
     usuário antes de usar a service role key (`src/lib/account.functions.ts`).
   - Senha mínima de 8 caracteres no cadastro.
   - CSRF middleware ativo em todas as server functions (`src/start.ts`).
   - A chave do Google Places só é lida no servidor (`src/lib/places.functions.ts`),
     nunca exposta ao frontend.
5. Pendente (opcional, não bloqueante): reforçar o mínimo de 8 caracteres também
   na configuração do Supabase Auth em si (hoje é validado no formulário do
   cliente).
