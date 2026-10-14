import { Link } from "@tanstack/react-router";
import { Heart, Menu, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Logo } from "./Logo";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop Candles" },
  { to: "/find-your-scent", label: "Find Your Scent" },
  { to: "/gifts", label: "Gifts" },
  { to: "/our-story", label: "Our Story" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const { count, wishlist } = useStore();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5">
        <Link to="/" aria-label="Kusasa-Elihle home">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm tracking-wide text-foreground/75 transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground font-medium" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <Link to="/moments" aria-label="My Moments of Light" className="relative rounded-full p-2.5 hover:bg-accent">
            <Heart className="h-5 w-5" />
            {wishlist.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 w-5 place-items-center rounded-full bg-gold text-[0.65rem] font-semibold text-gold-foreground">
                {wishlist.length}
              </span>
            )}
          </Link>
          <Link to="/cart" aria-label="Cart" className="relative rounded-full p-2.5 hover:bg-accent">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 w-5 place-items-center rounded-full bg-ink text-[0.65rem] font-semibold text-ink-foreground">
                {count}
              </span>
            )}
          </Link>
          <button className="rounded-full p-2.5 hover:bg-accent lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-border bg-background px-5 py-4 lg:hidden">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="block py-2.5 font-display text-xl">
              {n.label}
            </Link>
          ))}
          <Link to="/moments" onClick={() => setOpen(false)} className="block py-2.5 font-display text-xl">
            My Moments of Light
          </Link>
        </nav>
      )}
    </header>
  );
}
