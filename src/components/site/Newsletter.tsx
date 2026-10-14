import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Newsletter({ dark = false }: { dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [birthday, setBirthday] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = z.string().trim().email().max(255).safeParse(email);
    if (!parsed.success) return toast.error("Please enter a valid email address.");
    if (!consent) return toast.error("Please tick the box to agree to receive emails.");
    setLoading(true);
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: parsed.data.toLowerCase(), birthday_offers: birthday });
    setLoading(false);
    if (error && error.code !== "23505") return toast.error("Could not subscribe. Please try again.");
    toast.success("Thank you! You're on the list.");
    setEmail("");
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className={cn(
            "h-11 flex-1 rounded-full border px-5 text-sm outline-none focus:ring-2 focus:ring-gold",
            dark ? "border-ink-foreground/30 bg-transparent text-ink-foreground placeholder:text-ink-foreground/50" : "border-input bg-card",
          )}
        />
        <Button variant="gold" disabled={loading} className="h-11">
          {loading ? "…" : "Subscribe"}
        </Button>
      </div>
      <label className={cn("flex items-start gap-2 text-xs", dark ? "text-ink-foreground/70" : "text-muted-foreground")}>
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 accent-gold" />
        I agree to receive candle news and self-care inspiration by email. Unsubscribe any time.
      </label>
      <label className={cn("flex items-start gap-2 text-xs", dark ? "text-ink-foreground/70" : "text-muted-foreground")}>
        <input type="checkbox" checked={birthday} onChange={(e) => setBirthday(e.target.checked)} className="mt-0.5 accent-gold" />
        Optional: I'd like special-occasion offers when available.
      </label>
    </form>
  );
}
