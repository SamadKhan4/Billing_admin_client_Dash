const jwt = require("jsonwebtoken");

// Middleware: Check if user is logged in (JWT verification)
exports.isLoggedIn = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      msg: "Access denied. Authorization header missing or malformed.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Authenticated User:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ JWT Verification Failed:", err.message);
    return res.status(401).json({ msg: "Invalid or expired token" });
  }
};

// Middleware: Allow only Admins
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.userType === "Admin") {
    return next();
  }
  return res.status(403).json({ msg: "❌ Access denied: Admins only" });
};

// Middleware: Allow only Editors
exports.isEditor = (req, res, next) => {
  if (req.user?.userType === "Editor") {
    return next();
  }
  return res.status(403).json({ msg: "Access denied. Editors only." });
};

// Middleware: Allow Admins or Editors
exports.isEditorOrAdmin = (req, res, next) => {
  if (req.user && ["Admin", "Editor"].includes(req.user.userType)) {
    return next();
  }
  return res.status(403).json({ msg: "Access denied. Admins or Editors only." });
};
