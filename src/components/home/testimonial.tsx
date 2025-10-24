"use client";

export function Testimonial() {
  return (
    <section className="bg-background py-20 md:py-32">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <blockquote className="space-y-6">
          <p className="text-foreground text-2xl font-semibold md:text-3xl">
            "Love the simplicity of the service and the prompt customer support.
            We can't imagine working without it."
          </p>
          <footer className="space-y-2">
            <p className="text-primary font-semibold">Caitlyn King</p>
            <p className="text-foreground/70 text-sm">Head of Design, Layers</p>
            <div className="flex justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-accent">
                  ★
                </span>
              ))}
            </div>
          </footer>
        </blockquote>
      </div>
    </section>
  );
}
