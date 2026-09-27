import type { Source } from '@/lib/types';
import { formatDate } from '@/lib/format';
import { cn } from 'cn';

export default function SourceChip({ source, className }: { source: Source; className?: string }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      title={source.title}
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs whitespace-nowrap text-muted-foreground transition-colors hover:border-ctp-blue/60 hover:text-foreground',
        className,
      )}
    >
      <svg viewBox="0 0 12 12" className="size-3 shrink-0" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M5 2H2.6A1.6 1.6 0 0 0 1 3.6v5.8A1.6 1.6 0 0 0 2.6 11h5.8A1.6 1.6 0 0 0 10 9.4V7"></path>
        <path d="M7 1h4v4M11 1 5.5 6.5"></path>
      </svg>
      <span className="truncate">
        <span className="font-medium text-foreground/90">{source.publisher}</span>
        {source.date && <span> · {formatDate(source.date)}</span>}
      </span>
    </a>
  );
}
