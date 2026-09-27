import { useEffect, useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { FLAVORS, isFlavorId, type FlavorId } from '@/lib/palette';
import { applyTheme, preferredFlavor } from '@/lib/theme';

export default function ThemeSwitcher() {
  const [flavor, setFlavor] = useState<FlavorId | null>(null);

  useEffect(() => {
    const attr = document.documentElement.getAttribute('data-theme');
    setFlavor(isFlavorId(attr) ? attr : preferredFlavor());
  }, []);

  if (!flavor) return null;

  return (
    <ToggleGroup
      value={[flavor]}
      onValueChange={(values) => {
        if (values.length === 0) return;
        const next = values[0];
        if (!isFlavorId(next)) return;
        setFlavor(next);
        applyTheme(next);
      }}
      variant="outline"
      size="sm"
      aria-label="Tema (paleta Catppuccin)"
    >
      {FLAVORS.map((f) => (
        <ToggleGroupItem
          key={f.id}
          value={f.id}
          aria-label={`${f.label} — tema ${f.mode === 'light' ? 'claro' : 'escuro'}`}
          title={`${f.label} (${f.mode === 'light' ? 'claro' : 'escuro'})`}
          className="gap-1.5 px-2"
        >
          <span
            aria-hidden
            className="size-3 rounded-full border border-border/70"
            style={{ background: `linear-gradient(135deg, ${f.swatch[1]} 50%, ${f.swatch[2]} 50%)` }}
          />
          <span className="hidden md:inline">{f.label}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
