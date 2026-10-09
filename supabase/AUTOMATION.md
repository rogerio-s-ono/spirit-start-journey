# Aplicação automática de migrations (Supabase)

Este repositório aplica as migrations de `supabase/migrations/` **automaticamente**
no banco de produção, via GitHub Actions, sempre que um arquivo de migration muda
em `main`. É o equivalente, para o Supabase, ao auto-deploy que usamos para o
Apps Script.

Workflow: `.github/workflows/supabase-migrate.yml`

## Como funciona

1. Push em `main` alterando `supabase/migrations/**` dispara o workflow
   (também é possível rodar manualmente em **Actions → Apply Supabase Migrations → Run workflow**).
2. O workflow instala o **Supabase CLI**, faz `supabase link` ao projeto e roda
   `supabase db push`, que aplica apenas as migrations ainda não registradas no
   histórico remoto (`supabase_migrations.schema_migrations`).
3. A migration base (`20260316145021`) é marcada como "já aplicada" via
   `supabase migration repair` — ela cria as tabelas com `CREATE TABLE` (sem
   `IF NOT EXISTS`) e o banco já existe, então **não** deve ser re-executada.

## Secrets necessários (criar uma vez)

Em **GitHub → Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Onde obter |
|--------|-----------|
| `SUPABASE_ACCESS_TOKEN` | Supabase → conta → **Access Tokens** (https://supabase.com/dashboard/account/tokens) → *Generate new token* |
| `SUPABASE_PROJECT_REF` | O "ref" do projeto (ex.: `lawtzkhnhnyjtkptrlbs`). Fica na URL do dashboard: `.../project/<REF>`, ou em **Settings → General → Reference ID** |
| `SUPABASE_DB_PASSWORD` | A senha do banco. **Settings → Database → Database password** (se não souber, pode redefinir ali) |

> ⚠️ **Atenção ao project ref.** O arquivo `supabase/config.toml` tem
> `project_id = "dsbutkdvcxrokbhxeoxx"`, mas o app (em `.env`/secrets do build)
> aponta para `lawtzkhnhnyjtkptrlbs`. **Use em `SUPABASE_PROJECT_REF` o ref do
> projeto que o app realmente usa** (o mesmo da `VITE_SUPABASE_URL`). Se os dois
> forem o mesmo projeto, confirme qual é o correto antes de rodar.

## Escrever novas migrations

- Crie um arquivo em `supabase/migrations/` com nome
  `AAAAMMDDHHMMSS_descricao.sql` (timestamp de **14 dígitos**).
- Prefira SQL **idempotente** (`CREATE ... IF NOT EXISTS`, `DROP POLICY IF EXISTS`
  antes de `CREATE POLICY`, `INSERT ... ON CONFLICT`), para que reexecuções e
  ambientes já existentes não quebrem.
- Faça commit/push em `main` → o workflow aplica.

## Aplicação manual (alternativa, sem CLI)

Se preferir aplicar à mão, rode o conteúdo de `supabase/apply_persistence.sql`
no **SQL Editor** do Supabase. Ele é idempotente e consolida RLS + backfill de
profiles + seed de achievements.
