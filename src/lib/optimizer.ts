import solver from 'javascript-lp-solver';
import { Player, Formation, OptimizedTeam } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SolverResults = Record<string, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SolverModel = Record<string, any>;

/**
 * Optimize team using linear programming
 */
export function optimizeTeam(
  players: Player[],
  formation: Formation,
  budget: number,
  includePlayers: number[] = [],
  excludePlayers: number[] = []
): OptimizedTeam | null {
  // Filter available players
  let availablePlayers = players.filter(
    (p) => p.status === 'available' || p.chanceOfPlaying > 50
  );

  // Apply include/exclude filters
  if (includePlayers.length > 0) {
    availablePlayers = availablePlayers.filter((p) => includePlayers.includes(p.id));
  }
  if (excludePlayers.length > 0) {
    availablePlayers = availablePlayers.filter((p) => !excludePlayers.includes(p.id));
  }

  // If not enough players, return null
  const totalRequired = formation.gk + formation.def + formation.mid + formation.fwd;
  if (availablePlayers.length < totalRequired) {
    return null;
  }

  // Create model for solver
  const model: SolverModel = {
    optimize: 'expectedPoints',
    opType: 'max',
    constraints: {
      cost: budget * 10,
      GK: formation.gk,
      DEF: formation.def,
      MID: formation.mid,
      FWD: formation.fwd,
    },
    variables: {},
  };

  // Add team constraints (max 3 from same team)
  const teams = Array.from(new Set(availablePlayers.map((p) => p.team)));
  teams.forEach((teamId) => {
    model.constraints[`team_${teamId}`] = 3;
  });

  // Add player variables
  availablePlayers.forEach((player) => {
    const playerKey = `player_${player.id}`;
    model.variables[playerKey] = {
      expectedPoints: player.epThis || player.form || player.totalPoints / 10,
      cost: Math.round(player.price * 10),
      [player.position]: 1,
      [`team_${player.team}`]: 1,
    };
  });

  // Solve
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results = (solver as any).Solve(model) as SolverResults;

  if (!results || !results.result || results.result < 0) {
    return null;
  }

  // Extract selected players
  const selectedPlayerIds: number[] = [];
  Object.keys(results).forEach((key) => {
    if (key.startsWith('player_') && results[key] > 0.5) {
      const playerId = parseInt(key.replace('player_', ''));
      selectedPlayerIds.push(playerId);
    }
  });

  // Get player objects
  const selectedPlayers = selectedPlayerIds
    .map((id) => availablePlayers.find((p) => p.id === id))
    .filter((p): p is Player => p !== undefined);

  // Sort by position then by expected points (for captain selection)
  const positionOrder: Record<string, number> = { GK: 0, DEF: 1, MID: 2, FWD: 3 };
  selectedPlayers.sort((a, b) => {
    const posDiff = positionOrder[a.position] - positionOrder[b.position];
    if (posDiff !== 0) return posDiff;
    return (b.epThis || b.form) - (a.epThis || a.form);
  });

  // Calculate total cost and projected points
  const totalCost = selectedPlayers.reduce((sum, p) => sum + p.price, 0);
  const projectedPoints = selectedPlayers.reduce(
    (sum, p) => sum + (p.epThis || p.form || p.totalPoints / 10),
    0
  );

  // Select captain and vice-captain (highest epThis)
  const sortedByPoints = [...selectedPlayers].sort(
    (a, b) => (b.epThis || b.form) - (a.epThis || a.form)
  );
  const captain = sortedByPoints[0];
  const viceCaptain = sortedByPoints[1] || sortedByPoints[0];

  return {
    players: selectedPlayers,
    captain,
    viceCaptain,
    totalCost,
    projectedPoints,
    formation: formation.name,
  };
}

/**
 * Suggest transfers
 */
export function suggestTransfers(
  currentTeam: Player[],
  players: Player[],
  budget: number = 0,
  numTransfers: number = 1
): { in: Player; out: Player; pointsGain: number }[] {
  const suggestions: { in: Player; out: Player; pointsGain: number }[] = [];
  const currentTeamIds = new Set(currentTeam.map((p) => p.id));

  // Find potential outs (underperforming players)
  const potentialOuts = [...currentTeam]
    .filter((p) => p.status === 'available' || p.chanceOfPlaying > 50)
    .sort((a, b) => a.form - b.form)
    .slice(0, numTransfers * 3);

  // Find potential ins (best available players not in team)
  const potentialIns = players
    .filter(
      (p) =>
        !currentTeamIds.has(p.id) &&
        (p.status === 'available' || p.chanceOfPlaying > 50)
    )
    .sort((a, b) => (b.epNext || b.form) - (a.epNext || a.form))
    .slice(0, numTransfers * 5);

  // Generate suggestions
  for (const out of potentialOuts) {
    for (const inPlayer of potentialIns) {
      // Check if transfer is within budget
      const costDiff = inPlayer.price - out.price;
      if (costDiff > budget) continue;

      const pointsGain = (inPlayer.epNext || inPlayer.form) - (out.epNext || out.form);
      
      if (pointsGain > 0) {
        suggestions.push({ in: inPlayer, out, pointsGain });
      }
    }
  }

  // Sort by points gain and return top suggestions
  return suggestions
    .sort((a, b) => b.pointsGain - a.pointsGain)
    .slice(0, numTransfers);
}
