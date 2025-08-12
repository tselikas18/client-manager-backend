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

//controllers
export const getClients = () => ClientModel.find();
export const getClientByName = (name: string) => ClientModel.find({name});
export const getClientByEmail = (email: string) => ClientModel.findOne({ email });
export const getClientByPhone = (phone: string) => ClientModel.findOne({ phone });
export const dbCreateClient = (values: Record<string, any>) => new ClientModel(values)
    .save()
    .then((client) => client.toObject());
export const deleteClientById = (id: string) => ClientModel.findOneAndDelete({ _id: id });
export const updateClientById = (id: string, values: Record<string, any>) => ClientModel.findOneAndUpdate({ _id: id }, values, { new: true });