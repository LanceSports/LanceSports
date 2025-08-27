// server/index.js
const express = require('express');
const cors = require('cors');
const userRoutes = require('./src/services/routes/UserRegistration');

const app = express();

app.use(cors());
app.use(express.json());

// Use the user routes under /api
app.use('/api', userRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API running on ${PORT}`));
