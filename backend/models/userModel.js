const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "username is requried!"],
    },
    email: {
      type: String,
      required: [true, "email is required!"],
    },
    password: {
      type: String,
      requried: [true, "password is required!s"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);
