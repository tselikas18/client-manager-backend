"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSupplierByNameController = exports.deleteSupplierByEmailController = exports.deleteSupplierByPhoneController = exports.getSupplierByEmailController = exports.getSupplierByNameController = exports.getSupplierByPhoneController = exports.createSupplier = exports.updateSupplier = exports.deleteSupplier = exports.getAllSuppliers = void 0;
const supplier_1 = require("../db/supplier");
const zod_1 = require("zod");
const client_1 = require("../db/client");
const emailPre = zod_1.z.preprocess((v) => v === '' ? undefined : v, zod_1.z.string().email().optional());
const createSupplierSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    phone: zod_1.z.string().trim().min(10).optional().default(""),
    email: emailPre.optional().default(''),
    amount_owed: zod_1.z.number().positive().default(0.0).optional(),
    notes: zod_1.z.string().optional(),
});
const updateSupplierSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    phone: zod_1.z.string().trim().min(10).optional(),
    email: zod_1.z.string().optional().default(''), // Change to string and validate manually
    amount_owed: zod_1.z.number().positive().default(0.0).optional(),
    notes: zod_1.z.string().optional(),
});
const getAllSuppliers = async (req, res) => {
    try {
        const currentUserId = req.identity?._id;
        if (!currentUserId)
            return res.sendStatus(401);
        const searchRaw = req.query.search ?? "";
        const search = searchRaw.trim();
        console.log("GET /suppliers req.query:", req.query, "user:", currentUserId);
        const suppliers = await (0, supplier_1.getSuppliersByUserId)(currentUserId);
        if (!search) {
            return res.status(200).json(suppliers);
        }
        const esc = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const re = new RegExp("^" + esc, "i");
        const filtered = suppliers.filter((s) => (s.name && re.test(s.name)) ||
            (s.email && re.test(s.email)) ||
            (s.phone && re.test(s.phone)));
        console.log(`search="${search}" -> ${filtered.length} matches`);
        return res.status(200).json(filtered);
    }
    catch (error) {
        console.log(error);
        return res.status(400).json({ error: error.message });
    }
};
exports.getAllSuppliers = getAllSuppliers;
const deleteSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await (0, supplier_1.deleteSupplierById)(id);
        return res.status(200).json(deleted);
    }
    catch (error) {
        console.error(error);
        return res.status(400).json({ error: error.message });
    }
};
exports.deleteSupplier = deleteSupplier;
const updateSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id)
            return res.sendStatus(400).json({ error: "Missing supplier id" });
        const payload = updateSupplierSchema.parse(req.body);
        if (payload.email && !client_1.emailRegex.test(payload.email)) {
            return res.status(400).json({ error: "Please enter a valid email address" });
        }
        if (Object.keys(payload).length === 0)
            return res.sendStatus(400).json({ error: "No fields to update" });
        const supplier = await (0, supplier_1.getSupplierById)(id);
        if (!supplier)
            return res.status(400).json({ error: "Supplier not found" });
        const currentUserId = req.identity?._id;
        if (!currentUserId)
            return res.status(401);
        if (supplier.user_id?.toString() !== currentUserId.toString())
            return res.status(403).json({ error: "Forbidden" });
        const updated = await (0, supplier_1.updateSupplierById)(id, payload);
        return res.status(200).json({ message: "Supplier updated", supplier: updated });
    }
    catch (error) {
        console.error(error);
        return res.status(400).json({ error: error.message });
    }
};
exports.updateSupplier = updateSupplier;
const createSupplier = async (req, res) => {
    try {
        const parsed = createSupplierSchema.parse(req.body);
        if (parsed.email && !client_1.emailRegex.test(parsed.email)) {
            return res.status(400).json({ error: "Please enter a valid email address" });
        }
        const currentUserId = req.identity?._id;
        if (!currentUserId)
            return res.sendStatus(401);
        const existingByEmail = parsed.email
            ? await (0, supplier_1.getSupplierByEmailForUser)(parsed.email, currentUserId)
            : null;
        if (existingByEmail)
            return res.status(400).json({ error: "Email already exists" });
        const existingByPhone = parsed.phone
            ? await (0, supplier_1.getSupplierByPhoneForUser)(parsed.phone, currentUserId)
            : null;
        if (existingByPhone)
            return res.status(400).json({ error: "Phone already exists" });
        if (parsed.amount_owed === undefined || parsed.amount_owed === null) {
            return res.status(400).json({ error: 'Please provide the Amount Owed.' });
        }
        if (Number.isNaN(parsed.amount_owed)) {
            return res.status(400).json({ error: 'Amount Owed must be a valid number.' });
        }
        if (parsed.phone && parsed.phone.length < 8) {
            return res.status(400).json({ error: "Please enter a valid phone number." });
        }
        const payload = { ...parsed, user_id: currentUserId };
        const created = await (0, supplier_1.dbCreateSupplier)(payload);
        return res.status(201).json(created);
    }
    catch (error) {
        console.error(error);
        if (error?.code === 11000) {
            return res.status(409).json({ error: "Duplicate resource" });
        }
        return res.status(400).json({ error: error.message });
    }
};
exports.createSupplier = createSupplier;
const getSupplierByPhoneController = async (req, res) => {
    try {
        const currentUserId = req.identity?._id;
        if (!currentUserId)
            return res.sendStatus(401);
        const phone = String(req.params.phone || req.query.phone || req.body.phone);
        const supplier = await (0, supplier_1.getSupplierByPhoneForUser)(phone, currentUserId);
        if (!supplier)
            return res.status(404).json({ error: "Not found" });
        return res.status(200).json(supplier);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};
exports.getSupplierByPhoneController = getSupplierByPhoneController;
const getSupplierByNameController = async (req, res) => {
    try {
        const currentUserId = req.identity?._id;
        if (!currentUserId)
            return res.sendStatus(401);
        const name = String(req.params.name || req.query.name || req.body.name);
        const supplier = await (0, supplier_1.getSupplierByNameForUser)(name, currentUserId);
        if (!supplier)
            return res.status(404).json({ error: "Not found" });
        return res.status(200).json(supplier);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};
exports.getSupplierByNameController = getSupplierByNameController;
const getSupplierByEmailController = async (req, res) => {
    try {
        const currentUserId = req.identity?._id;
        if (!currentUserId)
            return res.sendStatus(401);
        const email = String(req.params.email || req.query.email || req.body.email);
        const supplier = await (0, supplier_1.getSupplierByEmailForUser)(email, currentUserId);
        if (!supplier)
            return res.status(404).json({ error: "Not found" });
        return res.status(200).json(supplier);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};
exports.getSupplierByEmailController = getSupplierByEmailController;
const deleteSupplierByPhoneController = async (req, res) => {
    try {
        const currentUserId = req.identity?._id;
        if (!currentUserId)
            return res.sendStatus(401);
        const phone = String(req.params.phone || req.body.phone || req.query.phone || '');
        if (!phone)
            return res.status(400).json({ error: 'Missing phone' });
        const deleted = await (0, supplier_1.deleteSupplierByPhoneForUser)(phone, currentUserId);
        if (!deleted)
            return res.status(404).json({ error: 'Not found' });
        return res.status(200).json(deleted);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
};
exports.deleteSupplierByPhoneController = deleteSupplierByPhoneController;
const deleteSupplierByEmailController = async (req, res) => {
    try {
        const currentUserId = req.identity?._id;
        if (!currentUserId)
            return res.sendStatus(401);
        const email = String(req.params.email || req.body.email || req.query.email || '');
        if (!email)
            return res.status(400).json({ error: 'Missing email' });
        const deleted = await (0, supplier_1.deleteSupplierByEmailForUser)(email, currentUserId);
        if (!deleted)
            return res.status(404).json({ error: 'Not found' });
        return res.status(200).json(deleted);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
};
exports.deleteSupplierByEmailController = deleteSupplierByEmailController;
const deleteSupplierByNameController = async (req, res) => {
    try {
        const currentUserId = req.identity?._id;
        if (!currentUserId)
            return res.sendStatus(401);
        const name = String(req.params.name || req.body.name || req.query.name || '');
        if (!name)
            return res.status(400).json({ error: 'Missing name' });
        const deleted = await (0, supplier_1.deleteSupplierByNameForUser)(name, currentUserId);
        if (!deleted)
            return res.status(404).json({ error: 'Not found' });
        return res.status(200).json(deleted);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
};
exports.deleteSupplierByNameController = deleteSupplierByNameController;
//# sourceMappingURL=supplierController.js.map