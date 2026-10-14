import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Flame, Moon, Scissors, ShieldAlert, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site/PageHeader";
import { ProductCard } from "@/components/site/ProductCard";
import { Newsletter } from "@/components/site/Newsletter";
import { productsQuery } from "@/lib/products";
import { useStore } from "@/lib/store";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/moments")({
  head: () => seo("My Moments of Light", "Your candle wish list, a candle-care guide and monthly self-care inspiration."),
  component: Moments,
});

const INSPIRATION = [
  { t: "A five-minute evening pause", d: "Light a calming candle, put your phone away and take ten slow breaths before bed." },
  { t: "Sunday reset", d: "Open the windows, tidy one small space and finish with a fresh, uplifting scent." },
  { t: "Write it down", d: "By candlelight, write three things that went well today." },
];

function Moments() {
  const { data: products = [] } = useQuery(productsQuery);
  const { wishlist } = useStore();
  const saved = products.filter((p) => wishlist.includes(p.id));
  return (
    <>
      <PageHeader eyebrow="My Moments of Light" title="Your little world of calm">Saved candles stay on this device — no account needed.</PageHeader>
      <section className="mx-auto max-w-7xl px-5 py-14">
        <h2 className="text-4xl">My wish list</h2>
        {saved.length ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{saved.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        ) : (
          <div className="mt-6 rounded-3xl border border-dashed border-border p-10 text-center">
            <p className="text-muted-foreground">Tap the heart on any candle to save it here.</p>
            <Button asChild className="mt-4"><Link to="/shop">Browse candles</Link></Button>
          </div>
        )}
      </section>

      <section id="care" className="bg-beige/60">
        <div className="mx-auto max-w-7xl px-5 py-16">
          <p className="eyebrow">Candle-care guide</p>
          <h2 className="mt-2 text-4xl">Burn beautifully, burn safely</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-4">
            {[
              { I: ShieldAlert, t: "Never unattended", d: "Never leave a burning candle unattended. Keep away from children and pets." },
              { I: Scissors, t: "Trim the wick", d: "Trim the wick before each burn, as advised on the candle's label." },
              { I: Wind, t: "Avoid drafts", d: "Place on a stable, heat-resistant surface away from drafts and anything flammable." },
              { I: Flame, t: "Follow instructions", d: "Always follow the manufacturer's instructions and warnings on the label." },
            ].map(({ I, t, d }) => (
              <div key={t} className="rounded-3xl bg-card p-6 shadow-soft">
                <I className="h-6 w-6 text-gold" /><h3 className="mt-3 text-2xl">{t}</h3><p className="mt-1 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16">
        <p className="eyebrow">Monthly self-care inspiration</p>
        <h2 className="mt-2 text-4xl">{new Date().toLocaleString("en-ZA", { month: "long" })} rituals</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {INSPIRATION.map((i) => (
            <div key={i.t} className="rounded-3xl border border-border bg-card p-6"><Moon className="h-5 w-5 text-gold" /><h3 className="mt-3 text-2xl">{i.t}</h3><p className="mt-1 text-sm text-muted-foreground">{i.d}</p></div>
          ))}
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <div className="rounded-3xl bg-ink p-8 text-ink-foreground">
            <h3 className="text-3xl">Special-occasion offers</h3>
            <p className="mt-2 text-sm text-ink-foreground/70">Opt in below to hear about birthday or occasion offers when they become available. Totally optional.</p>
            <div className="mt-5"><Newsletter dark /></div>
          </div>
          <div className="rounded-3xl border border-border bg-card p-8">
            <h3 className="text-3xl">Referral programme</h3>
            <p className="mt-2 text-muted-foreground">Coming soon — share the light with friends. We'll announce it here when it launches.</p>
          </div>
        </div>
      </section>
    </>
  );
}
