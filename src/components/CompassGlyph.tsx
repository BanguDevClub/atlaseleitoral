import { candidateColor } from '@/lib/palette';

interface CompassGlyphProps {
  social: number;
  economic: number;
  size?: number;
  showAxis?: boolean;
}

/** Static compass mini-map. viewBox 0..100: x = economic −10..+10, y inverted (social +10 = top). */
export default function CompassGlyph({ social, economic, size = 88, showAxis = true }: CompassGlyphProps) {
  const x = ((economic + 10) / 20) * 100;
  const y = ((10 - social) / 20) * 100;
  const color = candidateColor(economic);

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className="shrink-0 rounded-lg border border-border"
      role="img"
      aria-label={`Compasso: social ${social}, econômico ${economic}`}
    >
      <rect x="0" y="0" width="100" height="100" fill="var(--ctp-mantle)"></rect>
      {showAxis && (
        <>
          <line x1="50" y1="4" x2="50" y2="96" stroke="var(--ctp-surface0)" strokeWidth="1.5"></line>
          <line x1="4" y1="50" x2="96" y2="50" stroke="var(--ctp-surface0)" strokeWidth="1.5"></line>
        </>
      )}
      <circle cx={x} cy={y} r="8" fill={color} fillOpacity="0.28"></circle>
      <circle cx={x} cy={y} r="4.6" fill={color} stroke="var(--ctp-base)" strokeWidth="1.4"></circle>
    </svg>
  );
}
