'use client';

import { use } from 'react';
import { usePlayer, usePlayers } from '@/hooks/useFplData';
import { Player } from '@/types';
import Link from 'next/link';

export default function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const playerId = parseInt(resolvedParams.id);
  const { data: player, isLoading, error } = usePlayer(playerId);
  const { data: players } = usePlayers();

  // Find similar players from the same team
  const similarPlayers = players?.filter(
    (p) => p.team === player?.team && p.id !== player?.id
  ).slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 text-center">
        <h2 className="text-xl font-semibold text-red-400 mb-2">Error Loading Player</h2>
        <p className="text-slate-400">{error?.message || 'Player not found'}</p>
        <Link href="/players" className="text-emerald-400 hover:underline mt-4 inline-block">
          Back to Players
        </Link>
      </div>
    );
  }

  const value = (player.totalPoints / player.price).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link href="/players" className="text-slate-400 hover:text-white inline-flex items-center gap-2">
        ← Back to Players
      </Link>

      {/* Player Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">{player.webName}</h1>
            <p className="text-lg text-slate-400">{player.firstName} {player.secondName}</p>
            <div className="flex items-center gap-3 mt-2">
              <span
                className={`px-3 py-1 text-sm font-medium rounded ${
                  player.position === 'GK'
                    ? 'bg-amber-900 text-amber-200'
                    : player.position === 'DEF'
                    ? 'bg-blue-900 text-blue-200'
                    : player.position === 'MID'
                    ? 'bg-green-900 text-green-200'
                    : 'bg-red-900 text-red-200'
                }`}
              >
                {player.position}
              </span>
              <span className="text-slate-400">{player.teamName}</span>
              <span className={`px-2 py-0.5 text-xs rounded ${player.status === 'available' ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
                {player.status}
              </span>
            </div>
          </div>
          <div className="text-center md:text-right">
            <p className="text-4xl font-bold text-white">£{player.price}m</p>
            <p className="text-sm text-slate-400">Price</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-emerald-400">{player.totalPoints}</p>
          <p className="text-sm text-slate-400">Total Points</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-blue-400">{player.form}</p>
          <p className="text-sm text-slate-400">Form</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-amber-400">{value}</p>
          <p className="text-sm text-slate-400">Value (Pts/£m)</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-white">{player.minutesPlayed}</p>
          <p className="text-sm text-slate-400">Minutes</p>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Attack Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Goals</span>
              <span className="text-white font-medium">{player.goalsScored}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Assists</span>
              <span className="text-white font-medium">{player.assists}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Expected Goals (xG)</span>
              <span className="text-white font-medium">{player.expectedGoals.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Expected Assists (xA)</span>
              <span className="text-white font-medium">{player.expectedAssists.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Bonus Points</span>
              <span className="text-white font-medium">{player.bonusPoints}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Dreamteam Selections</span>
              <span className="text-white font-medium">{player.dreamteamCount}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Defensive Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Clean Sheets</span>
              <span className="text-white font-medium">{player.cleanSheets}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Chance of Playing</span>
              <span className="text-white font-medium">{player.chanceOfPlaying}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">EP This GW</span>
              <span className="text-white font-medium">{player.epThis.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">EP Next GW</span>
              <span className="text-white font-medium">{player.epNext.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* News */}
      {player.news && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">News</h3>
          <p className="text-slate-400">{player.news}</p>
        </div>
      )}

      {/* Similar Players */}
      {similarPlayers && similarPlayers.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Same Team</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {similarPlayers.map((p) => (
              <Link
                key={p.id}
                href={`/players/${p.id}`}
                className="flex items-center justify-between p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <div>
                  <p className="text-white font-medium">{p.webName}</p>
                  <p className="text-xs text-slate-400">{p.position}</p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 font-semibold">{p.totalPoints}</p>
                  <p className="text-xs text-slate-400">£{p.price}m</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
