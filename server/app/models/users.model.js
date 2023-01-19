const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
	label: String,
    username: String,
    email: String,
    password: String,
	apikey: String,
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
      }
    ]
  })
);

module.exports = User;