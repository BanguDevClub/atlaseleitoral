import { useState, type ReactNode } from 'react';
import { cn } from 'cn';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import CompassGlyph from '@/components/CompassGlyph';
import OrientationBadge from '@/components/OrientationBadge';
import SourceChip from '@/components/SourceChip';
import { candidateColor, quadrantOf } from '@/lib/palette';
import { formatScore } from '@/lib/format';
import type { Candidate, KeyPosition } from '@/lib/types';

export interface CompareCandidate {
  id: string;
  slug: string;
  ballotName: string;
  name: string;
  party: string;
  partyFullName: string;
  number: number;
  photo: string | null;
  vice: { name: string; party: string };
  coalition: string | null;
  age: number;
  occupation: string;
  headline: string;
  compass: Candidate['compass'];
  keyPositions: KeyPosition[];
  statementCount: number;
  scandalTitles: string[];
}

const TOPICS = [
  'Economia e tributos',
  'Trabalho e renda',
  'Segurança pública',
  'Saúde',
  'Educação',
  'Meio ambiente',
  'Democracia e instituições',
  'Política externa',
  'Direitos sociais',
];

const MAX_SELECTED = 4;

export function forComparison(candidate: Candidate): CompareCandidate {
  return {
    id: candidate.id,
    slug: candidate.slug,
    ballotName: candidate.ballotName,
    name: candidate.name,
    party: candidate.party,
    partyFullName: candidate.partyFullName,
    number: candidate.number,
    photo: candidate.photo,
    vice: candidate.vice,
    coalition: candidate.coalition,
    age: candidate.age,
    occupation: candidate.occupation,
    headline: candidate.headline,
    compass: candidate.compass,
    keyPositions: candidate.keyPositions,
    statementCount: candidate.statements.length,
    scandalTitles: candidate.scandals.map((scandal) => scandal.title),
  };
}

function PositionCell({ position }: { position: KeyPosition | undefined }) {
  if (!position) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="flex flex-col gap-2">
      <OrientationBadge orientation={position.orientation} />
      <p className="text-sm leading-snug">{position.stance}</p>
      <div className="flex flex-wrap gap-1.5">
        {position.sources.map((source) => (
          <SourceChip key={source.url} source={source} />
        ))}
      </div>
    </div>
  );
}

export default function CompareTool({ candidates }: { candidates: CompareCandidate[] }) {
  const [selected, setSelected] = useState<string[]>(() => {
    const defaults = ['lula', 'flavio-bolsonaro'].filter((id) => candidates.some((c) => c.id === id));
    return defaults.length >= 2 ? defaults : candidates.slice(0, 2).map((c) => c.id);
  });

  const chosen = selected
    .map((id) => candidates.find((c) => c.id === id))
    .filter((c): c is CompareCandidate => Boolean(c));

  const cellClass = (index: number) => cn('border-t border-border/60 p-3 align-top', index % 2 === 1 && 'bg-muted/30');

  const renderRow = (label: string, cells: ReactNode[], rowIndex: number) => (
    <div key={label} className="contents">
      <div className={cn(cellClass(rowIndex), 'text-xs font-medium tracking-wide text-muted-foreground uppercase')}>
        {label}
      </div>
      {cells.map((cell, i) => (
        <div key={`${label}-${i}`} className={cellClass(rowIndex)}>
          {cell}
        </div>
      ))}
    </div>
  );

  const rows: { label: string; cells: ReactNode[] }[] = [
    {
      label: 'Compasso político',
      cells: chosen.map((c) => (
        <div key={c.id} className="flex flex-col gap-2">
          <CompassGlyph social={c.compass.social} economic={c.compass.economic} size={72} />
          <p className="font-mono text-xs text-muted-foreground">
            social {formatScore(c.compass.social)} · econ. {formatScore(c.compass.economic)}
          </p>
          <p className="text-xs">{quadrantOf(c.compass.social, c.compass.economic).label}</p>
        </div>
      )),
    },
    {
      label: 'Partido',
      cells: chosen.map((c) => (
        <div key={c.id} className="flex flex-col gap-1 text-sm">
          <span className="font-medium">
            {c.party} — {c.partyFullName}
          </span>
          {c.coalition && <span className="text-xs text-muted-foreground">Coligação: {c.coalition}</span>}
        </div>
      )),
    },
    {
      label: 'Chapa',
      cells: chosen.map((c) => (
        <div key={c.id} className="flex flex-col gap-1 text-sm">
          <span>Vice: {c.vice.name} ({c.vice.party})</span>
          <span className="text-xs text-muted-foreground">Nº de urna {c.number}</span>
        </div>
      )),
    },
    {
      label: 'Perfil',
      cells: chosen.map((c) => (
        <div key={c.id} className="flex flex-col gap-1 text-sm">
          <span>{c.age} anos · {c.occupation}</span>
          <span className="text-xs text-muted-foreground">{c.headline}</span>
        </div>
      )),
    },
    ...TOPICS.map((topic) => ({
      label: topic,
      cells: chosen.map((c) => <PositionCell key={c.id} position={c.keyPositions.find((p) => p.topic === topic)} />),
    })),
    {
      label: 'Declarações documentadas',
      cells: chosen.map((c) => (
        <span key={c.id} className="font-mono text-sm tabular-nums">
          {c.statementCount}
        </span>
      )),
    },
    {
      label: 'Controvérsias registradas',
      cells: chosen.map((c) =>
        c.scandalTitles.length === 0 ? (
          <span key={c.id} className="text-sm text-muted-foreground">
            Nenhuma documentada
          </span>
        ) : (
          <ul key={c.id} className="flex list-disc flex-col gap-1 pl-4 text-sm">
            {c.scandalTitles.map((title) => (
              <li key={title}>{title}</li>
            ))}
          </ul>
        ),
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <ToggleGroup
          multiple
          value={selected}
          onValueChange={(values) => {
            if (values.length > MAX_SELECTED || values.length === 0) return;
            setSelected(values);
          }}
          variant="outline"
          size="sm"
          className="flex-wrap"
          aria-label="Selecionar candidatos para comparação"
        >
          {candidates.map((c) => (
            <ToggleGroupItem
              key={c.id}
              value={c.id}
              disabled={!selected.includes(c.id) && selected.length >= MAX_SELECTED}
            >
              <span
                aria-hidden
                className="size-2 rounded-full"
                style={{ background: candidateColor(c.compass.economic) }}
              />
              {c.ballotName}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <p className="text-xs text-muted-foreground">
          Escolha de 2 a {MAX_SELECTED} candidatos — a comparação inclui posições, compasso e controvérsias com fontes.
        </p>
      </div>

      {chosen.length < 2 ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Selecione ao menos dois candidatos para montar a comparação.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <div
            className="grid min-w-[820px]"
            style={{ gridTemplateColumns: `150px repeat(${chosen.length}, minmax(200px, 1fr))` }}
          >
            <div className="bg-muted/50 p-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Candidato
            </div>
            {chosen.map((c) => (
              <div key={c.id} className="bg-muted/50 p-3">
                <div className="flex items-center gap-2.5">
                  <Avatar className="size-10 border border-border">
                    {c.photo && <AvatarImage src={c.photo} alt={`Foto de ${c.ballotName}`} className="object-cover" />}
                    <AvatarFallback className="bg-background text-xs font-semibold">
                      {c.ballotName
                        .split(/\s+/)
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-heading text-sm font-semibold" title={c.name}>
                      {c.ballotName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {c.party} · nº {c.number}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {rows.map((row, rowIndex) => renderRow(row.label, row.cells, rowIndex + 1))}
          </div>
        </div>
      )}
    </div>
  );
}
