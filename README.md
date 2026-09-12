# Roque Digital — Loja Online

## Estrutura do projeto
```
/loja/index.html        → Interface do cliente (pública)
/manager/index.html     → Login do painel de gestão
/manager/signup.html    → Criar conta (Admin ou Gestor)
/manager/dashboard.html → Painel protegido (produtos, encomendas, stock...)
/supabase/schema.sql    → Base de dados a correr no Supabase
/assets/                → Logo e estilos partilhados
```

## Passos para colocar tudo a funcionar

### 1. Criar o projeto no Supabase
1. Vai a [supabase.com](https://supabase.com) → **New project**
2. Vai a **SQL Editor** → cola o conteúdo de `supabase/schema.sql` → **Run**
3. Vai a **Project Settings → API** → copia o **Project URL** e a **anon public key**

### 2. Ligar o site ao Supabase
Abre estes 3 ficheiros e substitui `COLA_AQUI_O_TEU_PROJECT_URL` e `COLA_AQUI_A_TUA_ANON_KEY`:
- `loja/index.html`
- `manager/index.html`
- `manager/signup.html`
- `manager/dashboard.html`

### 3. Publicar no GitHub (grátis, com GitHub Pages)
1. Cria um repositório novo no GitHub
2. Envia esta pasta completa para o repositório
3. Vai a **Settings → Pages** → escolhe a branch `main` → **Save**
4. O teu site fica disponível em:
   - Cliente: `https://teu-usuario.github.io/nome-repo/loja/`
   - Gestor: `https://teu-usuario.github.io/nome-repo/manager/`

### 4. Corrigir o registo (signup)
Corre também `supabase/fix-signup-trigger.sql` no SQL Editor — cria um trigger que gera o perfil automaticamente e evita o erro de permissão durante o registo.

### Nota técnica: biblioteca do Supabase local
A biblioteca do Supabase (`assets/supabase.js`) está guardada dentro do próprio projeto, em vez de vir de um CDN externo (jsDelivr/unpkg). Isto evita falhas de "Liga o Supabase primeiro" ou "Indisponível" causadas por redes móveis, operadoras ou bloqueadores que impeçam o carregamento de scripts externos — o ficheiro carrega sempre do mesmo sítio que o resto do site.

### 5. Criar a primeira conta de Admin
Abre `manager/signup.html`, escolhe **Admin**, regista-te. Depois entra em `manager/index.html`.

## Importante — separação Cliente / Gestor
O painel de gestor **não tem nenhum link a partir da loja do cliente**. É uma pasta e um conjunto de páginas totalmente separadas, protegidas por login (Supabase Auth). Só quem tiver conta com função `admin` ou `gestor` consegue entrar no dashboard.
