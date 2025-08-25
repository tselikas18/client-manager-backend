import mongoose from 'mongoose';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

const clientSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  phone: { type: String, trim: true },
  email: {
    type: String,
    trim: true,
    validate: { validator(v) { return !v || emailRegex.test(v); } }
  },
  amount_owed: { type: Number, default: 0.0 },
  notes: { type: String },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

clientSchema.index({ user_id: 1, email: 1 }, { unique: true, sparse: true });
clientSchema.index({ user_id: 1, phone: 1 }, { unique: true, sparse: true });

export const ClientModel = mongoose.model('Client', clientSchema);

//controller helpers
export const getClientsByUserId = (user_id : string) => ClientModel.find({user_id});
export const getClientById = (id: string) => ClientModel.findById(id);
export const getClientByEmailForUser = (email: string, user_id: string) => ClientModel.findOne({ email, user_id });
export const getClientByPhoneForUser = (phone: string, user_id: string) => ClientModel.findOne({ phone, user_id });
export const getClientByNameForUser = (name: string, user_id: string) => ClientModel.findOne({ name, user_id });
export const dbCreateClient = (values: Record<string, any>) => new ClientModel(values)
    .save()
    .then((client) => client.toObject());
export const deleteClientById = (id: string) => ClientModel.findOneAndDelete({ _id: id });
export const deleteClientByPhoneForUser = (phone: string, user_id: string) => ClientModel.findOneAndDelete({ phone, user_id });
export const deleteClientByEmailForUser = (email: string, user_id: string) => ClientModel.findOneAndDelete({ email, user_id });
export const deleteClientByNameForUser = (name: string, user_id: string) => ClientModel.findOneAndDelete({ name, user_id });
export const updateClientById = (id: string, values: Record<string, any>) => ClientModel.findByIdAndUpdate(id, values, { new: true });