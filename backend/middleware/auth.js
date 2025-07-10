import jwt from "jsonwebtoken";
import db from "../data/database.js";

//Main Authentication Middleware
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        error: "Access token required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await db.getUserById(decoded.userId);

    if (!user) res.status(401).json({ error: "User not found" });
    if (!user.is_active) res.status(401).json({ error: "Account is inactive" });

    req.user = {
      userId: user.user_id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      address: user.address,
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }

    console.error("Authentication error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};

const loginAttempts = new Map();

export const loginRateLimit = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  if (!loginAttempts.has(ip)) {
    loginAttempts.set(ip, { attempts: 0, resetTime: now + windowMs });
  }

  const attempts = loginAttempts.get(ip);

  if (now > attempts.resetTime) {
    attempts.attempts = 0;
    attempts.resetTime = now + windowMs;
  }

  if (attempts.attempts >= maxAttempts) {
    return res.status(429).json({
      error: "Too many login attempts. Please try again later.",
      retryAfter: Math.ceil((attempts.resetTime - now) / 1000 / 60),
    });
  }

  // Increment attempts on failed login (this will be called from the login route)
  req.incrementLoginAttempts = () => {
    attempts.attempts++;
    loginAttempts.set(ip, attempts);
  };

  next();
};
