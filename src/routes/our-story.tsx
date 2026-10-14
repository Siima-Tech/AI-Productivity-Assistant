import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/hero.jpg";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site/PageHeader";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/our-story")({
  head: () => seo("Our Story", "Kusasa elihle means 'a beautiful tomorrow'. Discover the story behind Kusasa-Elihle Essential Candles."),
  component: Story,
});

function Story() {
  return (
    <>
      <PageHeader eyebrow="Our Story" title="A beautiful tomorrow, one flame at a time" />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-2">
        <img src={hero} alt="Candles glowing" loading="lazy" className="rounded-3xl shadow-soft" />
        <div className="space-y-5 text-lg text-muted-foreground">
          <p><span className="font-display text-2xl text-foreground">Kusasa elihle</span> means “a beautiful tomorrow”. Our candles are an invitation to pause, breathe and light up your peaceful moments.</p>
          <p>We're a South African candle brand creating scents for rest, romance, freshness, energy and comfort — for your home and for the people you love.</p>
          <p className="rounded-2xl bg-muted p-4 text-sm">The founder's personal story will be shared here soon.</p>
          <Button asChild variant="gold"><Link to="/shop">Explore the collection</Link></Button>
        </div>
      </div>
    </>
  );
}
