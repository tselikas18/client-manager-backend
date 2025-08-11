import {getClients, deleteClientById, getClientByPhone, getClientByEmail, getClientByName} from "../db/client";

export const getAllClients = async (req, res) => {
  try {
    const clients = await getClients();
    return res.status(200).json(clients);
  } catch (error) {
    console.log(error);
    return res.status(400);
  }
}

export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const deleteClient = await deleteClientById(id);

    return res.json(deleteClient);
  } catch (error) {
    console.log(error);
    return res.status(400);
  }
}

export const updateClient = async (req, res) => {
  try {
    const { name, phone, email } = req.body;

    if (!name || !phone || !email) {
      return res.status(400).json({ error: "Please enter at least one of name, phone number, or email" });
    }

    const client  = await [getClientByName(name), getClientByPhone(phone), getClientByEmail(email)].reduce(
        async (acc, fn) => {
          const resolvedClient = await acc;
          return resolvedClient || fn(name, phone, email)
        },
        Promise.resolve(null)
    );

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    client.name = name;
    client.phone = phone;
    client.email = email;

    await client.save();
    return res.status(200).json({message: 'Client updated'});

  } catch (error) {
    return res.status(500).json({error: 'Error updating client'});
  }
}