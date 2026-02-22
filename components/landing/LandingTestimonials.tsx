const testimonials = [
  {
    quote:
      "We replaced a messy manual workflow and now ship comparison visuals the same day.",
    name: "Sarah Chen",
    role: "Product Designer",
  },
  {
    quote:
      "Client updates are easier to present because every before/after looks consistent.",
    name: "Marcus Rodriguez",
    role: "Freelance Developer",
  },
  {
    quote:
      "The browser-first processing made approval easy for our privacy and legal team.",
    name: "Nadia Patel",
    role: "Creative Operations Lead",
  },
]

export function LandingTestimonials() {
  return (
    <section id="reviews" className="border-b border-border scroll-mt-24">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 max-w-2xl">
          <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Reviews
          </p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Teams keep coming back because it stays simple.
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.name} className="rounded-xl border border-border bg-card p-5">
              <p className="mb-5 text-sm leading-relaxed text-muted-foreground">"{item.quote}"</p>
              <div>
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.role}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
