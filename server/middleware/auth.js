const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authenticateUser = async (req, res, next) => {
  try {
    let token = req.header("authorization");
    if (!token) {
      return res.status(400).json({ error: "No authorization token found." });
    }
    token = token.replace("Bearer ", "");
    const userId = jwt.verify(token, process.env.SECRET);
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(400)
        .json({ error: "Incorrect/Invalid authentication token provided" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({
      error: "Could not verify token right now. Please try again later",
    });
  }
};

module.exports = authenticateUser;
