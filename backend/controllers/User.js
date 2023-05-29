const User = require("../models/User");
const generateToken = require("../utils/auth");
const bcrypt = require("bcryptjs");

//Sign up function
const signUp = async (req, res) => {
  let { email, username, password } = req.body;
  // simple validation
  if (!email || !username || !password) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }
  // check for existing user
  try {
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    let passwordHashed = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      username,
      password: passwordHashed,
    });

    // save user
    const newUserSaved = await newUser.save();
    res.status(201).json({
      user: {
        id: newUserSaved.id,
        username: newUserSaved.username,
        email: newUserSaved.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

// Login function
const login = async (req, res) => {
  const { email, password } = req.body;

  // simple validation
  if (!email || !password) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }
  // check for existing user
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.matchPassword(password)) {
      res.status(200).json({
        _id: existingUser._id,
        username: existingUser.username,
        email: existingUser.email,
        //token: generateToken(existingUser._id),    /This one lead to a bug, let's solve them tomorrow
      });
    } else {
      return res.status(401).json({ msg: "Invalid credentials" });
    }
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

module.exports = { signUp, login };
