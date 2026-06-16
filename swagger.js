const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Pulse-Check API',
    description: 'A Dead Man\'s Switch API backend service.',
    version: '1.0.0',
  },
  host: 'localhost:3000',
  schemes: ['http'],
  consumes: ['application/json'],
  produces: ['application/json'],
  tags: [
    {
      name: 'Monitors',
      description: 'Endpoints for managing device monitors',
    },
    {
      name: 'Stats',
      description: 'Endpoints for system health',
    },
  ],
};

const outputFile = './src/swagger-output.json';
const endpointsFiles = ['./src/app.ts'];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log('Swagger documentation generated successfully!');
});
