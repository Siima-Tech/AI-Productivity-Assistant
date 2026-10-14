import c1 from "@/assets/candle-1.jpg";
import c2 from "@/assets/candle-2.jpg";
import c3 from "@/assets/candle-3.jpg";
import c4 from "@/assets/candle-4.jpg";
import c5 from "@/assets/candle-5.jpg";
import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Product = Tables<"products">;

export const IMAGES: Record<string, string> = {
  "candle-1": c1,
  "candle-2": c2,
  "candle-3": c3,
  "candle-4": c4,
  "candle-5": c5,
};
export const imageFor = (key: string) =>
  key.startsWith("http") ? key : (IMAGES[key] ?? c1);

export const FAMILIES = ["floral", "fresh", "sweet", "woody", "warm"] as const;
export const MOODS = ["relaxation", "romance", "freshness", "energy", "comfort"] as const;
export const ROOMS = ["bedroom", "bathroom", "living room", "office", "gift"] as const;

export const formatZAR = (n: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(n);

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("created_at");
    if (error) throw error;
    return data as Product[];
  },
});

export type QuizAnswers = {
  mood: string;
  room: string;
  family: string;
  budget: "under-250" | "250-400" | "any";
  forWhom: "me" | "someone";
};

export function recommend(products: Product[], a: QuizAnswers) {
  const scored = products
    .filter((p) => p.stock > 0)
    .map((p) => {
      let score = 0;
      const reasons: string[] = [];
      if (p.moods.includes(a.mood)) {
        score += 3;
        reasons.push(`creates a ${a.mood} mood`);
      }
      if (p.family === a.family) {
        score += 3;
        reasons.push(`matches your love of ${a.family} scents`);
      }
      if (p.rooms.includes(a.room)) {
        score += 2;
        reasons.push(a.room === "gift" ? "makes a lovely gift" : `suits your ${a.room}`);
      }
      if (a.forWhom === "someone" && p.is_gift_set) {
        score += 2;
        reasons.push("is presented as a gift set");
      }
      const price = Number(p.price);
      if (a.budget === "under-250" && price > 250) score -= 4;
      if (a.budget === "250-400" && (price < 200 || price > 400)) score -= 2;
      return { product: p, score, reasons };
    })
    .filter((r) => r.score > 0)
    .sort((x, y) => y.score - x.score);
  return scored.slice(0, 3);
}

export function matchHeadline(a: QuizAnswers) {
  const feel: Record<string, string> = {
    relaxation: "calming, unwinding",
    romance: "warm, romantic",
    freshness: "bright, refreshing",
    energy: "uplifting, energising",
    comfort: "warm, comforting",
  };
  const when: Record<string, string> = {
    bedroom: "peaceful evenings",
    bathroom: "slow self-care rituals",
    "living room": "cosy time together",
    office: "focused workdays",
    gift: "a thoughtful gift",
  };
  return `Your perfect match is a ${feel[a.mood] ?? "beautiful"} candle for ${when[a.room] ?? "special moments"}.`;
}
