const express = require("express");
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  updateCycleDetails,
  addDailyEntry,
  getAllDailyEntries,
  getDailyEntry,
  updateDailyEntry,
  deleteDailyEntry,
} = require("../controllers/user.controller");
const { authenticate } = require("../middleware/auth.middleware");

// Profile routes
router
  .route("/profile")
  .get(authenticate, getUserProfile)
  .put(authenticate, updateUserProfile);

// Cycle details route
router.route("/profile/cycle").put(authenticate, updateCycleDetails);

// Daily entry routes
router
  .route("/profile/entries")
  .post(authenticate, addDailyEntry)
  .get(authenticate, getAllDailyEntries);

router
  .route("/profile/entries/:entryId")
  .get(authenticate, getDailyEntry)
  .put(authenticate, updateDailyEntry)
  .delete(authenticate, deleteDailyEntry);

module.exports = router;
