import { useState, useEffect } from 'react';
import { Bar, BarChart, Rectangle, XAxis, YAxis } from 'recharts';
import { BarChart3, Table as TableIcon } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SourceChip from '@/components/SourceChip';
import { formatDate, formatScore } from '@/lib/format';
import { candidateColor } from '@/lib/palette';
import type { Poll } from '@/lib/types';

export interface PollPerson {
  name: string;
  economic: number;
}

interface PollsPanelProps {
  polls: Poll[];
  people: Record<string, PollPerson>;
}

interface PollBarShapeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: { value?: number; fill?: string };
}

function PollBarShape({ x = 0, y = 0, width = 0, height = 0, payload }: PollBarShapeProps) {
  return (
    <g>
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        radius={[0, 6, 6, 0]}
        fill={payload?.fill}
      />
      <text
        x={x + width + 8}
        y={y + height / 2 + 4}
        className="fill-foreground font-mono text-[11px] font-bold"
      >
        {formatScore(payload?.value ?? 0)}%
      </text>
    </g>
  );
}

function PollBars({ poll, people }: { poll: Poll; people: Record<string, PollPerson> }) {
  const [displayMode, setDisplayMode] = useState<'chart' | 'table'>('chart');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(typeof window !== 'undefined' && window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const rows = poll.candidates
    .filter((entry) => people[entry.id])
    .map((entry) => ({
      id: entry.id,
      name: people[entry.id].name,
      value: entry.votingIntent,
      economic: people[entry.id].economic,
      fill: candidateColor(people[entry.id].economic),
    }))
    .sort((a, b) => b.value - a.value);

  const maxValue = Math.max(...rows.map((row) => row.value), 10);
  const config: ChartConfig = Object.fromEntries(rows.map((row) => [row.id, { label: row.name, color: row.fill }]));
  const height = Math.max(220, rows.length * (isMobile ? 36 : 40) + 48);

  return (
    <div className="flex flex-col gap-4">
      {/* Poll Header & Display Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-foreground font-heading text-sm">{poll.institute}</span>
          {poll.scenario && (
            <span className="rounded-full bg-ctp-mauve/15 px-2.5 py-0.5 text-xs font-semibold text-ctp-mauve">
              {poll.scenario}
            </span>
          )}
          <span className="text-muted-foreground font-mono">{formatDate(poll.date)}</span>
        </div>

        <div className="inline-flex rounded-lg border border-border/80 bg-muted/40 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setDisplayMode('chart')}
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors ${
              displayMode === 'chart'
                ? 'bg-card text-foreground shadow-xs font-medium'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BarChart3 className="size-3.5" />
            <span>Gráfico</span>
          </button>
          <button
            type="button"
            onClick={() => setDisplayMode('table')}
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors ${
              displayMode === 'table'
                ? 'bg-card text-foreground shadow-xs font-medium'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <TableIcon className="size-3.5" />
            <span>Tabela</span>
          </button>
        </div>
      </div>

      {/* Main Content: Chart or Table */}
      {displayMode === 'chart' ? (
        <ChartContainer config={config} className="aspect-auto w-full" style={{ height }}>
          <BarChart
            data={rows}
            layout="vertical"
            margin={{ top: 8, right: isMobile ? 48 : 64, bottom: 8, left: isMobile ? 0 : 4 }}
          >
            <XAxis
              type="number"
              domain={[0, maxValue * 1.15]}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `${v}%`}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={isMobile ? 110 : 160}
              tickLine={false}
              axisLine={false}
              interval={0}
              fontSize={isMobile ? 11 : 12}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
              cursor={{ fill: 'var(--muted)', opacity: 0.3 }}
            />
            <Bar dataKey="value" shape={<PollBarShape />} barSize={isMobile ? 18 : 22} animationDuration={600} />
          </BarChart>
        </ChartContainer>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/80 bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border/60 bg-muted/30 text-xs font-semibold uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Candidato</th>
                <th className="px-4 py-3 text-right">Intenção de Voto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-foreground flex items-center gap-2">
                    <span className="size-2 rounded-full" style={{ background: row.fill }} />
                    {row.name}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold tabular-nums">
                    {formatScore(row.value)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Methodology & Metadata Notes */}
      <div className="flex flex-col gap-2 rounded-xl bg-muted/30 p-3 text-xs text-muted-foreground border border-border/50">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>Amostra: <strong className="text-foreground font-mono">{poll.sample.toLocaleString('pt-BR')}</strong> entrevistados</span>
          <span>·</span>
          <span>Método: <strong className="text-foreground">{poll.mode}</strong></span>
          {typeof poll.blankNull === 'number' && (
            <>
              <span>·</span>
              <span>Brancos/Nulos: <strong className="text-foreground font-mono">{formatScore(poll.blankNull)}%</strong></span>
            </>
          )}
          {typeof poll.undecided === 'number' && (
            <>
              <span>·</span>
              <span>Não sabem/Indecisos: <strong className="text-foreground font-mono">{formatScore(poll.undecided)}%</strong></span>
            </>
          )}
        </div>
        <div>
          <SourceChip source={poll.source} />
        </div>
      </div>
    </div>
  );
}

export default function PollsPanel({ polls, people }: PollsPanelProps) {
  if (polls.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma pesquisa disponível no momento.</p>;
  }

  return (
    <Tabs defaultValue="0" className="w-full">
      <div className="w-full mb-6">
        <TabsList className="group-data-horizontal/tabs:h-auto h-auto w-full max-w-full justify-start gap-2 overflow-x-auto bg-transparent p-1 pb-3.5 scrollbar-thin">
          {polls.map((poll, index) => (
            <TabsTrigger
              key={`${poll.institute}-${poll.date}-${index}`}
              value={String(index)}
              className="shrink-0 rounded-xl border border-border/80 bg-card px-3.5 py-2 text-xs font-medium transition-all data-[state=active]:border-primary data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-xs hover:border-primary/50"
            >
              {poll.scenario ? `${poll.institute} (${poll.scenario})` : `${poll.institute} · ${formatDate(poll.date)}`}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {polls.map((poll, index) => (
        <TabsContent key={`content-${poll.institute}-${poll.date}-${index}`} value={String(index)} className="mt-1">
          <PollBars poll={poll} people={people} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
