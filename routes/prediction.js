const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// POST /api/prediction/predict - Update user predictions (from frontend)
router.post('/predict', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { nextPeriod, model } = req.body;
    
    if (!nextPeriod) {
      return res.status(400).json({ error: 'Next period prediction is required' });
    }

    const predictionData = {
      nextPeriod: {
        start: nextPeriod.start ? new Date(nextPeriod.start) : null,
        end: nextPeriod.end ? new Date(nextPeriod.end) : null,
        confidence: nextPeriod.confidence || 0
      }
    };

    if (model) {
      predictionData.model = {
        type: model.type || 'linear_regression',
        r2Score: model.r2Score,
        mae: model.mae,
        accuracy: model.accuracy,
        dataPoints: model.dataPoints || user.cycles.filter(c => !c.isDeleted).length
      };
    }

    user.updatePredictions(predictionData);
    await user.save();
    
    res.json({
      message: 'Predictions updated successfully',
      predictions: user.predictions
    });
  } catch (error) {
    console.error('Update predictions error:', error);
    res.status(500).json({ 
      error: 'Failed to update predictions'
    });
  }
});

// GET /api/prediction/predict - Get user predictions
router.get('/predict', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.predictions);
  } catch (error) {
    console.error('Get predictions error:', error);
    res.status(500).json({ 
      error: 'Failed to get predictions'
    });
  }
});

// GET /api/prediction/health - Health check for prediction service
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    predictionService: 'frontend-based',
    timestamp: new Date().toISOString()
  });
});

// GET /api/prediction/model-info - Get model information
router.get('/model-info', (req, res) => {
  res.json({
    modelType: 'Linear Regression',
    location: 'frontend',
    minDataPoints: 3,
    features: ['cycleLength', 'periodLength', 'daysSinceLastPeriod'],
    version: '1.0.0'
  });
});

module.exports = router;