const jwt = require("jsonwebtoken");

function getToken(req) {
    const header = req.headers.authorization || "";
    return header.startsWith("Bearer ") ? header.slice(7) : null;
}

function verifyToken(token) {
    if (!token || !process.env.JWT_SECRET) return null;
    try { return jwt.verify(token, process.env.JWT_SECRET); }
    catch { return null; }
}

function requireAuth(req, res, next) {
    const user = verifyToken(getToken(req));
    if (!user) return res.status(401).json({ success:false, message:"Login talab qilinadi." });
    req.user = user;
    next();
}

function optionalAuth(req, _res, next) {
    req.user = verifyToken(getToken(req));
    next();
}

function requireAdmin(req, res, next) {
    requireAuth(req, res, () => {
        if (req.user.role !== "admin") {
            return res.status(403).json({ success:false, message:"Admin huquqi kerak." });
        }
        next();
    });
}

module.exports = { requireAuth, optionalAuth, requireAdmin };
