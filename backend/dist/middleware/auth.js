import jwt from 'jsonwebtoken';
export const authenticate = (jwtSecret) => {
    return (req, res, next) => {
        const auth = req.headers.authorization;
        if (!auth?.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const token = auth.slice('Bearer '.length);
        try {
            const payload = jwt.verify(token, jwtSecret);
            req.user = { id: payload.id, role: payload.role };
            return next();
        }
        catch {
            return res.status(401).json({ message: 'Invalid token' });
        }
    };
};
export const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        if (req.user.role !== role)
            return res.status(403).json({ message: 'Forbidden' });
        return next();
    };
};
