import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Flame } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site/PageHeader";
import { ProductCard } from "@/components/site/ProductCard";
import { formatZAR, imageFor, productsQuery } from "@/lib/products";
import { useStore } from "@/lib/store";
import { POLICIES } from "@/lib/policies";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gifts")({
  head: () => seo("Gift a Little Light", "Create a personalised candle gift with a recipient name, occasion and message, and preview a digital gift card."),
  component: Gifts,
});

const OCCASIONS = ["Birthday", "Anniversary", "Thank you", "Self-care", "Congratulations", "Thinking of you"];
const giftSchema = z.object({
  recipient: z.string().trim().min(1, "Add the recipient's name").max(60),
  message: z.string().trim().min(1, "Write a short message").max(300),
});

function Gifts() {
  const { data: products = [] } = useQuery(productsQuery);
  const { add } = useStore();
  const [pid, setPid] = useState<string>("");
  const [occasion, setOccasion] = useState(OCCASIONS[0]);
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const selected = products.find((p) => p.id === pid) ?? products.find((p) => p.is_gift_set) ?? products[0];

  const addGift = () => {
    if (!selected) return;
    const r = giftSchema.safeParse({ recipient, message });
    if (!r.success) return toast.error(r.error.issues[0].message);
    add({ productId: selected.id, name: selected.name, price: Number(selected.price), image: selected.image, gift: { occasion, ...r.data } });
    setRecipient(""); setMessage("");
  };

  return (
    <>
      <PageHeader eyebrow="Gift a Little Light" title="A gift that glows">Choose a candle, pick the occasion and add a heartfelt message.</PageHeader>
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-2">
        <div className="space-y-6">
          <div>
            <p className="mb-3 text-sm font-medium">1. Choose a candle or gift set</p>
            <div className="grid grid-cols-3 gap-3">
              {products.filter((p) => p.stock > 0).map((p) => (
                <button key={p.id} onClick={() => setPid(p.id)} className={cn("overflow-hidden rounded-2xl border-2 bg-card text-left", selected?.id === p.id ? "border-gold" : "border-transparent")}>
                  <img src={imageFor(p.image)} alt={p.name} loading="lazy" className="aspect-square w-full object-cover" />
                  <p className="p-2 text-xs">{p.name}</p>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-3 text-sm font-medium">2. Select the occasion</p>
            <div className="flex flex-wrap gap-2">
              {OCCASIONS.map((o) => (
                <button key={o} onClick={() => setOccasion(o)} className={cn("rounded-full border px-4 py-1.5 text-sm", occasion === o ? "border-ink bg-ink text-ink-foreground" : "border-border bg-card")}>{o}</button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium">3. Personalise</p>
            <input value={recipient} onChange={(e) => setRecipient(e.target.value)} maxLength={60} placeholder="Recipient's name" className="h-11 w-full rounded-xl border border-input bg-card px-4" />
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={300} rows={4} placeholder="Your personal message" className="w-full rounded-xl border border-input bg-card p-4" />
            <p className="text-right text-xs text-muted-foreground">{message.length}/300</p>
          </div>
          <Button variant="gold" size="lg" onClick={addGift} disabled={!selected}>Add gift to cart{selected && ` · ${formatZAR(Number(selected.price))}`}</Button>
          <p className="text-xs text-muted-foreground">{POLICIES.gifts}</p>
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="mb-3 text-sm font-medium">Digital gift card preview</p>
          <div className="relative overflow-hidden rounded-3xl border-4 border-gold bg-card p-10 text-center shadow-gold">
            <div className="absolute inset-0 bg-glow" />
            <div className="relative">
              <Flame className="mx-auto h-8 w-8 animate-flicker text-gold" />
              <p className="eyebrow mt-4">{occasion}</p>
              <p className="mt-4 font-display text-4xl">Dear {recipient || "…"}</p>
              <p className="mx-auto mt-5 max-w-sm whitespace-pre-wrap font-display text-xl italic text-muted-foreground">{message || "Your message will appear here."}</p>
              {selected && <p className="mt-8 text-sm">A little light for you: <span className="font-medium">{selected.name}</span></p>}
              <p className="mt-6 text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">Kusasa-Elihle Essential Candles</p>
            </div>
          </div>
        </div>
      </div>
      <section className="mx-auto max-w-7xl px-5 pb-10">
        <h2 className="mb-6 text-4xl">Gift suggestions</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.filter((p) => p.is_gift_set || p.moods.includes("romance")).slice(0, 3).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </>
  );
}
