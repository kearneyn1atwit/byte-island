//External library imports
const express = require('express');
const cors = require('cors');

//Project Utilities
const {initializeSwaggerUI} = require('./utils/api/SwaggerWrapper');

//Routes
const v1Friends = require('./routes/Friends');
const v1Login = require('./routes/Login');
const v1Networks = require('./routes/Networks');
const v1Notifications = require('./routes/Notifications');
const v1Posts = require('./routes/Posts');
const v1Projects = require('./routes/Projects');
const v1Requests = require('./routes/Requests');
const v1Shop = require('./routes/Shop');
const v1Signup = require('./routes/Signup');
const v1Users = require('./routes/Users');

//Instantiate express.js server
const app = express();
const port = 5000;
const router = express.Router()
app.use(express.json());
app.use(cors({ //Needs CORS enabled for 5000->3000 
    origin: ['http://localhost:3000','http://byteisland.net'], 
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    allowedHeaders: ['Content-Type', 'Authorization'], 
}));
app.use('/api', router);

//Define the route paths and their corresponding definitions | Turn this into a dictionary later
app.use('/', v1Friends);
app.use('/', v1Login);
app.use('/', v1Networks);
app.use('/', v1Notifications);
app.use('/', v1Posts);
app.use('/', v1Projects);
app.use('/', v1Requests);
app.use('/', v1Shop);
app.use('/', v1Signup);
app.use('/', v1Users);

//Create Swagger UI page for the provided API application
initializeSwaggerUI(app, '/docs', ["./routes/documentation/*.yaml"], port); //Each bit of documentation is contained in a .yaml file

//Export API to HTTPS server
app.listen(5000, () => {
    console.log(`Express app listening on port ${port}`)
})