import React from 'react';

export default function RescueProgress({
  quantityKg,
  collectedKg,
  reservedKg,
  remainingKg,
  rescueProgress
}) {
  return (
    <div className="space-y-2 mt-3 pt-3 border-t border-slate-700/60">
      {/* Progress Bar Header */}
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-400 font-medium">Rescue Progress</span>
        <span className="font-bold text-emerald-400">{rescueProgress || 0}%</span>
      </div>

      {/* Visual Bar */}
      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
        {/* Collected (Green) */}
        <div
          style={{ width: `${Math.min(100, rescueProgress)}%` }}
          className="bg-emerald-500 h-full transition-all duration-300"
          title={`Collected: ${collectedKg} kg`}
        />
        {/* Reserved (Blue/Cyan) */}
        {quantityKg > 0 && reservedKg > 0 && (
          <div
            style={{ width: `${Math.min(100 - rescueProgress, (reservedKg / quantityKg) * 100)}%` }}
            className="bg-blue-500 h-full transition-all duration-300"
            title={`Reserved: ${reservedKg} kg`}
          />
        )}
      </div>

      {/* Numerical breakdown */}
      <div className="grid grid-cols-4 gap-1 text-[11px] text-center pt-1">
        <div className="bg-slate-800/80 p-1 rounded border border-slate-700/50">
          <div className="text-slate-400">Total</div>
          <div className="font-bold text-slate-200">{quantityKg} kg</div>
        </div>
        <div className="bg-emerald-950/40 p-1 rounded border border-emerald-800/40">
          <div className="text-emerald-400">Collected</div>
          <div className="font-bold text-emerald-300">{collectedKg} kg</div>
        </div>
        <div className="bg-blue-950/40 p-1 rounded border border-blue-800/40">
          <div className="text-blue-400">Reserved</div>
          <div className="font-bold text-blue-300">{reservedKg} kg</div>
        </div>
        <div className="bg-amber-950/40 p-1 rounded border border-amber-800/40">
          <div className="text-amber-400">Remaining</div>
          <div className="font-bold text-amber-300">{remainingKg} kg</div>
        </div>
      </div>
    </div>
  );
}
