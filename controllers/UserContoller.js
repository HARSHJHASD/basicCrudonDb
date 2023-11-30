const User = require("../models/User");
const jwt = require("jsonwebtoken");
const secretKey = "your-secret-key";

async function SignupUser(req, res, next) {
  const { username, password } = req.body;
  console.log("request body is : ", req.body);
  const payload = { username, password };
  try {
    const newUser = new User(payload);
    await newUser.save();
    res.status(200).json({
      success: true,
      message: "User Created Successfully",
      user: newUser,
    });
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .json({ message: "Username already taken or invalid input" });
  }
}

async function LoginUser(req, res) {
  // {
  //     "username": "harshu",
  //     "password": "harshu9839#"
  // }
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, password });
    if (user) {
      const token = jwt.sign(
        { id: user._id, username: user.username },
        secretKey,
        { expiresIn: "30d" }
      );
      const oneHourFromNow = new Date(Date.now() + 3600000); // 3600000 milliseconds = 1 hour

      // Set the token as an HTTP-only cookie with an expiration time
      res.cookie("authorizationCookie", token, {
        httpOnly: true,
        expires: oneHourFromNow,
      });
      res.json({ token: token, user: user });
    }
  } catch (error) {
    console.log(error);
  }
}

async function UserLogout(req, res) {
  try {
    // Clear the authorization cookie
    res.clearCookie("authorizationCookie");

    // Optionally, you can include additional information in the response
    res.status(200).json({
      success: true,
      message: "Logout successful",
      data: null, // You can include additional data if needed
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

module.exports = {
  UserLogout,
  // Add other controller functions as needed
};

module.exports = {
  SignupUser,
  LoginUser,
  UserLogout,
};
