const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

// verification middleware for JWT
const protect = async (req, res, next) => {
  let token;

  // check token on header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // get token from header (format: "Bearer TOKEN")
      token = req.headers.authorization.split(" ")[1];

      // token verification
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // get user from db
      req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      });

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      next();
    } catch (error) {
      console.error("Auth Middleware Error:", error.message);

      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed",
      });
    }
  }

  // no token
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token",
    });
  }
};

module.exports = { protect };
