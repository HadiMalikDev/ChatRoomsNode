const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Room = require("./room");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: [5, "Length must be greater than 5"],
  },
  password: {
    minlength: [8, "Minimum length should be 8"],
    required: true,
    type: String,
  },
  rooms: [
    {
      room: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Room",
      },
    },
  ],
});
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    const encryptedPassword = await bcrypt.hash(user.password, 10);
    user.password = encryptedPassword;
  }
  next();
});
//Deleting user updates room(s) a user was part of
userSchema.post("remove", async function (user) {
  user.rooms.forEach(async (r) => {
    const room = await Room.findById(r.room);
    if (room) await room.removeParticipant(user._id);
  });
});

userSchema.methods.leaveRoom = async function (roomId) {
  const user = this;
  const id=roomId.toString()
  user.rooms = user.rooms.filter((r) => r.room.toString() != id);
  await user.save()
};
userSchema.statics.findByToken = async function (token) {
  const userId = jwt.verify(token, process.env.SECRET);
  const user = await this.findById(userId);
  return user;
};
const User = mongoose.model("User", userSchema);

module.exports = User;
