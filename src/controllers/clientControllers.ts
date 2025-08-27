import {
  getClientsByUserId,
  deleteClientById,
  dbCreateClient,
  getClientById,
  updateClientById,
  getClientByEmailForUser,
  getClientByPhoneForUser,
  getClientByNameForUser
} from "../db/client";
import { Request, Response} from "express";
import {z} from "zod";
import {emailRegex} from "../db/client";

const emailPre = z.preprocess((v) => v === '' ? undefined : v,
    z.string().email().optional()
);

const createClientSchema = z.object({
  name: z.string().min(1),
  phone: z.string().trim().min(10).optional().default(""),
  email: emailPre.optional().default(''),
  amount_owed: z.number().positive().default(0.0).optional(),
  notes: z.string().optional(),
})

const updateClientSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().trim().min(10).optional(),
  email: z.string().optional().default(''),  // Change to string and validate manually
  amount_owed: z.number().positive().default(0.0).optional(),
  notes: z.string().optional(),
})

const getCurrentUserId = (req: Request): string | null =>
    (req as any).identity?._id ?? null;
/**
 * @swagger
 * /clients:
 *   get:
 *     summary: Get all clients for the authenticated user
 *     tags: [Clients]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering clients
 *     responses:
 *       200:
 *         description: List of clients
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Client'
 *       401:
 *         description: Unauthorized
 */

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
/**
 * @swagger
 * /clients/{id}:
 *   delete:
 *     summary: Delete a client
 *     tags: [Clients]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Client ID
 *     responses:
 *       200:
 *         description: Client deleted successfully
 *       404:
 *         description: Client not found
 */

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
/**
 * @swagger
 * /clients/{id}:
 *   patch:
 *     summary: Update a client
 *     tags: [Clients]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Client ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               amount_owed:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Client updated successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Client not found
 */

export const updateClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.sendStatus(400).json({error: "Missing client id"});

    const payload = updateClientSchema.parse(req.body);

    if (payload.email && !emailRegex.test(payload.email)) {
      return res.status(400).json({ error: "Please enter a valid email address" });
    }

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
/**
 * @swagger
 * /clients:
 *   post:
 *     summary: Create a new client
 *     tags: [Clients]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - amount_owed
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Smith
 *               phone:
 *                 type: string
 *                 example: "1234567890"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               amount_owed:
 *                 type: number
 *                 example: 1500.00
 *               notes:
 *                 type: string
 *                 example: Important client
 *     responses:
 *       201:
 *         description: Client created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Client'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

export const createClient = async (req: Request, res: Response) => {
  try {
    const parsed = createClientSchema.parse(req.body);

    if (parsed.email && !emailRegex.test(parsed.email)) {
      return res.status(400).json({ error: "Please enter a valid email address" });
    }

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

    if (parsed.amount_owed === undefined || parsed.amount_owed === null) {
      return res.status(400).json({ error: 'Please provide the Amount Owed.' });
    }
    if (Number.isNaN(parsed.amount_owed)) {
      return res.status(400).json({ error: 'Amount Owed must be a valid number.' });
    }

    if (parsed.phone && parsed.phone.length < 8){
      return res.status(400).json({ error: "Please enter a valid phone number." });
    }

    const payload = { ...parsed, user_id: currentUserId };
    const created = await dbCreateClient(payload);
    return res.status(201).json(created);
  } catch (error: any) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
};

