import jwt from "jsonwebtoken";
import "dotenv/config.js";
const verifyToken = (req, res, next) => {
  // Check for token in cookies first - look for both "token" and "accessToken"
  const cookieToken = req.cookies.token || req.cookies.accessToken;
  
  // Then check for Bearer token in Authorization header
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : null;
  
  // Use whichever token is available
  const token = cookieToken || bearerToken;
  
  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ message: "Invalid token" });
  }
}

export default verifyToken;