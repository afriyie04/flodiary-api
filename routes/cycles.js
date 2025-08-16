const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// GET /api/cycles - Get all cycles for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const cycles = user.getCycles();
    
    res.json({
      cycles,
      total: cycles.length
    });
  } catch (error) {
    console.error('Get cycles error:', error);
    res.status(500).json({ error: 'Failed to fetch cycles' });
  }
});

// POST /api/cycles - Add a new cycle
router.post('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { startDate, endDate, cycleLength, periodLength } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const newStartDate = new Date(startDate);
    const newEndDate = new Date(endDate);
    
    // Calculate period length (duration of menstruation)
    const calculatedPeriodLength = periodLength || Math.ceil((newEndDate - newStartDate) / (1000 * 60 * 60 * 24)) + 1;
    
    // Calculate cycle length based on previous cycles
    let calculatedCycleLength = cycleLength;
    
    if (!calculatedCycleLength) {
      const previousCycles = user.getCycles();
      if (previousCycles.length > 0) {
        // Find the most recent cycle before this one
        const lastCycle = previousCycles.find(cycle => 
          new Date(cycle.startDate) < newStartDate
        );
        
        if (lastCycle) {
          // Calculate cycle length as days between period starts
          calculatedCycleLength = Math.ceil((newStartDate - new Date(lastCycle.startDate)) / (1000 * 60 * 60 * 24));
        } else {
          calculatedCycleLength = 28; // Default for first cycle
        }
      } else {
        calculatedCycleLength = 28; // Default for first cycle
      }
    }

    const cycleData = {
      startDate: newStartDate,
      endDate: newEndDate,
      cycleLength: calculatedCycleLength,
      periodLength: calculatedPeriodLength,
      predicted: false,
      confidence: 100
    };

    const cycle = user.addCycle(cycleData);
    await user.save();

    res.status(201).json({
      message: 'Cycle added successfully',
      cycle,
      stats: user.stats
    });
  } catch (error) {
    console.error('Add cycle error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: 'Validation failed', details: messages });
    }
    
    res.status(500).json({ error: 'Failed to add cycle' });
  }
});

// GET /api/cycles/stats - Get cycle statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Ensure stats are up to date
    user.updateStats();
    await user.save();

    res.json(user.stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// GET /api/cycles/:id - Get specific cycle
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const cycle = user.cycles.id(req.params.id);
    if (!cycle || cycle.isDeleted) {
      return res.status(404).json({ error: 'Cycle not found' });
    }

    res.json({ cycle });
  } catch (error) {
    console.error('Get cycle error:', error);
    res.status(500).json({ error: 'Failed to fetch cycle' });
  }
});

// PUT /api/cycles/:id - Update specific cycle
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { startDate, endDate, cycleLength, periodLength } = req.body;
    
    const updateData = {};
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    if (cycleLength) updateData.cycleLength = cycleLength;
    if (periodLength) updateData.periodLength = periodLength;

    const cycle = user.updateCycle(req.params.id, updateData);
    await user.save();

    res.json({
      message: 'Cycle updated successfully',
      cycle,
      stats: user.stats
    });
  } catch (error) {
    console.error('Update cycle error:', error);
    
    if (error.message === 'Cycle not found') {
      return res.status(404).json({ error: 'Cycle not found' });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: 'Validation failed', details: messages });
    }
    
    res.status(500).json({ error: 'Failed to update cycle' });
  }
});

// DELETE /api/cycles/:id - Delete specific cycle (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const cycle = user.deleteCycle(req.params.id);
    await user.save();

    res.json({
      message: 'Cycle deleted successfully',
      cycle,
      stats: user.stats
    });
  } catch (error) {
    console.error('Delete cycle error:', error);
    
    if (error.message === 'Cycle not found') {
      return res.status(404).json({ error: 'Cycle not found' });
    }
    
    res.status(500).json({ error: 'Failed to delete cycle' });
  }
});

// Daily Entry routes
// POST /api/cycles/daily - Create/update daily entry
router.post('/daily', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { date, flow, cycleId } = req.body;
    
    if (!date || !flow) {
      return res.status(400).json({ error: 'Date and flow are required' });
    }

    const entryData = {
      date: new Date(date),
      flow,
      cycleId
    };

    const entry = user.addDailyEntry(entryData);
    await user.save();

    res.status(201).json({
      message: 'Daily entry saved successfully',
      entry
    });
  } catch (error) {
    console.error('Create daily entry error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: 'Validation failed', details: messages });
    }
    
    res.status(500).json({ error: 'Failed to save daily entry' });
  }
});

// GET /api/cycles/daily - Get daily entries for date range
router.get('/daily', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { startDate, endDate } = req.query;
    const options = { startDate, endDate };

    const entries = user.getDailyEntries(options);
    
    res.json({
      entries,
      total: entries.length
    });
  } catch (error) {
    console.error('Get daily entries error:', error);
    res.status(500).json({ error: 'Failed to get daily entries' });
  }
});

module.exports = router;