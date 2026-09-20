# Roque Digital — Migração para Next.js + Supabase real

Este projeto está a ser migrado do site em HTML puro (Loja + Manager do teu
parceiro) para Next.js, mantendo o design cinematográfico e ligando aos
dados reais do Supabase dele.

## Configurar

```bash
npm install
cp .env.local.example .env.local   # já vem preenchido com o projeto Supabase real
npm run dev
```

## Estado atual

### ✅ Fase 1 — Fundação
- Cliente Supabase real (`lib/supabase.ts`)
- Tipos TypeScript para todo o schema (`types/database.ts`)
- Camada de queries, com os mesmos fallbacks do site original (`lib/queries.ts`)

### ✅ Fase 2 — Loja pública com dados reais
- Homepage: categorias reais no Header, Hero com `site_settings.hero_images`,
  3 barras (`destaques`/`vendidos`/`novidades`, com a mesma paginação e
  reserva de coluna do site original — `vendas` cai para `created_at` se
  a coluna não existir), títulos/eyebrows editáveis via `home_sections`,
  "Diversos" com o resto do catálogo, Depoimentos (`testimonials`, novo
  em relação à minha versão anterior), Destaque via `site_settings.destaque_*`
- `/categoria/[id]`, `/produto/[id]`, `/secao/[slug]` ("Ver tudo" de cada
  barra) e `/pesquisa` (correspondência direta + sugestões por
  semelhança, portada de `RD.searchProducts`)
- `Combo`: **placeholder** — o schema do teu parceiro ainda não tem
  conceito de combo; por agora mostra 2 produtos em destaque. Trocar
  quando existir um modelo de dados real.
- Por polir depois: galeria/avaliações completas em `/produto/[id]`
  (ainda mais simples que o `produto.html` original)

### ✅ Fase 3 — Carrinho, Favoritos, Conta
- `contexts/StoreContext.tsx` — carrinho e favoritos em `localStorage`
  (mesmas chaves `rd_cart`/`rd_favs` do site original, para não perder
  dados de quem já usava o site em HTML)
- `contexts/AuthContext.tsx` — Supabase Auth para clientes (separado do
  login do Manager), cria automaticamente a linha em `customers` no
  primeiro acesso (email/password ou Google)
- `lib/pending-action.ts` — réplica exata do `RD.requireAccount`: sem
  sessão, guarda a ação (adicionar ao carrinho / favoritar) e manda para
  `/conta?next=...`, que a conclui sozinha ao voltar
- `/conta` — login, registo, "Continuar com Google", perfil editável,
  separador de encomendas (lidas de `orders`) e favoritos
- `/carrinho` — lista editável, resumo com taxa de entrega
  (`site_settings.taxa_entrega`), métodos de pagamento reais
  (`payment_methods`, com fallback aos 2 fixos), upload do comprovativo
  para o bucket `imagens` quando exigido, criação de `orders` +
  `order_items`, e notificação por EmailJS se estiver configurado no
  painel
- `/favoritos` — lista, remover, adicionar ao carrinho
- Emblemas de contagem ao vivo no Header (♡ e 🛍️)
- Ações rápidas (♡ / +) direto nos cards de produto, em toda a loja

**Para isto funcionar 100% no teu Supabase**, confirma que:
- O bucket de storage `imagens` existe e aceita uploads públicos
- Em Authentication → URL Configuration, `/conta` está nos Redirect URLs
  se quiseres testar o "Continuar com Google" no domínio de produção
- `site_settings.emailjs_*` está preenchido no Manager, senão o email de
  notificação simplesmente não é enviado (não bloqueia a encomenda)

### 🚧 Fase 4 — Manager (em curso)

**Feito (4a):**
- `/manager/login` e `/manager/signup` — autenticação separada da loja,
  valida `profiles.role` em `['admin','gestor']`
- `contexts/ManagerAuthContext.tsx` — guarda de acesso reutilizável
- Layout protegido com sidebar (12 secções) e topbar — `/manager/(protected)`
- `/manager` — Dashboard com KPIs (total vendido, encomendas, clientes,
  stock baixo) e últimas encomendas
- `/manager/produtos` — CRUD completo: filtros (todos/ativos/stock
  baixo), modal com galeria de fotos (upload para o bucket `imagens`,
  a 1ª é capa/a 2ª é hover), toggle ativo/inativo, apagar
- `/manager/categorias` — CRUD com upload de imagem

**Por fazer (4b — stubs "em breve" já criados, só falta o conteúdo):**
Inventário, Avaliações, Depoimentos, Encomendas (com histórico de
estado), Clientes, Pagamentos, Início (curadoria das barras da home),
Textos do site (`site_settings`), Imagens, Equipa (gerir roles)

**Nota sobre o signup do Manager:** não tive acesso ao `manager/signup.html`
nem ao SQL dos triggers (`fix-signup-trigger.sql`) do teu parceiro — a
página `/manager/signup` está construída a partir do que o README e o
`dashboard.html` descrevem (envia `role` nos metadados do `signUp`, para
o trigger criar o `profile` sozinho). Testa com cuidado; se o trigger
esperar um formato diferente, diz-me e ajusto.

## Paleta
Tudo (incluindo as páginas que antes estavam em azul-marinho/dourado)
está a convergir para castanho `#3C1C05` / creme `#EBCBA9` / laranja
`#D9731A` / preto — decisão confirmada.


