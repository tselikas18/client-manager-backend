"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSupplierByNameForUser = exports.deleteSupplierByEmailForUser = exports.deleteSupplierByPhoneForUser = exports.updateSupplierById = exports.deleteSupplierById = exports.dbCreateSupplier = exports.getSupplierByEmailForUser = exports.getSupplierByPhoneForUser = exports.getSupplierByNameForUser = exports.getSupplierById = exports.getSuppliersByUserId = exports.SupplierModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const client_1 = require("./client");
const supplierSchema = new mongoose_1.default.Schema({
    user_id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    email: {
        type: String,
        trim: true,
        validate: { validator(v) { return !v || client_1.emailRegex.test(v); } }
    },
    amount_owed: { type: Number, default: 0.0 },
    notes: { type: String },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});
supplierSchema.index({ user_id: 1, email: 1 }, { unique: true, sparse: true });
supplierSchema.index({ user_id: 1, phone: 1 }, { unique: true, sparse: true });
supplierSchema.index({ user_id: 1, name: 1 }, { unique: false });
//controller helpers
exports.SupplierModel = mongoose_1.default.model('Supplier', supplierSchema);
const getSuppliersByUserId = (user_id) => exports.SupplierModel.find({ user_id });
exports.getSuppliersByUserId = getSuppliersByUserId;
const getSupplierById = (id) => exports.SupplierModel.findById(id);
exports.getSupplierById = getSupplierById;
const getSupplierByNameForUser = (name, user_id) => exports.SupplierModel.findOne({ name, user_id });
exports.getSupplierByNameForUser = getSupplierByNameForUser;
const getSupplierByPhoneForUser = (phone, user_id) => exports.SupplierModel.findOne({ phone, user_id });
exports.getSupplierByPhoneForUser = getSupplierByPhoneForUser;
const getSupplierByEmailForUser = (email, user_id) => exports.SupplierModel.findOne({ email, user_id });
exports.getSupplierByEmailForUser = getSupplierByEmailForUser;
const dbCreateSupplier = (values) => new exports.SupplierModel(values).save().then(doc => doc.toObject());
exports.dbCreateSupplier = dbCreateSupplier;
const deleteSupplierById = (id) => exports.SupplierModel.findOneAndDelete({ _id: id });
exports.deleteSupplierById = deleteSupplierById;
const updateSupplierById = (id, values) => exports.SupplierModel.findOneAndUpdate({ _id: id }, values, { new: true });
exports.updateSupplierById = updateSupplierById;
const deleteSupplierByPhoneForUser = (phone, user_id) => exports.SupplierModel.findOneAndDelete({ phone, user_id });
exports.deleteSupplierByPhoneForUser = deleteSupplierByPhoneForUser;
const deleteSupplierByEmailForUser = (email, user_id) => exports.SupplierModel.findOneAndDelete({ email, user_id });
exports.deleteSupplierByEmailForUser = deleteSupplierByEmailForUser;
const deleteSupplierByNameForUser = (name, user_id) => exports.SupplierModel.findOneAndDelete({ name, user_id });
exports.deleteSupplierByNameForUser = deleteSupplierByNameForUser;
//# sourceMappingURL=supplier.js.map