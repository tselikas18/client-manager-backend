import {
  getClientsByUserId,
  deleteClientById,
  dbCreateClient,
  getClientById,
  updateClientById,
  deleteClientByPhoneForUser,
  deleteClientByEmailForUser,
  deleteClientByNameForUser,
  getClientByEmailForUser,
  getClientByPhoneForUser,
  getClientByNameForUser
} from "../db/client";
import { Request, Response} from "express";
import {z} from "zod";


const createClientSchema = z.object({
  name: z.string().min(1),
  phone: z.string().trim().min(7).optional().default(""),
  email: z.string().email().optional().default(""),
  amount_owed: z.number().positive().default(0.0).optional(),
  notes: z.string().optional(),
})

const updateClientSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().trim().min(7).optional(),
  email: z.string().email().optional(),
  amount_owed: z.number().positive().default(0.0).optional(),
  notes: z.string().optional(),
})

const getCurrentUserId = (req: Request): string | null =>
    (req as any).identity?._id ?? null;

export const getAllClients = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).identity?._id as string | undefined;
    if (!currentUserId) return res.sendStatus(401);

    const searchRaw = (req.query.search as string | undefined) ?? "";
    const search = searchRaw.trim();

    const clients = await getClientsByUserId(currentUserId);

    if (!search) {
      return res.status(200).json(clients);
    }

    const esc = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp("^" + esc, "i");
    const filtered = clients.filter((c: any) =>
        (c.name && re.test(c.name)) ||
        (c.email && re.test(c.email)) ||
        (c.phone && re.test(c.phone))
    );

    console.log(`search="${search}" -> ${filtered.length} matches`);
    return res.status(200).json(filtered);
  } catch (error: any) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
};

export const deleteClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleteClient = await deleteClientById(id);

    return res.json(deleteClient);
  } catch (error) {
    console.log(error);
    return res.status(400);
  }
}

export const updateClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.sendStatus(400).json({error: "Missing client id"});

    const payload = updateClientSchema.parse(req.body);
    if (Object.keys(payload).length === 0)
      return res.status(400).json({ error: "No fields to update" });

    const client = await getClientById(id);
    if (!client)
      return res.status(400).json({ error: "Client not found" });

    const currentUserId = (req as any).identity?._id as string | undefined;
    if (!currentUserId)
      return res.status(401);
    if (client.user_id?.toString() !== currentUserId.toString())
      return res.status(403).json({ error: "Forbidden" });

    const updated = await updateClientById(id, payload);
    return res.status(200).json({message: "Client updated", client: updated });
  } catch (error: any) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
};

export const createClient = async (req: Request, res: Response) => {
  try {
    const parsed = createClientSchema.parse(req.body);
    const currentUserId = getCurrentUserId(req);
    if (!currentUserId) return res.sendStatus(401);

    const existingByEmail = parsed.email
        ? await getClientByEmailForUser(parsed.email, currentUserId)
        : null;
    if (existingByEmail) return res.status(400).json({ error: "Email already exists" });

    const existingByPhone = parsed.phone
        ? await getClientByPhoneForUser(parsed.phone, currentUserId)
        : null;
    if (existingByPhone) return res.status(400).json({ error: "Phone already exists" });

    const existingByName = parsed.name
        ? await getClientByNameForUser(parsed.name, currentUserId)
        : null;
    if (existingByName) return res.status(400).json({ error: "Name already exists" });

    const payload = { ...parsed, user_id: currentUserId };
    const created = await dbCreateClient(payload);
    return res.status(201).json(created);
  } catch (error: any) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
};

export const getClientByPhoneController = async (req: Request, res: Response) => {
  try {
    const phone = String(req.params.phone || req.query.phone || req.body.phone);
    const userId = getCurrentUserId(req);
    if (!userId) return res.sendStatus(401);

    const client = await getClientByPhoneForUser(phone, userId);
    if (!client) return res.status(404).json({ error: "Phone not found" });
    return res.status(200).json(client);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

export const getClientByNameController = async (req: Request, res: Response) => {
  try {
    const name = String(req.params.name || req.query.name || req.body.name);
    const userId = getCurrentUserId(req);
    if (!userId) return res.sendStatus(401);

    const client = await getClientByNameForUser(name, userId);
    if (!client) return res.status(404).json({ error: "Name not found" });
    return res.status(200).json(client);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

export const getClientByEmailController = async (req: Request, res: Response) => {
  try {
    const email = String(req.params.email || req.query.email || req.body.email);
    const userId = getCurrentUserId(req);
    if (!userId) return res.sendStatus(401);

    const client = await getClientByEmailForUser(email, userId);
    if (!client) return res.status(404).json({ error: "Email not found" });
    return res.status(200).json(client);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

export const deleteClientByPhoneController = async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) return res.sendStatus(401);
    const phone = String(req.params.phone || "");
    if (!phone) return res.status(400).json({ error: "Missing phone" });

    const deleted = await deleteClientByPhoneForUser(phone, userId);
    if (!deleted) return res.status(404).json({ error: "Client not found" });
    return res.status(200).json(deleted);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

export const deleteClientByEmailController = async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) return res.sendStatus(401);
    const email = String(req.params.email || "");
    if (!email) return res.status(400).json({ error: "Missing email" });

    const deleted = await deleteClientByEmailForUser(email, userId);
    if (!deleted) return res.status(404).json({ error: "Client not found" });
    return res.status(200).json(deleted);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

export const deleteClientByNameController = async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) return res.sendStatus(401);
    const name = String(req.params.name || "");
    if (!name) return res.status(400).json({ error: "Missing name" });

    const deleted = await deleteClientByNameForUser(name, userId);
    if (!deleted) return res.status(404).json({ error: "Client not found" });
    return res.status(200).json(deleted);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};