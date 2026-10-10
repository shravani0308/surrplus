import mongoose from 'mongoose';

const appStateSchema = new mongoose.Schema({
  key: { type: String, default: 'main', unique: true },
  clock: { type: String, required: true },
  is_seeded: { type: Boolean, default: false }
});

export const AppState = mongoose.model('AppState', appStateSchema);

