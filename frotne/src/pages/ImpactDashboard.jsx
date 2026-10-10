import React, { useEffect, useState } from 'react';
import { fetchDashboard } from '../api';
import { CheckCircle2, AlertTriangle, Scale, BarChart3, Users, Store } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ImpactDashboard({ clock }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchDashboard();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [clock]);

  if (loading && !stats) {
    return <div className="p-8 text-center text-slate-400 text-xs">Loading metrics...</div>;
  }

  if (!stats) return null;

  const chartData = [
    { name: 'Collected', value: stats.collected, color: '#10b981' },
    { name: 'In Progress', value: stats.inProgress, color: '#3b82f6' },
    { name: 'Still Open', value: stats.stillOpen, color: '#f59e0b' },
    { name: 'Missed', value: stats.missed, color: '#ef4444' },
    { name: 'Wasted', value: stats.wasted, color: '#64748b' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>📊</span> Impact & Reconciliation Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative breakdown of all listed food and mathematical audit of rescue outcomes.
          </p>
        </div>

        {/* Reconciliation Status Badge */}
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold border shadow-sm ${
            stats.isBalanced
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80'
              : 'bg-red-950/80 text-red-300 border-red-700/80'
          }`}
        >
          {stats.isBalanced ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Totals Balanced (Equation Verified)</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>Reconciliation Error</span>
            </>
          )}
        </div>
      </div>

      {/* Reconciliation Formula Banner */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-2">
          <Scale className="w-4 h-4 text-amber-400" />
          <span>Conservation of Mass Equation:</span>
        </div>
        <div className="bg-slate-900/90 rounded-xl p-4 font-mono text-xs text-slate-200 border border-slate-700/70 overflow-x-auto">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-white text-sm bg-slate-800 px-2 py-1 rounded">
              Listed ({stats.listed} kg)
            </span>
            <span>=</span>
            <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-1 rounded">
              Collected ({stats.collected} kg)
            </span>
            <span>+</span>
            <span className="text-red-400 font-bold bg-red-950/60 px-2 py-1 rounded">
              Missed ({stats.missed} kg)
            </span>
            <span>+</span>
            <span className="text-slate-400 font-bold bg-slate-800 px-2 py-1 rounded">
              Wasted ({stats.wasted} kg)
            </span>
            <span>+</span>
            <span className="text-blue-400 font-bold bg-blue-950/60 px-2 py-1 rounded">
              In Progress ({stats.inProgress} kg)
            </span>
            <span>+</span>
            <span className="text-amber-400 font-bold bg-amber-950/60 px-2 py-1 rounded">
              Still Open ({stats.stillOpen} kg)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Sum of right-hand components: <span className="font-bold text-white">{stats.sumOfParts} kg</span> (Difference: {stats.listed - stats.sumOfParts} kg)
          </div>
        </div>
      </div>

      {/* 6 Key Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-800/90 border border-slate-700 p-4 rounded-2xl">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Listed</div>
          <div className="text-2xl font-black text-white mt-1">{stats.listed} <span className="text-xs font-normal text-slate-400">kg</span></div>
          <div className="text-[10px] text-slate-500 mt-1">Total posted (non-cancelled)</div>
        </div>

        <div className="bg-emerald-950/30 border border-emerald-800/40 p-4 rounded-2xl">
          <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Collected</div>
          <div className="text-2xl font-black text-emerald-300 mt-1">{stats.collected} <span className="text-xs font-normal text-emerald-500">kg</span></div>
          <div className="text-[10px] text-emerald-500 mt-1">Safely rescued & collected</div>
        </div>

        <div className="bg-blue-950/30 border border-blue-800/40 p-4 rounded-2xl">
          <div className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">In Progress</div>
          <div className="text-2xl font-black text-blue-300 mt-1">{stats.inProgress} <span className="text-xs font-normal text-blue-500">kg</span></div>
          <div className="text-[10px] text-blue-500 mt-1">Actively reserved by volunteers</div>
        </div>

        <div className="bg-amber-950/30 border border-amber-800/40 p-4 rounded-2xl">
          <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">Still Open</div>
          <div className="text-2xl font-black text-amber-300 mt-1">{stats.stillOpen} <span className="text-xs font-normal text-amber-500">kg</span></div>
          <div className="text-[10px] text-amber-500 mt-1">Unclaimed on active donations</div>
        </div>

        <div className="bg-red-950/30 border border-red-800/40 p-4 rounded-2xl">
          <div className="text-[11px] font-semibold text-red-400 uppercase tracking-wider">Missed</div>
          <div className="text-2xl font-black text-red-300 mt-1">{stats.missed} <span className="text-xs font-normal text-red-500">kg</span></div>
          <div className="text-[10px] text-red-500 mt-1">Claims not picked up in time</div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/60 p-4 rounded-2xl">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Wasted</div>
          <div className="text-2xl font-black text-slate-300 mt-1">{stats.wasted} <span className="text-xs font-normal text-slate-500">kg</span></div>
          <div className="text-[10px] text-slate-500 mt-1">Unclaimed on expired donations</div>
        </div>
      </div>

      {/* Visual Chart Breakdown */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-lg">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <span>Kilogram Allocation Breakdown</span>
        </h3>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val) => [`${val} kg`, 'Quantity']}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Leaderboards / Tables: Donors and Volunteers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Donor Impact Table */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 shadow-lg">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Store className="w-4 h-4 text-emerald-400" />
            <span>Donor Rescues (Collected kg)</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="py-2">Donor Name</th>
                  <th className="py-2">Zone</th>
                  <th className="py-2 text-right">Collected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {stats.donorStats?.map(donor => (
                  <tr key={donor.id} className="hover:bg-slate-750">
                    <td className="py-2 font-medium text-slate-200">{donor.name}</td>
                    <td className="py-2 text-slate-400">{donor.zone}</td>
                    <td className="py-2 text-right font-bold text-emerald-400">{donor.collected_kg} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Volunteer Impact Table */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 shadow-lg">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span>Volunteer Impact</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="py-2">Volunteer</th>
                  <th className="py-2">Capacity</th>
                  <th className="py-2 text-right">Collected</th>
                  <th className="py-2 text-right">Missed Claims</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {stats.volunteerStats?.map(vol => (
                  <tr key={vol.id} className="hover:bg-slate-750">
                    <td className="py-2 font-medium text-slate-200">{vol.name}</td>
                    <td className="py-2 text-slate-400">{vol.capacity_kg} kg</td>
                    <td className="py-2 text-right font-bold text-emerald-400">{vol.collected_kg} kg</td>
                    <td className="py-2 text-right font-bold text-red-400">{vol.missed_claims_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
