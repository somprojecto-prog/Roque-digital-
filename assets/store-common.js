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

  // ---------- Notificação simples ----------
  showToast(msg){
    let el = document.getElementById('global-toast');
    if(!el){ el = document.createElement('div'); el.id='global-toast'; el.className='toast'; document.body.appendChild(el); }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(window.__rdToastTimer);
    window.__rdToastTimer = setTimeout(()=> el.classList.remove('show'), 2200);
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
      if(data.hero_url) document.querySelectorAll('.js-hero-image').forEach(el=> el.src = data.hero_url);

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
  }
};

document.addEventListener('DOMContentLoaded', ()=> RD.updateBadges());
