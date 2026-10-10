import mongoose from 'mongoose';

const volunteerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  capacity_kg: { type: Number, required: true },
  zones: [{ type: String }]
});

export const Volunteer = mongoose.model('Volunteer', volunteerSchema);

