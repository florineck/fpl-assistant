'use client';

import { useState } from 'react';
import { useFPLStore } from '@/store';

export function EntryIdInput() {
  const entryId = useFPLStore((state) => state.entryId);
  const setEntryId = useFPLStore((state) => state.setEntryId);
  const [localEntryId, setLocalEntryId] = useState(entryId?.toString() || '');
  const [isEditing, setIsEditing] = useState(!entryId);

  const handleSave = () => {
    const id = parseInt(localEntryId);
    if (!isNaN(id) && id > 0) {
      setEntryId(id);
      setIsEditing(false);
    }
  };

  if (!isEditing && entryId) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">Your FPL Team ID</p>
          <p className="text-xl font-bold text-white">{entryId}</p>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="text-emerald-400 hover:text-emerald-300 text-sm"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
      <label className="block text-sm text-slate-400 mb-2">Enter Your FPL Team ID</label>
      <div className="flex gap-2">
        <input
          type="number"
          value={localEntryId}
          onChange={(e) => setLocalEntryId(e.target.value)}
          placeholder="e.g. 12345"
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          onClick={handleSave}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Save
        </button>
      </div>
      <p className="text-xs text-slate-500 mt-2">
        Find your team ID in the URL: fantasy.premierleague.com/entry/12345
      </p>
    </div>
  );
}
