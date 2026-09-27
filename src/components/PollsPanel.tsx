import { Bar, BarChart, Rectangle, XAxis, YAxis } from 'recharts';
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
      <Rectangle x={x} y={y} width={width} height={height} radius={[0, 4, 4, 0]} fill={payload?.fill} />
      <text x={x + width + 6} y={y + height / 2 + 4} className="fill-foreground text-[11px] font-medium">
        {formatScore(payload?.value ?? 0)}%
      </text>
    </g>
  );
}

function PollBars({ poll, people }: { poll: Poll; people: Record<string, PollPerson> }) {
  const rows = poll.candidates
    .filter((entry) => people[entry.id])
    .map((entry) => ({
      id: entry.id,
      name: people[entry.id].name,
      value: entry.votingIntent,
      fill: candidateColor(people[entry.id].economic),
    }))
    .sort((a, b) => b.value - a.value);

  const maxValue = Math.max(...rows.map((row) => row.value), 10);
  const config: ChartConfig = Object.fromEntries(rows.map((row) => [row.id, { label: row.name, color: row.fill }]));
  const height = Math.max(220, rows.length * 38 + 48);

  return (
    <div className="flex flex-col gap-3">
      <ChartContainer config={config} className="aspect-auto w-full" style={{ height }}>
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 64, bottom: 4, left: 4 }}>
          <XAxis type="number" domain={[0, maxValue * 1.1]} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${v}%`} />
          <YAxis type="category" dataKey="name" width={150} tickLine={false} axisLine={false} interval={0} fontSize={11} />
          <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: 'var(--ctp-surface0)', opacity: 0.4 }} />
          <Bar dataKey="value" shape={<PollBarShape />} barSize={20} />
        </BarChart>
      </ChartContainer>
      <p className="text-xs text-muted-foreground">
        {poll.institute} · {formatDate(poll.date)} · {poll.sample.toLocaleString('pt-BR')} entrevistados · {poll.mode}
        {typeof poll.blankNull === 'number' && ` · brancos/nulos ${formatScore(poll.blankNull)}%`}
        {typeof poll.undecided === 'number' && ` · sem decisão ${formatScore(poll.undecided)}%`}
      </p>
      <SourceChip source={poll.source} />
    </div>
  );
}

export default function PollsPanel({ polls, people }: PollsPanelProps) {
  if (polls.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma pesquisa disponível.</p>;
  }

  return (
    <Tabs defaultValue="0" className="w-full">
      <TabsList className="max-w-full justify-start gap-1 overflow-x-auto bg-transparent p-0">
        {polls.map((poll, index) => (
          <TabsTrigger key={`${poll.institute}-${poll.date}-${index}`} value={String(index)} className="border border-border">
            {poll.scenario ? `${poll.institute} — ${poll.scenario}` : `${poll.institute} · ${formatDate(poll.date)}`}
          </TabsTrigger>
        ))}
      </TabsList>
      {polls.map((poll, index) => (
        <TabsContent key={`content-${poll.institute}-${poll.date}-${index}`} value={String(index)}>
          <PollBars poll={poll} people={people} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
