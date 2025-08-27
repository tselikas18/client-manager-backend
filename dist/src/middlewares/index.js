"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = exports.isOwner = void 0;
const users_1 = require("../db/users");
//Ownership middleware
const isOwner = (getById) => {
    return async (req, res, next) => {
        try {
            const currentUserId = req.identity?._id;
            console.debug('isOwner: currentUserId=', currentUserId);
            if (!currentUserId)
                return res.sendStatus(401);
            const { id } = req.params;
            console.debug('isOwner: req.params.id=', id, 'method=', req.method);
            if (!id || req.method === 'POST')
                return next();
            const resource = await getById(id);
            console.debug('isOwner: resource=', resource);
            if (!resource)
                return res.status(404).json({ message: 'resource not found' });
            const resourceOwnerId = resource.user_id ?? resource.userId ?? resource._id;
            console.debug('isOwner: resourceOwnerId=', resourceOwnerId);
            if (!resourceOwnerId || resourceOwnerId.toString() !== currentUserId.toString()) {
                return res.status(403).json({ message: 'forbidden action' });
            }
            return next();
        }
        catch (err) {
            console.error(err);
            return res.sendStatus(400);
        }
    };
};
exports.isOwner = isOwner;
const isAuthenticated = async (req, res, next) => {
    try {
        const sessionToken = req.cookies['authenticated'];
        if (!sessionToken)
            return res.sendStatus(401);
        const existingUser = await (0, users_1.getUserBySessionToken)(sessionToken);
        if (!existingUser)
            return res.sendStatus(401);
        req.identity = existingUser;
        console.debug('authenticated user id=', req.identity._id);
        return next();
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(400);
    }
};
exports.isAuthenticated = isAuthenticated;
//# sourceMappingURL=index.js.map