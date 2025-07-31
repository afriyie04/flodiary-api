const data = {
    userData: {
      firstName: "Jane",
      lastName: "Doe",
      username: "janedoe",
      email: "jane.doe@example.com",
      password: "password",
    },
    cycleDetails: {
      avgCycleLength: 28,
      avgPeriodDuration: 5,
      lastPeriodDate: "2025-05-20",
    },
    dailyEntries: [
      {
        date: "2025-06-15",
        mood: "okay", // 'great', 'good', 'okay', 'bad', 'awful'
        flowLevel: "medium", // 'none', 'light', 'medium', 'heavy'
        symptoms: ["cramps", "bloating", "fatigue"],
        notes: "Feeling a bit tired today.",
      },
      {
        date: "2025-06-16",
        mood: "good",
        flowLevel: "light",
        symptoms: ["headache"],
        notes: "Headache in the morning.",
      },
    ],

  appOutput: {
    dashboard: {
      predictedPeriodDate: "2025-06-17",
      predictedOvulationDate: "2025-07-01",
      fertileWindow: ["2025-06-28", "2025-07-03"],
      currentDayInCycle: 27,
    },
    cycleHistory: [
      {
        cycleId: "2025-05",
        startDate: "2025-05-20",
        endDate: "2025-05-24",
        cycleLength: 28,
        periodLength: 5,
      },
      {
        cycleId: "2025-04",
        startDate: "2025-04-22",
        endDate: "2025-04-26",
        cycleLength: 29,
        periodLength: 5,
      },
    ],
    statistics: {
      avgCycleLength: 28.5,
      avgPeriodLength: 5,
      cycleVariation: "±1 day",
    },
    charts: {
      cycleLengthTrend: [
        { month: "Jan", length: 28 },
        { month: "Feb", length: 29 },
        { month: "Mar", length: 28 },
      ],
      symptomFrequency: [
        { name: "Cramps", value: 8 },
        { name: "Fatigue", value: 6 },
        { name: "Headache", value: 5 },
      ],
    },
  },

  // Data structured for a linear regression model
  // to predict 'nextPeriodStartDate'
  modelInput: [
    {
      // Features for one cycle
      cycleId: "2025-05",
      userId: "user_123",
      // Cycle characteristics
      cycleLength: 28,
      periodLength: 5,
      // One-hot encoded moods for the cycle (could be averaged or summed)
      mood_great_days: 2,
      mood_good_days: 10,
      mood_okay_days: 10,
      mood_bad_days: 4,
      mood_awful_days: 2,
      // One-hot encoded flow levels
      flow_light_days: 2,
      flow_medium_days: 2,
      flow_heavy_days: 1,
      // One-hot encoded symptoms (days symptom was present)
      symptom_cramps: 4,
      symptom_headache: 3,
      symptom_bloating: 5,
      symptom_breast_tenderness: 2,
      symptom_fatigue: 6,
      symptom_acne: 1,
      symptom_nausea: 0,
      symptom_backache: 3,
      symptom_mood_swings: 5,
      symptom_irritability: 2,
      symptom_anxiety: 1,
      symptom_sadness: 1,
      symptom_stress: 3,
      symptom_high_energy: 4,
      symptom_low_energy: 7,
      // Target variable
      nextPeriodStartDate: "2025-06-17", // This is what the model would predict
    },
    // ... more data points for other cycles
  ],
};
