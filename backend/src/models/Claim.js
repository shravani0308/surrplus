import mongoose from 'mongoose';

const claimSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  donation_id: { type: String, required: true },
  volunteer_id: { type: String, required: true },
  quantity_kg: { type: Number, required: true },
  planned_pickup_time: { type: String, required: true },
  status: {
    type: String,
    enum: ['ACTIVE', 'COLLECTED', 'CANCELLED', 'MISSED'],
    default: 'ACTIVE'
  }
}, { timestamps: true });

export const Claim = mongoose.model('Claim', claimSchema);

