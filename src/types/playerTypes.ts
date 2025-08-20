export interface Player {
  id: string;
  name: string;
  position: string;
  age?: number;
  bats?: string;
  throws?: string;
  // Hitting stats
  avg?: string;
  obp?: string;
  slg?: string;
  ops?: string;
  hr?: string;
  rbi?: string;
  runs?: string;
  hits?: string;
  doubles?: string;
  triples?: string;
  sb?: string;
  bb?: string;
  so?: string;
  // Pitching stats
  era?: string;
  whip?: string;
  wins?: string;
  losses?: string;
  saves?: string;
  ip?: string;
  h?: string;
  er?: string;
  bb_p?: string;
  so_p?: string;
  hr_p?: string;
}

export interface TeamRecord {
  wins: string;
  losses: string;
  pct: string;
}

export interface Game {
  teams?: string;
  date?: string;
  result?: string;
  competitions?: any[];
}