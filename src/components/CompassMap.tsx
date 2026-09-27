import type { CSSProperties } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { candidateColor, quadrantOf } from '@/lib/palette';
import { formatScore } from '@/lib/format';

export interface CompassPoint {
  id: string;
  slug: string;
  ballotName: string;
  party: string;
  number: number;
  social: number;
  economic: number;
}

const VIEW = 460;
const PAD_TOP = 24;
const PAD_RIGHT = 24;
const PAD_BOTTOM = 54;
const PAD_LEFT = 54;
const PLOT_W = VIEW - PAD_LEFT - PAD_RIGHT;
const PLOT_H = VIEW - PAD_TOP - PAD_BOTTOM;

function gridLine(value: number, axis: 'x' | 'y') {
  const offset = ((value + 10) / 20) * (axis === 'x' ? PLOT_W : PLOT_H);
  return axis === 'x' ? PAD_LEFT + offset : PAD_TOP + offset;
}

export default function CompassMap({ candidates }: { candidates: CompassPoint[] }) {
  return (
    <TooltipProvider delay={200}>
      <div className="relative mx-auto aspect-square w-full max-w-2xl">
        <svg
          viewBox={`0 0 ${VIEW} ${VIEW}`}
          className="absolute inset-0 size-full"
          role="img"
          aria-label="Compasso político de dois eixos com os candidatos à Presidência"
        >
          <rect x={PAD_LEFT} y={PAD_TOP} width={PLOT_W} height={PLOT_H} fill="var(--ctp-mantle)" rx="4"></rect>

          {[-5, 5].map((v) => (
            <g key={`g-${v}`}>
              <line
                x1={gridLine(v, 'x')}
                y1={PAD_TOP}
                x2={gridLine(v, 'x')}
                y2={PAD_TOP + PLOT_H}
                stroke="var(--ctp-surface0)"
                strokeWidth="1"
                strokeDasharray="3 3"
              ></line>
              <line
                x1={PAD_LEFT}
                y1={gridLine(v, 'y')}
                x2={PAD_LEFT + PLOT_W}
                y2={gridLine(v, 'y')}
                stroke="var(--ctp-surface0)"
                strokeWidth="1"
                strokeDasharray="3 3"
              ></line>
            </g>
          ))}
          <line x1={gridLine(0, 'x')} y1={PAD_TOP} x2={gridLine(0, 'x')} y2={PAD_TOP + PLOT_H} stroke="var(--ctp-overlay0)" strokeWidth="1.5"></line>
          <line x1={PAD_LEFT} y1={gridLine(0, 'y')} x2={PAD_LEFT + PLOT_W} y2={gridLine(0, 'y')} stroke="var(--ctp-overlay0)" strokeWidth="1.5"></line>
          <rect
            x={PAD_LEFT}
            y={PAD_TOP}
            width={PLOT_W}
            height={PLOT_H}
            fill="none"
            stroke="var(--ctp-surface1)"
            strokeWidth="1"
            rx="4"
          ></rect>

          {/* quadrant labels */}
          <text x={PAD_LEFT + 8} y={PAD_TOP + 14} className="fill-ctp-overlay1 text-[9px] font-medium tracking-[0.08em] uppercase">
            Libertário · Esquerda
          </text>
          <text
            x={PAD_LEFT + PLOT_W - 8}
            y={PAD_TOP + 14}
            textAnchor="end"
            className="fill-ctp-overlay1 text-[9px] font-medium tracking-[0.08em] uppercase"
          >
            Libertário · Direita
          </text>
          <text x={PAD_LEFT + 8} y={PAD_TOP + PLOT_H - 8} className="fill-ctp-overlay1 text-[9px] font-medium tracking-[0.08em] uppercase">
            Autoritário · Esquerda
          </text>
          <text
            x={PAD_LEFT + PLOT_W - 8}
            y={PAD_TOP + PLOT_H - 8}
            textAnchor="end"
            className="fill-ctp-overlay1 text-[9px] font-medium tracking-[0.08em] uppercase"
          >
            Autoritário · Direita
          </text>

          {/* axis labels */}
          <text x={VIEW / 2} y={15} textAnchor="middle" className="fill-ctp-overlay0 text-[10px] font-medium tracking-wider uppercase">
            ↑ Progressista
          </text>
          <text x={PAD_LEFT} y={VIEW - 38} className="fill-ctp-overlay0 text-[10px] font-medium tracking-wider uppercase">
            ← Estatista
          </text>
          <text x={VIEW - PAD_RIGHT} y={VIEW - 38} textAnchor="end" className="fill-ctp-overlay0 text-[10px] font-medium tracking-wider uppercase">
            Livre-mercado →
          </text>
          <text x={VIEW / 2} y={VIEW - 38} textAnchor="middle" className="fill-ctp-overlay0 text-[10px] font-medium tracking-wider uppercase">
            ↓ Conservador
          </text>
          <text
            x={VIEW / 2}
            y={VIEW - 14}
            textAnchor="middle"
            className="fill-ctp-overlay0 text-[9px] tracking-[0.18em] uppercase"
          >
            Eixo econômico (−10 · 0 · +10) — eixo social
          </text>
        </svg>

        <div
          className="absolute"
          style={
            {
              left: `${(PAD_LEFT / VIEW) * 100}%`,
              right: `${(PAD_RIGHT / VIEW) * 100}%`,
              top: `${(PAD_TOP / VIEW) * 100}%`,
              bottom: `${(PAD_BOTTOM / VIEW) * 100}%`,
            } satisfies CSSProperties
          }
        >
          {candidates.map((c) => {
            const color = candidateColor(c.economic);
            const quadrant = quadrantOf(c.social, c.economic);
            return (
              <Tooltip key={c.id}>
                <TooltipTrigger
                  render={
                    <a
                      href={`/candidatos/${c.slug}`}
                      aria-label={`Ficha de ${c.ballotName}, número ${c.number}`}
                      className="absolute z-10 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 font-mono text-[11px] font-semibold shadow-sm transition-transform outline-none hover:z-20 hover:scale-110 focus-visible:z-20 focus-visible:scale-110 focus-visible:ring-2 focus-visible:ring-ring"
                      style={
                        {
                          left: `${((c.economic + 10) / 20) * 100}%`,
                          top: `${((10 - c.social) / 20) * 100}%`,
                          background: `color-mix(in oklch, ${color} 35%, var(--ctp-card))`,
                          borderColor: color,
                          color: 'var(--ctp-card-foreground)',
                        } satisfies CSSProperties
                      }
                    />
                  }
                >
                  {c.number}
                </TooltipTrigger>
                <TooltipContent side="top">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">
                      {c.ballotName} · {c.party}
                    </span>
                    <span className="opacity-80">
                      Nº {c.number} — {quadrant.label}
                    </span>
                    <span className="font-mono opacity-80">
                      social {formatScore(c.social)} · econômico {formatScore(c.economic)}
                    </span>
                    <span className="opacity-60">clique para abrir a ficha</span>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center gap-1.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span>Esquerda econômica</span>
          <span
            className="h-2 w-40 rounded-full"
            style={{ background: 'linear-gradient(to right, var(--ctp-red), var(--ctp-mauve), var(--ctp-blue))' }}
            aria-hidden
          />
          <span>Direita econômica</span>
        </div>
        <p>Cada bolha mostra o número de urna; a cor segue o eixo econômico. Clique para abrir a ficha do candidato.</p>
      </div>
    </TooltipProvider>
  );
}
