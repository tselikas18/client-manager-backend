import {getClients, deleteClientById, getClientByPhone, getClientByEmail, getClientByName, dbCreateClient} from "../db/client";
import {NextFunction, Request, Response} from "express";
import {z} from "zod";

const createClientSchema = z.object({
  name: z.string().min(1),
  phone: z.string().trim().min(7),
  email: z.string().email(),
  amount_owed: z.number().positive().default(0.0).optional(),
  notes: z.string().optional(),
})

export const getAllClients = async (req: Request, res: Response) => {
  try {
    const clients = await getClients();
    return res.status(200).json(clients);
  } catch (error) {
    console.log(error);
    return res.status(400);
  }
}

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
    const { name, phone, email } = req.body;

    if (!name && !phone && !email) {
      return res.status(400).json({ error: "Please provide at least one of name, phone, or email" });
    }

    const finders: Array<[ (arg: string) => Promise<any>, string | undefined ]> = [
      [getClientByName, name],
      [getClientByPhone, phone],
      [getClientByEmail, email],
    ];

    let client: any = null;
    for (const [finder, arg] of finders) {
      if (!arg) continue;
      client = await finder(arg);
      if (client) break;
    }

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    if (name) client.name = name;
    if (phone) client.phone = phone;
    if (email) client.email = email;

    await client.save();
    return res.status(200).json({ message: "Client updated", client });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error updating client" });
  }
};

export const createClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createClientSchema.parse(req.body);

    const existingByEmail = await getClientByEmail(parsed.email);
    if (existingByEmail) {
      return res.status(400).json({ error: "Email already exists" });
    }
    const existingByPhone = await getClientByPhone(parsed.phone);
    if (existingByPhone) {
      return res.status(400).json({ error: "Phone already exists" });
    }

    const created = await dbCreateClient(parsed)

    return res.status(201).json(created);
  }catch (error) {
    console.error(error);
    return next(error);
  }
}