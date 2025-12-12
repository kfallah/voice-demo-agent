const Problem = () => {
  return (
    <section className="py-32 md:py-40 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
      
      <div className="container px-6">
        <div className="max-w-4xl mx-auto">
          {/* Section label */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary/50" />
            <p className="text-sm font-mono text-primary tracking-[0.3em] uppercase">
              The Problem
            </p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary/50" />
          </div>

          {/* Main statement */}
          <div className="text-center space-y-6">
            <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
              <span className="block">Shipping is</span>
              <span className="text-gradient">fast.</span>
            </h2>
            <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-muted-foreground/60">
              <span className="block">Product understanding</span>
              <span className="block">isn't.</span>
            </h2>
          </div>

          {/* Description */}
          <p className="text-center text-lg md:text-xl text-muted-foreground leading-relaxed mt-12 max-w-2xl mx-auto">
            Pull requests are written for engineers—
            <br className="hidden md:block" />
            <span className="text-foreground/80">not for people making business decisions.</span>
          </p>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-border to-transparent" />
    </section>
  );
};

export default Problem;
