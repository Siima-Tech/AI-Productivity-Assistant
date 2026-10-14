import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatZAR, imageFor, productsQuery } from "@/lib/products";
import { useStore } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { POLICIES } from "@/lib/policies";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/shop/$slug")({
  head: ({ params }) => {
    const name = params.slug.split("-").map((w) => w[0]?.toUpperCase() + w.slice(1)).join(" ");
    return {
      meta: [
        { title: `${name} · KUSASA-ELIHLE Essential Candles` },
        { name: "description", content: `${name} candle by Kusasa-Elihle Essential Candles.` },
        { property: "og:title", content: `${name} · KUSASA-ELIHLE` },
        { property: "og:description", content: `${name} candle by Kusasa-Elihle Essential Candles.` },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProductPage,
});

const reviewSchema = z.object({
  name: z.string().trim().min(1).max(80),
  order_email: z.string().trim().email().max(255),
  comment: z.string().trim().min(2).max(1000),
  rating: z.number().min(1).max(5),
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: products = [], isLoading } = useQuery(productsQuery);
  const p = products.find((x) => x.slug === slug);
  const { add, wishlist, toggleWish } = useStore();
  const [qty, setQty] = useState(1);
  const { data: reviews = [], refetch } = useQuery({
    queryKey: ["reviews", p?.id],
    enabled: !!p,
    queryFn: async () => (await supabase.from("reviews").select("*").eq("product_id", p!.id).eq("approved", true)).data ?? [],
  });
  const [form, setForm] = useState({ name: "", order_email: "", comment: "", rating: 5 });

  if (isLoading) return <p className="mx-auto max-w-7xl px-5 py-20 text-muted-foreground">Loading…</p>;
  if (!p) return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <h1 className="text-4xl">Candle not found</h1>
      <Button asChild className="mt-6"><Link to="/shop">Back to shop</Link></Button>
    </div>
  );

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = reviewSchema.safeParse(form);
    if (!r.success) return toast.error("Please complete all review fields with a valid email.");
    const { error } = await supabase.from("reviews").insert({ ...r.data, product_id: p.id });
    if (error) return toast.error("Could not submit review.");
    toast.success("Thank you! Your review will appear once we verify your purchase.");
    setForm({ name: "", order_email: "", comment: "", rating: 5 });
    refetch();
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <Link to="/shop" className="text-sm text-muted-foreground hover:text-foreground">← Back to shop</Link>
      <div className="mt-6 grid gap-12 md:grid-cols-2">
        <img src={imageFor(p.image)} alt={p.name} width={816} height={816} className="aspect-square w-full rounded-3xl object-cover shadow-soft" />
        <div className="animate-rise">
          {p.is_sample && <span className="rounded-full bg-ink px-3 py-1 text-xs uppercase tracking-wider text-ink-foreground">Sample product</span>}
          <p className="eyebrow mt-5">{p.fragrance} · {p.family}</p>
          <h1 className="mt-2 text-5xl">{p.name}</h1>
          <p className="mt-4 text-2xl">{formatZAR(Number(p.price))} <span className="text-base text-muted-foreground">· {p.size}</span></p>
          <p className="mt-6 text-muted-foreground">{p.description}</p>
          <p className={cn("mt-4 text-sm", p.stock > 0 ? "text-foreground" : "text-destructive")}>
            {p.stock > 0 ? `In stock (${p.stock} available)` : "Currently out of stock"}
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            {[...p.moods, ...p.rooms].map((t) => <span key={t} className="rounded-full border border-border px-3 py-1 capitalize">{t}</span>)}
          </div>
          <div className="mt-8 flex items-center gap-3">
            <div className="flex items-center rounded-full border border-input">
              <button className="px-4 py-2" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <span className="w-8 text-center">{qty}</span>
              <button className="px-4 py-2" onClick={() => setQty(Math.min(p.stock, qty + 1))}>+</button>
            </div>
            <Button variant="gold" size="lg" disabled={p.stock <= 0}
              onClick={() => add({ productId: p.id, name: p.name, price: Number(p.price), image: p.image }, qty)}>Add to cart</Button>
            <Button variant="outline" size="icon" onClick={() => toggleWish(p.id)} aria-label="Save">
              <Heart className={cn(wishlist.includes(p.id) && "fill-gold text-gold")} />
            </Button>
          </div>
          <div className="mt-10 rounded-2xl bg-muted p-5 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Candle care</p>
            <p className="mt-1">{POLICIES.candleCare}</p>
          </div>
        </div>
      </div>

      <section className="mt-20 grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="text-3xl">Reviews</h2>
          {reviews.length ? reviews.map((r) => (
            <div key={r.id} className="mt-4 rounded-2xl border border-border bg-card p-5">
              <p className="text-gold">{"★".repeat(r.rating)}</p>
              <p className="mt-2">{r.comment}</p>
              <p className="mt-2 text-xs text-muted-foreground">{r.name} · verified purchase</p>
            </div>
          )) : <p className="mt-4 text-muted-foreground">No verified reviews yet.</p>}
        </div>
        <form onSubmit={submitReview} className="space-y-3 rounded-3xl border border-border bg-card p-6">
          <h3 className="text-2xl">Leave a review</h3>
          <p className="text-xs text-muted-foreground">Reviews are published only after we match them to a real order.</p>
          <input placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm" />
          <input placeholder="Email used for your order" value={form.order_email} onChange={(e) => setForm({ ...form, order_email: e.target.value })} className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm" />
          <select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm">
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}
          </select>
          <textarea placeholder="Your review" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} rows={4} className="w-full rounded-xl border border-input bg-background p-3 text-sm" />
          <Button type="submit">Submit review</Button>
        </form>
      </section>
    </div>
  );
}
