'use client';

import { usePlayers, useCurrentEvent, useNextEvent, useTeams } from '@/hooks/useFplData';
import { Player, FORMATIONS } from '@/types';
import { useFPLStore } from '@/store';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const { data: players, isLoading: playersLoading, error: playersError } = usePlayers();
  const { data: currentEvent } = useCurrentEvent();
  const { data: nextEvent } = useNextEvent();
  const { data: teams } = useTeams();
  const setPlayers = useFPLStore((state) => state.setPlayers);

  useEffect(() => {
    if (players) {
      setPlayers(players);
    }
  }, [players, setPlayers]);

  // Get top performers
  const topScorers = players?.slice().sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 5) || [];
  const topForm = players?.slice().sort((a, b) => b.form - a.form).slice(0, 5) || [];
  const bestValue = players?.slice().sort((a, b) => (b.totalPoints / b.price) - (a.totalPoints / a.price)).slice(0, 5) || [];

  if (playersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (playersError) {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 text-center">
        <h2 className="text-xl font-semibold text-red-400 mb-2">Error Loading Data</h2>
        <p className="text-slate-400">{playersError.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">FPL Assistant</h1>
        <p className="text-slate-400">Fantasy Premier League Optimization Tool</p>
      </div>

      {/* Gameweek Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Current Gameweek</h3>
          {currentEvent ? (
            <div className="space-y-2">
              <p className="text-3xl font-bold text-emerald-400">{currentEvent.name}</p>
              <p className="text-slate-400">Average Score: {currentEvent.averageEntryScore}</p>
            </div>
          ) : (
            <p className="text-slate-500">No active gameweek</p>
          )}
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Next Gameweek</h3>
          {nextEvent ? (
            <div className="space-y-2">
              <p className="text-3xl font-bold text-blue-400">{nextEvent.name}</p>
              <p className="text-slate-400">Deadline: {new Date(nextEvent.deadlineTime).toLocaleDateString()}</p>
            </div>
          ) : (
            <p className="text-slate-500">No upcoming gameweek</p>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-white">{players?.length || 0}</p>
          <p className="text-sm text-slate-400">Players</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-white">{teams?.length || 0}</p>
          <p className="text-sm text-slate-400">Teams</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-white">£{players && players.length > 0 ? (players.reduce((sum, p) => sum + p.price, 0) / players.length).toFixed(1) : '0.0'}m</p>
          <p className="text-sm text-slate-400">Avg Price</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-white">{FORMATIONS.length}</p>
          <p className="text-sm text-slate-400">Formations</p>
        </div>
      </div>

      {/* Top Players */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Scorers */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Points</h3>
          <div className="space-y-3">
            {topScorers.map((player, index) => (
              <Link
                key={player.id}
                href={`/players/${player.id}`}
                className="flex items-center justify-between p-2 rounded hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 w-6">{index + 1}</span>
                  <div>
                    <p className="text-white font-medium">{player.webName}</p>
                    <p className="text-xs text-slate-500">{player.teamName} • {player.position}</p>
                  </div>
                </div>
                <span className="text-emerald-400 font-semibold">{player.totalPoints}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Top Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Form</h3>
          <div className="space-y-3">
            {topForm.map((player, index) => (
              <Link
                key={player.id}
                href={`/players/${player.id}`}
                className="flex items-center justify-between p-2 rounded hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 w-6">{index + 1}</span>
                  <div>
                    <p className="text-white font-medium">{player.webName}</p>
                    <p className="text-xs text-slate-500">{player.teamName} • {player.position}</p>
                  </div>
                </div>
                <span className="text-blue-400 font-semibold">{player.form}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Best Value */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Best Value</h3>
          <div className="space-y-3">
            {bestValue.map((player, index) => (
              <Link
                key={player.id}
                href={`/players/${player.id}`}
                className="flex items-center justify-between p-2 rounded hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 w-6">{index + 1}</span>
                  <div>
                    <p className="text-white font-medium">{player.webName}</p>
                    <p className="text-xs text-slate-500">£{player.price}m</p>
                  </div>
                </div>
                <span className="text-amber-400 font-semibold">{(player.totalPoints / player.price).toFixed(1)}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/optimizer"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-6 rounded-lg text-center transition-colors"
        >
          <span className="block text-lg">Team Optimizer</span>
          <span className="block text-sm text-emerald-200">Find your best XI</span>
        </Link>
        <Link
          href="/transfers"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg text-center transition-colors"
        >
          <span className="block text-lg">Transfer Suggestions</span>
          <span className="block text-sm text-blue-200">Get transfer recommendations</span>
        </Link>
        <Link
          href="/predictions"
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-lg text-center transition-colors"
        >
          <span className="block text-lg">Points Predictions</span>
          <span className="block text-sm text-purple-200">Predict player points</span>
        </Link>
      </div>
    </div>
  );
}
