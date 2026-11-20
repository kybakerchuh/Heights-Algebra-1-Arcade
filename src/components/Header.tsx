import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export type ActivePage = 'games' | 'about' | 'manage';

interface HeaderProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
}

export function Header({ activePage, onNavigate }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (page: ActivePage) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0A0A0C]/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleNav('games')}
          className="font-display text-2xl font-extrabold tracking-tight text-[#F8F7F4] hover:text-[#F5B700] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B700] rounded-sm"
        >
          Heights Algebra 1 Arcade
        </button>

        {/* Primary Navigation Links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium"
        >
          <button
            type="button"
            onClick={() => handleNav('games')}
            className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B700] ${
              activePage === 'games'
                ? 'text-[#F5B700] border-[#F5B700]'
                : 'text-[#B3B1AA] border-transparent hover:text-[#F8F7F4] hover:border-white/30'
            }`}
          >
            Games
          </button>
          <button
            type="button"
            onClick={() => handleNav('about')}
            className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B700] ${
              activePage === 'about'
                ? 'text-[#F5B700] border-[#F5B700]'
                : 'text-[#B3B1AA] border-transparent hover:text-[#F8F7F4] hover:border-white/30'
            }`}
          >
            About Us
          </button>
          <button
            type="button"
            onClick={() => handleNav('manage')}
            className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B700] ${
              activePage === 'manage'
                ? 'text-[#F5B700] border-[#F5B700]'
                : 'text-[#B3B1AA] border-transparent hover:text-[#F8F7F4] hover:border-white/30'
            }`}
          >
            Teacher Portal
          </button>
          <a
            href="https://www.chuh.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="py-1 border-b-2 border-transparent text-[#B3B1AA] hover:text-[#F8F7F4] hover:border-white/30 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B700]"
          >
            CHUH.org
          </a>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-white/10 text-[#F8F7F4] hover:border-[#F5B700]/50 transition-colors cursor-pointer"
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#131317] px-4 py-4 space-y-2">
          <button
            type="button"
            onClick={() => handleNav('games')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              activePage === 'games'
                ? 'bg-[#F5B700]/15 text-[#F5B700]'
                : 'text-[#F8F7F4] hover:bg-white/5'
            }`}
          >
            Games
          </button>
          <button
            type="button"
            onClick={() => handleNav('about')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              activePage === 'about'
                ? 'bg-[#F5B700]/15 text-[#F5B700]'
                : 'text-[#F8F7F4] hover:bg-white/5'
            }`}
          >
            About Us
          </button>
          <button
            type="button"
            onClick={() => handleNav('manage')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              activePage === 'manage'
                ? 'bg-[#F5B700]/15 text-[#F5B700]'
                : 'text-[#F8F7F4] hover:bg-white/5'
            }`}
          >
            Teacher Portal
          </button>
          <a
            href="https://www.chuh.org/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileMenuOpen(false)}
            className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-[#B3B1AA] hover:text-[#F8F7F4] hover:bg-white/5 transition-colors"
          >
            CHUH.org
          </a>
        </div>
      )}
    </header>
  );
}
