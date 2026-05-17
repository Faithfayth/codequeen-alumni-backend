const express = require('express');

const cors = require('cors');

const connectDB = require('./db');

const dotenv = require('dotenv').config();

//Declare routes
const userRoutes = require('./routes/users');
const blogsRoutes = require('./routes/blogs');
const badgeRouters = require('./routes/badges');
const profileRoutes = require('./routes/profiles')


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

app.get('/', (req, res) => {
    res.send('Welcome to the CodeQueen Alumni API');
});
//ROUTES---------------------------------------------------------------------------------------------------------------------

app.use('/users', userRoutes);
app.use('/blogs', blogsRoutes);
app.use('/badges', badgeRouters);
app.use('/profiles', profileRoutes);

//PORT CONNECTION------------------------------------------------------------------------------------------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port at http://localhost:${PORT}`);
});


//CONNECT TO DB------------------------------------------------------------------------------------------------------
connectDB();