import {
  getSupplierById,
  deleteSupplierById,
  getSupplierByEmailForUser,
  getSupplierByPhoneForUser,
  getSuppliersByUserId,
  dbCreateSupplier,
  updateSupplierById,
} from "../db/supplier";
import {Request, Response} from "express";
import {z} from "zod";
import {emailRegex} from "../db/client";

const emailPre = z.preprocess((v) => v === '' ? undefined : v,
    z.string().email().optional()
);

const createSupplierSchema = z.object({
  name: z.string().min(1),
  phone: z.string().trim().min(10).optional().default(""),
  email: emailPre.optional().default(''),
  amount_owed: z.number().positive().default(0.0).optional(),
  notes: z.string().optional(),
})

const updateSupplierSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().trim().min(10).optional(),
  email: z.string().optional().default(''),  // Change to string and validate manually
  amount_owed: z.number().positive().default(0.0).optional(),
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

export const updateSupplier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.sendStatus(400).json({error: "Missing supplier id"});

    const payload = updateSupplierSchema.parse(req.body);

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
    const parsed = createSupplierSchema.parse(req.body);

    if (parsed.email && !emailRegex.test(parsed.email)) {
      return res.status(400).json({ error: "Please enter a valid email address" });
    }

    const currentUserId = (req as any).identity?._id as string | undefined;
    if (!currentUserId) return res.sendStatus(401);

    const existingByEmail = parsed.email
        ? await getSupplierByEmailForUser(parsed.email, currentUserId)
        : null;
    if (existingByEmail) return res.status(400).json({ error: "Email already exists" });

    const existingByPhone = parsed.phone
        ? await getSupplierByPhoneForUser(parsed.phone, currentUserId)
        : null;
    if (existingByPhone) return res.status(400).json({ error: "Phone already exists" });

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
