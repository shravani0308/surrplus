import mongoose from 'mongoose';

const donorSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  zone: { type: String, required: true }
});

export const Donor = mongoose.model('Donor', donorSchema);

