const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

const generateTokenAndSendResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.status(statusCode).json({
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
    },
  });
};

exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Username or email already exists" });
    }

    const user = new User({ firstName, lastName, username, email, password });
    await user.save();

    generateTokenAndSendResponse(user, 201, res);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Please provide username and password" });
    }

    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    generateTokenAndSendResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
