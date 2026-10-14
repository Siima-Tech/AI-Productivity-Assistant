import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-beige/60">
      <div className="absolute inset-0 bg-glow" />
      <div className="relative mx-auto max-w-4xl px-5 py-16 text-center animate-rise md:py-20">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 text-4xl md:text-6xl">{title}</h1>
        {children && <div className="mx-auto mt-4 max-w-2xl text-muted-foreground">{children}</div>}
      </div>
    </section>
  );
}
