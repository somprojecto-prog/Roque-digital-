import type { Category, Product } from "@/types/database";

export interface SearchResult {
  exact: Product[];
  suggestions: Product[];
}

/**
 * Porta direta de RD.searchProducts (store-common.js): 1ª tentativa é
 * correspondência direta no nome, marca ou categoria; se nada
 * corresponder, sugere por semelhança de palavras, para nunca devolver
 * zero resultados quando o catálogo tem itens parecidos.
 */
export function searchProducts(
  query: string,
  products: Product[],
  categoryNameById: Map<string, string>
): SearchResult {
  const q = query.toLowerCase().trim();
  if (!q) return { exact: [], suggestions: [] };

  const categoryName = (p: Product) =>
    (p.category_id && categoryNameById.get(p.category_id)) || "";

  const exact = products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      (p.brand || "").toLowerCase().includes(q) ||
      categoryName(p).toLowerCase().includes(q)
  );
  if (exact.length) return { exact, suggestions: [] };

  const qWords = q.split(/\s+/).filter(Boolean);
  const scored = products
    .map((p) => {
      const hay = `${p.name} ${p.brand || ""} ${categoryName(p)}`.toLowerCase();
      const hayWords = hay.split(/\s+/);
      let score = 0;
      qWords.forEach((w) => {
        if (hay.includes(w)) {
          score += 2;
          return;
        }
        hayWords.forEach((hw) => {
          const len = Math.min(3, w.length, hw.length);
          if (len >= 2 && (hw.startsWith(w.slice(0, len)) || w.startsWith(hw.slice(0, len)))) {
            score += 1;
          }
        });
      });
      return { p, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return { exact: [], suggestions: scored.slice(0, 12).map((s) => s.p) };
}

export function buildCategoryNameMap(categories: Category[]): Map<string, string> {
  return new Map(categories.map((c) => [c.id, c.name]));
}
