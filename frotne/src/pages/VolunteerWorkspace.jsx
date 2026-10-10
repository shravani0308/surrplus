import React from 'react';
import { Truck, CheckCircle2, XCircle, AlertTriangle, Clock, MapPin, Check, X } from 'lucide-react';
import MissionCard from '../components/MissionCard';

export default function VolunteerWorkspace({
  donations,
  clock,
  selectedVolunteer,
  onClaimClick,
  onCollectClick,
  onCancelClaimClick
}) {
  // Find all claims made by this volunteer across all donations
  const myClaims = [];
  donations.forEach(donation => {
    (donation.claims || []).forEach(claim => {
      if (claim.volunteer_id === selectedVolunteer?.id) {
        myClaims.push({
          ...claim,
          donation
        });
      }
    });
  });

  // Sort claims: ACTIVE first, then COLLECTED, MISSED, CANCELLED
  myClaims.sort((a, b) => {
    if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
    if (b.status === 'ACTIVE' && a.status !== 'ACTIVE') return 1;
    return b.planned_pickup_time.localeCompare(a.planned_pickup_time);
  });

  // Available donations in volunteer's zones
  const zoneDonations = donations.filter(d =>
    d.status === 'OPEN' &&
    d.remaining_kg > 0 &&
    selectedVolunteer?.zones?.includes(d.zone)
  );

  const activeClaimsCount = myClaims.filter(c => c.status === 'ACTIVE').length;
  const collectedKg = myClaims
    .filter(c => c.status === 'COLLECTED')
    .reduce((sum, c) => sum + c.quantity_kg, 0);
  const missedClaimsCount = myClaims.filter(c => c.status === 'MISSED').length;

  return (
    <div className="space-y-8">
      {/* Volunteer Profile Banner */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl border border-blue-500/30">
            <Truck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {selectedVolunteer?.name}
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 font-normal">
                Capacity: {selectedVolunteer?.capacity_kg} kg
              </span>
            </h2>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
              <span>Assigned Zones:</span>
              <div className="flex gap-1">
                {selectedVolunteer?.zones?.map(z => (
                  <span key={z} className="px-2 py-0.5 bg-slate-700 text-slate-200 rounded-md font-semibold text-[11px]">
                    {z}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats summary */}
        <div className="flex items-center gap-4 text-xs">
          <div className="bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-700 text-center">
            <span className="text-slate-400 block text-[11px]">Active Rescues</span>
            <span className="font-bold text-blue-400 text-base">{activeClaimsCount}</span>
          </div>
          <div className="bg-emerald-950/40 px-3 py-2 rounded-xl border border-emerald-800/40 text-center">
            <span className="text-emerald-400 block text-[11px]">Collected</span>
            <span className="font-bold text-emerald-300 text-base">{collectedKg} kg</span>
          </div>
          <div className="bg-red-950/40 px-3 py-2 rounded-xl border border-red-800/40 text-center">
            <span className="text-red-400 block text-[11px]">Missed</span>
            <span className="font-bold text-red-300 text-base">{missedClaimsCount}</span>
          </div>
        </div>
      </div>

      {/* Section 1: My Claims */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <span>📋</span> My Claimed Rescues ({myClaims.length})
        </h3>

        {myClaims.length === 0 ? (
          <div className="p-8 text-center bg-slate-800/40 rounded-2xl border border-slate-800 text-xs text-slate-400">
            You haven't claimed any surplus food yet. See available donations below!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myClaims.map(claim => {
              const { donation } = claim;
              const canCollect =
                claim.status === 'ACTIVE' &&
                clock >= donation.pickup_from &&
                clock <= donation.pickup_until;
              const canCancelClaim =
                claim.status === 'ACTIVE' &&
                clock < claim.planned_pickup_time;

              return (
                <div
                  key={claim.id}
                  className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="text-xs font-bold text-white line-clamp-1">
                        {donation.description}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-bold border ${
                          claim.status === 'ACTIVE'
                            ? 'bg-blue-950 text-blue-300 border-blue-800'
                            : claim.status === 'COLLECTED'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : claim.status === 'MISSED'
                            ? 'bg-red-950 text-red-300 border-red-800'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {claim.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 mb-2">
                      {donation.donor_name} • <span className="text-emerald-400 font-semibold">{donation.zone}</span>
                    </div>

                    <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-xs space-y-1 mb-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Reserved Amount:</span>
                        <span className="font-bold text-amber-300">{claim.quantity_kg} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Planned Pickup:</span>
                        <span className="font-mono text-slate-200">
                          {claim.planned_pickup_time.replace('T', ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800">
                        <span>Window:</span>
                        <span>{donation.pickup_from.split('T')[1]} - {donation.pickup_until.split('T')[1]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for ACTIVE claim */}
                  {claim.status === 'ACTIVE' && (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-700/60">
                      <button
                        onClick={() => onCollectClick(claim.id)}
                        disabled={!canCollect}
                        className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition ${
                          canCollect
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                            : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                        }`}
                        title={
                          canCollect
                            ? 'Mark as Collected'
                            : `Can only collect during pickup window (${donation.pickup_from} to ${donation.pickup_until}). Current clock: ${clock}`
                        }
                      >
                        <Check className="w-3.5 h-3.5" /> Mark Collected
                      </button>

                      <button
                        onClick={() => onCancelClaimClick(claim.id)}
                        disabled={!canCancelClaim}
                        className={`py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                          canCancelClaim
                            ? 'bg-red-900/50 hover:bg-red-800 text-red-200 border border-red-700/60'
                            : 'bg-slate-750 text-slate-500 cursor-not-allowed'
                        }`}
                        title={
                          canCancelClaim
                            ? 'Cancel Claim (quantity returns to donation)'
                            : `Can only cancel strictly before planned time (${claim.planned_pickup_time}). Current clock: ${clock}`
                        }
                      >
                        <X className="w-3.5 h-3.5" /> Cancel
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Available in Volunteer's Zones */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>📍</span> Available Surplus in Your Zones ({zoneDonations.length})
          </h3>
          <span className="text-xs text-slate-400">
            Zones: {selectedVolunteer?.zones?.join(', ')}
          </span>
        </div>

        {zoneDonations.length === 0 ? (
          <div className="p-8 text-center bg-slate-800/40 rounded-2xl border border-slate-800 text-xs text-slate-400">
            No open donations available in your assigned zones right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {zoneDonations.map(donation => (
              <MissionCard
                key={donation.id}
                donation={donation}
                clock={clock}
                activeRole="volunteer"
                selectedPerson={selectedVolunteer}
                onClaimClick={onClaimClick}
                onCollectClick={onCollectClick}
                onCancelClaimClick={onCancelClaimClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
