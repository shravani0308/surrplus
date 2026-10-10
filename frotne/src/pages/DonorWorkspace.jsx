import React, { useState } from 'react';
import { Store, Plus, MapPin, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import MissionCard from '../components/MissionCard';
import DonationModal from '../components/DonationModal';

export default function DonorWorkspace({
  donations,
  clock,
  selectedDonor,
  onRefresh,
  onCancelDonationClick
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Donations posted by this donor
  const myDonations = donations.filter(d => d.donor_id === selectedDonor?.id);

  const totalKgPosted = myDonations.reduce((sum, d) => sum + (d.is_cancelled ? 0 : d.quantity_kg), 0);
  const totalKgCollected = myDonations.reduce((sum, d) => sum + d.collected_kg, 0);

  return (
    <div className="space-y-6">
      {/* Donor Profile Header */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
            <Store className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {selectedDonor?.name}
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-700 text-slate-300 font-normal">
                {selectedDonor?.zone}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Donor Portal • Post extra food before closing and track volunteer pickups.
            </p>
          </div>
        </div>

        {/* Quick Stats & Action */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-slate-400">Total Food Rescued:</div>
            <div className="text-base font-bold text-emerald-400">{totalKgCollected} kg / {totalKgPosted} kg</div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Post Surplus Food</span>
          </button>
        </div>
      </div>

      {/* List of Donations */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-white">
            My Posted Food ({myDonations.length})
          </h3>
          <span className="text-xs text-slate-400">
            Note: You can cancel a donation only while it is OPEN and has no ACTIVE or COLLECTED claims.
          </span>
        </div>

        {myDonations.length === 0 ? (
          <div className="text-center py-16 bg-slate-800/40 rounded-2xl border border-slate-800">
            <Store className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-300">No food posted yet</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Click the button above to post your surplus food and connect with city volunteers.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl"
            >
              <Plus className="w-4 h-4" /> Post Surplus Food
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myDonations.map((donation) => (
              <MissionCard
                key={donation.id}
                donation={donation}
                clock={clock}
                activeRole="donor"
                selectedPerson={selectedDonor}
                onCancelDonationClick={onCancelDonationClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Post Donation Modal */}
      <DonationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clock={clock}
        selectedDonor={selectedDonor}
        onSuccess={() => {
          onRefresh();
        }}
      />
    </div>
  );
}
