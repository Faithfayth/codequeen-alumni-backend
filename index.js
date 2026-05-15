const express = require('express');

const cors = require('cors');

const connectDB = require('./db');

const dotenv = require('dotenv').config();

//Declare routes



//APP-------------------------------------------------------------------------------------------------------------------
const app = express();
app.use(express.json());


//CORS----------------------------------------------------------------------------------------------------------------
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

app.use(cors(corsOptions));


//ROUTES---------------------------------------------------------------------------------------------------------------------



//PORT CONNECTION------------------------------------------------------------------------------------------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port at http://localhost:${PORT}`);
});


//CONNECT TO DB------------------------------------------------------------------------------------------------------
connectDB();