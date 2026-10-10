// API helper for SurplusLink backend

const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return '/api';
  const clean = envUrl.replace(/\/$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

const API_BASE = getApiBase();

export async function fetchClock() {
  const res = await fetch(`${API_BASE}/clock`);
  return res.json();
}

export async function updateClock(newClockTime) {
  const res = await fetch(`${API_BASE}/clock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clock: newClockTime })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update clock');
  return data;
}

export async function fetchDonors() {
  const res = await fetch(`${API_BASE}/donors`);
  return res.json();
}

export async function fetchVolunteers() {
  const res = await fetch(`${API_BASE}/volunteers`);
  return res.json();
}

export async function fetchDonations() {
  const res = await fetch(`${API_BASE}/donations`);
  return res.json();
}

export async function postDonation(donationData) {
  const res = await fetch(`${API_BASE}/donations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(donationData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to post donation');
  return data;
}

export async function cancelDonation(donationId, donorId) {
  const res = await fetch(`${API_BASE}/donations/${donationId}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ donor_id: donorId })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to cancel donation');
  return data;
}

export async function fetchClaims(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/claims?${query}`);
  return res.json();
}

export async function submitClaim(claimData) {
  const res = await fetch(`${API_BASE}/claims`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(claimData)
  });
  const data = await res.json();
  if (!res.ok) {
    const errorMsg = data.errors ? data.errors.join(' | ') : data.message || 'Claim failed';
    throw new Error(errorMsg);
  }
  return data;
}

export async function collectClaim(claimId, volunteerId) {
  const res = await fetch(`${API_BASE}/claims/${claimId}/collect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ volunteer_id: volunteerId })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to collect claim');
  return data;
}

export async function cancelClaim(claimId, volunteerId) {
  const res = await fetch(`${API_BASE}/claims/${claimId}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ volunteer_id: volunteerId })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to cancel claim');
  return data;
}

export async function fetchRescueNow(volunteerId) {
  const res = await fetch(`${API_BASE}/rescue-now${volunteerId ? `?volunteer_id=${volunteerId}` : ''}`);
  return res.json();
}

export async function fetchDashboard() {
  const res = await fetch(`${API_BASE}/dashboard`);
  return res.json();
}

export async function resetDatabase() {
  const res = await fetch(`${API_BASE}/seed/reset`, {
    method: 'POST'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to reset database');
  return data;
}
