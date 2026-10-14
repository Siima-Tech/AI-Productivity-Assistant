import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/site/PageHeader";
import { ProductCard } from "@/components/site/ProductCard";
import { FAMILIES, productsQuery } from "@/lib/products";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/shop/")({
  head: () => seo("Shop Candles", "Browse Kusasa-Elihle candles by fragrance family, price and mood. Prices in South African rand."),
  component: Shop,
});

function Shop() {
  const { data: products = [], isLoading, error } = useQuery(productsQuery);
  const [family, setFamily] = useState<string>("all");
  const [sort, setSort] = useState("featured");
  const [q, setQ] = useState("");
  const [inStock, setInStock] = useState(false);

  const list = useMemo(() => {
    let l = products.filter((p) => (family === "all" || p.family === family) && (!inStock || p.stock > 0));
    if (q) l = l.filter((p) => `${p.name} ${p.fragrance}`.toLowerCase().includes(q.toLowerCase()));
    if (sort === "low") l = [...l].sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === "high") l = [...l].sort((a, b) => Number(b.price) - Number(a.price));
    if (sort === "featured") l = [...l].sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
    return l;
  }, [products, family, sort, q, inStock]);

  return (
    <>
      <PageHeader eyebrow="The collection" title="Shop Candles">All items shown are clearly labelled sample products while the collection is being finalised.</PageHeader>
      <div className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {["all", ...FAMILIES].map((f) => (
              <button key={f} onClick={() => setFamily(f)}
                className={cn("rounded-full border px-4 py-1.5 text-sm capitalize", family === f ? "border-ink bg-ink text-ink-foreground" : "border-border bg-card hover:border-gold")}>
                {f}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search scents…" className="h-10 rounded-full border border-input bg-card px-4 text-sm" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="accent-gold" /> In stock</label>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-10 rounded-full border border-input bg-card px-4 text-sm">
              <option value="featured">Featured</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
            </select>
          </div>
        </div>
        {isLoading && <p className="text-muted-foreground">Loading candles…</p>}
        {error && <p className="text-destructive">Could not load products. Please refresh.</p>}
        {!isLoading && !list.length && <p className="text-muted-foreground">No candles match these filters.</p>}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </>
  );
}
