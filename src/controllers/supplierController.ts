import {deleteSupplierById, getSupplierByName, getSupplierByEmail, getSupplierByPhone, getSuppliers} from "../db/supplier";
import {Request, Response} from "express";

export const getAllSuppliers = async (req: Request, res: Response) => {
  try {
    const suppliers = await getSuppliers()
    return res.status(200).json(suppliers);
  } catch (error) {
    console.log(error);
    return res.status(400)
  }
}

export const deleteSupplier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleteSupplier = await deleteSupplierById(id);

    return res.json(deleteSupplier);
  } catch (error) {
    console.log(error);
    return res.status(400)
  }
}

export const updateSupplier = async (req: Request, res: Response) => {
  try {
    const { name, phone, email } = req.body;

    if (!name && !phone && !email) {
      return res.status(400).json({ error: "Please provide at least one of name, phone, or email" });
    }

    const finders: Array<[ (arg: string) => Promise<any>, string | undefined ]> = [
      [getSupplierByName, name],
      [getSupplierByPhone, phone],
      [getSupplierByEmail, email],
    ];

    let supplier: any = null;
    for (const [finder, arg] of finders) {
      if (!arg) continue;
      supplier = await finder(arg);
      if (supplier) break;
    }

    if (!supplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }

    if (name) supplier.name = name;
    if (phone) supplier.phone = phone;
    if (email) supplier.email = email;

    await supplier.save();
    return res.status(200).json({ message: "Supplier updated", supplier });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error updating supplier" });
  }
};