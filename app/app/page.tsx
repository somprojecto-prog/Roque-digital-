import Hero from "@/components/Hero";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import ProductRow from "@/components/ProductRow";
import DiverseGrid from "@/components/DiverseGrid";
import ComboSection from "@/components/ComboSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import HighlightSection from "@/components/HighlightSection";
import { buildProductListJsonLd } from "@/lib/json-ld";
import {
  getSiteSettings,
  getSectionProducts,
  getSectionMeta,
  getCatalogProducts,
  getTestimonials,
} from "@/lib/queries";

export default async function Home() {
  const [siteSettings, destaquesMeta, novidadesMeta] = await Promise.all([
    getSiteSettings(),
    getSectionMeta("destaques"),
    getSectionMeta("novidades"),
  ]);

  // Mesma paginação do site original: destaques usa os 10 primeiros,
  // "novidades" salta esses (range 10–19) para nunca repetir produtos.
  const [destaques, novidades] = await Promise.all([
    getSectionProducts("destaques", { orderBy: "created_at", ascending: false, from: 0, to: 9 }),
    getSectionProducts("novidades", { orderBy: "created_at", ascending: false, from: 10, to: 19 }),
  ]);

  const shownIds = [...destaques, ...novidades].map((p) => p.id);
  const [catalogProducts, testimonials] = await Promise.all([
    getCatalogProducts(shownIds),
    getTestimonials(),
  ]);

  const productListJsonLd = buildProductListJsonLd(destaques);

  return (
    <main className="bg-cacau-darker">
      <Hero siteSettings={siteSettings} rotatorProducts={destaques.slice(0, 4)} />

      <FeaturedCarousel
        products={destaques}
        title={destaquesMeta.title}
        eyebrow={destaquesMeta.eyebrow}
      />

      <ProductRow
        title={novidadesMeta.title}
        eyebrow={novidadesMeta.eyebrow}
        viewAllHref="/secao/novidades"
        products={novidades}
      />

      <DiverseGrid products={catalogProducts} />
      <ComboSection products={destaques.slice(0, 2)} />
      <TestimonialsSection testimonials={testimonials} />
      <HighlightSection siteSettings={siteSettings} />

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productListJsonLd) }}
      />
    </main>
  );
}
