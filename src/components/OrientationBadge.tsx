import { Badge } from '@/components/ui/badge';
import type { Orientation } from '@/lib/types';

export const ORIENTATION_COLOR: Record<Orientation, string> = {
  esquerda: 'var(--ctp-red)',
  'centro-esquerda': 'var(--ctp-maroon)',
  centro: 'var(--ctp-mauve)',
  'centro-direita': 'var(--ctp-sapphire)',
  direita: 'var(--ctp-blue)',
};

export default function OrientationBadge({ orientation }: { orientation: Orientation }) {
  const color = ORIENTATION_COLOR[orientation];
  return (
    <Badge
      variant="outline"
      style={{
        color,
        borderColor: `color-mix(in oklch, ${color} 45%, transparent)`,
        background: `color-mix(in oklch, ${color} 12%, transparent)`,
      }}
      className="font-medium"
    >
      {orientation}
    </Badge>
  );
}
