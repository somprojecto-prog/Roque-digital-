import type { Metadata } from "next";
import Image from "next/image";
import { getProductById, getRelatedProducts } from "@/lib/queries";
import { formatPrice } from "@/lib/format";
import ProductCard from "@/components/ProductCard";
import ProductActions from "@/components/ProductActions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  return {
    title: product?.name || "Produto não encontrado",
    description: product?.description || undefined,
  };
}

export default async function ProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cacau-darker pt-24">
        <p className="text-creme/60">Produto não encontrado.</p>
      </main>
    );
  }

  const related = await getRelatedProducts(product.id);
  const price = product.promo_price ?? product.price;
  const hasPromo = product.promo_price != null && product.promo_price < product.price;
  const gallery = [product.image_url, ...(product.images || [])].filter(
    (src): src is string => Boolean(src)
  );

  return (
    <main className="min-h-screen bg-cacau-darker pb-24 pt-32 lg:pt-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Galeria */}
          <div>
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-cacau/70 bg-cacau-dark">
              {gallery[0] ? (
                <Image
                  src={gallery[0]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-6xl">📦</div>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {gallery.slice(1, 5).map((src, i) => (
                  <div
                    key={src + i}
                    className="relative aspect-square overflow-hidden rounded-xl border border-cacau/70 bg-cacau-dark"
                  >
                    <Image src={src} alt="" fill sizes="120px" className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Informação */}
          <div>
            {product.tag && (
              <span className="inline-block rounded-full border border-laranja/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-laranja">
                {product.tag}
              </span>
            )}
            <h1 className="mt-3 font-display text-3xl text-creme lg:text-4xl">{product.name}</h1>
            {product.brand && <p className="mt-1 text-sm text-creme/50">{product.brand}</p>}

            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-2xl text-laranja">{formatPrice(price)}</span>
              {hasPromo && (
                <span className="text-sm text-creme/40 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            {product.description && (
              <p className="mt-6 text-sm leading-relaxed text-creme/70">{product.description}</p>
            )}

            {product.features && product.features.length > 0 && (
              <ul className="mt-6 flex flex-col gap-2">
                {product.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-creme/70">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-laranja" />
                    {feature}
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-6 text-xs text-creme/40">
              {(product.stock ?? 0) > 0
                ? `${product.stock} em stock`
                : "Sem stock de momento"}
            </p>

            {/* Carrinho/Favoritos: réplica exata do "conta obrigatória" do
                site original — RD.requireAccount()/conta.html. */}
            <ProductActions product={product} />
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="font-display text-2xl text-creme">Também pode gostar</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} sizes="(max-width: 768px) 45vw, 22vw" />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
