"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const client_1 = require("../db/client");
const supplier_1 = require("../db/supplier");
const getDashboardStats = async (req, res) => {
    try {
        const currentUserId = req.identity?._id;
        if (!currentUserId)
            return res.sendStatus(401);
        const clients = (await (0, client_1.getClientsByUserId)(currentUserId));
        const suppliers = (await (0, supplier_1.getSuppliersByUserId)(currentUserId));
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
        const dashboardData = {
            total_money_owed_to_me,
            total_money_i_owe,
            net_position,
            total_clients: clients.length,
            total_suppliers: suppliers.length,
            recent_clients,
            recent_suppliers
        };
        return res.status(200).json(dashboardData);
    }
    catch (error) {
        console.error('getDashboardStats error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getDashboardStats = getDashboardStats;
//# sourceMappingURL=dashboardController.js.map