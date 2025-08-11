import {deleteSupplierById, getSupplierByName, getSupplierEmail, getSupplierPhone} from "../db/supplier";

export const getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await getAllSuppliers()
    return res.status(200).json(suppliers);
  } catch (error) {
    console.log(error);
    return res.status(400)
  }
}

export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    const deleteSupplier = await deleteSupplierById(id);

    return res.json(deleteSupplier);
  } catch (error) {
    console.log(error);
    return res.status(400)
  }
}

export const updateSupplier = async (req, res) => {
  try {
    const { name, phone, email } = req.body;

    if (!name || !phone || !email) {
      return res.status(400).json({error: "Please enter at least one of name, phone number, or email"})
    }

    const supplier = await [getSupplierByName(name), getSupplierEmail(email), getSupplierPhone(phone)].reduce(
        async (acc, fn) => {
          const resolvedClient = await acc;
          return resolvedClient || fn(name, phone, email)
        },
        Promise.resolve(null)
    );

    if (!supplier) {
      return res.status(404).json({error: "Supplier not found"})
    }

    supplier.name = name;
    supplier.phone = phone;
    supplier.email = email;

    await supplier.save();
    return res.status(200).json({message: "Supplier updated"})
  } catch (error) {
    return res.status(500).json({error: "Error updating supplier"})
  }
}