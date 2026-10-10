import React from 'react';
import { Flame, Clock, MapPin, ArrowRight } from 'lucide-react';
import CountdownTimer from './CountdownTimer';

export default function RescueNowQueue({
  queue,
  clock,
  selectedPerson,
  activeRole,
  onClaimClick
}) {
  if (!queue || queue.length === 0) {
    return null;
  }

  // Show top 3 most urgent donations
  const topQueue = queue.slice(0, 3);

  return (
    <div className="bg-gradient-to-r from-amber-950/40 via-slate-800 to-slate-900 border border-amber-500/40 rounded-2xl p-5 mb-8 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Rescue Now Queue
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Highest Priority
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Surplus food prioritized by closest pickup deadline. Claim before time expires!
            </p>
          </div>
        </div>
        <div className="text-xs text-slate-400 font-medium">
          {queue.length} urgent {queue.length === 1 ? 'item' : 'items'} available
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topQueue.map((item) => {
          const isVolunteer = activeRole === 'volunteer';
          const canVolunteerClaim =
            isVolunteer &&
            selectedPerson?.zones?.includes(item.zone) &&
            item.remaining_kg > 0;

          return (
            <div
              key={item.id}
              className="bg-slate-850 bg-slate-900/90 border border-slate-700/80 hover:border-amber-500/50 rounded-xl p-4 flex flex-col justify-between transition shadow-sm"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {item.zone}
                  </span>
                  <CountdownTimer
                    clock={clock}
                    pickupUntil={item.pickup_until}
                    isExpired={false}
                  />
                </div>

                <h3 className="font-bold text-white text-sm line-clamp-1 mb-1">
                  {item.description}
                </h3>
                <p className="text-xs text-slate-400 mb-3">{item.donor_name}</p>

                <div className="bg-slate-800/80 rounded-lg p-2 flex justify-between text-xs text-slate-300 border border-slate-700/50 mb-3">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Available:</span>
                    <span className="font-bold text-amber-300">{item.remaining_kg} kg</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-[11px] block">Deadline:</span>
                    <span className="font-mono text-slate-200 text-[11px]">
                      {item.pickup_until.split('T')[1]}
                    </span>
                  </div>
                </div>
              </div>

              {isVolunteer ? (
                <button
                  onClick={() => onClaimClick(item)}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    canVolunteerClaim
                      ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-md'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <span>Rescue {item.remaining_kg} kg</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="text-[11px] text-center text-slate-500 py-1">
                  Switch to Volunteer to Claim
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
