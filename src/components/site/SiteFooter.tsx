import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Music2 } from "lucide-react";
import { Logo } from "./Logo";
import { Newsletter } from "./Newsletter";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="rounded-full bg-background/95 p-1 pr-5 w-fit">
            <Logo />
          </div>
          <p className="mt-5 max-w-sm font-display text-2xl italic text-ink-foreground/90">
            “Light up your peaceful moments.”
          </p>
          <div className="mt-6 max-w-md">
            <Newsletter dark />
          </div>
        </div>
        <div>
          <p className="eyebrow mb-4">Explore</p>
          <ul className="space-y-2 text-sm text-ink-foreground/75">
            <li><Link to="/shop" className="hover:text-gold">Shop Candles</Link></li>
            <li><Link to="/find-your-scent" className="hover:text-gold">Find Your Scent</Link></li>
            <li><Link to="/gifts" className="hover:text-gold">Gift a Little Light</Link></li>
            <li><Link to="/moments" className="hover:text-gold">My Moments of Light</Link></li>
            <li><Link to="/our-story" className="hover:text-gold">Our Story</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-4">Help</p>
          <ul className="space-y-2 text-sm text-ink-foreground/75">
            <li><Link to="/contact" className="hover:text-gold">Contact & policies</Link></li>
            <li><Link to="/privacy" className="hover:text-gold">Privacy</Link></li>
            <li><Link to="/terms" className="hover:text-gold">Terms</Link></li>
            <li><Link to="/admin" className="hover:text-gold">Owner login</Link></li>
          </ul>
          <div className="mt-6 flex gap-3">
            {[Instagram, Facebook, Music2].map((I, i) => (
              <a key={i} href="#" aria-label="Social link (to be added)" className="rounded-full border border-ink-foreground/30 p-2 hover:border-gold hover:text-gold">
                <I className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-ink-foreground/15 py-5 text-center text-xs text-ink-foreground/50">
        © {new Date().getFullYear()} KUSASA-ELIHLE Essential Candles · South Africa
      </div>
    </footer>
  );
}
