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
  }
};

document.addEventListener('DOMContentLoaded', ()=> RD.updateBadges());
