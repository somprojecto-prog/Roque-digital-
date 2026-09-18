/* ==========================================================
   ROQUE DIGITAL — Módulo partilhado (carrinho, favoritos, pesquisa)
   Usado por: loja/index.html, loja/carrinho.html,
              loja/favoritos.html, loja/conta.html
   ========================================================== */

// Catálogo de demonstração — usado quando o Supabase não tiver produtos
const DEMO_PRODUCTS = [
  { id:'iphone15pro',    name:'iPhone 15 Pro',   brand:'Apple',    price:850000, tag:'NOVO',         emoji:'📱', category:'Telefones', rating:4.8 },
  { id:'perfume-elan',   name:'Perfume Élan',    brand:'Lattafa',  price:35000,  tag:'PROMOÇÃO',      emoji:'🌸', category:'Perfumes',  rating:4.6 },
  { id:'relogio-aurora', name:'Relógio Aurora',  brand:'Casio',    price:50000,  tag:null,           emoji:'⌚', category:'Relógios',  rating:4.9 },
  { id:'airpods-pro',    name:'AirPods Pro',     brand:'Apple',    price:75000,  tag:'MAIS VENDIDO', emoji:'🎧', category:'Áudio',     rating:4.7 },
  { id:'camisa-slim',    name:'Camisa Slim',     brand:'Zara',     price:18000,  tag:null,           emoji:'👕', category:'Moda',      rating:4.5 },
];

