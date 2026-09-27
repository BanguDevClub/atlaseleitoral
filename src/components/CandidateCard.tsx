import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import CompassGlyph from '@/components/CompassGlyph';
import { candidateColor, quadrantOf } from '@/lib/palette';
import { url } from '@/lib/base';
import type { Candidate } from '@/lib/types';

export default function CandidateCard({ candidate }: { candidate: Candidate }) {
  const color = candidateColor(candidate.compass.economic);
  const quadrant = quadrantOf(candidate.compass.social, candidate.compass.economic);
  const initials = candidate.ballotName
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 2)
    .join('');

  return (
    <a href={url(`/candidatos/${candidate.slug}`)} className="group block h-full outline-none">
      <Card className="relative h-full gap-4 overflow-hidden rounded-2xl border border-border/70 bg-card transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:border-ctp-mauve/40 group-hover:shadow-xl group-hover:shadow-black/5 dark:group-hover:shadow-black/30 group-focus-visible:ring-2 group-focus-visible:ring-ring">
        {/* Subtle Spectrum Color Accent Line */}
        <div
          className="absolute inset-x-0 top-0 h-1 transition-opacity duration-300 opacity-80 group-hover:opacity-100"
          style={{ background: color }}
          aria-hidden="true"
        />

        <CardHeader className="flex-row items-start gap-3.5 space-y-0 pt-5">
          <Avatar className="size-13 shrink-0 rounded-xl border border-border/80 shadow-xs transition-transform duration-300 group-hover:scale-105">
            {candidate.photo && (
              <AvatarImage
                src={candidate.photo}
                alt={`Foto de ${candidate.name}`}
                className="object-cover"
              />
            )}
            <AvatarFallback className="bg-muted font-heading text-sm font-bold text-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <p
                className="truncate font-heading text-base font-bold leading-tight text-foreground transition-colors group-hover:text-ctp-mauve"
                title={candidate.name}
              >
                {candidate.ballotName}
              </p>
              <Badge variant="secondary" className="font-mono text-xs font-bold tabular-nums shrink-0">
                nº {candidate.number}
              </Badge>
            </div>
            <p
              className="truncate text-xs font-medium text-muted-foreground"
              title={`${candidate.partyFullName} — ${candidate.name}`}
            >
              <span className="font-semibold text-foreground/80">{candidate.party}</span> · {candidate.name}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-3.5">
          <p className="line-clamp-2 min-h-10 text-xs leading-relaxed text-muted-foreground">
            {candidate.headline}
          </p>

          <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 p-2.5">
            <div className="flex items-center gap-2 text-xs">
              <span
                className="size-2.5 rounded-full shrink-0 shadow-xs"
                style={{ background: color }}
              />
              <span className="font-medium text-foreground/80 text-[11px] truncate">
                {quadrant.label}
              </span>
            </div>
            <div className="shrink-0">
              <CompassGlyph
                social={candidate.compass.social}
                economic={candidate.compass.economic}
                size={42}
                showAxis={false}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="justify-between gap-2 border-t border-border/60 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
          <span className="truncate">{candidate.statements.length} declarações citadas</span>
          <span className="font-medium text-foreground/70 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-ctp-mauve shrink-0">
            Ver ficha →
          </span>
        </CardFooter>
      </Card>
    </a>
  );
}
