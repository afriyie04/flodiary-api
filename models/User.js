const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Embedded cycle schema
const cycleSchema = new mongoose.Schema(
  {
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    cycleLength: {
      type: Number,
      required: [true, "Cycle length is required"],
      min: [15, "Cycle length must be at least 15 days"],
      max: [60, "Cycle length cannot exceed 60 days"],
    },
    periodLength: {
      type: Number,
      required: [true, "Period length is required"],
      min: [1, "Period length must be at least 1 day"],
      max: [15, "Period length cannot exceed 15 days"],
    },
    predicted: {
      type: Boolean,
      default: false,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 100,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Embedded daily entry schema
const dailyEntrySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    flow: {
      type: String,
      enum: ["none", "spotting", "light", "medium", "heavy"],
      required: [true, "Flow is required"],
    },
    cycleId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Cycle ID is required"],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Stats schema
const statsSchema = new mongoose.Schema(
  {
    totalCycles: { type: Number, default: 0 },
    avgCycleLength: { type: Number, default: 28 },
    avgPeriodLength: { type: Number, default: 4 },
    minCycleLength: { type: Number, default: 28 },
    maxCycleLength: { type: Number, default: 28 },
    firstCycleDate: { type: Date },
    lastCycleDate: { type: Date },
  },
  { _id: false }
);

// Prediction schema
const predictionSchema = new mongoose.Schema(
  {
    nextPeriod: {
      start: { type: Date },
      end: { type: Date },
      confidence: { type: Number, min: 0, max: 1 },
    },
    model: {
      type: { type: String, default: "linear_regression" },
      r2Score: { type: Number },
      mae: { type: Number },
      accuracy: { type: Number },
      lastTrained: { type: Date },
      dataPoints: { type: Number, default: 0 },
    },
  },
  { _id: false }
);

// App metadata schema
const appMetadataSchema = new mongoose.Schema(
  {
    lastSync: { type: Date, default: Date.now },
    setupCompleted: { type: Boolean, default: false },
    onboardingCompleted: { type: Boolean, default: false },
  },
  { _id: false }
);

// Main User schema
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Embedded data arrays
    cycles: [cycleSchema],
    dailyEntries: [dailyEntrySchema],

    // Embedded objects
    stats: { type: statsSchema, default: () => ({}) },
    predictions: { type: predictionSchema, default: () => ({}) },
    appMetadata: { type: appMetadataSchema, default: () => ({}) },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastLoginAt: -1 });
userSchema.index({ "cycles.startDate": -1 });
userSchema.index({ "dailyEntries.date": -1 });

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Instance method to get safe user data (without sensitive info)
userSchema.methods.toSafeObject = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

// Instance method to update last login
userSchema.methods.updateLastLogin = async function () {
  this.lastLoginAt = new Date();
  return await this.save();
};

// Static method to find by credentials
userSchema.statics.findByCredentials = async function (email, password) {
  const user = await this.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    throw new Error("Invalid email or password");
  }

  return user;
};

// Static method to check if email exists
userSchema.statics.emailExists = async function (email) {
  const user = await this.findOne({ email: email.toLowerCase() });
  return !!user;
};

// Static method to check if username exists
userSchema.statics.usernameExists = async function (username) {
  const user = await this.findOne({ username: username.toLowerCase() });
  return !!user;
};

