const { format, parseISO, isValid } = require('date-fns');

// Date utilities
const formatDate = (date) => {
  if (!date) return null;
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return isValid(parsedDate) ? format(parsedDate, 'yyyy-MM-dd') : null;
};

const formatDateTime = (date) => {
  if (!date) return null;
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return isValid(parsedDate) ? format(parsedDate, 'yyyy-MM-dd HH:mm:ss') : null;
};

// Response utilities
const successResponse = (data, message = 'Success') => ({
  success: true,
  message,
  data
});

const errorResponse = (message, details = null) => ({
  success: false,
  error: message,
  ...(details && { details })
});

// Validation utilities
const isValidFlow = (flow) => {
  const validFlows = ['none', 'spotting', 'light', 'medium', 'heavy'];
  return validFlows.includes(flow);
};

const isValidMood = (mood) => {
  return Number.isInteger(mood) && mood >= 1 && mood <= 5;
};

const isValidCycleLength = (length) => {
  return Number.isInteger(length) && length >= 15 && length <= 50;
};

const isValidPeriodLength = (length) => {
  return Number.isInteger(length) && length >= 1 && length <= 15;
};

// Data processing utilities
const sanitizeUserData = (user) => {
  if (!user) return null;
  
  const { password, ...safeUser } = user;
  return safeUser;
};

const processSymptoms = (symptoms) => {
  if (!Array.isArray(symptoms)) return [];
  
  const validSymptoms = [
    'cramps', 'bloating', 'headache', 'fatigue', 'nausea', 
    'breast_tenderness', 'mood_swings', 'acne', 'back_pain',
    'food_cravings', 'irritability', 'anxiety', 'depression'
  ];
  
  return symptoms.filter(symptom => 
    typeof symptom === 'string' && validSymptoms.includes(symptom.toLowerCase())
  );
};

// Cycle calculation utilities
const calculateCycleLength = (startDate, endDate) => {
  if (!startDate || !endDate) return null;
  
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  
  if (!isValid(start) || !isValid(end)) return null;
  
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

const getCyclePhase = (dayOfCycle, cycleLength = 28) => {
  if (dayOfCycle <= 5) return 'menstrual';
  if (dayOfCycle <= Math.floor(cycleLength / 2) - 2) return 'follicular';
  if (dayOfCycle <= Math.floor(cycleLength / 2) + 2) return 'ovulatory';
  return 'luteal';
};

module.exports = {
  formatDate,
  formatDateTime,
  successResponse,
  errorResponse,
  isValidFlow,
  isValidMood,
  isValidCycleLength,
  isValidPeriodLength,
  sanitizeUserData,
  processSymptoms,
  calculateCycleLength,
  getCyclePhase
};