const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).populate('role_id');
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role_id) {
            return res.status(401).json({ message: 'Not authorized, no role assigned' });
        }

        const userRole = req.user.role_id.role_code;
        if (!roles.includes(userRole)) {
            return res.status(403).json({ message: `Role ${userRole} is not authorized to access this route` });
        }
        next();
    };
};

module.exports = { protect, authorize };
