import React, { useState } from 'react';
import { MapPin, Calendar, Clock, AlertCircle, ChevronDown, ChevronUp, Check, X, ShieldAlert } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import RescueProgress from './RescueProgress';

export default function MissionCard({
  donation,
  clock,
  activeRole,
  selectedPerson,
  onClaimClick,
  onCollectClick,
  onCancelClaimClick,
  onCancelDonationClick
}) {
  const [showClaims, setShowClaims] = useState(false);

  // Status badge styling and text
  const getStatusBadge = () => {
    switch (donation.status) {
      case 'OPEN':
        if (donation.reserved_kg > 0) {
          return (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
              Partially Reserved
            </span>
          );
        }
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
            Open for Rescue
          </span>
        );
      case 'FULLY_CLAIMED':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-950 text-blue-300 border border-blue-800">
            Fully Reserved
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-950 text-red-300 border border-red-800">
            Expired
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const isVolunteer = activeRole === 'volunteer';
  const isDonorOwner = activeRole === 'donor' && selectedPerson?.id === donation.donor_id;

  // Volunteer eligibility check for fast visual hint
  const canVolunteerClaim =
    isVolunteer &&
    donation.status === 'OPEN' &&
    donation.remaining_kg > 0 &&
    selectedPerson?.zones?.includes(donation.zone);

  return (
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-lg hover:border-slate-600 transition flex flex-col justify-between">
      <div>
        {/* Header: Title and Status */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <h3 className="font-bold text-white text-base leading-snug">
              {donation.description}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-300">
              <span className="font-medium text-emerald-400">{donation.donor_name}</span>
              <span className="text-slate-500">•</span>
              <span className="inline-flex items-center gap-1 text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded-md">
                <MapPin className="w-3 h-3 text-emerald-400" />
                {donation.zone}
              </span>
            </div>
          </div>
          <div>{getStatusBadge()}</div>
        </div>

        {/* Pickup Times */}
        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/50 mt-3 text-xs space-y-1">
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-400">Pickup Window:</span>
            <span className="font-mono text-slate-200">
              {donation.pickup_from.replace('T', ' ')} → {donation.pickup_until.replace('T', ' ')}
            </span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-slate-800">
            <span className="text-slate-400">Time to Close:</span>
            <CountdownTimer
              clock={clock}
              pickupUntil={donation.pickup_until}
              isExpired={donation.status === 'EXPIRED'}
            />
          </div>
        </div>

        {/* Progress & Kg breakdown */}
        <RescueProgress
          quantityKg={donation.quantity_kg}
          collectedKg={donation.collected_kg}
          reservedKg={donation.reserved_kg}
          remainingKg={donation.remaining_kg}
          rescueProgress={donation.rescue_progress}
        />
      </div>

      {/* Action Buttons & Claims Section */}
      <div className="mt-4 pt-3 border-t border-slate-700/60">
        <div className="flex items-center justify-between gap-2">
          {/* Volunteer Claim Button */}
          {isVolunteer && (
            <button
              onClick={() => onClaimClick(donation)}
              disabled={donation.status !== 'OPEN' || donation.remaining_kg <= 0}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition shadow-sm ${
                canVolunteerClaim
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {donation.status !== 'OPEN' || donation.remaining_kg <= 0
                ? 'Unavailable'
                : canVolunteerClaim
                ? '⚡ Claim Food'
                : 'Claim Food (Check Rules)'}
            </button>
          )}

          {/* Donor Cancel Button */}
          {isDonorOwner && (
            <button
              onClick={() => onCancelDonationClick(donation.id)}
              disabled={!donation.can_cancel}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition ${
                donation.can_cancel
                  ? 'bg-red-900/40 hover:bg-red-800/60 text-red-200 border border-red-700/60'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/40'
              }`}
              title={
                donation.can_cancel
                  ? 'Cancel this open donation'
                  : 'Can only cancel while OPEN and with no ACTIVE or COLLECTED claims'
              }
            >
              Cancel Donation
            </button>
          )}

          {/* Toggle Claims view */}
          {donation.claims && donation.claims.length > 0 && (
            <button
              onClick={() => setShowClaims(!showClaims)}
              className="p-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 flex items-center gap-1"
              title="Show Claims"
            >
              <span>{donation.claims.length} Claim{donation.claims.length > 1 ? 's' : ''}</span>
              {showClaims ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Accordion Claims List */}
        {showClaims && donation.claims && donation.claims.length > 0 && (
          <div className="mt-3 bg-slate-900/80 rounded-xl p-3 border border-slate-700/70 space-y-2 text-xs">
            <div className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">
              Claims for this donation:
            </div>
            {donation.claims.map((claim) => {
              const isMyClaim = isVolunteer && selectedPerson?.id === claim.volunteer_id;
              const canCollect =
                isMyClaim &&
                claim.status === 'ACTIVE' &&
                clock >= donation.pickup_from &&
                clock <= donation.pickup_until;
              const canCancelClaim =
                isMyClaim &&
                claim.status === 'ACTIVE' &&
                clock < claim.planned_pickup_time;

              return (
                <div
                  key={claim.id}
                  className="bg-slate-800/90 p-2 rounded-lg border border-slate-700/60 flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="font-medium text-slate-200 flex items-center gap-1.5">
                      <span>{claim.quantity_kg} kg</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        Pickup: {claim.planned_pickup_time.replace('T', ' ')}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Status: <span className="font-semibold text-amber-300">{claim.status}</span>
                      {claim.volunteer_id && (
                        <span className="ml-1 text-slate-500">({claim.volunteer_id})</span>
                      )}
                    </div>
                  </div>

                  {/* Actions for active claim owner */}
                  {isMyClaim && claim.status === 'ACTIVE' && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onCollectClick(claim.id)}
                        disabled={!canCollect}
                        className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 ${
                          canCollect
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-slate-700/60 text-slate-500 cursor-not-allowed'
                        }`}
                        title={
                          canCollect
                            ? 'Mark as Collected'
                            : 'Can only collect within pickup window'
                        }
                      >
                        <Check className="w-3 h-3" /> Collect
                      </button>
                      <button
                        onClick={() => onCancelClaimClick(claim.id)}
                        disabled={!canCancelClaim}
                        className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 ${
                          canCancelClaim
                            ? 'bg-red-800 hover:bg-red-700 text-white'
                            : 'bg-slate-700/60 text-slate-500 cursor-not-allowed'
                        }`}
                        title={
                          canCancelClaim
                            ? 'Cancel Claim (kg returns)'
                            : 'Can only cancel strictly before planned pickup time'
                        }
                      >
                        <X className="w-3 h-3" /> Cancel
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
