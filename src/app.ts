import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import monitorRoutes from './routes/monitor.routes';
import statsRoutes from './routes/stats.routes';
import errorHandler from './middleware/errorHandler';

const app: Application = express();

// Load Swagger document if it exists
const swaggerFilePath = path.join(__dirname, 'swagger-output.json');
if (fs.existsSync(swaggerFilePath)) {
  const swaggerDocument = JSON.parse(fs.readFileSync(swaggerFilePath, 'utf8'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}


// Security headers
app.use(helmet());

// CORS
app.use(cors());

// Request logging
app.use(morgan('dev'));

// Parse JSON bodies
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Routes
app.use('/monitors', monitorRoutes);
app.use('/stats', statsRoutes);

// Centralized error handling
app.use(errorHandler);

export default app;
