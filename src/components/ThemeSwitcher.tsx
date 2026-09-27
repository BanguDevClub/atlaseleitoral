import { useEffect, useRef, useState } from 'react';
import { Sun, Moon, Palette, Check, ChevronDown } from 'lucide-react';
import { FLAVORS, isFlavorId, type FlavorId } from '@/lib/palette';
import { applyTheme, getCurrentFlavor, isDarkMode } from '@/lib/theme';

export default function ThemeSwitcher() {
  const [flavor, setFlavor] = useState<FlavorId | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFlavor(getCurrentFlavor());

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ flavor: FlavorId }>;
      if (customEvent.detail?.flavor) {
        setFlavor(customEvent.detail.flavor);
      }
    };

    window.addEventListener('atlas-theme-change', handleThemeChange);

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('atlas-theme-change', handleThemeChange);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!flavor) {
    return (
      <div className="flex h-8 w-20 items-center justify-center rounded-lg border border-border/50 bg-muted/40 animate-pulse" />
    );
  }

  const dark = isDarkMode(flavor);
  const currentFlavorObj = FLAVORS.find((f) => f.id === flavor) || FLAVORS[0];

  const handleToggleMode = () => {
    const next: FlavorId = dark ? 'light' : 'dark';
    setFlavor(next);
    applyTheme(next, true);
  };

  const handleSelectFlavor = (id: FlavorId) => {
    setFlavor(id);
    applyTheme(id, true);
    setMenuOpen(false);
  };

  const standardThemes = FLAVORS.filter((f) => f.category === 'standard');
  const catppuccinThemes = FLAVORS.filter((f) => f.category === 'catppuccin');

  return (
    <div className="relative inline-flex items-center gap-1.5" ref={menuRef}>
      {/* Quick Light/Dark Toggle Button */}
      <button
        type="button"
        onClick={handleToggleMode}
        aria-label={dark ? 'Mudar para tema claro padrão' : 'Mudar para tema escuro padrão'}
        title={dark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
        className="group relative flex size-8 items-center justify-center rounded-lg border border-border/70 bg-card text-foreground transition-all duration-200 hover:border-ctp-mauve/50 hover:bg-muted/80 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="relative size-4">
          <Sun
            className={`absolute inset-0 size-4 transition-all duration-300 ${
              dark
                ? 'rotate-90 scale-0 opacity-0'
                : 'rotate-0 scale-100 opacity-100 text-amber-500'
            }`}
          />
          <Moon
            className={`absolute inset-0 size-4 transition-all duration-300 ${
              dark
                ? 'rotate-0 scale-100 opacity-100 text-indigo-400'
                : '-rotate-90 scale-0 opacity-0'
            }`}
          />
        </div>
      </button>

      {/* Flavor Palette Menu Trigger */}
      <button
        type="button"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-label="Selecionar paleta de cores e temas"
        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border/70 bg-card px-2 text-xs font-medium text-foreground transition-all duration-200 hover:border-ctp-mauve/50 hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span
          className="size-2.5 rounded-full border border-border/60 transition-transform group-hover:scale-110"
          style={{
            background: `linear-gradient(135deg, ${currentFlavorObj.swatch[1]} 50%, ${currentFlavorObj.swatch[2]} 50%)`,
          }}
          aria-hidden
        />
        <span className="hidden sm:inline font-medium">
          {currentFlavorObj.label.replace(' (Padrão)', '').replace('Catppuccin ', '')}
        </span>
        <ChevronDown
          className={`size-3 text-muted-foreground transition-transform duration-200 ${
            menuOpen ? 'rotate-180' : ''
          }`}
          aria-hidden
        />
      </button>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div
          role="menu"
          aria-label="Temas e paletas"
          className="absolute right-0 top-full z-50 mt-2 w-56 origin-top-right rounded-xl border border-border/70 bg-card/95 p-1.5 shadow-xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95"
        >
          {/* Standard Themes Section */}
          <div className="px-2 py-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            Padrão
          </div>

          <div className="space-y-0.5">
            {standardThemes.map((f) => {
              const isSelected = f.id === flavor;
              const isLight = f.mode === 'light';

              return (
                <button
                  key={f.id}
                  type="button"
                  role="menuitem"
                  onClick={() => handleSelectFlavor(f.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="size-3.5 rounded-full border border-border/60 shadow-xs"
                      style={{
                        background: `linear-gradient(135deg, ${f.swatch[1]} 50%, ${f.swatch[2]} 50%)`,
                      }}
                      aria-hidden
                    />
                    <div className="text-left">
                      <div className="font-medium text-foreground">{f.label}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {isLight ? 'Modo claro neutro' : 'Modo escuro neutro'}
                      </div>
                    </div>
                  </div>

                  {isSelected && <Check className="size-3.5 text-primary" />}
                </button>
              );
            })}
          </div>

          {/* Catppuccin Themes Section */}
          <div className="mt-2 border-t border-border/60 pt-1.5 px-2 py-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            Catppuccin
          </div>

          <div className="space-y-0.5">
            {catppuccinThemes.map((f) => {
              const isSelected = f.id === flavor;
              const isLight = f.mode === 'light';

              return (
                <button
                  key={f.id}
                  type="button"
                  role="menuitem"
                  onClick={() => handleSelectFlavor(f.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="size-3.5 rounded-full border border-border/60 shadow-xs"
                      style={{
                        background: `linear-gradient(135deg, ${f.swatch[1]} 50%, ${f.swatch[2]} 50%)`,
                      }}
                      aria-hidden
                    />
                    <div className="text-left">
                      <div className="font-medium text-foreground">{f.label}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {isLight ? 'Catppuccin claro' : 'Catppuccin escuro'}
                      </div>
                    </div>
                  </div>

                  {isSelected && <Check className="size-3.5 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
