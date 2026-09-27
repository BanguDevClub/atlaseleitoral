import CandidateCard from '@/components/CandidateCard';
import type { Candidate } from '@/lib/types';

export default function FeaturedGrid({ candidates }: { candidates: Candidate[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {candidates.map((candidate) => (
        <CandidateCard key={candidate.id} candidate={candidate} />
      ))}
    </div>
  );
}
