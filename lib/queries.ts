import { cache } from "react";
import { supabase } from "@/lib/supabase";
import type {
  Category,
  HomeSection,
  Product,
  SiteSettings,
  Testimonial,
} from "@/types/database";

/**
 * Estas funções replicam, 1:1, as queries feitas em store-common.js e em
 * index.html/produto.html do site original — incluindo os mesmos
 * fallbacks defensivos (coluna em falta, tabela vazia, etc.) — para que
 * o comportamento em Next.js seja idêntico ao site em HTML puro.
 *
 * Cada uma é envolvida em `cache()` do React: se for chamada mais do que
 * uma vez durante o mesmo pedido de servidor (ex: layout + página),
 * o Supabase só é consultado uma vez.
 */

export const getCategories = cache(async (): Promise<Category[]> => {
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error || !data) return [];
  return data;
});

export const getHomeSections = cache(async (): Promise<HomeSection[]> => {
  const { data, error } = await supabase.from("home_sections").select("*");
  if (error || !data) return [];
  return data;
});

/**
 * Produtos escolhidos à mão no painel (home_section_products) para uma
 * barra. Devolve null se não houver nenhum escolhido, para quem chamar
 * decidir o comportamento automático (mesma lógica de
 * RD.getCuratedSectionProducts).
 */
async function getCuratedSectionProducts(
  slug: string,
  limit?: number
): Promise<Product[] | null> {
  let query = supabase
    .from("home_section_products")
    .select("position, products(*)")
    .eq("section_slug", slug)
    .order("position", { ascending: true });
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error || !data || data.length === 0) return null;
  return data.map((row) => row.products).filter(Boolean) as unknown as Product[];
}

/**
 * Produtos de uma secção da home, com curadoria manual como 1ª opção e
 * ordenação automática como reserva — replica carregarCarrossel() do
 * index.html original, incluindo a reserva quando a coluna pedida
 * (ex: "vendas") ainda não existir na tabela.
 */
export const getSectionProducts = cache(
  async (
    slug: string,
    options: {
      orderBy?: string;
      ascending?: boolean;
      from?: number;
      to?: number;
      limit?: number;
    } = {}
  ): Promise<Product[]> => {
    const curated = await getCuratedSectionProducts(slug, options.limit ?? 10);
    if (curated) return curated;

    const { orderBy = "created_at", ascending = false, from = 0, to = 9 } = options;

    let { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order(orderBy, { ascending })
      .range(from, to);

    if (error) {
      // A coluna pedida (ex: "vendas") pode não existir ainda.
      ({ data, error } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .range(0, 9));
    }

    return !error && data ? data : [];
  }
);

export const getProductById = cache(async (id: string): Promise<Product | null> => {
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
  return error ? null : data;
});

export const getProductsByCategory = cache(
  async (categoryId: string): Promise<Product[]> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .eq("category_id", categoryId);
    return error || !data ? [] : data;
  }
);

export const getCategoryById = cache(async (id: string): Promise<Category | null> => {
  const { data, error } = await supabase.from("categories").select("*").eq("id", id).single();
  return error ? null : data;
});

export const getRelatedProducts = cache(
  async (excludeId: string, limit = 4): Promise<Product[]> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .neq("id", excludeId)
      .limit(limit);
    return error || !data ? [] : data;
  }
);

/**
 * Lista geral de produtos ativos, paginada — usada pela secção
 * "Diversos" (grid com Ver mais / Ver menos). O schema do teu parceiro
 * não tem um conceito de "diversos" próprio, por isso isto mostra o
 * catálogo geral, com opção de excluir os já mostrados nas 3 barras
 * curadas acima, para não duplicar produtos na página.
 */
export const getCatalogProducts = cache(
  async (excludeIds: string[] = [], limit = 60): Promise<Product[]> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return excludeIds.length ? data.filter((p) => !excludeIds.includes(p.id)) : data;
  }
);

/**
 * Textos por omissão de cada barra da home — idênticos aos que estavam
 * fixos no index.html original. O painel de gestão pode substituí-los
 * via a tabela `home_sections` (título/eyebrow); isto só se aplica
 * quando não houver substituição.
 */
export const SECTION_DEFAULTS: Record<string, { title: string; eyebrow: string }> = {
  destaques: { title: "🔥 Produtos em destaque", eyebrow: "Destaques" },
  vendidos: { title: "🏆 Mais vendidos", eyebrow: "Populares" },
  novidades: { title: "✨ Novidades", eyebrow: "Acabaram de chegar" },
};

export async function getSectionMeta(
  slug: string
): Promise<{ title: string; eyebrow: string }> {
  const fallback = SECTION_DEFAULTS[slug] || { title: slug, eyebrow: "" };
  const sections = await getHomeSections();
  const override = sections.find((s) => s.slug === slug);
  return {
    title: override?.title || fallback.title,
    eyebrow: override?.eyebrow || fallback.eyebrow,
  };
}

export const getAllActiveProducts = cache(async (limit = 200): Promise<Product[]> => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .limit(limit);
  return error || !data ? [] : data;
});

export const getSiteSettings = cache(async (): Promise<SiteSettings | null> => {
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).single();
  return error ? null : data;
});

export const getTestimonials = cache(async (limit = 6): Promise<Testimonial[]> => {
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return error || !data ? [] : data;
});
