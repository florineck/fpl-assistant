// Player positions
export type Position = 'GK' | 'DEF' | 'MID' | 'FWD';

// Player status
export type PlayerStatus = 'available' | 'doubtful' | 'unavailable';

// Player interface
export interface Player {
  id: number;
  firstName: string;
  secondName: string;
  webName: string;
  team: number;
  teamName: string;
  position: Position;
  price: number;
  form: number;
  totalPoints: number;
  minutesPlayed: number;
  goalsScored: number;
  assists: number;
  cleanSheets: number;
  bonusPoints: number;
  expectedGoals: number;
  expectedAssists: number;
  news: string;
  status: PlayerStatus;
  chanceOfPlaying: number;
  dreamteamCount: number;
  epNext: number;
  epThis: number;
}

// Raw FPL element from API
export interface FPLElement {
  id: number;
  first_name: string;
  second_name: string;
  web_name: string;
  team: number;
  element_type: number;
  now_cost: number;
  form: string;
  total_points: number;
  minutes: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  bonus: number;
  expected_goals: string;
  expected_assists: string;
  news: string;
  status: string;
  chance_of_playing_next_round: number | null;
  dreamteam_count: number;
  ep_next: string;
  ep_this: string;
}

// FPL API Bootstrap Static Response
export interface BootstrapStaticResponse {
  teams: Team[];
  total_players: number;
  elements: FPLElement[];
  element_types: ElementType[];
  events: Event[];
}

export interface Team {
  id: number;
  name: string;
  shortName: string;
  strength: number;
  strengthOverallHome: number;
  strengthOverallAway: number;
  strengthAttackHome: number;
  strengthAttackAway: number;
  strengthDefenceHome: number;
  strengthDefenceAway: number;
}

export interface Element {
  id: number;
  firstName: string;
  secondName: string;
  webName: string;
  team: number;
  teamCode: number;
  elementType: number;
  price: number;
  form: number;
  totalPoints: number;
  minutesPlayed: number;
  goalsScored: number;
  assists: number;
  cleanSheets: number;
  bonusPoints: number;
  expectedGoals: number;
  expectedAssists: number;
  news: string;
  newsAdded: string;
  status: string;
  chanceOfPlaying: number | null;
  dreamteamCount: number;
  epNext: number;
  epThis: number;
}

export interface ElementType {
  id: number;
  singularName: string;
  singularNameShort: string;
  pluralName: string;
  pluralNameShort: number;
}

export interface Event {
  id: number;
  name: string;
  deadlineTime: string;
  averageEntryScore: number;
  finished: boolean;
  isNext: boolean;
  isCurrent: boolean;
  chipPlays: ChipPlay[];
}

export interface ChipPlay {
  chipName: string;
  numPlayed: number;
}

// Optimized Team
export interface OptimizedTeam {
  players: Player[];
  captain: Player;
  viceCaptain: Player;
  totalCost: number;
  projectedPoints: number;
  formation: string;
}

// Transfer Suggestion
export interface TransferSuggestion {
  in: Player;
  out: Player;
  pointsGain: number;
  cost: number;
  risk: 'low' | 'medium' | 'high';
  reason: string;
}

// Player Prediction
export interface PlayerPrediction {
  player: Player;
  predictedPoints: number;
  confidence: number;
  recommendation: 'buy' | 'hold' | 'sell';
  factors: {
    form: number;
    fixtureDifficulty: number;
    historical: number;
  };
}

// FPL Entry (User's Team)
export interface FPLEntry {
  id: number;
  playerFirstName: string;
  playerLastName: string;
  entryName: string;
  teamName: string;
  overallRank: number;
  overallPoints: number;
  teamValue: number;
  bank: number;
  transfers: Transfer[];
  picks: Pick[];
}

export interface Transfer {
  id: number;
  elementIn: number;
  elementOut: number;
  event: number;
}

export interface Pick {
  id: number;
  element: number;
  position: number;
  isCaptain: boolean;
  isViceCaptain: boolean;
  multiplier: number;
}

// Filter options
export interface PlayerFilters {
  position?: Position;
  team?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: 'price' | 'form' | 'totalPoints' | 'value';
  sortOrder?: 'asc' | 'desc';
}

// Formation
export interface Formation {
  name: string;
  gk: number;
  def: number;
  mid: number;
  fwd: number;
}

export const FORMATIONS: Formation[] = [
  { name: '4-4-2', gk: 1, def: 4, mid: 4, fwd: 2 },
  { name: '4-3-3', gk: 1, def: 4, mid: 3, fwd: 3 },
  { name: '3-4-3', gk: 1, def: 3, mid: 4, fwd: 3 },
  { name: '3-5-2', gk: 1, def: 3, mid: 5, fwd: 2 },
  { name: '4-5-1', gk: 1, def: 4, mid: 5, fwd: 1 },
  { name: '5-4-1', gk: 1, def: 5, mid: 4, fwd: 1 },
  { name: '5-3-2', gk: 1, def: 5, mid: 3, fwd: 2 },
];

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: 'success' | 'error';
}
