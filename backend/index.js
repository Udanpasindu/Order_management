require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./db/db');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());



app.get('/', (req, res) => res.json({ message: 'API is running' }));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
