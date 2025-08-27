"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateClientById = exports.deleteClientByNameForUser = exports.deleteClientByEmailForUser = exports.deleteClientByPhoneForUser = exports.deleteClientById = exports.dbCreateClient = exports.getClientByNameForUser = exports.getClientByPhoneForUser = exports.getClientByEmailForUser = exports.getClientById = exports.getClientsByUserId = exports.ClientModel = exports.emailRegex = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const clientSchema = new mongoose_1.default.Schema({
    user_id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    email: {
        type: String,
        trim: true,
        validate: { validator(v) { return !v || exports.emailRegex.test(v); } }
    },
    amount_owed: { type: Number, default: 0.0 },
    notes: { type: String },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});
clientSchema.index({ user_id: 1, email: 1 }, { unique: true, sparse: true });
clientSchema.index({ user_id: 1, phone: 1 }, { unique: true, sparse: true });
exports.ClientModel = mongoose_1.default.model('Client', clientSchema);
//controller helpers
const getClientsByUserId = (user_id) => exports.ClientModel.find({ user_id });
exports.getClientsByUserId = getClientsByUserId;
const getClientById = (id) => exports.ClientModel.findById(id);
exports.getClientById = getClientById;
const getClientByEmailForUser = (email, user_id) => exports.ClientModel.findOne({ email, user_id });
exports.getClientByEmailForUser = getClientByEmailForUser;
const getClientByPhoneForUser = (phone, user_id) => exports.ClientModel.findOne({ phone, user_id });
exports.getClientByPhoneForUser = getClientByPhoneForUser;
const getClientByNameForUser = (name, user_id) => exports.ClientModel.findOne({ name, user_id });
exports.getClientByNameForUser = getClientByNameForUser;
const dbCreateClient = (values) => new exports.ClientModel(values)
    .save()
    .then((client) => client.toObject());
exports.dbCreateClient = dbCreateClient;
const deleteClientById = (id) => exports.ClientModel.findOneAndDelete({ _id: id });
exports.deleteClientById = deleteClientById;
const deleteClientByPhoneForUser = (phone, user_id) => exports.ClientModel.findOneAndDelete({ phone, user_id });
exports.deleteClientByPhoneForUser = deleteClientByPhoneForUser;
const deleteClientByEmailForUser = (email, user_id) => exports.ClientModel.findOneAndDelete({ email, user_id });
exports.deleteClientByEmailForUser = deleteClientByEmailForUser;
const deleteClientByNameForUser = (name, user_id) => exports.ClientModel.findOneAndDelete({ name, user_id });
exports.deleteClientByNameForUser = deleteClientByNameForUser;
const updateClientById = (id, values) => exports.ClientModel.findByIdAndUpdate(id, values, { new: true });
exports.updateClientById = updateClientById;
//# sourceMappingURL=client.js.map