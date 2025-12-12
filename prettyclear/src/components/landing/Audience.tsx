import { User, Users, Rocket } from "lucide-react";

const audiences = [
  {
    icon: User,
    title: "Product Managers",
    description: "Stay in the loop without context-switching to code.",
    stat: "10x",
    statLabel: "faster understanding",
  },
  {
    icon: Users,
    title: "Business Leaders",
    description: "Oversee multiple teams with confidence.",
    stat: "5+",
    statLabel: "teams at once",
  },
  {
    icon: Rocket,
    title: "Founders",
    description: "Save engineers' time on shipping. Not endless explanation.",
    stat: "0",
    statLabel: "code required",
  },
];

const Audience = () => {
  return (
    <section className="py-32 md:py-40 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-card/30" />
      <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
      
      <div className="container px-6 relative z-10">
        {/* Section header */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary/50" />
            <p className="text-sm font-mono text-primary tracking-[0.3em] uppercase">
              Who It's For
            </p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary/50" />
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
            Made for
            <span className="text-gradient"> decision-makers</span>
          </h2>
        </div>

        {/* Audience cards */}
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {audiences.map((audience, index) => (
            <div
              key={index}
              className="group relative"
            >
              {/* Card */}
              <div className="relative h-full p-8 rounded-2xl bg-background border border-border hover:border-primary/30 transition-all duration-500 text-center">
                {/* Glow */}
                <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6 group-hover:bg-primary/20 group-hover:glow transition-all duration-300">
                    <audience.icon className="w-7 h-7 text-primary" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="font-display text-xl font-semibold mb-3">
                    {audience.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-muted-foreground mb-6">
                    {audience.description}
                  </p>
                  
                  {/* Stat */}
                  <div className="pt-6 border-t border-border">
                    <span className="font-display text-3xl font-bold text-gradient">
                      {audience.stat}
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">
                      {audience.statLabel}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Audience;