const RD = {
  CART_KEY:'rd_cart',
  FAV_KEY:'rd_favs',

  // ---------- Carrinho ----------
  getCart(){ try{ return JSON.parse(localStorage.getItem(this.CART_KEY)) || []; }catch(e){ return []; } },
  saveCart(cart){ localStorage.setItem(this.CART_KEY, JSON.stringify(cart)); this.updateBadges(); },
  addToCart(product, qty=1){
    const cart = this.getCart();
    const existing = cart.find(i=>i.id===product.id);
    if(existing){ existing.qty += qty; } else { cart.push(Object.assign({}, product, { qty })); }
    this.saveCart(cart);
  },
  removeFromCart(id){ this.saveCart(this.getCart().filter(i=>i.id!==id)); },
  setQty(id, qty){
    const cart = this.getCart();
    const item = cart.find(i=>i.id===id);
    if(item){ item.qty = Math.max(1, qty); this.saveCart(cart); }
  },
  clearCart(){ this.saveCart([]); },
  cartCount(){ return this.getCart().reduce((n,i)=>n+i.qty,0); },
  cartTotal(){ return this.getCart().reduce((n,i)=>n+i.qty*i.price,0); },

  // ---------- Favoritos ----------
  getFavs(){ try{ return JSON.parse(localStorage.getItem(this.FAV_KEY)) || []; }catch(e){ return []; } },
  saveFavs(favs){ localStorage.setItem(this.FAV_KEY, JSON.stringify(favs)); this.updateBadges(); },
  isFavorite(id){ return this.getFavs().some(i=>i.id===id); },
  toggleFavorite(product){
    let favs = this.getFavs();
    if(favs.some(i=>i.id===product.id)){ favs = favs.filter(i=>i.id!==product.id); }
    else{ favs.push(product); }
    this.saveFavs(favs);
    return this.isFavorite(product.id);
  },
  favCount(){ return this.getFavs().length; },

  // ---------- Emblemas (badges) ----------
  updateBadges(){
    const cartN = this.cartCount(), favN = this.favCount();
    document.querySelectorAll('[data-cart-badge]').forEach(el=>{
      el.textContent = cartN; el.style.display = cartN>0 ? '' : 'none';
    });
    document.querySelectorAll('[data-fav-badge]').forEach(el=>{
      el.textContent = favN; el.style.display = favN>0 ? '' : 'none';
    });
  },

  formatKz(n){ return Number(n).toLocaleString('pt-PT') + ' Kz'; },

  // ---------- Conta obrigatória (carrinho / favoritos / avaliações) ----------
  PENDING_KEY:'rd_pending_action',

  // Guarda a ação que a pessoa queria fazer (ex: adicionar X ao carrinho)
  // para a repetir sozinha assim que ela iniciar sessão.
  setPendingAction(action){ try{ sessionStorage.setItem(this.PENDING_KEY, JSON.stringify(action)); }catch(e){} },
  consumePendingAction(){
    try{
      const raw = sessionStorage.getItem(this.PENDING_KEY);
      sessionStorage.removeItem(this.PENDING_KEY);
      return raw ? JSON.parse(raw) : null;
    }catch(e){ return null; }
  },

  async isLoggedIn(supabaseClient){
    if(!supabaseClient) return false;
    try{
      const { data:{ session } } = await supabaseClient.auth.getSession();
      return !!session;
    }catch(e){ return false; }
  },

  // Chamar antes de qualquer ação que exija conta (carrinho, favoritos,
  // avaliações). Se não houver sessão, guarda a ação pendente (opcional)
  // e manda para a página de conta, que a repete sozinha ao entrar.
  async requireAccount(supabaseClient, pendingAction){
    const logado = await this.isLoggedIn(supabaseClient);
    if(logado) return true;
    if(pendingAction) this.setPendingAction(pendingAction);
    const aviso = pendingAction?.type === 'toggle-fav'
      ? 'Precisas de criar conta (ou entrar) para guardar favoritos'
      : 'Precisas de criar conta (ou entrar) para adicionar ao carrinho';
    this.showToast(aviso, 1800);
    const next = encodeURIComponent(location.pathname.split('/').pop() + location.search);
    setTimeout(()=>{ location.href = 'conta.html?next=' + next; }, 1600);
    return false;
  },

  renderStars(rating){
    const r = Math.round(Number(rating) || 0);
    return Array.from({length:5}).map((_,i)=> i < r ? '★' : '☆').join('');
  },

  // ---------- Notificação simples ----------
  showToast(msg, duracaoMs){
    let el = document.getElementById('global-toast');
    if(!el){ el = document.createElement('div'); el.id='global-toast'; el.className='toast'; document.body.appendChild(el); }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(window.__rdToastTimer);
    window.__rdToastTimer = setTimeout(()=> el.classList.remove('show'), duracaoMs || 2200);
  },

  // ---------- Pesquisa inteligente ----------
  // 1ª tentativa: correspondência direta no nome, marca ou categoria.
  // Se nada corresponder, sugere produtos parecidos por semelhança de palavras,
  // para o cliente nunca ficar sem nenhum resultado.
  searchProducts(query, products){
    const q = (query || '').toLowerCase().trim();
    if(!q) return { exact:[], suggestions:[] };

    const exact = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.brand || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    );
    if(exact.length) return { exact, suggestions:[] };

    const qWords = q.split(/\s+/).filter(Boolean);
    const scored = products.map(p=>{
      const hay = `${p.name} ${p.brand||''} ${p.category||''}`.toLowerCase();
      const hayWords = hay.split(/\s+/);
      let score = 0;
      qWords.forEach(w=>{
        if(hay.includes(w)){ score += 2; return; }
        hayWords.forEach(hw=>{
          const len = Math.min(3, w.length, hw.length);
          if(len >= 2 && (hw.startsWith(w.slice(0,len)) || w.startsWith(hw.slice(0,len)))) score += 1;
        });
      });
      return { p, score };
    }).filter(s=>s.score>0).sort((a,b)=>b.score-a.score);

    return { exact:[], suggestions: scored.slice(0,6).map(s=>s.p) };
  },

  // ---------- Conteúdo do site (aplicado pelo painel de gestão) ----------
  // Lê a tabela site_settings e atualiza nome, slogan, textos de destaque,
  // rodapé, contactos e links de redes sociais em qualquer página que tenha
  // estas classes no HTML. Chamar depois de criar o cliente `supabase`.
  async applySiteSettings(supabaseClient){
    if(!supabaseClient) return;
    try{
      const { data } = await supabaseClient.from('site_settings').select('*').eq('id',1).single();
      if(!data) return;

      if(data.nome_site) document.querySelectorAll('.js-site-name').forEach(el=> el.textContent = data.nome_site);
      if(data.slogan) document.querySelectorAll('.js-site-slogan').forEach(el=> el.textContent = data.slogan);
      if(data.hero_titulo) document.querySelectorAll('.js-hero-titulo').forEach(el=> el.textContent = data.hero_titulo);
      if(data.hero_descricao) document.querySelectorAll('.js-hero-descricao').forEach(el=> el.textContent = data.hero_descricao);

      if(data.logo_url) document.querySelectorAll('.js-site-logo').forEach(el=> el.src = data.logo_url);

      // Carrossel do hero — quantas fotos o Admin tiver adicionado, a passar de 2,5 em 2,5s
      const heroBg = document.getElementById('heroBg');
      const heroDots = document.getElementById('heroDots');
      const imagens = Array.isArray(data.hero_images) && data.hero_images.length ? data.hero_images : (data.hero_url ? [data.hero_url] : null);
      if(heroBg && imagens && imagens.length){
        heroBg.innerHTML = imagens.map((url,i)=> `<img class="js-hero-image${i===0?' active':''}" src="${url}" alt="">`).join('');
        if(heroDots) heroDots.innerHTML = imagens.map((_,i)=> `<span class="${i===0?'active':''}" onclick="RD.heroGoTo(${i})"></span>`).join('');
        if(imagens.length > 1) RD.startHeroCarousel(imagens.length);
      } else if(heroBg && data.hero_url){
        document.querySelectorAll('.js-hero-image').forEach(el=> el.src = data.hero_url);
      }

      // Cores do site (definidas no painel de gestão, em "Conteúdo do site")
      const raiz = document.documentElement.style;
      if(data.cor_destaque) raiz.setProperty('--gold', data.cor_destaque);
      if(data.cor_destaque_clara) raiz.setProperty('--gold-light', data.cor_destaque_clara);
      if(data.cor_fundo) raiz.setProperty('--bg', data.cor_fundo);
      if(data.cor_fundo_2) raiz.setProperty('--bg-2', data.cor_fundo_2);
      if(data.cor_superficie) raiz.setProperty('--surface', data.cor_superficie);

      const footerCopy = document.getElementById('footer-copy');
      if(footerCopy){
        const nome = data.nome_site || 'Roque Digital';
        const texto = data.rodape_texto || 'Todos os direitos reservados.';
        footerCopy.textContent = `© ${new Date().getFullYear()} ${nome} — ${texto}`;
      }

      if(data.contacto_whatsapp){
        const numero = data.contacto_whatsapp.replace(/\D/g,'');
        document.querySelectorAll('.js-whatsapp-float, .js-social-whatsapp').forEach(el=> el.href = `https://wa.me/${numero}`);
      }
      if(data.redes_instagram) document.querySelectorAll('.js-social-instagram').forEach(el=> el.href = data.redes_instagram);
      if(data.redes_facebook) document.querySelectorAll('.js-social-facebook').forEach(el=> el.href = data.redes_facebook);
    }catch(e){ console.warn('Não foi possível aplicar o conteúdo do site.', e); }
  },

  // ---------- Carrossel do hero (várias fotos, troca a cada 2,5s) ----------
  _heroIndex: 0,
  _heroTimer: null,
  startHeroCarousel(total){
    clearInterval(this._heroTimer);
    this._heroTimer = setInterval(()=> this.heroGoTo((this._heroIndex + 1) % total), 2500);
  },
  heroGoTo(i){
    this._heroIndex = i;
    document.querySelectorAll('#heroBg .js-hero-image').forEach((img,idx)=> img.classList.toggle('active', idx===i));
    document.querySelectorAll('#heroDots span').forEach((dot,idx)=> dot.classList.toggle('active', idx===i));
  },

  // ---------- Cartão de produto (partilhado com categoria.html / secao.html) ----------
  prodImgMarkup(imgMain, imgHover, emoji){
    if(imgMain && imgHover) return `<img class="prod-img-main" src="${imgMain}"><img class="prod-img-hover" src="${imgHover}">`;
    if(imgMain) return `<img class="prod-img-main" src="${imgMain}" style="width:100%;height:100%;object-fit:cover;">`;
    return emoji || '📦';
  },
  productCardHTML(p){
    return `
      <div class="prod-card" data-id="${p.id}">
        <div class="prod-img">
          ${this.prodImgMarkup(p.image_url, p.image_url_hover, '📦')}
          ${p.tag ? `<span class="prod-tag">${p.tag}</span>` : ''}
          <div class="prod-fav" onclick="toggleFav(this)">${this.isFavorite(p.id) ? '❤️' : '♡'}</div>
        </div>
        <div class="prod-body">
          <div class="prod-name">${p.name}</div>
          <div class="prod-brand">${p.brand || ''}</div>
          <div class="prod-price-row">
            <span class="prod-price">${Number(p.price).toLocaleString('pt-PT')} Kz</span>
            <div class="prod-add" onclick="addToCartFromCard(this)">+</div>
          </div>
        </div>
      </div>`;
  },

  // ---------- Categorias da página inicial ----------
  // Lê a tabela `categories` (a mesma usada no painel de gestão para os
  // produtos) e, se tiver categorias com imagem, substitui os cartões fixos
  // da página inicial (#catGrid) pelas categorias reais da loja. Cada
  // cartão abre categoria.html com os produtos filtrados por essa categoria.
  async loadHomeCategories(supabaseClient){
    const grid = document.getElementById('catGrid');
    if(!grid || !supabaseClient) return;
    try{
      const { data, error } = await supabaseClient.from('categories').select('*').order('name');
      if(error || !data || !data.length) return; // mantém os cartões fixos como reserva
      grid.innerHTML = data.map(c=>{
        const imagem = c.image_url
          ? `<img class="cat-thumb" src="${c.image_url}" alt="${c.name}">`
          : `<div class="emoji">${c.emoji || '🛍️'}</div>`;
        return `<a href="categoria.html?id=${c.id}&nome=${encodeURIComponent(c.name)}" class="cat-card">${imagem}<div class="label">${c.name}</div></a>`;
      }).join('');
    }catch(e){ console.warn('Não foi possível carregar as categorias.', e); }
  },

  // ---------- Barras editáveis da página inicial (Destaques/Vendidos/Novidades) ----------
  // Aplica os títulos escolhidos no painel (tabela home_sections) aos
  // cabeçalhos de cada barra, se existirem.
  async applyHomeSectionTitles(supabaseClient){
    if(!supabaseClient) return;
    try{
      const { data } = await supabaseClient.from('home_sections').select('*');
      if(!data) return;
      data.forEach(s=>{
        const h2 = document.getElementById(`secTitle-${s.slug}`);
        const eyebrow = document.getElementById(`secEyebrow-${s.slug}`);
        if(h2 && s.title) h2.textContent = s.title;
        if(eyebrow && s.eyebrow) eyebrow.textContent = s.eyebrow;
      });
    }catch(e){ /* mantém os títulos fixos como reserva */ }
  },

  // Vai buscar os produtos de uma barra: primeiro tenta os escolhidos à
  // mão no painel (home_section_products); se não houver nenhum, devolve
  // null para quem chamou continuar com o comportamento automático.
  async getCuratedSectionProducts(supabaseClient, slug, limit){
    if(!supabaseClient) return null;
    try{
      let q = supabaseClient.from('home_section_products')
        .select('position, products(*)')
        .eq('section_slug', slug)
        .order('position', { ascending:true });
      if(limit) q = q.limit(limit);
      const { data, error } = await q;
      if(error || !data || data.length === 0) return null;
      return data.map(row=> row.products).filter(Boolean);
    }catch(e){ return null; }
  },

  // ---------- Estados da encomenda (usado na loja e no painel) ----------
  ORDER_STATUSES: ['recebido','confirmado','em_preparacao','enviado','entregue','cancelado'],
  statusLabel(status){
    const nomes = {
      recebido:'Recebido', confirmado:'Pagamento confirmado', em_preparacao:'Em preparação',
      enviado:'Enviado', entregue:'Entregue', cancelado:'Cancelado'
    };
    return nomes[status] || status;
  },
  statusStep(status){
    return this.ORDER_STATUSES.indexOf(status);
  }
};

document.addEventListener('DOMContentLoaded', ()=> RD.updateBadges());
