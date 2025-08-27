import { Request, Response } from 'express';
import { getClientsByUserId } from '../db/client';
import { getSuppliersByUserId } from '../db/supplier';
import { ClientType, SupplierType, DashboardResponse } from '../types';

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardStats'
 *       401:
 *         description: Unauthorized
 */
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).identity?._id as string | undefined;
    if (!currentUserId) return res.sendStatus(401);

    const clients = (await getClientsByUserId(currentUserId)) as unknown as ClientType[];
    const suppliers = (await getSuppliersByUserId(currentUserId)) as unknown as SupplierType[];

    const total_money_owed_to_me = clients.reduce((sum, client) => sum + (client.amount_owed || 0), 0);
    const total_money_i_owe = suppliers.reduce((sum, supplier) => sum + (supplier.amount_owed || 0), 0);
    const net_position = total_money_owed_to_me - total_money_i_owe;

    const recent_clients = clients
        .sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 5)
        .map(client => ({
          id: client._id.toString(),
          name: client.name,
          phone: client.phone,
          email: client.email,
          amount_owed: client.amount_owed
        }));

    const recent_suppliers = suppliers
        .sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 5)
        .map(supplier => ({
          id: supplier._id.toString(),
          name: supplier.name,
          phone: supplier.phone,
          email: supplier.email,
          amount_owed: supplier.amount_owed
        }));

    const dashboardData: DashboardResponse = {
      total_money_owed_to_me,
      total_money_i_owe,
      net_position,
      total_clients: clients.length,
      total_suppliers: suppliers.length,
      recent_clients,
      recent_suppliers
    };

    return res.status(200).json(dashboardData);
  } catch (error) {
    console.error('getDashboardStats error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};