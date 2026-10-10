import React, { useState } from 'react';
import { Clock, RefreshCw, User, Store, Truck, ChevronRight, PlusCircle } from 'lucide-react';
import { updateClock, resetDatabase } from '../api';

export default function Navbar({
  clock,
  onClockUpdate,
  activeRole,
  setActiveRole,
  selectedPerson,
  setSelectedPerson,
  donors,
  volunteers,
  activeTab,
  setActiveTab
}) {
  const [customTime, setCustomTime] = useState('');
  const [showClockModal, setShowClockModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Advance clock by given minutes
  const handleAdvanceMinutes = async (minutes) => {
    try {
      setUpdating(true);
      const current = new Date(clock);
      current.setMinutes(current.getMinutes() + minutes);
      const iso = current.toISOString().slice(0, 16);
      await updateClock(iso);
      onClockUpdate();
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleCustomClockSubmit = async (e) => {
    e.preventDefault();
    if (!customTime) return;
    try {
      setUpdating(true);
      await updateClock(customTime);
      setShowClockModal(false);
      onClockUpdate();
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleResetData = async () => {
    if (window.confirm('Reset all donations and clock back to initial seed data?')) {
      try {
        await resetDatabase();
        onClockUpdate();
        alert('Database reset to seed data!');
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-md">
      {/* Top Banner: Clock & Role Switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/20 text-emerald-400 p-2 rounded-xl border border-emerald-500/30">
            <span className="text-2xl">🥗</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              SurplusLink
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                Rescue Hub
              </span>
            </h1>
            <p className="text-xs text-slate-400">Every kilogram counts. Every minute matters.</p>
          </div>
        </div>

        {/* Simulated Clock Bar */}
        <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
          <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
          <div className="text-xs">
            <span className="text-slate-400 mr-1">Simulated Clock:</span>
            <span className="font-mono font-bold text-amber-300">{clock || 'Loading...'}</span>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={() => handleAdvanceMinutes(15)}
              disabled={updating}
              className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition font-medium"
              title="Advance 15 minutes"
            >
              +15m
            </button>
            <button
              onClick={() => handleAdvanceMinutes(60)}
              disabled={updating}
              className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition font-medium"
              title="Advance 1 hour"
            >
              +1h
            </button>
            <button
              onClick={() => handleAdvanceMinutes(1440)}
              disabled={updating}
              className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition font-medium"
              title="Advance 1 day"
            >
              +1d
            </button>
            <button
              onClick={() => setShowClockModal(true)}
              className="px-2 py-1 text-xs bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/40 rounded transition"
            >
              Set...
            </button>
          </div>
        </div>

        {/* Role & Persona Selector */}
        <div className="flex items-center gap-3">
          {/* Role Toggle */}
          <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs font-medium">
            <button
              onClick={() => {
                setActiveRole('donor');
                if (donors.length > 0) setSelectedPerson(donors[0]);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition ${
                activeRole === 'donor'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              Donor
            </button>
            <button
              onClick={() => {
                setActiveRole('volunteer');
                if (volunteers.length > 0) setSelectedPerson(volunteers[0]);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition ${
                activeRole === 'volunteer'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              Volunteer
            </button>
          </div>

          {/* Persona Dropdown */}
          <div className="relative">
            <select
              value={selectedPerson?.id || ''}
              onChange={(e) => {
                const list = activeRole === 'donor' ? donors : volunteers;
                const found = list.find(item => item.id === e.target.value);
                if (found) setSelectedPerson(found);
              }}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              {activeRole === 'donor'
                ? donors.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.zone})
                    </option>
                  ))
                : volunteers.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.capacity_kg}kg, {v.zones?.join(', ')})
                    </option>
                  ))}
            </select>
          </div>

          {/* Reset Seed Button */}
          <button
            onClick={handleResetData}
            title="Reset database to seed.json"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('command-center')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === 'command-center'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <span>⚡</span> Live Command Center
        </button>

        <button
          onClick={() => setActiveTab('donor-workspace')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === 'donor-workspace'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Store className="w-3.5 h-3.5" /> Donor Workspace
        </button>

        <button
          onClick={() => setActiveTab('volunteer-workspace')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === 'volunteer-workspace'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Truck className="w-3.5 h-3.5" /> Volunteer Workspace
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === 'dashboard'
              ? 'border-purple-500 text-purple-400 bg-purple-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <span>📊</span> Impact & Reconciliation
        </button>
      </div>

      {/* Clock Setting Modal */}
      {showClockModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              Advance Simulated Clock
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Current Clock: <span className="text-amber-300 font-mono">{clock}</span>. Time can never move backwards.
            </p>
            <form onSubmit={handleCustomClockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  New Clock Time (YYYY-MM-DDTHH:MM)
                </label>
                <input
                  type="datetime-local"
                  required
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClockModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-700/50 hover:bg-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow"
                >
                  {updating ? 'Updating...' : 'Set Simulated Clock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
