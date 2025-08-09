import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  user_id: {type: String, required: true},
  name: {type: String, required: true, trim: true},
  phone: {type: String, trim: true},
  email: {type: String, trim: true, match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/},
  amount_owed: {type: Number, default: 0.0},
  notes: {type: String},
  created_at: {type: Date, default: Date.now},
  updated_at: {type: Date, default: Date.now}
});

export const ClientModel = mongoose.model('Client', clientSchema);