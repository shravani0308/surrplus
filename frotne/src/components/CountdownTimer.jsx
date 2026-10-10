import React from 'react';
import { Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function CountdownTimer({ clock, pickupUntil, isExpired }) {
  if (!clock || !pickupUntil) return null;

  const currentMs = new Date(clock).getTime();
  const deadlineMs = new Date(pickupUntil).getTime();
  const diffMs = deadlineMs - currentMs;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (isExpired || diffMinutes <= 0) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-950/80 text-red-300 border border-red-800/80">
        <XCircle className="w-3.5 h-3.5 text-red-400" />
        <span>Pickup window closed</span>
      </div>
    );
  }

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  const timeText = hours > 0 ? `${hours}h ${minutes}m remaining` : `${minutes}m remaining`;

  // Urgency styling based on problem specs
  if (diffMinutes <= 15) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-900/40 text-red-300 border border-red-700 animate-pulse">
        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
        <span>Urgent pickup: {timeText}</span>
      </div>
    );
  }

  if (diffMinutes <= 60) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-900/40 text-amber-300 border border-amber-700">
        <Clock className="w-3.5 h-3.5 text-amber-400" />
        <span>Pickup closes in {timeText}</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
      <Clock className="w-3.5 h-3.5 text-slate-400" />
      <span>{timeText}</span>
    </div>
  );
}
