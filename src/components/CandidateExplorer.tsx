import { useMemo, useState } from 'react';
import { SearchIcon, X, LayoutGrid, List } from 'lucide-react';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CandidateCard from '@/components/CandidateCard';
import { candidateColor, quadrantOf } from '@/lib/palette';
import { formatScore } from '@/lib/format';
import { url } from '@/lib/base';
import type { Candidate } from '@/lib/types';

const SORTS = [
  'Número de urna',
  'Nome (A–Z)',
  'Mais à esquerda',
  'Mais à direita',
  'Mais progressista',
  'Mais conservador',
] as const;

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

type SpectrumFilter = 'all' | 'left' | 'center' | 'right';

export default function CandidateExplorer({ candidates }: { candidates: Candidate[] }) {
  const [query, setQuery] = useState('');
  const [party, setParty] = useState('all');
  const [spectrum, setSpectrum] = useState<SpectrumFilter>('all');
  const [sort, setSort] = useState<SortLabel>('Número de urna');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const parties = useMemo(
    () => [...new Set(candidates.map((c) => c.party))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [candidates],
  );

  const visible = useMemo(() => {
    const needle = normalize(query.trim());
    return candidates
      .filter((c) => party === 'all' || c.party === party)
      .filter((c) => {
        if (spectrum === 'all') return true;
        if (spectrum === 'left') return c.compass.economic < -2;
        if (spectrum === 'center') return c.compass.economic >= -2 && c.compass.economic <= 2;
        if (spectrum === 'right') return c.compass.economic > 2;
        return true;
      })
      .filter((c) => {
        if (!needle) return true;
        return normalize(`${c.ballotName} ${c.name} ${c.party} ${c.partyFullName} ${c.headline}`).includes(needle);
      })
      .sort(SORTERS[sort]);
  }, [candidates, query, party, spectrum, sort]);

  return (
    <div className="flex flex-col gap-6">
      {/* Search and Dropdowns Bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Search Input with Clear Button */}
        <div className="relative flex-1">
          <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nome, partido, temas ou propostas…"
            aria-label="Buscar candidatos"
            className="pl-9 pr-8 h-10 rounded-xl bg-card border-border/80 focus-visible:ring-ctp-mauve/40"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
              aria-label="Limpar busca"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns & View Toggle */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
          <Select value={party} onValueChange={(value) => setParty(value ?? 'all')}>
            <SelectTrigger className="h-10 w-full sm:w-44 rounded-xl bg-card border-border/80 text-xs sm:text-sm" aria-label="Filtrar por partido">
              <SelectValue>{(value) => (value === 'all' ? 'Todos partidos' : value)}</SelectValue>
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
            <SelectTrigger className="h-10 w-full sm:w-52 rounded-xl bg-card border-border/80 text-xs sm:text-sm" aria-label="Ordenar candidatos">
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

          {/* View Mode Toggle */}
          <div className="hidden sm:inline-flex rounded-xl border border-border/80 bg-card p-1">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-label="Visualização em grade"
              title="Grade de cards"
              className={`rounded-lg p-1.5 transition-colors ${
                viewMode === 'grid' ? 'bg-muted text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-label="Visualização em lista"
              title="Lista compacta"
              className={`rounded-lg p-1.5 transition-colors ${
                viewMode === 'list' ? 'bg-muted text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Spectrum Quick-Filter Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-3">
        <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs pb-1 sm:pb-0">
          <span className="text-muted-foreground mr-1 text-[11px] font-semibold uppercase tracking-wider shrink-0">Espectro:</span>
          <button
            type="button"
            onClick={() => setSpectrum('all')}
            className={`shrink-0 rounded-full px-3 py-1 font-medium transition-all ${
              spectrum === 'all'
                ? 'bg-foreground text-background shadow-xs'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setSpectrum('left')}
            className={`shrink-0 rounded-full px-3 py-1 font-medium transition-all ${
              spectrum === 'left'
                ? 'bg-ctp-red text-ctp-base shadow-xs'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            Esquerda Econômica
          </button>
          <button
            type="button"
            onClick={() => setSpectrum('center')}
            className={`shrink-0 rounded-full px-3 py-1 font-medium transition-all ${
              spectrum === 'center'
                ? 'bg-ctp-mauve text-ctp-base shadow-xs'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            Centro
          </button>
          <button
            type="button"
            onClick={() => setSpectrum('right')}
            className={`shrink-0 rounded-full px-3 py-1 font-medium transition-all ${
              spectrum === 'right'
                ? 'bg-ctp-blue text-ctp-base shadow-xs'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            Direita Econômica
          </button>
        </div>

        <p className="text-xs font-medium text-muted-foreground shrink-0" role="status">
          <span className="font-bold text-foreground">{visible.length}</span> de {candidates.length} candidatos
        </p>
      </div>

      {/* Results */}
      {visible.length === 0 ? (
        <Empty className="glass-panel rounded-2xl py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchIcon className="size-6 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>Nenhum candidato encontrado</EmptyTitle>
            <EmptyDescription>
              Não encontramos resultados para os filtros selecionados. Tente ajustar a busca ou limpar os filtros.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setParty('all');
                setSpectrum('all');
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
            >
              Limpar todos os filtros
            </button>
          </EmptyContent>
        </Empty>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((candidate) => (
            <CandidateCard key={candidate.id} candidate={candidate} />
          ))}
        </div>
      ) : (
        /* Compact List View */
        <div className="flex flex-col gap-2 rounded-2xl border border-border/80 bg-card p-2">
          {visible.map((candidate) => {
            const color = candidateColor(candidate.compass.economic);
            const quadrant = quadrantOf(candidate.compass.social, candidate.compass.economic);
            return (
              <a
                key={candidate.id}
                href={url(`/candidatos/${candidate.slug}`)}
                className="group flex items-center justify-between gap-4 rounded-xl p-3 transition-colors hover:bg-muted/70"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="size-2.5 rounded-full shrink-0" style={{ background: color }} />
                  <div className="min-w-0">
                    <p className="font-heading text-sm font-bold text-foreground group-hover:text-ctp-mauve truncate">
                      {candidate.ballotName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {candidate.party} · {candidate.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-xs">
                  <span className="hidden sm:inline text-muted-foreground">{quadrant.label}</span>
                  <span className="font-mono text-muted-foreground">
                    soc {formatScore(candidate.compass.social)} / econ {formatScore(candidate.compass.economic)}
                  </span>
                  <span className="font-mono font-bold rounded-md bg-muted px-2 py-0.5 text-xs">
                    nº {candidate.number}
                  </span>
                  <span className="text-ctp-mauve font-medium group-hover:translate-x-0.5 transition-transform">
                    →
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
