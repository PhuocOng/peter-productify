const User = require('../models/User');
const { generateToken } = require('../utils/auth');
const bcrypt = require('bcryptjs');

// Get leaderboard function
const leaderboard = async (req, res) => {
  try {
    // get all users
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching leaderboard', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};

// Sign up function
const signUp = async (req, res) => {
  let { email, username, password } = req.body;
  // simple validation
  if (!email || !username || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }
  // check for existing user
  try {
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ msg: 'User already exists' });
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
      id: newUserSaved.id,
      username: newUserSaved.username,
      email: newUserSaved.email,
      token: generateToken(newUserSaved._id),
      profilepicture: newUserSaved.profilepicture,
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
    return res.status(400).json({ msg: 'Please enter all fields' });
  }
  // check for existing user
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.matchPassword(password)) {
      res.status(200).json({
        _id: existingUser._id,
        username: existingUser.username,
        email: existingUser.email,
        token: generateToken(existingUser._id),
        profilepicture: existingUser.profilepicture, //We will save it into localStorage and show on Navbar
      });
    } else {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

const getUser = async (req, res) => {
  //Not user now, just draft it
  try {
    const userId = req.user._id; //Get userID
    let currentUser = await User.findById(userId);
    return res.status(200).json(currentUser);
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

const updateUser = async (req, res) => {
  //We haven't used and tested it on Postman or frontend
  try {
    const userId = req.user._id;
    let updateInformation = req.body; //THis is an object with full property for user, if we want to update which property, we have to pass new property. If not, just keep it as past
    const updateUser = await User.findByIdAndUpdate(
      { _id: userId },
      { $set: updateInformation },
      { new: true }, //return to (updateUser variable) the new data
    );
    res.status(200).json({ user: updateUser });
  } catch (error) {
    console.log(`Failed to modify user information: ${error}`);
    res.status(500).json({ error: error });
  }
};

//getLabellist and setLabellist
//Asignee: Phuoc
//req: request object containing event id.
//res: response object to return status 200.
const getLabelList = async (req, res) => {
  try {
    const userId = req.user._id;
    let currentUser = await User.findById(userId);
    let currentLabelList = currentUser.labellist;
    res.status(200).json(currentLabelList)
  } catch (error) {
    console.log("Failed to fetch labellist from current User", { error })
    res.status(500).json({ error: error })
  }
}

const addLabelList = async (req, res) => { /* Res.body is an label object - return a new labellist (array of label objects) */
  const newLabel = req.body; /* Axios.post with body is object with name and color, {name: "event", color: "#00054F"} */
  try {
    const userId = req.user._id;
    let currentUser = await User.findById(userId);
    let currentLabelList = currentUser.labellist;
    let newLabelList = [...currentLabelList, newLabel]
    const updateUser = await User.findByIdAndUpdate(userId, {
      labellist: newLabelList,
    }, { new: true })
    res.status(200).json(updateUser.labellist)
  } catch (error) {
    console.log("Failed to update labellist from current User", { error })
    res.status(500).json({ error: error })
  }
}

const deleteLabelList = async (req, res) => {
  const deleteLabel = req.body;
  console.log('deleteLabel is', deleteLabel)
  try {
    const userId = req.user._id;
    const currentUser = await User.findById(userId)
    const currentLabelList = currentUser.labellist
    const newLabelList = currentLabelList.filter((labels) => {
      return labels.name !== deleteLabel.name || labels.color !== deleteLabel.color
    })
    const updateUser = await User.findByIdAndUpdate(userId, { labellist: newLabelList }, { new: true })
    res.status(200).json(updateUser.labellist)
  } catch (error) {
    console.log("failed to delete labels from labellist in current user", { error })
    res.status(500).json({ error: error })
  }
}


module.exports = { signUp, login, leaderboard, getUser, updateUser, getLabelList, addLabelList, deleteLabelList };
