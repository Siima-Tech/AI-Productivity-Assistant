import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatZAR, imageFor, type Product } from "@/lib/products";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ProductCard({ product, note }: { product: Product; note?: string }) {
  const { add, wishlist, toggleWish } = useStore();
  const wished = wishlist.includes(product.id);
  const out = product.stock <= 0;
  return (
    <article className="group overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-transform hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link to="/shop/$slug" params={{ slug: product.slug }}>
          <img src={imageFor(product.image)} alt={product.name} loading="lazy" width={816} height={816}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        </Link>
        <button onClick={() => toggleWish(product.id)} aria-label="Save to wish list"
          className="absolute right-3 top-3 rounded-full bg-card/90 p-2 backdrop-blur hover:bg-card">
          <Heart className={cn("h-4 w-4", wished && "fill-gold text-gold")} />
        </button>
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {product.is_sample && <span className="rounded-full bg-ink/80 px-2.5 py-1 text-[0.65rem] uppercase tracking-wider text-ink-foreground">Sample</span>}
          {product.is_new && <span className="rounded-full bg-gold px-2.5 py-1 text-[0.65rem] uppercase tracking-wider text-gold-foreground">New</span>}
        </div>
      </div>
      <div className="space-y-2 p-5">
        <p className="eyebrow">{product.fragrance}</p>
        <Link to="/shop/$slug" params={{ slug: product.slug }}>
          <h3 className="text-2xl leading-tight">{product.name}</h3>
        </Link>
        {note && <p className="text-sm text-muted-foreground">{note}</p>}
        <div className="flex items-center justify-between pt-2">
          <span className="font-medium">{formatZAR(Number(product.price))}<span className="ml-1 text-xs text-muted-foreground">· {product.size}</span></span>
          <Button size="sm" variant={out ? "outline" : "default"} disabled={out}
            onClick={() => add({ productId: product.id, name: product.name, price: Number(product.price), image: product.image })}>
            {out ? "Out of stock" : "Add to cart"}
          </Button>
        </div>
      </div>
    </article>
  );
}
