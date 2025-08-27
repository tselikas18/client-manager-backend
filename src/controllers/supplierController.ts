import {
  getSupplierById,
  deleteSupplierById,
  getSupplierByEmailForUser,
  getSupplierByPhoneForUser,
  getSuppliersByUserId,
  dbCreateSupplier,
  updateSupplierById, getSupplierByNameForUser,
} from "../db/supplier";
import {Request, Response} from "express";
import {z} from "zod";
import {getCurrentUserId, emailRegex} from "../helpers";

const emailPre = z.preprocess((v) => v === '' ? undefined : v,
    z.string().email().optional()
);

const createOrUpdateSupplierSchema = z.object({
  name: z.string().min(1),
  phone: z.string().trim().min(8).optional().default(""),
  email: emailPre.optional().default(''),
  amount_owed: z.number().min(0, "Amount must be non-negative"),
  notes: z.string().optional(),
})
/**
 * @swagger
 * /suppliers:
 *   get:
 *     summary: Get all suppliers for the authenticated user
 *     tags: [Suppliers]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering suppliers
 *     responses:
 *       200:
 *         description: List of suppliers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Supplier'
 *       401:
 *         description: Unauthorized
 */
export const getAllSuppliers = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).identity?._id as string | undefined;
    if (!currentUserId) return res.sendStatus(401);

    const searchRaw = (req.query.search as string | undefined) ?? "";
    const search = searchRaw.trim();

    console.log("GET /suppliers req.query:", req.query, "user:", currentUserId);

    const suppliers = await getSuppliersByUserId(currentUserId);

    if (!search) {
      return res.status(200).json(suppliers);
    }

    const esc = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp("^" + esc, "i");

    const filtered = suppliers.filter((s: any) =>
        (s.name && re.test(s.name)) ||
        (s.email && re.test(s.email)) ||
        (s.phone && re.test(s.phone))
    );

    console.log(`search="${search}" -> ${filtered.length} matches`);
    return res.status(200).json(filtered);
  } catch (error: any) {
    console.log(error);
    return res.status(400).json({ error: error.message });
  }
};
/**
 * @swagger
 * /suppliers/{id}:
 *   delete:
 *     summary: Delete a supplier
 *     tags: [Suppliers]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Supplier ID
 *     responses:
 *       200:
 *         description: Supplier deleted successfully
 *       404:
 *         description: Supplier not found
 */
export const deleteSupplier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await deleteSupplierById(id);
    return res.status(200).json(deleted);
  } catch (error: any) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
};
/**
 * @swagger
 * /suppliers/{id}:
 *   patch:
 *     summary: Update a supplier
 *     tags: [Suppliers]
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
 *         description: Supplier updated successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Supplier not found
 */
export const updateSupplier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.sendStatus(400).json({error: "Missing supplier id"});

    const payload = createOrUpdateSupplierSchema.parse(req.body);

    if (payload.email && !emailRegex.test(payload.email)) {
      return res.status(400).json({ error: "Please enter a valid email address" });
    }

    if (Object.keys(payload).length === 0)
      return res.sendStatus(400).json({error: "No fields to update"});

    const supplier = await getSupplierById(id);
    if (!supplier)
      return res.status(400).json({error: "Supplier not found"});

    const currentUserId = (req as any).identity?._id as string | undefined;
    if (!currentUserId)
      return res.status(401);
    if (supplier.user_id?.toString() !== currentUserId.toString())
      return res.status(403).json({error: "Forbidden"});

    const updated = await updateSupplierById(id, payload);
    return res.status(200).json({message: "Supplier updated", supplier: updated});
  } catch (error: any) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
};
/**
 * @swagger
 * /suppliers:
 *   post:
 *     summary: Create a new supplier
 *     tags: [Suppliers]
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
 *                 example: ABC Supply Co
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: contact@abcsupply.com
 *               amount_owed:
 *                 type: number
 *                 example: 500.00
 *               notes:
 *                 type: string
 *                 example: Regular supplier
 *     responses:
 *       201:
 *         description: Supplier created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Supplier'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const createSupplier = async (req: Request, res: Response) => {
  try {
    const parsed = createOrUpdateSupplierSchema.parse(req.body);

    if (parsed.email && !emailRegex.test(parsed.email)) {
      return res.status(400).json({ error: "Please enter a valid email address" });
    }

    const currentUserId = getCurrentUserId(req)
    if (!currentUserId) return res.sendStatus(401);

    const existingByEmail = parsed.email
        ? await getSupplierByEmailForUser(parsed.email, currentUserId)
        : null;
    if (existingByEmail) return res.status(400).json({ error: "Email already exists" });

    const existingByPhone = parsed.phone
        ? await getSupplierByPhoneForUser(parsed.phone, currentUserId)
        : null;
    if (existingByPhone) return res.status(400).json({ error: "Phone already exists" });

    const existingByName = parsed.name
        ? await getSupplierByNameForUser(parsed.name, currentUserId)
        : null;
    if (existingByName) return res.status(400).json({ error: "Name already exists" });

    if (parsed.amount_owed === undefined || parsed.amount_owed === null) {
      return res.status(400).json({ error: 'Please provide the Amount Owed.' });
    }

    if (parsed.phone && parsed.phone.length < 8){
      return res.status(400).json({ error: "Please enter a valid phone number." });
    }

    if (parsed.amount_owed < 0){
      return res.status(400).json({ error: "Amount owed can't be negative" });
    }

    const payload = { ...parsed, user_id: currentUserId };
    const created = await dbCreateSupplier(payload);

    return res.status(201).json(created);
  } catch (error: any) {
    console.error(error);
    if (error?.code === 11000) {
      return res.status(409).json({ error: "Duplicate resource" });
    }
    return res.status(400).json({ error: error.message });
  }
}
