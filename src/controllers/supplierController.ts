import {
  getSupplierById,
  deleteSupplierById,
  getSupplierByNameForUser,
  getSupplierByEmailForUser,
  getSupplierByPhoneForUser,
  getSuppliersByUserId,
  dbCreateSupplier,
  updateSupplierById,
  deleteSupplierByPhoneForUser,
  deleteSupplierByEmailForUser,
  deleteSupplierByNameForUser
} from "../db/supplier";
import {Request, Response} from "express";
import {z} from "zod";

const createSupplierSchema = z.object({
  name: z.string().min(1),
  phone: z.string().trim().min(7).optional().default(""),
  email: z.string().email().optional().default(""),
  amount_owed: z.number().positive().default(0.0).optional(),
  notes: z.string().optional(),
})

const updateSupplierSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().trim().min(7).optional(),
  email: z.string().email().optional(),
  amount_owed: z.number().positive().default(0.0).optional(),
  notes: z.string().optional(),
})

export const getAllSuppliers = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).identity?._id as string | undefined;
    if (!currentUserId) return res.sendStatus(401);

    const suppliers = await getSuppliersByUserId(currentUserId);

    return res.status(200).json(suppliers);
  } catch (error: any) {
    console.log(error);
    return res.status(400).json({error: error.message});
  }
}

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

export const createSupplier = async (req: Request, res: Response) => {
  try {
    const parsed = createSupplierSchema.parse(req.body);

    const currentUserId = (req as any).identity?._id as string | undefined;
    if (!currentUserId) return res.sendStatus(401);

    const existingByEmail = await getSupplierByEmailForUser(parsed.email, currentUserId);
    if (existingByEmail) return res.status(400).json({ error: "Email already exists" });

    const existingByPhone = await getSupplierByPhoneForUser(parsed.phone, currentUserId);
    if (existingByPhone) return res.status(400).json({ error: "Phone already exists" });

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

export const getSupplierByPhoneController = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).identity?._id as string | undefined;
    if (!currentUserId) return res.sendStatus(401);
    const phone = String(req.params.phone || req.query.phone || req.body.phone);
    const supplier = await getSupplierByPhoneForUser(phone, currentUserId);
    if (!supplier) return res.status(404).json({error: "Not found"});
    return res.status(200).json(supplier);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({error: error.message});
  }
}

export const getSupplierByNameController = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).identity?._id as string | undefined;
    if (!currentUserId) return res.sendStatus(401);
    const name = String(req.params.name || req.query.name || req.body.name);
    const supplier = await getSupplierByNameForUser(name, currentUserId);
    if (!supplier) return res.status(404).json({error: "Not found"});
    return res.status(200).json(supplier);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({error: error.message});
  }
}

export const getSupplierByEmailController = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).identity?._id as string | undefined;
    if (!currentUserId) return res.sendStatus(401);
    const email = String(req.params.email || req.query.email || req.body.email);
    const supplier = await getSupplierByPhoneForUser(email, currentUserId);
    if (!supplier) return res.status(404).json({error: "Not found"});
    return res.status(200).json(supplier);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({error: error.message});
  }
}

export const deleteSupplierByPhoneController = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).identity?._id as string | undefined;
    if (!currentUserId) return res.sendStatus(401);
    const phone = String(req.params.phone || req.body.phone || req.query.phone || '');
    if (!phone) return res.status(400).json({ error: 'Missing phone' });

    const deleted = await deleteSupplierByPhoneForUser(phone, currentUserId);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json(deleted);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

export const deleteSupplierByEmailController = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).identity?._id as string | undefined;
    if (!currentUserId) return res.sendStatus(401);
    const email = String(req.params.email || req.body.email || req.query.email || '');
    if (!email) return res.status(400).json({ error: 'Missing email' });

    const deleted = await deleteSupplierByEmailForUser(email, currentUserId);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json(deleted);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

export const deleteSupplierByNameController = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).identity?._id as string | undefined;
    if (!currentUserId) return res.sendStatus(401);
    const name = String(req.params.name || req.body.name || req.query.name || '');
    if (!name) return res.status(400).json({ error: 'Missing name' });

    const deleted = await deleteSupplierByNameForUser(name, currentUserId);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json(deleted);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};