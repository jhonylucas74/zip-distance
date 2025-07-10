import request from 'supertest';
import express from 'express';
import { DistanceController } from '../controllers/distanceController';

// Mock services for integration tests
jest.mock('../services/databaseService');
jest.mock('../services/distanceService');

describe('API Integration Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    
    const controller = new DistanceController();
    app.get('/health', (req, res) => controller.healthCheck(req, res));
    app.post('/api/distances', (req, res) => controller.calculateDistances(req, res));
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'OK',
        message: 'API de distância entre códigos postais funcionando',
        timestamp: expect.any(String),
      });
    });
  });

  describe('POST /api/distances', () => {
    it('should return 400 for missing originZipCode', async () => {
      const response = await request(app)
        .post('/api/distances')
        .send({
          destinationZipCodes: ['99660'],
        })
        .expect(400);

      expect(response.body).toEqual({
        error: 'Parâmetros inválidos. originZipCode e destinationZipCodes são obrigatórios.',
      });
    });

    it('should return 400 for missing destinationZipCodes', async () => {
      const response = await request(app)
        .post('/api/distances')
        .send({
          originZipCode: '99509',
        })
        .expect(400);

      expect(response.body).toEqual({
        error: 'Parâmetros inválidos. originZipCode e destinationZipCodes são obrigatórios.',
      });
    });

    it('should return 400 for empty destinationZipCodes array', async () => {
      const response = await request(app)
        .post('/api/distances')
        .send({
          originZipCode: '99509',
          destinationZipCodes: [],
        })
        .expect(400);

      expect(response.body).toEqual({
        error: 'A lista de códigos postais de destino não pode estar vazia.',
      });
    });

    it('should return 400 for invalid destinationZipCodes (not array)', async () => {
      const response = await request(app)
        .post('/api/distances')
        .send({
          originZipCode: '99509',
          destinationZipCodes: '99660', // Should be array
        })
        .expect(400);

      expect(response.body).toEqual({
        error: 'Parâmetros inválidos. originZipCode e destinationZipCodes são obrigatórios.',
      });
    });
  });
});