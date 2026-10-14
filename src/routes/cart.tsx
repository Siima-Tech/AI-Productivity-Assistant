import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site/PageHeader";
import { formatZAR, imageFor } from "@/lib/products";
import { useStore } from "@/lib/store";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/cart")({
  head: () => seo("Your Cart", "Review the candles in your cart before checkout."),
  component: Cart,
});

function Cart() {
  const { cart, setQty, remove, total } = useStore();
  return (
    <>
      <PageHeader eyebrow="Your cart" title="Shopping cart" />
      <div className="mx-auto max-w-5xl px-5 py-12">
        {!cart.length ? (
          <div className="text-center">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Button asChild variant="gold" className="mt-5"><Link to="/shop">Shop candles</Link></Button>
          </div>
        ) : (
          <div className="grid gap-10 md:grid-cols-3">
            <div className="space-y-4 md:col-span-2">
              {cart.map((i) => (
                <div key={i.key} className="flex gap-4 rounded-2xl border border-border bg-card p-4">
                  <img src={imageFor(i.image)} alt={i.name} className="h-24 w-24 rounded-xl object-cover" />
                  <div className="flex-1">
                    <p className="font-display text-2xl">{i.name}</p>
                    <p className="text-sm text-muted-foreground">{formatZAR(i.price)}</p>
                    {i.gift && <p className="mt-1 text-xs text-muted-foreground">🎁 {i.gift.occasion} gift for {i.gift.recipient}: “{i.gift.message}”</p>}
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center rounded-full border border-input text-sm">
                        <button className="px-3 py-1" onClick={() => setQty(i.key, i.qty - 1)}>−</button>
                        <span className="w-6 text-center">{i.qty}</span>
                        <button className="px-3 py-1" onClick={() => setQty(i.key, i.qty + 1)}>+</button>
                      </div>
                      <button onClick={() => remove(i.key)} aria-label="Remove" className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <p className="font-medium">{formatZAR(i.price * i.qty)}</p>
                </div>
              ))}
            </div>
            <div className="h-fit rounded-3xl bg-ink p-6 text-ink-foreground">
              <p className="flex justify-between text-lg"><span>Subtotal</span><span>{formatZAR(total)}</span></p>
              <p className="mt-2 text-xs text-ink-foreground/60">Delivery is not yet published — we'll confirm with you.</p>
              <Button asChild variant="gold" size="lg" className="mt-6 w-full"><Link to="/checkout">Checkout</Link></Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
