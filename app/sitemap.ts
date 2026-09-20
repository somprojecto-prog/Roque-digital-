import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { getCategories, getCatalogProducts, SECTION_DEFAULTS } from "@/lib/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [categories, products] = await Promise.all([
    getCategories(),
    getCatalogProducts([], 200),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteConfig.url, lastModified: now, changeFrequency: "daily", priority: 1 },
  ];

  const sectionRoutes: MetadataRoute.Sitemap = Object.keys(SECTION_DEFAULTS).map((slug) => ({
    url: `${siteConfig.url}/secao/${slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${siteConfig.url}/categoria/${cat.id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${siteConfig.url}/produto/${product.id}`,
    lastModified: product.created_at ? new Date(product.created_at) : now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...sectionRoutes, ...categoryRoutes, ...productRoutes];
}
