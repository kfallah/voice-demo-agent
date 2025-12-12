import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { lazy, Suspense } from "react";

const HeroScene = lazy(() => import("./HeroScene"));

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute inset-0 bg-gradient-mesh" />
      
      {/* 3D Scene */}
      <Suspense fallback={<div className="absolute inset-0 bg-background" />}>
        <HeroScene />
      </Suspense>
      
      {/* Grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />
      
      {/* Content */}
      <div className="container relative z-10 px-6 py-24 md:py-32">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="animate-fade-up mb-10">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-mono text-primary tracking-wide">
              <Sparkles className="w-4 h-4" />
              <span>Early Access Now Open</span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            </span>
          </div>

          {/* Headline */}
          <h1 className="animate-fade-up-delay-1 font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-8">
            <span className="block">Understand what</span>
            <span className="block mt-2">
              <span className="text-gradient">shipped.</span>
            </span>
            <span className="block text-muted-foreground/80 text-4xl md:text-5xl lg:text-6xl mt-4 font-medium">
              Without reading code.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="animate-fade-up-delay-2 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            Turn complex pull requests into clear, explorable product explanations.
          </p>

          {/* CTA */}
          <div className="animate-fade-up-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="xl">
              Request Early Access
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="group">
              <span>See how it works</span>
              <span className="ml-2 text-primary group-hover:translate-x-1 transition-transform">→</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-up-delay-4">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
          <div className="w-1 h-2 rounded-full bg-primary animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
