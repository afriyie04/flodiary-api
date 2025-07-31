const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "is invalid"],
    },
    password: {
      type: String,
      required: true,
    },
    cycleDetails: {
      avgCycleLength: {
        type: Number,
        default: 28,
      },
      avgPeriodDuration: {
        type: Number,
        default: 5,
      },
      lastPeriodDate: {
        type: Date,
      },
    },
    dailyEntries: [
      {
        date: {
          type: Date,
          required: true,
        },
        mood: {
          type: String,
          enum: ["great", "good", "okay", "bad", "awful"],
          required: true,
        },
        flowLevel: {
          type: String,
          enum: ["none", "light", "medium", "heavy"],
          required: true,
        },
        symptoms: [String],
        notes: {
          type: String,
          trim: true,
        },
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
