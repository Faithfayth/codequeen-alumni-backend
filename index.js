const express = require('express');

const cors = require('cors');

const { Server } = require('socket.io');

const http = require('http'); 

const connectDB = require('./db');

const dotenv = require('dotenv').config();



//Declare routes
const userRoutes = require('./routes/users');
const badgeRoutes = require('./routes/badges');
const profileRoutes = require('./routes/profiles');
const blogsRoutes = require('./routes/blogs');
const generalMessages = require('./routes/generalmessages');
const eventsRoutes = require('./routes/events');
const opportunitiesRoutes = require('./routes/opportunities');
const partnersRoutes = require('./routes/partners');
const cohortRoutes = require('./routes/cohort');
const enrollmentRoutes = require('./routes/enrollments');
const projectsRoutes = require('./routes/projects');
const resourceRoutes = require('./routes/resources');
const electionsRoutes = require('./routes/elections');
const achievementsRoutes = require('./routes/achievements');
const galleryRoutes = require('./routes/gallery');
const walloffameRoutes = require('./routes/walloffame');
const alumdirectoryRoutes = require('./routes/alumdirectory');


//APP-------------------------------------------------------------------------------------------------------------------
const app = express();
const server = http.createServer(app);
app.use(express.json());

const io = new Server(server, {
    cors: {
        origin: "*", // Allows your frontend to connect safely
    }
});

app.set('io', io);

// Socket Connection Listener (Checks if a user opened the app)
io.on('connection', (socket) => {
    console.log(`Sister connected: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log('Sister disconnected');
    });
});


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
app.use('/badges', badgeRoutes);
app.use('/profiles', profileRoutes);
app.use('/blogs', blogsRoutes);
app.use('/generalmessages', generalMessages);
app.use('/events', eventsRoutes);
app.use('/opportunities', opportunitiesRoutes);
app.use('/partners', partnersRoutes);
app.use('/cohort', cohortRoutes);  //not tested
app.use('/enrollments', enrollmentRoutes);//not tested
app.use('/projects', projectsRoutes);//not tested
app.use('/resources', resourceRoutes);//not tested
app.use('/elections', electionsRoutes);//not tested
app.use('/achievements', achievementsRoutes);//not tested
app.use('/gallery', galleryRoutes);//not tested
app.use('/walloffame', walloffameRoutes);//not tested
app.use('/alumdirectory', alumdirectoryRoutes);//not tested






//PORT CONNECTION------------------------------------------------------------------------------------------------------
const PORT = process.env.PORT || 3000;

// Change app.listen to server.listen
server.listen(PORT, () => {
    console.log(`Server is running on port at http://localhost:${PORT}`);
});


//CONNECT TO DB------------------------------------------------------------------------------------------------------
connectDB();