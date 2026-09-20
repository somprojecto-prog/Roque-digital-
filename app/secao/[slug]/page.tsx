import type { Metadata } from "next";
import { getSectionMeta, getSectionProducts, SECTION_DEFAULTS } from "@/lib/queries";
import ProductCard from "@/components/ProductCard";

const ORDER_CONFIG: Record<string, { orderBy: string; ascending: boolean }> = {
  destaques: { orderBy: "created_at", ascending: false },
  vendidos: { orderBy: "vendas", ascending: false },
  novidades: { orderBy: "created_at", ascending: false },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = await getSectionMeta(slug);
  return { title: meta.title };
}

export default async function SecaoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = await getSectionMeta(slug);
  const order = ORDER_CONFIG[slug] || SECTION_DEFAULTS.destaques;

  // Sem o limite de 10 usado nas barras da home — mostra a lista completa.
  const products = await getSectionProducts(slug, {
    orderBy: order.orderBy,
    ascending: order.ascending,
    from: 0,
    to: 59,
  });

  return (
    <main className="min-h-screen bg-cacau-darker pb-24 pt-32 lg:pt-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <p className="text-sm text-laranja">{meta.eyebrow}</p>
        <h1 className="mt-1 font-display text-3xl text-creme lg:text-4xl">{meta.title}</h1>
        <p className="mt-2 text-sm text-creme/60">
          {products.length} produto{products.length === 1 ? "" : "s"}
        </p>

        {products.length === 0 ? (
          <p className="mt-16 text-center text-creme/50">Ainda não há produtos aqui.</p>
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
