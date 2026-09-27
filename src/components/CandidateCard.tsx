import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import CompassGlyph from '@/components/CompassGlyph';
import { candidateColor, quadrantOf } from '@/lib/palette';
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
    <a href={`/candidatos/${candidate.slug}`} className="group block h-full">
      <Card className="h-full gap-4 transition-colors group-hover:border-ctp-blue/50">
        <CardHeader className="flex-row items-start gap-3 space-y-0">
          <Avatar className="size-12 border border-border">
            {candidate.photo && <AvatarImage src={candidate.photo} alt={`Foto de ${candidate.name}`} className="object-cover" />}
            <AvatarFallback className="bg-muted text-sm font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <p className="truncate font-heading text-base leading-tight font-semibold" title={candidate.name}>
                {candidate.ballotName}
              </p>
              <Badge variant="secondary" className="font-mono tabular-nums">
                {candidate.number}
              </Badge>
            </div>
            <p className="truncate text-xs text-muted-foreground" title={`${candidate.partyFullName} — ${candidate.name}`}>
              {candidate.party} · {candidate.name}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">{candidate.headline}</p>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="size-2.5 rounded-full" style={{ background: color }}></span>
              <span className="text-muted-foreground">{quadrant.label}</span>
            </div>
            <CompassGlyph social={candidate.compass.social} economic={candidate.compass.economic} size={44} showAxis={false} />
          </div>
        </CardContent>
        <CardFooter className="justify-between gap-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
          <span>{candidate.statements.length} declarações</span>
          <span>
            {candidate.scandals.length > 0 ? `${candidate.scandals.length} controvérsias` : 'sem controvérsias registradas'}
          </span>
        </CardFooter>
      </Card>
    </a>
  );
}
