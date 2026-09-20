import type { Testimonial } from "@/types/database";

export default function TestimonialsSection({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  if (testimonials.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
      <p className="text-sm text-laranja">Depoimentos</p>
      <h2 className="mt-2 font-display text-3xl text-creme lg:text-4xl">
        Quem já comprou, recomenda
      </h2>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="rounded-2xl border border-cacau/70 bg-cacau-dark p-6"
          >
            <div className="text-laranja" aria-hidden>
              {"★".repeat(Math.max(1, Math.min(5, t.stars || 5)))}
              <span className="text-creme/20">
                {"★".repeat(5 - Math.max(1, Math.min(5, t.stars || 5)))}
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-creme/80">“{t.text}”</p>
            <p className="mt-4 text-sm text-creme/50">
              — {t.author}
              {t.location ? `, ${t.location}` : ""}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
