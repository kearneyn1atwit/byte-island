const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

/**
 * @param {string[]} apiPaths 
 * @returns A JSON body of Swagger options to be applied to Swagger page
 */
function setOptions(apiPaths) {
    const options = {
        definition: {
          openapi: "3.1.0",
          info: {
            title: "Byte Island Express API Documentation",
            version: "0.1.0",
            description: "API Documentation hosted by Swagger.",
          },
          servers: [
            {
              url: "http://localhost:5000", //Adjust this later
            },
          ],
        },
        //Needs to match directories we want to put swagger documentation in
        apis: apiPaths,
    };
    return options;
}

/**
 * Creates a swagger page for API testing.
 * @param {Express} app - Express API application that will be documented
 * @param {string} swaggerRoute - Website route that swagger page will be located
 * @param {string[]} apiPaths - Array of regex expressions for relative file paths to search for swagger documentation
 */
function initializeSwaggerUI(app, swaggerRoute, apiPaths) {

    if(typeof swaggerRoute !== 'string') { throw new Error('Route path must be a string!'); }
    try {
        const options = setOptions(apiPaths);
        app.use(swaggerRoute, swaggerUi.serve);
        app.get(swaggerRoute, swaggerUi.setup(swaggerJsdoc(options)))
    }
    catch (error) {
        console.log("Couldn't set up SwaggerUI page.");
        console.log(error);
    }
}

module.exports = { initializeSwaggerUI };