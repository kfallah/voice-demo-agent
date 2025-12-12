import { Shield, Cpu, MessageSquare } from "lucide-react";

const pillars = [
  { icon: Shield, label: "Accurate" },
  { icon: Cpu, label: "Contextual" },
  { icon: MessageSquare, label: "Trustworthy" },
];

const WhyItWorks = () => {
  return (
    <section className="py-32 md:py-40 relative overflow-hidden">
      <div className="container px-6">
        <div className="max-w-4xl mx-auto">
          {/* Section header */}
          <div className="flex items-center justify-center gap-4 mb-16">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary/50" />
            <p className="text-sm font-mono text-primary tracking-[0.3em] uppercase">
              Why This Works
            </p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary/50" />
          </div>

          {/* Content card */}
          <div className="relative">
            {/* Gradient border */}
            <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-primary/50 via-accent/30 to-primary/50 opacity-50" />
            
            <div className="relative p-10 md:p-16 rounded-3xl bg-background">
              {/* Mesh background */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-mesh opacity-50" />
              
              <div className="relative z-10 text-center">
                <p className="font-display text-2xl md:text-4xl font-semibold mb-6 leading-relaxed">
                  This isn't a <span className="text-muted-foreground line-through decoration-primary/50">static summary</span>.
                </p>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-12 max-w-2xl mx-auto">
                It's an <span className="text-foreground font-medium">agent that demos new features</span>—and talks to you about it. Grounded in the actual pull request, so answers stay accurate, contextual, and trustworthy.
              </p>

                {/* Trust pillars */}
                <div className="flex flex-wrap justify-center gap-6">
                  {pillars.map((pillar, index) => (
                    <div 
                      key={index}
                      className="group flex items-center gap-3 px-6 py-3 rounded-full glass hover:border-primary/50 transition-all duration-300"
                    >
                      <pillar.icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-300" />
                      <span className="font-medium">{pillar.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyItWorks;
