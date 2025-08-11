import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  user_id: {type: String,required: true},
  name: {type: String, required: true, trim: true},
  phone: {type: String, trim: true},
  email: {type: String, trim: true},
  amount_owed: {type: Number, default: 0.0},
  notes: {type: String},
  created_at: {type: Date, default: Date.now},
  updated_at: {type: Date,default: Date.now}
});

export const SupplierModel = mongoose.model('Supplier', supplierSchema);

//controllers
export const getAllSuppliers = () => SupplierModel.find();
export const getSupplierByName = (name: string) => SupplierModel.find({ name });
export const getSupplierPhone = (phone: string) => SupplierModel.findOne({ phone });
export const getSupplierEmail = (email: string) => SupplierModel.findOne({ email });
export const createSupplier = (values: Record<string, any>) => new SupplierModel(values)
    .save()
    .then((suppliers) => suppliers.toObject());
export const deleteSupplierById = (id: string) => SupplierModel.findOneAndDelete({ _id: id });
export const updateSupplierById = (id: string, values: Record<string, any>) =>
    SupplierModel.findOneAndUpdate({ _id: id }, values, { new: true });
