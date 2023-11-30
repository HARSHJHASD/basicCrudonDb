const jwt = require("jsonwebtoken");
function authenticateToken(req, res, next) {
  const token = req.cookies.authorizationCookie;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Missing token" });
  }
  jwt.verify(token, "your-secret-key", (err, decoded) => {
    if (decoded) {
      req.user = decoded;
      console.log(req.user);
      next();
    }
    if (err) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
  });
}
module.exports = {
  authenticateToken,
};
