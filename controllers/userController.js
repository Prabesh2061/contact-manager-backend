const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// @desc   Register a user
// @route  POST /api/users/register
// @access Public
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400);
    throw new Error('Please add all fields');
  }
  const userAvailable = await User.findOne({ email });
  if (userAvailable) {
    res.status(400);
    throw new Error('User already registered');
  }
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    username,
    email,
    password: hashedPassword
  });
  if (user) {
    res.status(201).json({
      _id: user.id,
      email: user.email
    });
  } else {
    res.status(400);
    throw new Error('User data is not valid');
  }
  res.json({message: 'Register the user'});
});

// @desc   Login user
// @route  POST /api/users/login
// @access Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error('Please add email and password');
  }
  const user = await User.findOne({ email });
  // compare passwords with hashed password
  if (user && (await bcrypt.compare(password, user.password))) {
    const accessToken = jwt.sign(
      {
        user: {
          username: user.username,
          email: user.email,
          id: user.id
        }
      },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '20m' }
      );
    res.status(200).json({ accessToken });
  } else {
    res.status(401);
    throw new Error('Invalid credentials');
  }
  res.json({message: 'login user'});
});

// @desc   Current user info
// @route  POST /api/users/current
// @access Private
const currentUser = asyncHandler(async (req, res) => {
  res.json({userinfo: req.user});
});


module.exports = {registerUser, loginUser, currentUser};