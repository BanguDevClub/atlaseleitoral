import type { Candidate, ElectionFacts, PollsFile } from './types';

const researchModules = import.meta.glob<{ default: Candidate }>('../data/research/*.json', { eager: true });

export const candidates: Candidate[] = Object.values(researchModules)
  .map((mod) => mod.default)
  .sort((a, b) => a.ballotName.localeCompare(b.ballotName, 'pt-BR'));

export function candidateBySlug(slug: string): Candidate | undefined {
  return candidates.find((candidate) => candidate.slug === slug);
}

export function candidateById(id: string): Candidate | undefined {
  return candidates.find((candidate) => candidate.id === id);
}

const dataModules = import.meta.glob<{ default: PollsFile | ElectionFacts }>('../data/*.json', { eager: true });

function dataFile<T>(name: string): T | null {
  const mod = Object.entries(dataModules).find(([path]) => path.endsWith(`/${name}.json`));
  return mod ? (mod[1].default as T) : null;
}

export const pollsFile = dataFile<PollsFile>('polls');
export const electionFacts = dataFile<ElectionFacts>('election-facts');
