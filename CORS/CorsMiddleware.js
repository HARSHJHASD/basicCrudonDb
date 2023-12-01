async function CorsMiddleware(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Replace * with your allowed origins
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Continue to the next middleware or route handler
  next();
}

module.exports = {
  CorsMiddleware,
};
