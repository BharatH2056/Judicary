const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const cors = require('cors');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}))

// Route files
const cases = require('./routes/cases');
const judges = require('./routes/judges');
const courtrooms = require('./routes/courtrooms');
const hearings = require('./routes/hearings');
const evidence = require('./routes/evidence');
const parties = require('./routes/parties');
const lawyers = require('./routes/lawyers');
const verdicts = require('./routes/verdicts');
const caseParty = require('./routes/caseParty');
const caseLawyer = require('./routes/caseLawyer');
const dashboard = require('./routes/dashboard');

// Mount routers
app.use('/api/cases', cases);
app.use('/api/judges', judges);
app.use('/api/courtrooms', courtrooms);
app.use('/api/hearings', hearings);
app.use('/api/evidence', evidence);
app.use('/api/parties', parties);
app.use('/api/lawyers', lawyers);
app.use('/api/verdicts', verdicts);
app.use('/api/case-party', caseParty);
app.use('/api/case-lawyer', caseLawyer);
app.use('/api/dashboard', dashboard);

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    // server.close(() => process.exit(1));
});

/**
 * HOW TO RUN:
 * 1. npm install
 * 2. Make sure MongoDB is running locally on port 27017
 * 3. Copy .env.example to .env (or ensure .env exists)
 * 4. npm run seed    ← populate sample data
 * 5. npm run dev     ← start server with nodemon
 * 6. API base URL: http://localhost:5000/api
 */
