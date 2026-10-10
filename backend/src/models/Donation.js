import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  donor_id: { type: String, required: true },
  description: { type: String, required: true },
  quantity_kg: { type: Number, required: true },
  pickup_from: { type: String, required: true },
  pickup_until: { type: String, required: true },
  is_cancelled: { type: Boolean, default: false }
}, { timestamps: true });

export const Donation = mongoose.model('Donation', donationSchema);

