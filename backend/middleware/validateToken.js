const asyncHandler = require("express-async-handler")
const jwt = require("jsonwebtoken")
const validateToken = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization || req.headers.Authorization;
  
  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        res.status(401);
        throw new Error("Not authorized, token failed");
      }
      req.userId = decoded.user.id;
      req.email = decoded.user.email;
      req.username = decoded.user.username;
      next();
    });
  } else {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

module.exports = validateToken;