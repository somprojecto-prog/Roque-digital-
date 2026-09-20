/**
 * Tipos que espelham o schema Supabase real do projeto (extraídos de
 * store-common.js, produto.html, carrinho.html, conta.html e
 * dashboard.html). Mantidos à parte de types/product.ts (o antigo
 * modelo mockado), para nunca confundir dados reais com mocks durante
 * a migração.
 */

export type ProfileRole = "admin" | "gestor" | "pendente";
export type OrderStatus =
  | "recebido"
  | "confirmado"
  | "em_preparacao"
  | "enviado"
  | "entregue"
  | "cancelado";
export type ProofMode = "none" | "optional" | "required";

export interface Category {
  id: string;
  name: string;
  image_url: string | null;
  emoji: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string | null;
  description: string | null;
  price: number;
  promo_price: number | null;
  tag: string | null;
  image_url: string | null;
  image_url_hover: string | null;
  images: string[] | null;
  features: string[] | null;
  stock: number | null;
  active: boolean;
  category_id: string | null;
  vendas: number | null;
  created_at: string;
}

export interface Customer {
  id: string;
  auth_user_id: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: number;
  customer_id: string | null;
  status: OrderStatus;
  total: number;
  delivery_fee: number;
  payment_method: string | null;
  payment_proof_url: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  quantity: number;
  unit_price: number;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: OrderStatus;
  changed_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: ProfileRole;
  created_at: string;
}

export interface HomeSection {
  id: string;
  slug: string;
  title: string | null;
  eyebrow: string | null;
  created_at: string;
}

export interface HomeSectionProduct {
  id: string;
  section_slug: string;
  product_id: string;
  position: number;
}

export interface ProductReview {
  id: string;
  product_id: string;
  customer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface Testimonial {
  id: string;
  author: string;
  location: string | null;
  stars: number;
  text: string;
  created_at: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  instructions: string | null;
  proof_mode: ProofMode;
  proof_label: string | null;
  active: boolean;
  created_at: string;
}

export interface SiteSettings {
  id: number;
  nome_site: string | null;
  slogan: string | null;
  hero_titulo: string | null;
  hero_descricao: string | null;
  hero_url: string | null;
  hero_images: string[] | null;
  logo_url: string | null;
  destaque_video_url: string | null;
  destaque_titulo: string | null;
  destaque_descricao: string | null;
  destaque_preco: number | null;
  cor_destaque: string | null;
  cor_destaque_clara: string | null;
  cor_fundo: string | null;
  cor_fundo_2: string | null;
  cor_superficie: string | null;
  rodape_texto: string | null;
  contacto_whatsapp: string | null;
  redes_instagram: string | null;
  redes_facebook: string | null;
  taxa_entrega: number | null;
  emailjs_public_key: string | null;
  emailjs_service_id: string | null;
  emailjs_template_id: string | null;
}
