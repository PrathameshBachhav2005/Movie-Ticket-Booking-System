// This file must be the FIRST import in server.js.
// ES module imports are hoisted and evaluated before any code runs,
// so dotenv must be loaded via a side-effect import before db.js
// creates the pg Pool (which reads process.env.DATABASE_URL).
import dotenv from 'dotenv';
dotenv.config();
