import React, { useState } from 'react';
import { X, ShieldAlert, Truck, Check, AlertCircle } from 'lucide-react';
import { submitClaim } from '../api';

export default function ClaimModal({
  isOpen,
  onClose,
  donation,
  clock,
  selectedVolunteer,
  onSuccess
}) {
  const [quantityKg, setQuantityKg] = useState('5');
  const [plannedTime, setPlannedTime] = useState(clock || '');
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !donation) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    const qty = parseInt(quantityKg, 10);
    if (!qty || qty < 1) {
      setErrors(['Claimed quantity must be a whole number of at least 1 kg.']);
      return;
    }

    try {
      setSubmitting(true);
      await submitClaim({
        donation_id: donation.id,
        volunteer_id: selectedVolunteer.id,
        quantity_kg: qty,
        planned_pickup_time: plannedTime
      });

      onSuccess();
      onClose();
    } catch (err) {
      // Split pipe-separated or array errors
      const errList = err.message.split(' | ');
      setErrors(errList);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
          <Truck className="w-5 h-5 text-blue-400" />
          Claim Food for Rescue
        </h2>
        <p className="text-xs text-slate-400 mb-3">
          Claiming as <span className="text-blue-300 font-semibold">{selectedVolunteer?.name}</span> (Max Capacity: {selectedVolunteer?.capacity_kg} kg, Zones: {selectedVolunteer?.zones?.join(', ')})
        </p>

        {/* Donation Summary Card */}
        <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-700/60 mb-4 text-xs space-y-1">
          <div className="font-bold text-slate-100 text-sm">{donation.description}</div>
          <div className="text-slate-400">
            Donor: <span className="text-emerald-400">{donation.donor_name}</span> ({donation.zone})
          </div>
          <div className="flex justify-between pt-1 border-t border-slate-800 text-[11px]">
            <span className="text-slate-400">Remaining Available:</span>
            <span className="font-bold text-amber-300">{donation.remaining_kg} kg</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">Pickup Window:</span>
            <span className="font-mono text-slate-300">
              {donation.pickup_from.replace('T', ' ')} → {donation.pickup_until.replace('T', ' ')}
            </span>
          </div>
        </div>

        {/* Validation Errors Display */}
        {errors.length > 0 && (
          <div className="bg-red-950/80 border border-red-700/80 rounded-xl p-3 mb-4 space-y-1.5 text-xs text-red-200">
            <div className="font-bold flex items-center gap-1.5 text-red-300">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              Claim Refused — Rules Violated:
            </div>
            <ul className="list-disc pl-5 space-y-1">
              {errors.map((err, idx) => (
                <li key={idx} className="leading-tight">{err}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Quantity to Claim (Whole Kilograms)
            </label>
            <input
              type="number"
              min="1"
              max={Math.min(selectedVolunteer?.capacity_kg || 50, donation.remaining_kg)}
              step="1"
              required
              value={quantityKg}
              onChange={(e) => setQuantityKg(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="text-[11px] text-slate-400 mt-1">
              Must be ≤ your capacity ({selectedVolunteer?.capacity_kg} kg) and ≤ remaining kg ({donation.remaining_kg} kg).
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Planned Pickup Time (T)
            </label>
            <input
              type="datetime-local"
              required
              value={plannedTime}
              onChange={(e) => setPlannedTime(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="text-[11px] text-slate-400 mt-1">
              Must be within pickup window, not before current time ({clock}), and ≥60 mins from your other active claims.
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-700/50 hover:bg-slate-700 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg transition"
            >
              {submitting ? 'Validating...' : 'Confirm Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
