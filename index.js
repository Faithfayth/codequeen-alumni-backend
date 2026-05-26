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

//CORS MIDDLEWARE CONFIGURATION-----------------------------------------------------------------------------------------
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

// const io = require('socket.io')(server, {
//     cors: {
//         origin: "http://127.0.0.1:5500", // Allows your Live Server to connect
//         methods: ["GET", "POST", "DELETE"],
//         credentials: true
//     }
// });

// CORS must always run before any routing or parsing happens!
app.use(cors(corsOptions));

// GLOBAL PARSERS-------------------------------------------------------------------------------------------------------
// Moved safely here so it doesn't conflict with or strip raw binary multipart data streams before Multer can catch them
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use('/cohort', cohortRoutes);  
app.use('/enrollments', enrollmentRoutes);
app.use('/projects', projectsRoutes);
app.use('/resources', resourceRoutes); // ⚡ Now Multer will cleanly parse the request file buffer!
app.use('/elections', electionsRoutes);
app.use('/achievements', achievementsRoutes);
app.use('/gallery', galleryRoutes);
app.use('/walloffame', walloffameRoutes);
app.use('/alumdirectory', alumdirectoryRoutes);

//PORT CONNECTION------------------------------------------------------------------------------------------------------
const PORT = process.env.PORT || 5000; // Updated to match your frontend port 5000 configuration smoothly

server.listen(PORT, () => {
    console.log(`Server is running on port at http://localhost:${PORT}`);
});

//CONNECT TO DB------------------------------------------------------------------------------------------------------
connectDB();