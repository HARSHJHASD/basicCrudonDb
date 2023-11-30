const { default: mongoose } = require("mongoose");

const User = mongoose.model("User", {
  username: { type: String, unique: true },
  password: String,
});

module.exports = User;
