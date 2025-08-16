# Flodiary API

A RESTful API backend for Flodiary - a period tracking application.

## Features

- **User Authentication**: JWT-based authentication with registration and login
- **Cycle Tracking**: Complete cycle management with CRUD operations
- **Daily Entries**: Detailed daily tracking of flow, symptoms, mood
- **ML Predictions**: Advanced machine learning predictions using trained linear regression model
- **Statistics**: Cycle insights and analytics
- **Security**: Input validation, rate limiting, password hashing

## Quick Start

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Seed the database with sample data
npm run seed

# Start development server
npm run dev
```

### Environment Variables

Copy `.env.example` to `.env` and update the values:

```env
PORT=3001
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-secret-key-here
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/password` - Change password

### Cycles
- `POST /api/cycles` - Create new cycle
- `GET /api/cycles` - Get user cycles
- `GET /api/cycles/stats` - Get cycle statistics
- `GET /api/cycles/:id` - Get specific cycle
- `PUT /api/cycles/:id` - Update cycle
- `DELETE /api/cycles/:id` - Delete cycle

### Daily Entries
- `POST /api/cycles/daily` - Create/update daily entry
- `GET /api/cycles/daily/:date` - Get daily entry
- `GET /api/cycles/daily` - Get daily entries (date range)
- `PUT /api/cycles/daily/:date` - Update daily entry
- `DELETE /api/cycles/daily/:date` - Delete daily entry

### ML Predictions
- `POST /api/prediction/predict` - Generate ML-powered cycle predictions
- `POST /api/prediction/setup-complete` - Trigger predictions after cycle setup
- `GET /api/prediction/health` - Service health check
- `GET /api/prediction/model-info` - ML model technical information
- `GET /api/prediction/insights` - Get AI-powered cycle insights

### Health Check
- `GET /api/health` - API health status

## Database Schema (MongoDB)

### Users Collection
```javascript
{
  _id: ObjectId,
  firstName: String (required),
  lastName: String (required),
  username: String (unique, required),
  email: String (unique, required),
  password: String (required, hashed),
  profileSettings: {
    timezone: String,
    notifications: {
      periodReminders: Boolean,
      ovulationReminders: Boolean,
      symptomReminders: Boolean
    },
    privacy: {
      dataSharing: Boolean,
      analytics: Boolean
    }
  },
  lastLoginAt: Date,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Cycles Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  startDate: Date (required),
  endDate: Date,
  cycleLength: Number (15-60),
  periodLength: Number (1-15),
  symptoms: [String], // Array of symptoms
  mood: String,
  notes: String,
  tags: [String],
  flow: {
    heavy: Number,
    medium: Number,
    light: Number,
    spotting: Number
  },
  painLevel: Number (0-10),
  predicted: Boolean,
  confidence: Number (0-100),
  dataQuality: String,
  isDeleted: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Daily Entries Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  date: Date (required, unique per user),
  flow: String, // none, spotting, light, medium, heavy
  symptoms: [String], // Array of symptoms
  mood: Number (1-5),
  energy: Number (1-5),
  painLevel: Number (0-10),
  notes: String,
  isOvulation: Boolean,
  temperature: Number (90-110°F),
  sleep: {
    hours: Number,
    quality: Number (1-5)
  },
  exercise: {
    type: String, // none, light, moderate, intense
    duration: Number,
    notes: String
  },
  medication: [{
    name: String,
    dosage: String,
    time: String
  }],
  tags: [String],
  cycleId: ObjectId (ref: Cycle),
  dataSource: String, // manual, imported, predicted
  confidence: Number (0-100),
  isDeleted: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Sample Data

Run the seed script to populate the database with sample data:

```bash
npm run seed
```

This creates a test user:
- Email: `jane@example.com`
- Password: `password123`

## Development

### Scripts
- `npm start` - Production server
- `npm run dev` - Development server with nodemon
- `npm run seed` - Seed database with sample data

### Project Structure
```
flodiary-api/
├── config/
│   └── database.js      # Database configuration
├── models/
│   ├── User.js          # User model
│   ├── Cycle.js         # Cycle model
│   └── DailyEntry.js    # Daily entry model
├── routes/
│   ├── auth.js          # Authentication routes
│   ├── users.js         # User management routes
│   ├── cycles.js        # Cycle and daily entry routes
│   └── prediction.js    # Prediction routes
├── middleware/
│   ├── auth.js          # JWT authentication
│   └── validation.js    # Input validation
├── utils/
│   └── helpers.js       # Utility functions
├── scripts/
│   └── seed.js          # Database seeding
└── server.js            # Main server file
```

## Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: Prevents abuse and DoS attacks
- **Input Validation**: Express-validator for request validation
- **CORS Protection**: Configurable cross-origin requests
- **Helmet**: Security headers middleware

## API Response Format

### Success Response
```json
{
  "message": "Success message",
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": [ ... ] // Optional validation details
}
```

## Testing

Use the health check endpoint to verify the API is running:

```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "flodiary-api"
}
```