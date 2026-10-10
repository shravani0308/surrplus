import React, { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { postDonation } from '../api';

export default function DonationModal({
  isOpen,
  onClose,
  clock,
  selectedDonor,
  onSuccess
}) {
  const [description, setDescription] = useState('');
  const [quantityKg, setQuantityKg] = useState('10');
  const [pickupFrom, setPickupFrom] = useState(clock || '');
  const [pickupUntil, setPickupUntil] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const qty = parseInt(quantityKg, 10);
    if (!qty || qty < 1) {
      setError('Quantity must be a whole number of at least 1 kg.');
      return;
    }

    if (!pickupFrom || !pickupUntil) {
      setError('Please provide both pickup start and pickup deadline times.');
      return;
    }

    if (pickupFrom >= pickupUntil) {
      setError('Pickup start time must be strictly before the pickup deadline.');
      return;
    }

    if (pickupUntil < clock) {
      setError(`Pickup deadline cannot be before simulated current time (${clock}).`);
      return;
    }

    try {
      setSubmitting(true);
      await postDonation({
        donor_id: selectedDonor.id,
        description: description.trim(),
        quantity_kg: qty,
        pickup_from: pickupFrom,
        pickup_until: pickupUntil
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
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
          <span>📦</span> Post Surplus Food
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Posting as <span className="text-emerald-400 font-semibold">{selectedDonor?.name}</span> ({selectedDonor?.zone})
        </p>

        {error && (
          <div className="bg-red-950/70 border border-red-700 text-red-300 p-3 rounded-xl mb-4 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Food Description
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 20 trays of cooked pasta and fresh bread"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Quantity (Whole Kilograms)
            </label>
            <input
              type="number"
              min="1"
              step="1"
              required
              value={quantityKg}
              onChange={(e) => setQuantityKg(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Pickup Window Starts
              </label>
              <input
                type="datetime-local"
                required
                value={pickupFrom}
                onChange={(e) => setPickupFrom(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Pickup Deadline
              </label>
              <input
                type="datetime-local"
                required
                value={pickupUntil}
                onChange={(e) => setPickupUntil(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
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
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg transition"
            >
              {submitting ? 'Posting...' : 'Post Donation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
