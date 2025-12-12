import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-4 mt-4">
        <div className="glass rounded-2xl">
          <div className="container px-6">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-xs">PR</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-primary/70 blur-lg opacity-50" />
              </div>
              <span className="font-display font-semibold text-lg tracking-tight">
                <span className="font-bold">PR</span>etty Clear
              </span>
              </div>

              {/* CTA */}
              <Button variant="cta" size="sm" className="rounded-xl">
                Request Access
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
