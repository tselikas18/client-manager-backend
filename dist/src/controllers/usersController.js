"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.updateUser = exports.deleteUser = exports.getAllUsers = void 0;
const users_1 = require("../db/users");
const getAllUsers = async (req, res) => {
    try {
        const users = await (0, users_1.getUsers)();
        return res.status(200).json(users);
    }
    catch (err) {
        console.error('getAllUsers error', err);
        return res.sendStatus(500);
    }
};
exports.getAllUsers = getAllUsers;
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id)
            return res.sendStatus(400);
        const existing = await (0, users_1.getUserById)(id);
        if (!existing)
            return res.status(404).json({ message: 'user not found' });
        await (0, users_1.deleteUserById)(id);
        return res.sendStatus(204);
    }
    catch (err) {
        console.error('deleteUser error', err);
        return res.sendStatus(500);
    }
};
exports.deleteUser = deleteUser;
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const values = req.body;
        if (!id)
            return res.sendStatus(400);
        if (values.authentication) {
            delete values.authentication;
        }
        if (values._id)
            delete values._id;
        const existing = await (0, users_1.getUserById)(id);
        if (!existing)
            return res.status(404).json({ message: 'user not found' });
        await (0, users_1.updateUserById)(id, values);
        const updated = await (0, users_1.getUserById)(id);
        return res.status(200).json(updated);
    }
    catch (err) {
        console.error('updateUser error', err);
        return res.sendStatus(500);
    }
};
exports.updateUser = updateUser;
const getMe = async (req, res) => {
    try {
        const identity = req.identity;
        if (!identity)
            return res.sendStatus(401);
        const user = identity.toObject ? identity.toObject() : identity;
        delete user.authentication;
        delete user.password;
        delete user.salt;
        delete user.sessionToken;
        return res.status(200).json(user);
    }
    catch (err) {
        console.error('getMe error', err);
        return res.sendStatus(500);
    }
};
exports.getMe = getMe;
//# sourceMappingURL=usersController.js.map