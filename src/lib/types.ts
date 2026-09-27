export interface Source {
  title: string;
  publisher: string;
  url: string;
  date: string | null;
}

export type Orientation = 'esquerda' | 'centro-esquerda' | 'centro' | 'centro-direita' | 'direita';

export interface Compass {
  /** −10 conservador/autoritário … +10 progressista/libertário */
  social: number;
  /** −10 intervencionista/estatista … +10 livre-mercado */
  economic: number;
  confidence: 'alta' | 'média' | 'baixa';
  rationale: string;
  sources: Source[];
}

export interface KeyPosition {
  topic: string;
  stance: string;
  orientation: Orientation;
  sources: Source[];
}

export interface Statement {
  quote: string;
  date: string;
  context: string;
  source: Source;
}

export interface Scandal {
  title: string;
  period: string;
  summary: string;
  status: string;
  sources: Source[];
}

export interface Candidate {
  id: string;
  slug: string;
  name: string;
  ballotName: string;
  number: number;
  party: string;
  partyFullName: string;
  coalition: string | null;
  vice: { name: string; party: string };
  status: string;
  age: number;
  occupation: string;
  headline: string;
  photo: string | null;
  birth: { city: string; state: string; year: number };
  politicalJourney: string;
  bio: string[];
  compass: Compass;
  keyPositions: KeyPosition[];
  statements: Statement[];
  scandals: Scandal[];
}

export interface PollCandidate {
  id: string;
  votingIntent: number;
}

export interface Poll {
  institute: string;
  date: string;
  sample: number;
  mode: string;
  candidates: PollCandidate[];
  blankNull?: number;
  undecided?: number;
  scenario?: string;
  source: Source;
}

export interface PollsFile {
  asOf: string;
  polls: Poll[];
  trendSummary: string;
  sources: Source[];
}

export interface ElectionFacts {
  firstRound: string;
  secondRound: string;
  eligibleVoters: number;
  votingHours: string;
  registeredCandidates: number;
  totalRegistered: number;
  context: string;
  keyDates: { date: string; event: string }[];
  sources: Source[];
}
