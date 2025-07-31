const User = require("../models/user.model");

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        username: updatedUser.username,
        email: updatedUser.email,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update cycle details
// @route   PUT /api/users/profile/cycle
// @access  Private
const updateCycleDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.cycleDetails.avgCycleLength =
        req.body.avgCycleLength || user.cycleDetails.avgCycleLength;
      user.cycleDetails.avgPeriodDuration =
        req.body.avgPeriodDuration || user.cycleDetails.avgPeriodDuration;
      user.cycleDetails.lastPeriodDate =
        req.body.lastPeriodDate || user.cycleDetails.lastPeriodDate;

      const updatedUser = await user.save();
      res.json(updatedUser.cycleDetails);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Add a daily entry
// @route   POST /api/users/profile/entries
// @access  Private
const addDailyEntry = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      const { date, mood, flowLevel, symptoms, notes } = req.body;
      const newEntry = {
        date,
        mood,
        flowLevel,
        symptoms,
        notes,
      };
      user.dailyEntries.push(newEntry);
      await user.save();
      res.status(201).json(user.dailyEntries);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res
      .status(400)
      .json({ message: "Invalid entry data", error: error.message });
  }
};

// @desc    Get all daily entries
// @route   GET /api/users/profile/entries
// @access  Private
const getAllDailyEntries = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      res.json(user.dailyEntries);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get a single daily entry
// @route   GET /api/users/profile/entries/:entryId
// @access  Private
const getDailyEntry = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      const entry = user.dailyEntries.id(req.params.entryId);
      if (entry) {
        res.json(entry);
      } else {
        res.status(404).json({ message: "Entry not found" });
      }
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update a daily entry
// @route   PUT /api/users/profile/entries/:entryId
// @access  Private
const updateDailyEntry = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      const entry = user.dailyEntries.id(req.params.entryId);
      if (entry) {
        const { date, mood, flowLevel, symptoms, notes } = req.body;
        entry.date = date || entry.date;
        entry.mood = mood || entry.mood;
        entry.flowLevel = flowLevel || entry.flowLevel;
        entry.symptoms = symptoms || entry.symptoms;
        entry.notes = notes || entry.notes;

        await user.save();
        res.json(entry);
      } else {
        res.status(404).json({ message: "Entry not found" });
      }
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res
      .status(400)
      .json({ message: "Invalid entry data", error: error.message });
  }
};

// @desc    Delete a daily entry
// @route   DELETE /api/users/profile/entries/:entryId
// @access  Private
const deleteDailyEntry = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      const entry = user.dailyEntries.id(req.params.entryId);
      if (entry) {
        entry.remove();
        await user.save();
        res.json({ message: "Entry removed" });
      } else {
        res.status(404).json({ message: "Entry not found" });
      }
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  updateCycleDetails,
  addDailyEntry,
  getAllDailyEntries,
  getDailyEntry,
  updateDailyEntry,
  deleteDailyEntry,
};
