const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide name"],
      maxlength: 50,
      minLength: 3,
    },
    email: {
      type: String,
      required: [true, "Please provide email"],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please provide a valid email",
      ],
      unique: true,
    },
    profilePic: { type: String, default: null },
    password: {
      type: String,
      required: [true, "Please provide password"],
    },
    role: {
      type: String,
      enum: ["user", "owner", "trainer"],
      default: "user",
    },
    otp: {
      type: Number,
      default: 0,
      required: false,
      validate: {
        validator: function (val) {
          return val.toString().length === 6;
        },
        message: (val) => `${val.value} has to be 9 digits`,
      },
      select: false,
    },
    otpExpiration: {
      type: Date,
      select: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// instance method

UserSchema.methods.createJWT = function () {
  return jwt.sign({ id: this._id, name: this.name }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });
};

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

module.exports = mongoose.model("User", UserSchema);
