import type { Metadata } from "next";
import { getAllActiveProducts, getCategories } from "@/lib/queries";
import { searchProducts, buildCategoryNameMap } from "@/lib/search";
import ProductCard from "@/components/ProductCard";

export const metadata: Metadata = { title: "Pesquisa" };

export default async function PesquisaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const [products, categories] = await Promise.all([getAllActiveProducts(), getCategories()]);
  const { exact, suggestions } = searchProducts(q, products, buildCategoryNameMap(categories));
  const results = exact.length > 0 ? exact : suggestions;

  return (
    <main className="min-h-screen bg-cacau-darker pb-24 pt-32 lg:pt-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <p className="text-sm text-laranja">Pesquisa</p>
        <h1 className="mt-1 font-display text-3xl text-creme lg:text-4xl">
          {q ? `Resultados para "${q}"` : "O que procuras hoje?"}
        </h1>

        {q && exact.length === 0 && suggestions.length > 0 && (
          <p className="mt-2 text-sm text-creme/60">
            Não encontrámos "{q}" exatamente, mas talvez gostes destes:
          </p>
        )}

        {q && results.length === 0 ? (
          <p className="mt-16 text-center text-creme/50">
            Não encontrámos nada parecido com "{q}".
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
            {results.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                sizes="(max-width: 768px) 45vw, 22vw"
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
