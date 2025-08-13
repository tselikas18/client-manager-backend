import {
  getClientsByUserId,
  deleteClientById,
  getClientByPhone,
  getClientByEmail,
  getClientByName,
  dbCreateClient,
  getClientById, updateClientById
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

export const getAllClients = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).identity?._id as string | undefined;
    if (!currentUserId) return res.sendStatus(401);

    const clients = await getClientsByUserId(currentUserId);

    return res.status(200).json(clients);
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

    const currentUserId = (req as any).identity?._id as string | undefined;
    if (!currentUserId) return res.sendStatus(401);

    const existingByEmail = await getClientByEmail(parsed.email);
    if (existingByEmail) return res.status(400).json({ error: "Email already exists" });

    const existingByPhone = await getClientByPhone(parsed.phone);
    if (existingByPhone) return res.status(400).json({ error: "Phone already exists" });

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
    const client = await getClientByPhone(phone);
    if (!client) return res.status(404).json({ error: "Not found" });
    return res.status(200).json(client);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

export const getClientByNameController = async (req: Request, res: Response) => {
  try {
    const name = String(req.params.name || req.query.name || req.body.name);
    const clients = await getClientByName(name);
    return res.status(200).json(clients);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

export const getClientByEmailController = async (req: Request, res: Response) => {
  try {
    const email = String(req.params.email || req.query.email || req.body.email);
    const client = await getClientByEmail(email);
    if (!client) return res.status(404).json({ error: "Not found" });
    return res.status(200).json(client);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};