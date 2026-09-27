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
  if (!position) return <span className="text-muted-foreground text-xs italic">Não documentado no programa</span>;
  return (
    <div className="flex flex-col gap-2">
      <div>
        <OrientationBadge orientation={position.orientation} />
      </div>
      <p className="text-xs leading-relaxed text-foreground/90">{position.stance}</p>
      <div className="flex flex-wrap gap-1 pt-1">
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

  const cellClass = (index: number) =>
    cn('border-t border-border/70 p-4 align-top transition-colors', index % 2 === 1 && 'bg-muted/20');

  const renderRow = (label: string, cells: ReactNode[], rowIndex: number) => (
    <div key={label} className="contents">
      <div className={cn(cellClass(rowIndex), 'text-xs font-bold tracking-wider text-muted-foreground uppercase')}>
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
          <div className="flex items-center gap-3">
            <CompassGlyph social={c.compass.social} economic={c.compass.economic} size={64} />
            <div className="flex flex-col text-xs">
              <span className="font-bold text-foreground" style={{ color: candidateColor(c.compass.economic) }}>
                {quadrantOf(c.compass.social, c.compass.economic).label}
              </span>
              <span className="font-mono text-muted-foreground">
                soc. {formatScore(c.compass.social)} · econ. {formatScore(c.compass.economic)}
              </span>
              <span className="text-[10px] text-muted-foreground">
                Confiança: <strong className="capitalize text-foreground">{c.compass.confidence}</strong>
              </span>
            </div>
          </div>
        </div>
      )),
    },
    {
      label: 'Partido & Coligação',
      cells: chosen.map((c) => (
        <div key={c.id} className="flex flex-col gap-1 text-xs">
          <span className="font-bold text-foreground">
            {c.party} — {c.partyFullName}
          </span>
          {c.coalition && <span className="text-muted-foreground">Coligação: {c.coalition}</span>}
        </div>
      )),
    },
    {
      label: 'Chapa e Vice',
      cells: chosen.map((c) => (
        <div key={c.id} className="flex flex-col gap-1 text-xs">
          <span className="text-foreground">
            Vice: <strong>{c.vice.name}</strong> ({c.vice.party})
          </span>
          <span className="font-mono font-medium text-muted-foreground">Urna: nº {c.number}</span>
        </div>
      )),
    },
    {
      label: 'Perfil & Idade',
      cells: chosen.map((c) => (
        <div key={c.id} className="flex flex-col gap-1 text-xs">
          <span className="font-medium text-foreground">
            {c.age} anos · {c.occupation}
          </span>
          <span className="text-muted-foreground leading-relaxed">{c.headline}</span>
        </div>
      )),
    },
    ...TOPICS.map((topic) => ({
      label: topic,
      cells: chosen.map((c) => <PositionCell key={c.id} position={c.keyPositions.find((p) => p.topic === topic)} />),
    })),
    {
      label: 'Declarações Documentadas',
      cells: chosen.map((c) => (
        <span key={c.id} className="font-mono text-sm font-bold text-foreground tabular-nums">
          {c.statementCount} declarações apuradas
        </span>
      )),
    },
    {
      label: 'Controvérsias Registradas',
      cells: chosen.map((c) =>
        c.scandalTitles.length === 0 ? (
          <span key={c.id} className="text-xs text-muted-foreground italic">
            Nenhuma de ampla notoriedade documentada
          </span>
        ) : (
          <ul key={c.id} className="flex list-disc flex-col gap-1.5 pl-4 text-xs text-foreground/90">
            {c.scandalTitles.map((title) => (
              <li key={title} className="leading-snug">
                {title}
              </li>
            ))}
          </ul>
        ),
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Candidate Selector Box */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Selecione de 2 a {MAX_SELECTED} candidatos para comparar:
          </span>
          <span className="text-xs text-muted-foreground">
            {selected.length} de {MAX_SELECTED} selecionados
          </span>
        </div>

        <ToggleGroup
          multiple
          value={selected}
          onValueChange={(values) => {
            if (values.length > MAX_SELECTED || values.length === 0) return;
            setSelected(values);
          }}
          variant="outline"
          size="sm"
          className="flex-wrap gap-1.5"
          aria-label="Selecionar candidatos para comparação"
        >
          {candidates.map((c) => (
            <ToggleGroupItem
              key={c.id}
              value={c.id}
              disabled={!selected.includes(c.id) && selected.length >= MAX_SELECTED}
              className="gap-1.5 rounded-xl border border-border/70 px-3 py-1.5 data-[state=on]:border-ctp-mauve data-[state=on]:bg-muted"
            >
              <span
                aria-hidden
                className="size-2.5 rounded-full"
                style={{ background: candidateColor(c.compass.economic) }}
              />
              <span className="font-medium">{c.ballotName}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {chosen.length < 2 ? (
        <div className="glass-panel rounded-2xl p-10 text-center text-sm text-muted-foreground">
          Selecione ao menos dois candidatos acima para montar o painel comparativo lado a lado.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border/80 bg-card shadow-sm">
          <div
            className="grid min-w-[860px]"
            style={{ gridTemplateColumns: `170px repeat(${chosen.length}, minmax(220px, 1fr))` }}
          >
            {/* Header Sticky Row */}
            <div className="sticky top-0 z-20 bg-muted/60 p-4 text-xs font-bold tracking-wider text-muted-foreground uppercase backdrop-blur-md">
              Critério
            </div>
            {chosen.map((c) => (
              <div key={c.id} className="sticky top-0 z-20 bg-muted/60 p-4 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <Avatar className="size-11 rounded-xl border border-border/80 shadow-xs">
                    {c.photo && <AvatarImage src={c.photo} alt={`Foto de ${c.ballotName}`} className="object-cover" />}
                    <AvatarFallback className="bg-card font-heading text-xs font-bold">
                      {c.ballotName
                        .split(/\s+/)
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-heading text-sm font-bold text-foreground" title={c.name}>
                      {c.ballotName}
                    </p>
                    <p className="truncate text-xs font-medium text-muted-foreground">
                      {c.party} · nº {c.number}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Comparison Rows */}
            {rows.map((row, rowIndex) => renderRow(row.label, row.cells, rowIndex + 1))}
          </div>
        </div>
      )}
    </div>
  );
}
