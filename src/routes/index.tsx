import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Flame, Gift, Heart, Leaf, Sparkles } from "lucide-react";
import hero from "@/assets/hero.jpg";
import gift from "@/assets/candle-3.jpg";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/site/ProductCard";
import { Newsletter } from "@/components/site/Newsletter";
import { productsQuery, type Product } from "@/lib/products";
import { supabase } from "@/integrations/supabase/client";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => seo("Light up your peaceful moments", "Elegant South African candles that bring light, peace and warmth into your space. Find your signature scent."),
  component: Home,
});

function Row({ title, eyebrow, items }: { title: string; eyebrow: string; items: Product[] }) {
  if (!items.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-5 py-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-2 text-4xl md:text-5xl">{title}</h2>
        </div>
        <Link to="/shop" className="hidden text-sm underline-offset-4 hover:underline md:block">View all</Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.slice(0, 3).map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}

function Home() {
  const { data: products = [] } = useQuery(productsQuery);
  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews-approved"],
    queryFn: async () => (await supabase.from("reviews").select("*").eq("approved", true).order("created_at", { ascending: false }).limit(3)).data ?? [],
  });

  return (
    <>
      <section className="relative isolate min-h-[88vh] overflow-hidden bg-ink">
        <img src={hero} alt="Candles glowing among dried botanicals" width={1600} height={1008} className="absolute inset-0 -z-10 h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/70 to-transparent" />
        <div className="mx-auto flex min-h-[88vh] max-w-7xl items-center px-5">
          <div className="max-w-2xl animate-rise text-ink-foreground">
            <p className="eyebrow">Light up your peaceful moments</p>
            <h1 className="mt-5 text-5xl leading-[1.05] md:text-7xl">Bring Light, Peace and Warmth Into Your Space.</h1>
            <p className="mt-6 max-w-lg text-lg text-ink-foreground/80">Discover candles that make ordinary moments feel special.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild variant="gold" size="lg"><Link to="/shop">Shop Our Candles</Link></Button>
              <Button asChild variant="hero" size="lg"><Link to="/find-your-scent">Find Your Perfect Scent</Link></Button>
            </div>
          </div>
        </div>
      </section>

      <Row eyebrow="Handpicked" title="Featured candles" items={products.filter((p) => p.is_featured)} />

      <section className="bg-beige/60">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:grid-cols-2">
          <div>
            <p className="eyebrow">Find your signature scent</p>
            <h2 className="mt-3 text-4xl md:text-5xl">Five little questions. One perfect match.</h2>
            <p className="mt-4 text-muted-foreground">Tell us the mood, the room and the scents you love — our Candle Matchmaker recommends candles from our collection, with a reason for each.</p>
            <Button asChild variant="default" size="lg" className="mt-8"><Link to="/find-your-scent"><Sparkles /> Start the Matchmaker</Link></Button>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {["Relax", "Romance", "Fresh", "Energy", "Comfort"].map((m, i) => (
              <div key={m} className="flex aspect-[1/2] flex-col items-center justify-end rounded-full border border-gold/50 bg-card pb-6 shadow-soft" style={{ marginTop: `${(i % 2) * 2}rem` }}>
                <Flame className="mb-auto mt-6 h-5 w-5 animate-flicker text-gold" />
                <span className="text-xs uppercase tracking-widest">{m}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Row eyebrow="Loved by customers" title="Bestsellers" items={products.filter((p) => p.is_bestseller)} />
      <Row eyebrow="Just poured" title="New arrivals" items={products.filter((p) => p.is_new)} />

      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="text-center">
          <p className="eyebrow">Why Kusasa-Elihle</p>
          <h2 className="mt-2 text-4xl md:text-5xl">Made for your peaceful moments</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-4">
          {[
            { I: Flame, t: "Warm, calming light", d: "Candles designed to slow you down and soften your space." },
            { I: Leaf, t: "Scent-led collection", d: "Floral, fresh, sweet, woody and warm families to explore." },
            { I: Gift, t: "Thoughtful gifting", d: "Add a recipient name and personal message to any candle." },
            { I: Heart, t: "Proudly South African", d: "A local brand inspired by kusasa elihle — a beautiful tomorrow." },
          ].map(({ I, t, d }) => (
            <div key={t} className="rounded-3xl border border-border bg-card p-7 text-center shadow-soft">
              <I className="mx-auto h-7 w-7 text-gold" />
              <h3 className="mt-4 text-2xl">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid overflow-hidden rounded-3xl bg-ink text-ink-foreground md:grid-cols-2">
          <img src={gift} alt="Candle gift set" loading="lazy" width={816} height={816} className="h-full w-full object-cover" />
          <div className="flex flex-col justify-center p-10 md:p-14">
            <p className="eyebrow">Gift a Little Light</p>
            <h2 className="mt-3 text-4xl">Send warmth to someone special</h2>
            <p className="mt-4 text-ink-foreground/75">Choose a candle, pick the occasion, write your message and preview a digital gift card.</p>
            <Button asChild variant="gold" size="lg" className="mt-8 w-fit"><Link to="/gifts">Create a gift</Link></Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-16 text-center">
        <p className="eyebrow">Customer reviews</p>
        <h2 className="mt-2 text-4xl">Kind words</h2>
        {reviews.length ? (
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {reviews.map((r) => (
              <blockquote key={r.id} className="rounded-3xl border border-border bg-card p-6 text-left shadow-soft">
                <p className="text-gold">{"★".repeat(r.rating)}</p>
                <p className="mt-3 font-display text-xl italic">“{r.comment}”</p>
                <footer className="mt-4 text-sm text-muted-foreground">— {r.name} · verified purchase</footer>
              </blockquote>
            ))}
          </div>
        ) : (
          <p className="mx-auto mt-6 max-w-md text-muted-foreground">No reviews yet — we only show genuine reviews from verified customers. Bought a candle? Leave a review on its product page.</p>
        )}
      </section>

      <section className="mx-auto max-w-2xl px-5 py-12 text-center">
        <h2 className="text-4xl">Join our circle of light</h2>
        <p className="mt-3 text-muted-foreground">Monthly self-care inspiration, candle care tips and first news of new scents.</p>
        <div className="mt-6 text-left"><Newsletter /></div>
      </section>
    </>
  );
}
