//External library imports
const express = require('express');

//Project Utilities
const {initializeSwaggerUI} = require('./utils/SwaggerWrapper');

//Instantiate express.js server
const app = express();
const port = 5000;
const router = express.Router()
app.use('/api', router);

/*app.use('/', (req, res) => {
    res.send('Hello World!');
})*/

//Define the route paths and their corresponding definitions
//app.use('/v1/hello', fileConstant);

//Create Swagger UI page for the provided API application
initializeSwaggerUI(app, '/docs', ["*.js"], port); //expand this later

//Export API to HTTPS server
app.listen(5000, () => {
    console.log(`Express app listening on port ${port}`)
})