import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LiveCommandCenter from './pages/LiveCommandCenter';
import DonorWorkspace from './pages/DonorWorkspace';
import VolunteerWorkspace from './pages/VolunteerWorkspace';
import ImpactDashboard from './pages/ImpactDashboard';
import ClaimModal from './components/ClaimModal';
import {
  fetchClock,
  fetchDonors,
  fetchVolunteers,
  fetchDonations,
  fetchRescueNow,
  collectClaim,
  cancelClaim,
  cancelDonation
} from './api';

export default function App() {
  const [clock, setClock] = useState('');
  const [donors, setDonors] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [rescueNowQueue, setRescueNowQueue] = useState([]);

  // Active state
  const [activeRole, setActiveRole] = useState('donor');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [activeTab, setActiveTab] = useState('command-center');

  // Claim modal state
  const [selectedDonationForClaim, setSelectedDonationForClaim] = useState(null);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

  // Loading state
  const [loading, setLoading] = useState(true);

  // Load all initial data
  const loadAllData = async () => {
    try {
      const [clockData, donorList, volunteerList, donationList, queue] = await Promise.all([
        fetchClock(),
        fetchDonors(),
        fetchVolunteers(),
        fetchDonations(),
        fetchRescueNow()
      ]);

      setClock(clockData.clock);
      setDonors(donorList);
      setVolunteers(volunteerList);
      setDonations(donationList);
      setRescueNowQueue(queue);

      // Default selected person if not set
      if (!selectedPerson) {
        if (activeRole === 'donor' && donorList.length > 0) {
          setSelectedPerson(donorList[0]);
        } else if (activeRole === 'volunteer' && volunteerList.length > 0) {
          setSelectedPerson(volunteerList[0]);
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Update selected person when role toggles
  useEffect(() => {
    if (activeRole === 'donor' && donors.length > 0) {
      setSelectedPerson(donors[0]);
    } else if (activeRole === 'volunteer' && volunteers.length > 0) {
      setSelectedPerson(volunteers[0]);
    }
  }, [activeRole]);

  // Actions
  const handleOpenClaimModal = (donation) => {
    // If not in volunteer role, switch to volunteer automatically
    if (activeRole !== 'volunteer') {
      setActiveRole('volunteer');
      if (volunteers.length > 0) {
        setSelectedPerson(volunteers[0]);
      }
    }
    setSelectedDonationForClaim(donation);
    setIsClaimModalOpen(true);
  };

  const handleCollectClaim = async (claimId) => {
    try {
      await collectClaim(claimId, selectedPerson?.id);
      await loadAllData();
      alert('Claim marked as COLLECTED successfully!');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCancelClaim = async (claimId) => {
    if (!window.confirm('Cancel this claim? The food quantity will return to the donation.')) return;
    try {
      await cancelClaim(claimId, selectedPerson?.id);
      await loadAllData();
      alert('Claim cancelled successfully.');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCancelDonation = async (donationId) => {
    if (!window.confirm('Are you sure you want to cancel this donation?')) return;
    try {
      await cancelDonation(donationId, selectedPerson?.id);
      await loadAllData();
      alert('Donation cancelled successfully.');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <Navbar
        clock={clock}
        onClockUpdate={loadAllData}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        selectedPerson={selectedPerson}
        setSelectedPerson={setSelectedPerson}
        donors={donors}
        volunteers={volunteers}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-20 text-slate-400 text-sm">
            Connecting to SurplusLink Hub...
          </div>
        ) : (
          <>
            {activeTab === 'command-center' && (
              <LiveCommandCenter
                donations={donations}
                rescueNowQueue={rescueNowQueue}
                clock={clock}
                activeRole={activeRole}
                selectedPerson={selectedPerson}
                onClaimClick={handleOpenClaimModal}
                onCollectClick={handleCollectClaim}
                onCancelClaimClick={handleCancelClaim}
                onCancelDonationClick={handleCancelDonation}
              />
            )}

            {activeTab === 'donor-workspace' && (
              <DonorWorkspace
                donations={donations}
                clock={clock}
                selectedDonor={selectedPerson}
                onRefresh={loadAllData}
                onCancelDonationClick={handleCancelDonation}
              />
            )}

            {activeTab === 'volunteer-workspace' && (
              <VolunteerWorkspace
                donations={donations}
                clock={clock}
                selectedVolunteer={selectedPerson}
                onClaimClick={handleOpenClaimModal}
                onCollectClick={handleCollectClaim}
                onCancelClaimClick={handleCancelClaim}
              />
            )}

            {activeTab === 'dashboard' && (
              <ImpactDashboard clock={clock} />
            )}
          </>
        )}
      </main>

      {/* Claim Modal */}
      <ClaimModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        donation={selectedDonationForClaim}
        clock={clock}
        selectedVolunteer={selectedPerson}
        onSuccess={() => {
          loadAllData();
        }}
      />
    </div>
  );
}
