const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true, sparse: true },
  password: { type: String }, // for local auth
  googleId: { type: String, unique: true, sparse: true },
  githubId: { type: String, unique: true, sparse: true },
  role: { type: String, default: "user" },
  createdAt: { type: Date, default: Date.now },
});

//sparse field is use if it login with github or mormal then it can be Null

module.exports = mongoose.model("User", UserSchema);
