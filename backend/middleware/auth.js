import jwt from "jsonwebtoken";

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
    const decoded = jwt.verify(token, "790802b77cd0623ec9a664507686153e5bbf235da748680bf5a6a21fed43bb034afb65393ba00e8ee579750f1102aa8cefcd091e8b7a030acb973527d61fbd72");
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ message: "Invalid token" });
  }
}

export default verifyToken;