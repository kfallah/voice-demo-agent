import { GitPullRequest, MessageSquareText, MessagesSquare } from "lucide-react";

const steps = [
  {
    icon: GitPullRequest,
    number: "01",
    title: "A feature ships",
    description: "Our agent analyzes the pull request.",
    color: "primary",
  },
  {
    icon: MessageSquareText,
    number: "02",
    title: "PMs and leaders get a demo link",
    description: "Agent demos new features and changes.",
    color: "accent",
  },
  {
    icon: MessagesSquare,
    number: "03",
    title: "Talk to the agent to get a personalized understanding",
    description: "It explains in plain language. Without code.",
    color: "primary",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-32 md:py-40 relative overflow-hidden">
      {/* Background mesh */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-50" />
      
      <div className="container px-6 relative z-10">
        {/* Section header */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary/50" />
            <p className="text-sm font-mono text-primary tracking-[0.3em] uppercase">
              How It Works
            </p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary/50" />
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
            From code to clarity
            <br />
            <span className="text-muted-foreground">in seconds</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div 
                key={index}
                className="group relative"
              >
                {/* Card */}
                <div className="relative p-8 rounded-2xl glass hover:border-primary/30 transition-all duration-500 h-full">
                  {/* Glow on hover */}
                  <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl ${step.color === 'primary' ? 'bg-primary/10' : 'bg-accent/10'}`} />
                  
                  <div className="relative z-10">
                    {/* Number */}
                    <span className="font-mono text-xs text-muted-foreground tracking-wider">
                      {step.number}
                    </span>
                    
                    {/* Icon */}
                    <div className={`mt-4 mb-6 w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      step.color === 'primary' 
                        ? 'bg-primary/10 group-hover:bg-primary/20 group-hover:glow' 
                        : 'bg-primary/10 group-hover:bg-primary/20 group-hover:glow-soft'
                    }`}>
                      <step.icon className="w-6 h-6 text-primary" />
                    </div>

                    {/* Content */}
                    <h3 className="font-display text-xl font-semibold mb-3 group-hover:text-gradient transition-all duration-300">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-border to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
