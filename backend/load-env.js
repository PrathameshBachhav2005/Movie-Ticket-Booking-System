// This file must be imported FIRST in server.js.
// ES module imports are hoisted, so dotenv must be loaded
// via a side-effect import before any other module reads process.env.
import dotenv from 'dotenv';
dotenv.config();
