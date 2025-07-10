import express from 'express';
import cors from 'cors';
import { DistanceController } from './controllers/distanceController';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize controller
const distanceController = new DistanceController();

// Routes
app.get('/health', (req, res) => distanceController.healthCheck(req, res));
app.post('/api/distances', (req, res) => distanceController.calculateDistances(req, res));

// Documentation route
app.get('/', (req, res) => {
  res.json({
    name: 'Zip Distance API',
    version: '1.0.0',
    description: 'API to calculate distances between postal codes',
    endpoints: {
      'GET /health': 'Check API status',
      'POST /api/distances': 'Calculate distances between postal codes'
    },
    example: {
      method: 'POST',
      url: '/api/distances',
      body: {
        originZipCode: '99509',
        destinationZipCodes: ['99660', '99547'],
        unit: 'km' // optional: 'km', 'miles', 'meters', 'feet'
      }
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📖 Documentation: http://localhost:${PORT}`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
}); 