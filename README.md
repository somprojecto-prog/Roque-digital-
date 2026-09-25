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

### 4. Corrigir o registo (signup) e ativar contas de cliente
Corre por esta ordem no SQL Editor:
1. `supabase/fix-signup-trigger.sql` — cria o perfil automaticamente para Admin/Gestor e evita erros de permissão
2. `supabase/add-customer-accounts.sql` — liga a tabela de clientes ao login e permite criar conta, editar perfil e ver as próprias encomendas na loja

### 5. Criar a primeira conta de Admin
Abre `manager/signup.html`, escolhe **Admin**, regista-te. Depois entra em `manager/index.html`.

## Páginas da loja
- `loja/index.html` — página inicial
- `loja/carrinho.html` — carrinho e checkout (nome, telefone, morada, método de pagamento)
- `loja/favoritos.html` — produtos guardados com ♡
- `loja/conta.html` — login/registo do cliente + perfil, encomendas e favoritos

O carrinho e os favoritos usam `localStorage` (guardados no aparelho); a conta do cliente usa o Supabase Auth, tal como o painel do gestor, mas sem nenhuma sobreposição de permissões — um cliente nunca ganha acesso ao painel de gestão.

## Nota técnica: biblioteca do Supabase local
A biblioteca do Supabase (`assets/supabase.js`) está guardada dentro do próprio projeto, em vez de vir de um CDN externo (jsDelivr/unpkg). Isto evita falhas de "Liga o Supabase primeiro" ou "Indisponível" causadas por redes móveis, operadoras ou bloqueadores que impeçam o carregamento de scripts externos — o ficheiro carrega sempre do mesmo sítio que o resto do site.

## Conta obrigatória para comprar, favoritos e avaliações
- Corre `supabase/customer-accounts-and-reviews.sql` no SQL Editor do Supabase (cria/garante `customers`, `orders` e a nova tabela `product_reviews`, com RLS)
- Adicionar ao carrinho, guardar nos favoritos e avaliar um produto agora **exigem sessão iniciada**; se a pessoa não tiver conta, é enviada para `conta.html`, e a ação (ex: "adicionar ao carrinho") conclui-se sozinha assim que ela entra
- Qualquer cliente com conta pode comentar e avaliar (1–5 estrelas) um produto uma vez; pode editar a sua própria avaliação depois. Só o Admin ou o Gestor (painel `manager/`) pode apagar a avaliação de outra pessoa — o próprio cliente também pode apagar a sua
- `loja/produto.html` deixou de usar produtos de exemplo fixos: agora lê o produto real do Supabase pelo `?id=` (o mesmo `id` usado nos cartões da loja) e mostra "Produto não encontrado" se o id não existir
- Os cartões de produto na página inicial agora abrem `produto.html?id=...` ao serem tocados (fora do ♡ e do +)

### Ativar "Continuar com Google"
Isto configura-se no painel do Supabase, não no código:
1. Na Google Cloud Console, cria um **OAuth Client ID** (tipo "Web application") e adiciona como *Authorized redirect URI*: `https://ijbkwdtooypmgngtuwpy.supabase.co/auth/v1/callback`
2. No Supabase: **Authentication → Providers → Google** → ativa e cola o Client ID e o Client Secret
3. Em **Authentication → URL Configuration**, adiciona o URL do teu site (`https://<utilizador>.github.io/Roque-digital-/loja/conta.html`) a **Redirect URLs**, para o Supabase aceitar devolver a pessoa para lá depois do login com Google

## Categorias clicáveis e barras da home editáveis
- Corre `supabase/home-sections-and-categories.sql` no SQL Editor (cria `home_sections` e `home_section_products`, com RLS)
- Tocar numa categoria na página inicial agora abre `loja/categoria.html?id=...`, com todos os produtos dessa categoria
- Cada uma das 3 barras da home (Destaques, Mais vendidos, Novidades) tem "Ver tudo →" a abrir `loja/secao.html?slug=...` com a lista completa
- No painel de gestão, novo separador **Início**: dá para mudar o nome de cada barra e escolher à mão quais produtos aparecem nela (adicionar/remover). Sem produtos escolhidos, a barra continua a preencher-se sozinha como antes

## Importante — separação Cliente / Gestor
O painel de gestor **não tem nenhum link a partir da loja do cliente**. É uma pasta e um conjunto de páginas totalmente separadas, protegidas por login (Supabase Auth). Só quem tiver conta com função `admin` ou `gestor` consegue entrar no dashboard.
