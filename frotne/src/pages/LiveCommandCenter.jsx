import React, { useState } from 'react';
import RescueNowQueue from '../components/RescueNowQueue';
import MissionCard from '../components/MissionCard';
import { Search, Filter, Layers } from 'lucide-react';

export default function LiveCommandCenter({
  donations,
  rescueNowQueue,
  clock,
  activeRole,
  selectedPerson,
  onClaimClick,
  onCollectClick,
  onCancelClaimClick,
  onCancelDonationClick
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Extract unique zones
  const zones = Array.from(new Set(donations.map(d => d.zone).filter(Boolean)));

  // Filter donations
  const filteredDonations = donations.filter(d => {
    const matchesSearch =
      d.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.donor_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesZone = selectedZone === 'ALL' || d.zone === selectedZone;

    const matchesStatus =
      selectedStatus === 'ALL' ||
      (selectedStatus === 'OPEN' && d.status === 'OPEN') ||
      (selectedStatus === 'FULLY_CLAIMED' && d.status === 'FULLY_CLAIMED') ||
      (selectedStatus === 'EXPIRED' && d.status === 'EXPIRED') ||
      (selectedStatus === 'CANCELLED' && d.status === 'CANCELLED');

    return matchesSearch && matchesZone && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Heading */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>⚡</span> Live Rescue Command Center
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time surplus food dispatch, countdowns, and active volunteer reservations.
          </p>
        </div>

        {/* Quick summary badges */}
        <div className="flex items-center gap-2 text-xs">
          <div className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300">
            Total Missions: <span className="font-bold text-white">{donations.length}</span>
          </div>
          <div className="bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-800/60 text-emerald-300">
            Open for Rescue:{' '}
            <span className="font-bold text-emerald-400">
              {donations.filter(d => d.status === 'OPEN').length}
            </span>
          </div>
        </div>
      </div>

      {/* Signature Feature: Rescue Now Queue */}
      <RescueNowQueue
        queue={rescueNowQueue}
        clock={clock}
        selectedPerson={selectedPerson}
        activeRole={activeRole}
        onClaimClick={onClaimClick}
      />

      {/* Search and Filters Bar */}
      <div className="bg-slate-850 bg-slate-800/80 p-4 rounded-2xl border border-slate-700 flex flex-wrap items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search food description or restaurant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Zone Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Zone:</span>
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Zones</option>
            {zones.map(z => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open for Rescue</option>
            <option value="FULLY_CLAIMED">Fully Claimed</option>
            <option value="EXPIRED">Expired</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Missions Grid */}
      {filteredDonations.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/40 rounded-2xl border border-slate-800">
          <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">No rescue missions found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search query or zone/status filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDonations.map((donation) => (
            <MissionCard
              key={donation.id}
              donation={donation}
              clock={clock}
              activeRole={activeRole}
              selectedPerson={selectedPerson}
              onClaimClick={onClaimClick}
              onCollectClick={onCollectClick}
              onCancelClaimClick={onCancelClaimClick}
              onCancelDonationClick={onCancelDonationClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
