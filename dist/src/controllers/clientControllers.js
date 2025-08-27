"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClientByNameController = exports.deleteClientByEmailController = exports.deleteClientByPhoneController = exports.getClientByEmailController = exports.getClientByNameController = exports.getClientByPhoneController = exports.createClient = exports.updateClient = exports.deleteClient = exports.getAllClients = void 0;
const client_1 = require("../db/client");
const zod_1 = require("zod");
const client_2 = require("../db/client");
const emailPre = zod_1.z.preprocess((v) => v === '' ? undefined : v, zod_1.z.string().email().optional());
const createClientSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    phone: zod_1.z.string().trim().min(10).optional().default(""),
    email: emailPre.optional().default(''),
    amount_owed: zod_1.z.number().positive().default(0.0).optional(),
    notes: zod_1.z.string().optional(),
});
const updateClientSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    phone: zod_1.z.string().trim().min(10).optional(),
    email: zod_1.z.string().optional().default(''), // Change to string and validate manually
    amount_owed: zod_1.z.number().positive().default(0.0).optional(),
    notes: zod_1.z.string().optional(),
});
const getCurrentUserId = (req) => req.identity?._id ?? null;
const getAllClients = async (req, res) => {
    try {
        const currentUserId = req.identity?._id;
        if (!currentUserId)
            return res.sendStatus(401);
        const searchRaw = req.query.search ?? "";
        const search = searchRaw.trim();
        const clients = await (0, client_1.getClientsByUserId)(currentUserId);
        if (!search) {
            return res.status(200).json(clients);
        }
        const esc = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const re = new RegExp("^" + esc, "i");
        const filtered = clients.filter((c) => (c.name && re.test(c.name)) ||
            (c.email && re.test(c.email)) ||
            (c.phone && re.test(c.phone)));
        console.log(`search="${search}" -> ${filtered.length} matches`);
        return res.status(200).json(filtered);
    }
    catch (error) {
        console.error(error);
        return res.status(400).json({ error: error.message });
    }
};
exports.getAllClients = getAllClients;
const deleteClient = async (req, res) => {
    try {
        const { id } = req.params;
        const deleteClient = await (0, client_1.deleteClientById)(id);
        return res.json(deleteClient);
    }
    catch (error) {
        console.log(error);
        return res.status(400);
    }
};
exports.deleteClient = deleteClient;
const updateClient = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id)
            return res.sendStatus(400).json({ error: "Missing client id" });
        const payload = updateClientSchema.parse(req.body);
        if (payload.email && !client_2.emailRegex.test(payload.email)) {
            return res.status(400).json({ error: "Please enter a valid email address" });
        }
        if (Object.keys(payload).length === 0)
            return res.status(400).json({ error: "No fields to update" });
        const client = await (0, client_1.getClientById)(id);
        if (!client)
            return res.status(400).json({ error: "Client not found" });
        const currentUserId = req.identity?._id;
        if (!currentUserId)
            return res.status(401);
        if (client.user_id?.toString() !== currentUserId.toString())
            return res.status(403).json({ error: "Forbidden" });
        const updated = await (0, client_1.updateClientById)(id, payload);
        return res.status(200).json({ message: "Client updated", client: updated });
    }
    catch (error) {
        console.error(error);
        return res.status(400).json({ error: error.message });
    }
};
exports.updateClient = updateClient;
const createClient = async (req, res) => {
    try {
        const parsed = createClientSchema.parse(req.body);
        if (parsed.email && !client_2.emailRegex.test(parsed.email)) {
            return res.status(400).json({ error: "Please enter a valid email address" });
        }
        const currentUserId = getCurrentUserId(req);
        if (!currentUserId)
            return res.sendStatus(401);
        const existingByEmail = parsed.email
            ? await (0, client_1.getClientByEmailForUser)(parsed.email, currentUserId)
            : null;
        if (existingByEmail)
            return res.status(400).json({ error: "Email already exists" });
        const existingByPhone = parsed.phone
            ? await (0, client_1.getClientByPhoneForUser)(parsed.phone, currentUserId)
            : null;
        if (existingByPhone)
            return res.status(400).json({ error: "Phone already exists" });
        const existingByName = parsed.name
            ? await (0, client_1.getClientByNameForUser)(parsed.name, currentUserId)
            : null;
        if (existingByName)
            return res.status(400).json({ error: "Name already exists" });
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
        const created = await (0, client_1.dbCreateClient)(payload);
        return res.status(201).json(created);
    }
    catch (error) {
        console.error(error);
        return res.status(400).json({ error: error.message });
    }
};
exports.createClient = createClient;
const getClientByPhoneController = async (req, res) => {
    try {
        const phone = String(req.params.phone || req.query.phone || req.body.phone);
        const userId = getCurrentUserId(req);
        if (!userId)
            return res.sendStatus(401);
        const client = await (0, client_1.getClientByPhoneForUser)(phone, userId);
        if (!client)
            return res.status(404).json({ error: "Phone not found" });
        return res.status(200).json(client);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
};
exports.getClientByPhoneController = getClientByPhoneController;
const getClientByNameController = async (req, res) => {
    try {
        const name = String(req.params.name || req.query.name || req.body.name);
        const userId = getCurrentUserId(req);
        if (!userId)
            return res.sendStatus(401);
        const client = await (0, client_1.getClientByNameForUser)(name, userId);
        if (!client)
            return res.status(404).json({ error: "Name not found" });
        return res.status(200).json(client);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
};
exports.getClientByNameController = getClientByNameController;
const getClientByEmailController = async (req, res) => {
    try {
        const email = String(req.params.email || req.query.email || req.body.email);
        const userId = getCurrentUserId(req);
        if (!userId)
            return res.sendStatus(401);
        const client = await (0, client_1.getClientByEmailForUser)(email, userId);
        if (!client)
            return res.status(404).json({ error: "Email not found" });
        return res.status(200).json(client);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
};
exports.getClientByEmailController = getClientByEmailController;
const deleteClientByPhoneController = async (req, res) => {
    try {
        const userId = getCurrentUserId(req);
        if (!userId)
            return res.sendStatus(401);
        const phone = String(req.params.phone || "");
        if (!phone)
            return res.status(400).json({ error: "Missing phone" });
        const deleted = await (0, client_1.deleteClientByPhoneForUser)(phone, userId);
        if (!deleted)
            return res.status(404).json({ error: "Client not found" });
        return res.status(200).json(deleted);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
};
exports.deleteClientByPhoneController = deleteClientByPhoneController;
const deleteClientByEmailController = async (req, res) => {
    try {
        const userId = getCurrentUserId(req);
        if (!userId)
            return res.sendStatus(401);
        const email = String(req.params.email || "");
        if (!email)
            return res.status(400).json({ error: "Missing email" });
        const deleted = await (0, client_1.deleteClientByEmailForUser)(email, userId);
        if (!deleted)
            return res.status(404).json({ error: "Client not found" });
        return res.status(200).json(deleted);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
};
exports.deleteClientByEmailController = deleteClientByEmailController;
const deleteClientByNameController = async (req, res) => {
    try {
        const userId = getCurrentUserId(req);
        if (!userId)
            return res.sendStatus(401);
        const name = String(req.params.name || "");
        if (!name)
            return res.status(400).json({ error: "Missing name" });
        const deleted = await (0, client_1.deleteClientByNameForUser)(name, userId);
        if (!deleted)
            return res.status(404).json({ error: "Client not found" });
        return res.status(200).json(deleted);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
};
exports.deleteClientByNameController = deleteClientByNameController;
//# sourceMappingURL=clientControllers.js.map