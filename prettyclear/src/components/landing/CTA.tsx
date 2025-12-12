import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-32 md:py-40 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute inset-0 bg-gradient-mesh" />
      
      {/* Animated orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-accent/10 blur-3xl animate-float-delayed" />
      
      <div className="container px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass mb-10 animate-pulse-glow">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          
          {/* Headline */}
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
            See your last feature—
            <br />
            <span className="text-gradient">explained.</span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-xl mx-auto">
            Join the waitlist and be among the first to experience a new way of understanding your product.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="xl">
              Request Early Access
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Trust text */}
          <p className="mt-10 text-sm text-muted-foreground font-mono">
            ✦ No credit card required • ✦ Free during early access
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;