// Instance method to add cycle
userSchema.methods.addCycle = function (cycleData) {
  const cycle = {
    ...cycleData,
    _id: new mongoose.Types.ObjectId(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  this.cycles.push(cycle);
  this.updateStats();
  return cycle;
};

// Instance method to update cycle
userSchema.methods.updateCycle = function (cycleId, cycleData) {
  const cycle = this.cycles.id(cycleId);
  if (!cycle) throw new Error("Cycle not found");

  Object.assign(cycle, cycleData, { updatedAt: new Date() });
  this.updateStats();
  return cycle;
};

// Instance method to delete cycle (soft delete)
userSchema.methods.deleteCycle = function (cycleId) {
  const cycle = this.cycles.id(cycleId);
  if (!cycle) throw new Error("Cycle not found");

  cycle.isDeleted = true;
  cycle.updatedAt = new Date();
  this.updateStats();
  return cycle;
};

// Instance method to get cycles
userSchema.methods.getCycles = function (options = {}) {
  const { includeDeleted = false } = options;

  let cycles = this.cycles;
  if (!includeDeleted) {
    cycles = cycles.filter((cycle) => !cycle.isDeleted);
  }

  return cycles.sort((a, b) => b.startDate - a.startDate);
};

// Instance method to add daily entry
userSchema.methods.addDailyEntry = function (entryData) {
  const entry = {
    ...entryData,
    _id: new mongoose.Types.ObjectId(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  this.dailyEntries.push(entry);
  return entry;
};

// Instance method to update daily entry
userSchema.methods.updateDailyEntry = function (entryId, entryData) {
  const entry = this.dailyEntries.id(entryId);
  if (!entry) throw new Error("Daily entry not found");

  Object.assign(entry, entryData, { updatedAt: new Date() });
  return entry;
};

// Instance method to delete daily entry (soft delete)
userSchema.methods.deleteDailyEntry = function (entryId) {
  const entry = this.dailyEntries.id(entryId);
  if (!entry) throw new Error("Daily entry not found");

  entry.isDeleted = true;
  entry.updatedAt = new Date();
  return entry;
};

// Instance method to get daily entries
userSchema.methods.getDailyEntries = function (options = {}) {
  const { includeDeleted = false, startDate, endDate } = options;

  let entries = this.dailyEntries;

  if (!includeDeleted) {
    entries = entries.filter((entry) => !entry.isDeleted);
  }

  if (startDate || endDate) {
    entries = entries.filter((entry) => {
      if (startDate && entry.date < new Date(startDate)) return false;
      if (endDate && entry.date > new Date(endDate)) return false;
      return true;
    });
  }

  return entries.sort((a, b) => b.date - a.date);
};

// Instance method to update stats
userSchema.methods.updateStats = function () {
  const activeCycles = this.cycles.filter((cycle) => !cycle.isDeleted);

  if (activeCycles.length === 0) {
    this.stats = {
      totalCycles: 0,
      avgCycleLength: 28,
      avgPeriodLength: 4,
      minCycleLength: 28,
      maxCycleLength: 28,
      firstCycleDate: null,
      lastCycleDate: null,
    };
    return;
  }

  const cycleLengths = activeCycles
    .map((cycle) => cycle.cycleLength)
    .filter(Boolean);
  const periodLengths = activeCycles
    .map((cycle) => cycle.periodLength)
    .filter(Boolean);
  const dates = activeCycles.map((cycle) => cycle.startDate).filter(Boolean);

  this.stats = {
    totalCycles: activeCycles.length,
    avgCycleLength: cycleLengths.length
      ? Number(
          (
            cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length
          ).toFixed(1)
        )
      : 28,
    avgPeriodLength: periodLengths.length
      ? Number(
          (
            periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length
          ).toFixed(1)
        )
      : 4,
    minCycleLength: cycleLengths.length ? Math.min(...cycleLengths) : 28,
    maxCycleLength: cycleLengths.length ? Math.max(...cycleLengths) : 28,
    firstCycleDate: dates.length ? new Date(Math.min(...dates)) : null,
    lastCycleDate: dates.length ? new Date(Math.max(...dates)) : null,
  };
};

// Instance method to update predictions
userSchema.methods.updatePredictions = function (predictionData) {
  this.predictions = {
    ...this.predictions.toObject(),
    ...predictionData,
    model: {
      ...this.predictions.model,
      ...predictionData.model,
      lastTrained: new Date(),
    },
  };
};

// Instance method to update app metadata
userSchema.methods.updateAppMetadata = function (metadataData) {
  this.appMetadata = {
    ...this.appMetadata.toObject(),
    ...metadataData,
    lastSync: new Date(),
  };
};

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtuals are included when converting to JSON
userSchema.set("toJSON", { virtuals: true });

const User = mongoose.model("User", userSchema);

module.exports = User;
