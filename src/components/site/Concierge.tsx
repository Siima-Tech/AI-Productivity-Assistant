import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Flame, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { askConcierge } from "@/lib/ai.functions";
import { productsQuery } from "@/lib/products";

type Msg = { role: "user" | "assistant"; content: string };

export function Concierge() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", content: "Hello! I'm the Kusasa Candle Concierge. Ask me about scents, gifts or how ordering works." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: products = [] } = useQuery(productsQuery);
  const ask = useServerFn(askConcierge);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [msgs, loading]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim().slice(0, 2000);
    if (!text || loading) return;
    const next = [...msgs, { role: "user" as const, content: text }];
    setMsgs(next);
    setInput("");
    setLoading(true);
    try {
      const res = await ask({
        data: {
          messages: next.slice(-12),
          products: products.map((p) => ({
            name: p.name, fragrance: p.fragrance, family: p.family, price: Number(p.price),
            size: p.size, description: p.description, inStock: p.stock > 0, slug: p.slug,
          })),
        },
      });
      setMsgs((m) => [...m, { role: "assistant", content: "error" in res && res.error ? `⚠️ ${res.error}` : (res as { reply: string }).reply }]);
    } catch {
      setMsgs((m) => [...m, { role: "assistant", content: "⚠️ I couldn't connect just now. Please try again or visit our Contact page." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setOpen(!open)} aria-label="Open Kusasa Candle Concierge"
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-ink px-5 py-3.5 text-sm text-ink-foreground shadow-gold transition-transform hover:-translate-y-0.5">
        {open ? <X className="h-4 w-4" /> : <Flame className="h-4 w-4 animate-flicker text-gold" />}
        <span className="hidden sm:inline">{open ? "Close" : "Candle Concierge"}</span>
      </button>
      {open && (
        <div className="fixed bottom-20 right-5 z-50 flex h-[32rem] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft animate-rise">
          <div className="bg-ink px-5 py-4 text-ink-foreground">
            <p className="font-display text-xl">Kusasa Candle Concierge</p>
            <p className="text-xs text-ink-foreground/60">AI assistant · uses only our published info</p>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {msgs.map((m, i) => (
              <div key={i} className={m.role === "user" ? "ml-8 rounded-2xl rounded-br-sm bg-ink px-4 py-2.5 text-sm text-ink-foreground" : "mr-8 whitespace-pre-wrap rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5 text-sm"}>
                {m.content}
              </div>
            ))}
            {loading && <div className="mr-8 rounded-2xl bg-muted px-4 py-2.5 text-sm text-muted-foreground">Thinking…</div>}
            <div ref={endRef} />
          </div>
          <form onSubmit={send} className="flex gap-2 border-t border-border p-3">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about candles or gifts…"
              className="h-10 flex-1 rounded-full border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-gold" />
            <button disabled={loading} aria-label="Send" className="grid h-10 w-10 place-items-center rounded-full bg-gradient-gold text-gold-foreground disabled:opacity-50">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
