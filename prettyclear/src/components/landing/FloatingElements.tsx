const FloatingElements = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large pulsing gradient orbs - more visible */}
      <div className="absolute -top-20 -right-10 w-[600px] h-[600px] rounded-full bg-primary/20 blur-[80px] animate-float" />
      <div className="absolute -bottom-40 -left-20 w-[700px] h-[700px] rounded-full bg-primary/15 blur-[100px] animate-float-delayed" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full bg-primary/10 blur-[120px] animate-pulse-glow" />
      
      {/* Animated scanning line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent animate-scan-horizontal" />
      
      {/* Vertical beam lines - brighter */}
      <div className="absolute top-0 left-[30%] w-0.5 h-64 bg-gradient-to-b from-primary/50 via-primary/30 to-transparent animate-beam" />
      <div className="absolute top-0 left-[35%] w-px h-48 bg-gradient-to-b from-primary/40 to-transparent animate-beam" style={{ animationDelay: '0.5s' }} />
      <div className="absolute top-0 right-[25%] w-0.5 h-56 bg-gradient-to-b from-primary/50 via-primary/20 to-transparent animate-beam" style={{ animationDelay: '1s' }} />
      
      {/* Large rotating ring - center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px]">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-spin-slow" />
        <div className="absolute inset-8 rounded-full border border-dashed border-primary/15 animate-spin-reverse" />
        <div className="absolute inset-16 rounded-full border border-primary/10 animate-spin-slow" style={{ animationDuration: '40s' }} />
      </div>
      
      {/* Orbiting particles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] animate-spin-slow" style={{ animationDuration: '15s' }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary/80 blur-[2px] shadow-[0_0_20px_hsl(var(--primary)/0.8)]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary/60 blur-[1px]" />
      </div>
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] animate-spin-reverse" style={{ animationDuration: '12s' }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary/70 blur-[1px]" />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary/50" />
      </div>
      
      {/* Floating geometric shapes */}
      <div className="absolute top-24 right-[20%] w-20 h-20 border border-primary/30 rotate-45 animate-float" />
      <div className="absolute bottom-32 left-[15%] w-16 h-16 border border-primary/25 rotate-12 animate-float-delayed" />
      <div className="absolute top-1/3 left-[10%] w-12 h-12 border-2 border-primary/20 rounded-full animate-pulse-glow" />
      
      {/* Corner brackets - animated */}
      <div className="absolute top-12 left-12 w-24 h-24">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary/60 to-transparent animate-line-grow" />
        <div className="absolute top-0 left-0 h-full w-0.5 bg-gradient-to-b from-primary/60 to-transparent animate-line-grow" />
      </div>
      
      <div className="absolute top-12 right-12 w-24 h-24">
        <div className="absolute top-0 right-0 w-full h-0.5 bg-gradient-to-l from-primary/60 to-transparent animate-line-grow" style={{ animationDelay: '0.3s' }} />
        <div className="absolute top-0 right-0 h-full w-0.5 bg-gradient-to-b from-primary/60 to-transparent animate-line-grow" style={{ animationDelay: '0.3s' }} />
      </div>
      
      <div className="absolute bottom-12 left-12 w-24 h-24">
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary/60 to-transparent animate-line-grow" style={{ animationDelay: '0.6s' }} />
        <div className="absolute bottom-0 left-0 h-full w-0.5 bg-gradient-to-t from-primary/60 to-transparent animate-line-grow" style={{ animationDelay: '0.6s' }} />
      </div>
      
      <div className="absolute bottom-12 right-12 w-24 h-24">
        <div className="absolute bottom-0 right-0 w-full h-0.5 bg-gradient-to-l from-primary/60 to-transparent animate-line-grow" style={{ animationDelay: '0.9s' }} />
        <div className="absolute bottom-0 right-0 h-full w-0.5 bg-gradient-to-t from-primary/60 to-transparent animate-line-grow" style={{ animationDelay: '0.9s' }} />
      </div>
      
      {/* Animated dots grid */}
      <div className="absolute top-1/4 right-24 grid grid-cols-5 gap-4">
        {[...Array(25)].map((_, i) => (
          <div 
            key={i} 
            className="w-1.5 h-1.5 rounded-full bg-primary"
            style={{ 
              animation: `pulseGlow 2s ease-in-out ${i * 0.1}s infinite`,
              opacity: 0.2 + (i % 5) * 0.15
            }}
          />
        ))}
      </div>
      
      {/* Moving particles */}
      <div className="absolute top-1/4 left-1/4 w-1.5 h-1.5 rounded-full bg-primary/80 animate-drift" />
      <div className="absolute top-1/3 right-1/3 w-1 h-1 rounded-full bg-primary/60 animate-drift" style={{ animationDelay: '2s', animationDuration: '8s' }} />
      <div className="absolute bottom-1/3 left-1/2 w-2 h-2 rounded-full bg-primary/70 animate-drift" style={{ animationDelay: '4s', animationDuration: '10s' }} />
      
      {/* Glowing line segments */}
      <div className="absolute top-1/2 left-[5%] w-32 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-glow-line" />
      <div className="absolute top-2/3 right-[10%] w-40 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent animate-glow-line" style={{ animationDelay: '1.5s' }} />
    </div>
  );
};

export default FloatingElements;
