import { useState, type CSSProperties } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { candidateColor, quadrantOf, QUADRANTS } from '@/lib/palette';
import { formatScore } from '@/lib/format';
import { url } from '@/lib/base';

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
const PAD_TOP = 28;
const PAD_RIGHT = 28;
const PAD_BOTTOM = 56;
const PAD_LEFT = 56;
const PLOT_W = VIEW - PAD_LEFT - PAD_RIGHT;
const PLOT_H = VIEW - PAD_TOP - PAD_BOTTOM;

function gridLine(value: number, axis: 'x' | 'y') {
  const offset = ((value + 10) / 20) * (axis === 'x' ? PLOT_W : PLOT_H);
  return axis === 'x' ? PAD_LEFT + offset : PAD_TOP + offset;
}

export default function CompassMap({ candidates }: { candidates: CompassPoint[] }) {
  const [activeQuadrant, setActiveQuadrant] = useState<string>('all');
  const [hoveredCandidate, setHoveredCandidate] = useState<CompassPoint | null>(null);

  const filteredCandidates = candidates.filter((c) => {
    if (activeQuadrant === 'all') return true;
    const isLeft = c.economic < 0;
    const isAuth = c.social < 0;
    if (activeQuadrant === 'auth-left') return isAuth && isLeft;
    if (activeQuadrant === 'auth-right') return isAuth && !isLeft;
    if (activeQuadrant === 'lib-left') return !isAuth && isLeft;
    if (activeQuadrant === 'lib-right') return !isAuth && !isLeft;
    return true;
  });

  return (
    <TooltipProvider delay={100}>
      <div className="flex flex-col gap-5">
        {/* Quadrant Quick-Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setActiveQuadrant('all')}
            className={`rounded-full px-3 py-1 font-medium transition-all duration-200 ${
              activeQuadrant === 'all'
                ? 'bg-foreground text-background shadow-xs'
                : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            Todos ({candidates.length})
          </button>
          {QUADRANTS.map((quad) => {
            const count = candidates.filter((c) => {
              const isLeft = c.economic < 0;
              const isAuth = c.social < 0;
              if (quad.key === 'auth-left') return isAuth && isLeft;
              if (quad.key === 'auth-right') return isAuth && !isLeft;
              if (quad.key === 'lib-left') return !isAuth && isLeft;
              return !isAuth && !isLeft;
            }).length;

            return (
              <button
                key={quad.key}
                type="button"
                onClick={() => setActiveQuadrant((prev) => (prev === quad.key ? 'all' : quad.key))}
                className={`rounded-full px-3 py-1 font-medium transition-all duration-200 ${
                  activeQuadrant === quad.key
                    ? 'bg-ctp-mauve text-ctp-base shadow-xs'
                    : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {quad.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Live Coordinate Crosshair HUD */}
        <div className="flex min-h-7 items-center justify-center text-xs">
          {hoveredCandidate ? (
            <div className="inline-flex items-center gap-2.5 rounded-full border border-border/80 bg-card px-3.5 py-1 text-xs font-mono font-medium animate-fade-in text-foreground shadow-xs">
              <span className="font-bold text-sm text-foreground">{hoveredCandidate.ballotName}</span>
              <span className="text-muted-foreground/60">·</span>
              <span className="font-semibold text-primary">Social: {formatScore(hoveredCandidate.social)}</span>
              <span className="text-muted-foreground/60">·</span>
              <span className="font-semibold text-chart-1">Econômico: {formatScore(hoveredCandidate.economic)}</span>
            </div>
          ) : (
            <span className="text-muted-foreground/80 text-[11px]">
              Passe o cursor sobre qualquer candidato para inspecionar os eixos
            </span>
          )}
        </div>

        {/* Main Map Box */}
        <div className="relative mx-auto aspect-square w-full max-w-2xl">
          <svg
            viewBox={`0 0 ${VIEW} ${VIEW}`}
            className="absolute inset-0 size-full select-none"
            role="img"
            aria-label="Compasso político de dois eixos com os candidatos à Presidência"
          >
            <defs>
              {/* Subtle Quadrant Color Tints */}
              <linearGradient id="libLeftGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--ctp-red)" stopOpacity="0.08" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
              <linearGradient id="libRightGrad" x1="1" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--ctp-teal)" stopOpacity="0.08" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
              <linearGradient id="authLeftGrad" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--ctp-peach)" stopOpacity="0.08" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
              <linearGradient id="authRightGrad" x1="1" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="var(--ctp-blue)" stopOpacity="0.08" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>

            {/* Base Background */}
            <rect x={PAD_LEFT} y={PAD_TOP} width={PLOT_W} height={PLOT_H} fill="var(--card)" rx="8"></rect>

            {/* Quadrant Tints */}
            <rect x={PAD_LEFT} y={PAD_TOP} width={PLOT_W / 2} height={PLOT_H / 2} fill="url(#libLeftGrad)" />
            <rect x={PAD_LEFT + PLOT_W / 2} y={PAD_TOP} width={PLOT_W / 2} height={PLOT_H / 2} fill="url(#libRightGrad)" />
            <rect x={PAD_LEFT} y={PAD_TOP + PLOT_H / 2} width={PLOT_W / 2} height={PLOT_H / 2} fill="url(#authLeftGrad)" />
            <rect x={PAD_LEFT + PLOT_W / 2} y={PAD_TOP + PLOT_H / 2} width={PLOT_W / 2} height={PLOT_H / 2} fill="url(#authRightGrad)" />

            {/* Subtle Grid Guidelines */}
            {[-5, 5].map((v) => (
              <g key={`g-${v}`}>
                <line
                  x1={gridLine(v, 'x')}
                  y1={PAD_TOP}
                  x2={gridLine(v, 'x')}
                  y2={PAD_TOP + PLOT_H}
                  stroke="var(--border)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity="0.6"
                />
                <line
                  x1={PAD_LEFT}
                  y1={gridLine(v, 'y')}
                  x2={PAD_LEFT + PLOT_W}
                  y2={gridLine(v, 'y')}
                  stroke="var(--border)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity="0.6"
                />
              </g>
            ))}

            {/* Main Center Axes */}
            <line
              x1={gridLine(0, 'x')}
              y1={PAD_TOP}
              x2={gridLine(0, 'x')}
              y2={PAD_TOP + PLOT_H}
              stroke="var(--muted-foreground)"
              strokeWidth="1.5"
              opacity="0.6"
            />
            <line
              x1={PAD_LEFT}
              y1={gridLine(0, 'y')}
              x2={PAD_LEFT + PLOT_W}
              y2={gridLine(0, 'y')}
              stroke="var(--muted-foreground)"
              strokeWidth="1.5"
              opacity="0.6"
            />

            {/* Interactive Dynamic Crosshairs when a Candidate is Hovered */}
            {hoveredCandidate && (
              <g className="animate-fade-in">
                <line
                  x1={gridLine(hoveredCandidate.economic, 'x')}
                  y1={PAD_TOP}
                  x2={gridLine(hoveredCandidate.economic, 'x')}
                  y2={PAD_TOP + PLOT_H}
                  stroke="var(--ctp-mauve)"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  opacity="0.8"
                />
                <line
                  x1={PAD_LEFT}
                  y1={gridLine(10 - hoveredCandidate.social, 'y')}
                  x2={PAD_LEFT + PLOT_W}
                  y2={gridLine(10 - hoveredCandidate.social, 'y')}
                  stroke="var(--ctp-mauve)"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  opacity="0.8"
                />
              </g>
            )}

            {/* Outer Border */}
            <rect
              x={PAD_LEFT}
              y={PAD_TOP}
              width={PLOT_W}
              height={PLOT_H}
              fill="none"
              stroke="var(--border)"
              strokeWidth="1.5"
              rx="8"
            ></rect>

            {/* Quadrant Watermark Labels */}
            <text
              x={PAD_LEFT + 12}
              y={PAD_TOP + 18}
              className="fill-muted-foreground text-[9px] font-semibold tracking-wider uppercase opacity-75"
            >
              Libertário · Esquerda
            </text>
            <text
              x={PAD_LEFT + PLOT_W - 12}
              y={PAD_TOP + 18}
              textAnchor="end"
              className="fill-muted-foreground text-[9px] font-semibold tracking-wider uppercase opacity-75"
            >
              Libertário · Direita
            </text>
            <text
              x={PAD_LEFT + 12}
              y={PAD_TOP + PLOT_H - 12}
              className="fill-muted-foreground text-[9px] font-semibold tracking-wider uppercase opacity-75"
            >
              Autoritário · Esquerda
            </text>
            <text
              x={PAD_LEFT + PLOT_W - 12}
              y={PAD_TOP + PLOT_H - 12}
              textAnchor="end"
              className="fill-muted-foreground text-[9px] font-semibold tracking-wider uppercase opacity-75"
            >
              Autoritário · Direita
            </text>

            {/* Axis External Labels */}
            <text
              x={VIEW / 2}
              y={18}
              textAnchor="middle"
              className="fill-foreground text-[10px] font-bold tracking-wider uppercase"
            >
              ↑ Social Progressista
            </text>
            <text
              x={VIEW / 2}
              y={VIEW - 40}
              textAnchor="middle"
              className="fill-foreground text-[10px] font-bold tracking-wider uppercase"
            >
              ↓ Social Conservador
            </text>
            <text
              x={PAD_LEFT}
              y={VIEW - 24}
              className="fill-muted-foreground text-[9px] font-bold tracking-wider uppercase"
            >
              ← Estado / Regulação
            </text>
            <text
              x={VIEW - PAD_RIGHT}
              y={VIEW - 24}
              textAnchor="end"
              className="fill-muted-foreground text-[9px] font-bold tracking-wider uppercase"
            >
              Livre-Mercado →
            </text>
            <text
              x={VIEW / 2}
              y={VIEW - 8}
              textAnchor="middle"
              className="fill-muted-foreground text-[8px] font-mono tracking-widest uppercase opacity-75"
            >
              Eixo Econômico (−10 a +10) × Eixo Social (−10 a +10)
            </text>
          </svg>

          {/* Interactive Candidate Bubbles Layer */}
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
              const isFiltered = filteredCandidates.some((item) => item.id === c.id);
              const isHovered = hoveredCandidate?.id === c.id;

              return (
                <Tooltip key={c.id} open={isHovered}>
                  <TooltipTrigger
                    render={
                      <a
                        href={url(`/candidatos/${c.slug}`)}
                        aria-label={`Ficha de ${c.ballotName}, número ${c.number}`}
                        onMouseEnter={() => setHoveredCandidate(c)}
                        onMouseLeave={() => setHoveredCandidate(null)}
                        onFocus={() => setHoveredCandidate(c)}
                        onBlur={() => setHoveredCandidate(null)}
                        className={`absolute z-10 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 font-mono text-[11px] font-bold shadow-md transition-all duration-300 outline-none hover:z-30 hover:scale-125 focus-visible:z-30 focus-visible:scale-125 focus-visible:ring-2 focus-visible:ring-ring ${
                          isFiltered ? 'opacity-100' : 'opacity-20 scale-90 pointer-events-none'
                        } ${isHovered ? 'ring-4 ring-ctp-mauve/40 scale-125 z-30' : ''}`}
                        style={
                          {
                            left: `${((c.economic + 10) / 20) * 100}%`,
                            top: `${((10 - c.social) / 20) * 100}%`,
                            background: `color-mix(in oklch, ${color} 30%, var(--card))`,
                            borderColor: color,
                            color: 'var(--foreground)',
                          } satisfies CSSProperties
                        }
                      />
                    }
                  >
                    {c.number}
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    sideOffset={8}
                    className="p-3.5 shadow-2xl backdrop-blur-xl border border-border/90 bg-popover text-popover-foreground rounded-xl"
                  >
                    <div className="flex flex-col gap-1.5 text-xs min-w-[180px]">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-bold text-sm text-foreground">
                          {c.ballotName}
                        </span>
                        <span className="font-mono rounded-md bg-muted px-1.5 py-0.5 font-bold text-xs text-foreground border border-border/60">
                          nº {c.number}
                        </span>
                      </div>
                      <span className="text-muted-foreground font-medium text-[11px]">
                        {c.party} · {quadrant.label}
                      </span>
                      <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                        <span className="font-medium text-ctp-mauve">Social: {formatScore(c.social)}</span>
                        <span>·</span>
                        <span className="font-medium text-ctp-blue">Econ.: {formatScore(c.economic)}</span>
                      </div>
                      <span className="text-[10px] text-primary font-medium pt-1 flex items-center gap-1">
                        Clique para abrir a ficha completa →
                      </span>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-2 flex flex-col items-center gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="font-medium text-ctp-red">← Esquerda Econômica</span>
            <span
              className="h-2 w-48 rounded-full shadow-inner"
              style={{
                background: 'linear-gradient(to right, var(--ctp-red), var(--ctp-mauve), var(--ctp-blue))',
              }}
              aria-hidden
            />
            <span className="font-medium text-ctp-blue">Direita Econômica →</span>
          </div>
          <p className="text-center text-[11px]">
            O número de urna identifica cada candidatura; a cor indica a orientação econômica no espectro.
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}
