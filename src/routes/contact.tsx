import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { POLICIES } from "@/lib/policies";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () => seo("Contact & Policies", "Get in touch with Kusasa-Elihle Essential Candles and read our ordering, delivery and gift policies."),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  message: z.string().trim().min(2, "Please write a message").max(2000),
});

function Contact() {
  const [f, setF] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(f);
    if (!r.success) return toast.error(r.error.issues[0].message);
    setLoading(true);
    const { error } = await supabase.from("messages").insert(r.data);
    setLoading(false);
    if (error) return toast.error("Could not send. Please try again.");
    toast.success("Message sent — we'll be in touch soon.");
    setF({ name: "", email: "", message: "" });
  };
  return (
    <>
      <PageHeader eyebrow="Say hello" title="Contact us">Questions about a candle, a gift or an order? We'd love to help.</PageHeader>
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 md:grid-cols-2">
        <form onSubmit={submit} className="space-y-3 rounded-3xl border border-border bg-card p-8 shadow-soft">
          <input placeholder="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="h-11 w-full rounded-xl border border-input bg-background px-4" />
          <input placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className="h-11 w-full rounded-xl border border-input bg-background px-4" />
          <textarea placeholder="Message" rows={6} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} className="w-full rounded-xl border border-input bg-background p-4" />
          <Button variant="gold" disabled={loading}>{loading ? "Sending…" : "Send message"}</Button>
        </form>
        <div className="space-y-5">
          <h2 className="text-3xl">Published policies</h2>
          {Object.entries({ Ordering: POLICIES.ordering, Delivery: POLICIES.delivery, Returns: POLICIES.returns, Gifts: POLICIES.gifts, "Candle safety": POLICIES.candleCare }).map(([k, v]) => (
            <div key={k}><p className="font-medium">{k}</p><p className="text-sm text-muted-foreground">{v}</p></div>
          ))}
        </div>
      </div>
    </>
  );
}
