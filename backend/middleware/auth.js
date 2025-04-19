import jwt from "jsonwebtoken";

const verifyToken = (req,res,next) => {
 const token = req.cookies.token;
 if(token == null) return res.sendStatus(401); // if there isn't any token
try {
  const decoded = jwt.verify(token,process.env.JWT_SECRET);
  req.user = decoded;
} catch (error) {
  return res.status(403).json({ message: "Invalid token" })
}
next();
}
export default verifyToken;