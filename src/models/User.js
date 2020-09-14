const mongoose = require("mongoose");
const bcript = require("bcrypt");

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: false,
  },
  userAppleId: {
    type: String,
    require: false,
  },
});

userSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("password") || !user.password) {
    return next();
  }

  bcript.hash(user.password, 10, (err, hash) => {
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  });
});

userSchema.methods.comparePassword = async function (password) {
  try {
    const user = this;
    const result = await bcript.compare(password, user.password);
    return result;
  } catch (error) {
    return false;
  }
};

mongoose.model("User", userSchema);
