import {
  BootstrapStaticResponse,
  Player,
  Team,
  ElementType,
  FPLEntry,
  Event,
  ApiResponse,
} from '@/types';

// Base API URL - using our own proxy
const FPL_API_BASE = '/api/fpl';

// In-memory cache
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache: Map<string, CacheEntry<unknown>> = new Map();

// Cache duration (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * Get data from cache or fetch from API
 */
async function getCachedOrFetch<T>(url: string, cacheKey: string): Promise<ApiResponse<T>> {
  try {
    // Check cache
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return {
        data: cached.data as T,
        status: 'success',
      };
    }

    // Fetch from API
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'FPL-Assistant/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Store in cache
    cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });

    return {
      data: data as T,
      status: 'success',
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error',
    };
  }
}

/**
 * Get bootstrap static data (all players, teams, events)
 */
export async function getBootstrapStatic(): Promise<ApiResponse<BootstrapStaticResponse>> {
  return getCachedOrFetch<BootstrapStaticResponse>(
    `${FPL_API_BASE}?endpoint=bootstrap-static`,
    'bootstrap-static'
  );
}

/**
 * Get all teams
 */
export async function getTeams(): Promise<ApiResponse<Team[]>> {
  const response = await getBootstrapStatic();
  if (response.data) {
    return {
      data: response.data.teams,
      status: 'success',
    };
  }
  return {
    error: response.error || 'Failed to fetch teams',
    status: 'error',
  };
}

/**
 * Get all element types (positions)
 */
export async function getElementTypes(): Promise<ApiResponse<ElementType[]>> {
  const response = await getBootstrapStatic();
  if (response.data) {
    return {
      data: response.data.elementTypes,
      status: 'success',
    };
  }
  return {
    error: response.error || 'Failed to fetch element types',
    status: 'error',
  };
}

/**
 * Get current gameweek
 */
export async function getCurrentEvent(): Promise<ApiResponse<Event | null>> {
  const response = await getBootstrapStatic();
  if (response.data) {
    const currentEvent = response.data.events.find((e) => e.isCurrent);
    return {
      data: currentEvent || null,
      status: 'success',
    };
  }
  return {
    error: response.error || 'Failed to fetch current event',
    status: 'error',
  };
}

/**
 * Get next gameweek
 */
export async function getNextEvent(): Promise<ApiResponse<Event | null>> {
  const response = await getBootstrapStatic();
  if (response.data) {
    const nextEvent = response.data.events.find((e) => e.isNext);
    return {
      data: nextEvent || null,
      status: 'success',
    };
  }
  return {
    error: response.error || 'Failed to fetch next event',
    status: 'error',
  };
}

/**
 * Map FPL element to Player interface
 */
function mapElementToPlayer(
  element: BootstrapStaticResponse['elements'][0],
  teams: Team[],
  elementTypes: ElementType[]
): Player {
  const team = teams?.find((t) => t.id === element.team);
  const position = elementTypes?.find((e) => e.id === element.elementType);

  return {
    id: element.id,
    firstName: element.firstName,
    secondName: element.secondName,
    webName: element.webName,
    team: element.team,
    teamName: team?.name || 'Unknown',
    position: (position?.singularName?.toUpperCase().slice(0, 3) as Player['position']) || 'MID',
    price: element.price / 10,
    form: typeof element.form === 'string' ? parseFloat(element.form) : element.form || 0,
    totalPoints: element.totalPoints,
    minutesPlayed: element.minutesPlayed,
    goalsScored: element.goalsScored,
    assists: element.assists,
    cleanSheets: element.cleanSheets,
    bonusPoints: element.bonusPoints,
    expectedGoals: parseFloat(String(element.expectedGoals)) || 0,
    expectedAssists: parseFloat(String(element.expectedAssists)) || 0,
    news: element.news,
    status: mapStatus(element.status),
    chanceOfPlaying: element.chanceOfPlaying || 0,
    dreamteamCount: element.dreamteamCount,
    epNext: parseFloat(String(element.epNext)) || 0,
    epThis: parseFloat(String(element.epThis)) || 0,
  };
}

/**
 * Map FPL status to our status type
 */
function mapStatus(status: string): Player['status'] {
  if (status === 'a') return 'available';
  if (status === 'd') return 'doubtful';
  return 'unavailable';
}

/**
 * Get all players
 */
export async function getAllPlayers(): Promise<ApiResponse<Player[]>> {
  const response = await getBootstrapStatic();

  if (response.data) {
    const teams = response.data.teams || [];
    const elementTypes = response.data.elementTypes || [];
    const players = response.data.elements.map((element) =>
      mapElementToPlayer(element, teams, elementTypes)
    );
    return {
      data: players,
      status: 'success',
    };
  }

  return {
    error: response.error || 'Failed to fetch players',
    status: 'error',
  };
}

/**
 * Get a single player by ID
 */
export async function getPlayer(playerId: number): Promise<ApiResponse<Player | null>> {
  const response = await getAllPlayers();

  if (response.data) {
    const player = response.data.find((p) => p.id === playerId);
    return {
      data: player || null,
      status: 'success',
    };
  }

  return {
    error: response.error || 'Failed to fetch player',
    status: 'error',
  };
}

/**
 * Get user's FPL entry (team)
 */
export async function getEntry(entryId: number): Promise<ApiResponse<FPLEntry>> {
  return getCachedOrFetch<FPLEntry>(
    `${FPL_API_BASE}?endpoint=entry/${entryId}/`,
    `entry-${entryId}`
  );
}

/**
 * Get user's FPL entry history
 */
export async function getEntryHistory(entryId: number): Promise<ApiResponse<unknown>> {
  return getCachedOrFetch(
    `${FPL_API_BASE}?endpoint=entry/${entryId}/history/`,
    `entry-history-${entryId}`
  );
}

/**
 * Get user's FPL entry picks for a specific gameweek
 */
export async function getEntryPicks(entryId: number, eventId: number): Promise<ApiResponse<unknown>> {
  return getCachedOrFetch(
    `${FPL_API_BASE}?endpoint=entry/${entryId}/event/${eventId}/picks/`,
    `entry-picks-${entryId}-${eventId}`
  );
}

/**
 * Get fixture difficulty for teams
 */
export async function getFixtures(): Promise<ApiResponse<unknown>> {
  return getCachedOrFetch(
    `${FPL_API_BASE}?endpoint=fixtures/`,
    'fixtures'
  );
}

/**
 * Clear cache (useful for debugging or forced refresh)
 */
export function clearCache(): void {
  cache.clear();
}
