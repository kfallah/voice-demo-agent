const Footer = () => {
  return (
    <footer className="py-16 border-t border-border relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-20" />
      
      <div className="container px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-[10px]">PR</span>
            </div>
            <span className="font-display font-medium">
              <span className="font-bold">PR</span>etty Clear
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground font-mono">
            © {new Date().getFullYear()} PRetty Clear
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
