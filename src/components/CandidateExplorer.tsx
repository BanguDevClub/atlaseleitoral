import { useMemo, useState } from 'react';
import { SearchIcon } from 'lucide-react';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CandidateCard from '@/components/CandidateCard';
import type { Candidate } from '@/lib/types';

const SORTS = ['Número de urna', 'Nome (A–Z)', 'Mais à esquerda', 'Mais à direita', 'Mais progressista', 'Mais conservador'] as const;

type SortLabel = (typeof SORTS)[number];

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

const SORTERS: Record<SortLabel, (a: Candidate, b: Candidate) => number> = {
  'Número de urna': (a, b) => a.number - b.number,
  'Nome (A–Z)': (a, b) => a.ballotName.localeCompare(b.ballotName, 'pt-BR'),
  'Mais à esquerda': (a, b) => a.compass.economic - b.compass.economic,
  'Mais à direita': (a, b) => b.compass.economic - a.compass.economic,
  'Mais progressista': (a, b) => b.compass.social - a.compass.social,
  'Mais conservador': (a, b) => a.compass.social - b.compass.social,
};

export default function CandidateExplorer({ candidates }: { candidates: Candidate[] }) {
  const [query, setQuery] = useState('');
  const [party, setParty] = useState('all');
  const [sort, setSort] = useState<SortLabel>('Número de urna');

  const parties = useMemo(
    () => [...new Set(candidates.map((c) => c.party))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [candidates],
  );

  const visible = useMemo(() => {
    const needle = normalize(query.trim());
    return candidates
      .filter((c) => party === 'all' || c.party === party)
      .filter((c) => {
        if (!needle) return true;
        return normalize(`${c.ballotName} ${c.name} ${c.party} ${c.partyFullName} ${c.headline}`).includes(needle);
      })
      .sort(SORTERS[sort]);
  }, [candidates, query, party, sort]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon data-icon="inline-start" className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nome, partido ou tema…"
            aria-label="Buscar candidatos"
            className="pl-9"
          />
        </div>
        <Select value={party} onValueChange={(value) => setParty(value ?? 'all')}>
          <SelectTrigger className="w-full sm:w-44" aria-label="Filtrar por partido">
            <SelectValue>{(value) => (value === 'all' ? 'Todos os partidos' : value)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Todos os partidos</SelectItem>
              {parties.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(value) => setSort(value as SortLabel)}>
          <SelectTrigger className="w-full sm:w-52" aria-label="Ordenar candidatos">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {SORTS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground" role="status">
        {visible.length} {visible.length === 1 ? 'candidato' : 'candidatos'} de {candidates.length}
      </p>

      {visible.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchIcon />
            </EmptyMedia>
            <EmptyTitle>Nenhum candidato encontrado</EmptyTitle>
            <EmptyDescription>Ajuste a busca ou o filtro de partido para ver resultados.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setParty('all');
              }}
              className="text-sm text-ctp-blue underline underline-offset-4 hover:text-foreground"
            >
              Limpar filtros
            </button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((candidate) => (
            <CandidateCard key={candidate.id} candidate={candidate} />
          ))}
        </div>
      )}
    </div>
  );
}
