import { Eye, Zap, MessageCircle, Presentation } from "lucide-react";

const features = [
  {
    icon: Eye,
    title: "See exactly what changed",
    description: "Get a clear view of every modification without diving into diffs.",
  },
  {
    icon: Zap,
    title: "Save engineering time",
    description: "Save engineer's time on valuable tasks.",
  },
  {
    icon: MessageCircle,
    title: "Ask follow-up questions naturally",
    description: "Have a conversation in plain English to go deeper.",
  },
  {
    icon: Presentation,
    title: "Explain with confidence",
    description: "Brief stakeholders accurately without technical jargon.",
  },
];

const Features = () => {
  return (
    <section className="py-32 md:py-40 relative">
      <div className="container px-6">
        {/* Section header */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary/50" />
            <p className="text-sm font-mono text-primary tracking-[0.3em] uppercase">
              Capabilities
            </p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary/50" />
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
            Built for
            <span className="text-gradient"> product thinking</span>
          </h2>
        </div>

        {/* Features grid */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-8 rounded-2xl glass hover:border-primary/30 transition-all duration-500"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10 flex items-start gap-6">
                {/* Icon */}
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:glow-cyan transition-all duration-300">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <h3 className="font-display text-xl font-semibold mb-2 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Arrow indicator */}
                <div className="hidden md:flex opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
                  <span className="text-primary text-2xl">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
