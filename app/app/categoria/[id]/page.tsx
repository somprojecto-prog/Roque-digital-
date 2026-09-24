import type { Metadata } from "next";
import { getCategoryById, getProductsByCategory } from "@/lib/queries";
import ProductCard from "@/components/ProductCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const category = await getCategoryById(id);
  return {
    title: category?.name || "Categoria",
    description: category
      ? `Explora a coleção de ${category.name} da Roque Digital.`
      : "Categoria não encontrada.",
  };
}

export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [category, products] = await Promise.all([
    getCategoryById(id),
    getProductsByCategory(id),
  ]);

  return (
    <main className="min-h-screen bg-cacau-darker pb-24 pt-32 lg:pt-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <p className="text-sm text-laranja">Categoria</p>
        <h1 className="mt-2 font-display text-3xl text-creme lg:text-4xl">
          {category?.name || "Categoria não encontrada"}
        </h1>
        <p className="mt-2 text-sm text-creme/60">
          {products.length} produto{products.length === 1 ? "" : "s"}
        </p>

        {products.length === 0 ? (
          <p className="mt-16 text-center text-creme/50">
            Ainda não há produtos nesta categoria.
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
            {products.map((product) => (
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
