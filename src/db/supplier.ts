import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  user_id: {type: String, required: true},
  name: {type: String, required: true, trim: true},
  phone: {type: String, trim: true},
  email: {type: String, trim: true},
  amount_owed: {type: Number, default: 0.0},
  notes: {type: String},
  created_at: {type: Date, default: Date.now},
  updated_at: {type: Date, default: Date.now}
});

supplierSchema.index({ user_id: 1, email: 1 }, { unique: true, sparse: true });
supplierSchema.index({ user_id: 1, phone: 1 }, { unique: true, sparse: true });
supplierSchema.index({ user_id: 1, name: 1 }, { unique: false });

//controller helpers
export const SupplierModel = mongoose.model('Supplier', supplierSchema);
export const getSuppliersByUserId = (user_id: string) => SupplierModel.find({ user_id });
export const getSupplierById = (id: string) => SupplierModel.findById(id);
export const getSupplierByNameForUser = (name: string, user_id: string) => SupplierModel.find({ name, user_id });
export const getSupplierByPhoneForUser = (phone: string, user_id: string) => SupplierModel.find({ phone, user_id });
export const getSupplierByEmailForUser = (email: string, user_id: string) => SupplierModel.find({ email, user_id });
export const dbCreateSupplier = (values: Record<string, any>) => new SupplierModel(values).save().then(doc => doc.toObject());
export const deleteSupplierById = (id: string) => SupplierModel.findOneAndDelete({ _id: id });
export const updateSupplierById = (id: string, values: Record<string, any>) => SupplierModel.findOneAndUpdate({ _id: id }, values, { new: true });
export const deleteSupplierByPhoneForUser = (phone: string, user_id: string) => SupplierModel.findOneAndDelete({ phone, user_id });
export const deleteSupplierByEmailForUser = (email: string, user_id: string) => SupplierModel.findOneAndDelete({ email, user_id });
export const deleteSupplierByNameForUser = (name: string, user_id: string) => SupplierModel.findOneAndDelete({ name, user_id });