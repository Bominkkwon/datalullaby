import { AudioWaveform, Github, Info } from "lucide-react";
import { Link } from "wouter";

export function Header() {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-primary-foreground">
            <AudioWaveform className="w-5 h-5" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-foreground">
            Data<span className="text-primary">Lullaby</span>
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 ml-2 text-[10px] font-mono bg-muted text-muted-foreground border border-border rounded uppercase">
            Beta v0.9
          </span>
        </div>

        <nav className="flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Studio
          </Link>
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="w-5 h-5" />
          </a>
        </nav>
      </div>
    </header>
  );
}
