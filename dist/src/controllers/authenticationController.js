"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.register = exports.login = void 0;
const users_1 = require("../db/users");
const helpers_1 = require("../helpers");
const mapToSafeUser = (user) => ({
    id: user._id?.toString() ?? user.id,
    name: user.username ?? user.name ?? user.fullName ?? "",
    email: user.email ?? "",
});
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send({ error: "Email and password are required" });
        }
        const user = await (0, users_1.getUserByEmail)(email).select("+authentication.salt +authentication.password");
        if (!user) {
            return res.status(400).send({ error: "User not found" });
        }
        const salt = user.authentication?.salt;
        const expectedHash = salt ? (0, helpers_1.authentication)(salt, password) : null;
        if (!expectedHash || user.authentication?.password !== expectedHash) {
            return res.status(403).send({ error: "Passwords do not match" });
        }
        const sessionSalt = (0, helpers_1.random)();
        if (user.authentication) {
            user.authentication.sessionToken = (0, helpers_1.authentication)(sessionSalt, user._id.toString());
        }
        await user.save();
        res.cookie("authenticated", user.authentication?.sessionToken, {
            httpOnly: true,
            path: "/",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        const safeUser = mapToSafeUser(user);
        return res.status(200).json({
            success: true,
            message: "Authenticated successfully.",
            user: safeUser,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.login = login;
const register = async (req, res) => {
    try {
        const { email, password, username } = req.body;
        if (!email || !password || !username) {
            return res.status(400).send({ error: "Email, username and password are required" });
        }
        const existingUser = await (0, users_1.getUserByEmail)(email);
        if (existingUser) {
            return res.status(400).send({ error: "Email already in use" });
        }
        const salt = (0, helpers_1.random)();
        const created = await (0, users_1.createUser)({
            email,
            username,
            authentication: {
                salt,
                password: (0, helpers_1.authentication)(salt, password),
            },
        });
        const safeUser = mapToSafeUser(created);
        return res.status(200).json(safeUser);
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.register = register;
const me = async (req, res) => {
    try {
        const token = req.cookies?.authenticated;
        if (!token)
            return res.status(401).json({ error: "Not authenticated" });
        const user = await (0, users_1.getUserBySessionToken)(token);
        if (!user)
            return res.status(401).json({ error: "Not authenticated" });
        return res.status(200).json(mapToSafeUser(user));
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.me = me;
//# sourceMappingURL=authenticationController.js.map