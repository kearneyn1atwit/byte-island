//External library imports
const express = require('express');
const cors = require('cors');

//Project Utilities
const {initializeSwaggerUI} = require('./utils/api/SwaggerWrapper');

//Routes
const v1Signup = require('./routes/Signup');
const v1Login = require('./routes/Login');

//Instantiate express.js server
const app = express();
const port = 5000;
const router = express.Router()
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000', // Allow requests from this origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow these HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
}));
app.use('/api', router);

//Define the route paths and their corresponding definitions | Turn this into a dictionary later
app.use('/', v1Signup);
app.use('/', v1Login);

//Create Swagger UI page for the provided API application
initializeSwaggerUI(app, '/docs', ["./routes/documentation/*.yaml"], port); //Each bit of documentation is contained in a .yaml file

//Export API to HTTPS server
app.listen(5000, () => {
    console.log(`Express app listening on port ${port}`)
})