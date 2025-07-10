import { Request, Response } from 'express';
import { DistanceController } from '../distanceController';


describe('DistanceController', () => {
  let controller: DistanceController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new DistanceController();
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('calculateDistances', () => {
    it('should calculate distances successfully', async () => {
      mockRequest.body = {
        originZipCode: '99509',
        destinationZipCodes: ['99660', '99547'],
        unit: 'km',
      };

      await controller.calculateDistances(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          origin: expect.objectContaining({
            zipCode: '99509',
            placeName: expect.any(String),
            latitude: expect.any(Number),
            longitude: expect.any(Number),
          }),
          destinations: expect.arrayContaining([
            expect.objectContaining({
              zipCode: '99660',
              unit: 'km',
            }),
            expect.objectContaining({
              zipCode: '99547',
              unit: 'km',
            }),
          ]),
        })
      );
    });

    it('should return 400 for missing originZipCode', async () => {
      mockRequest.body = {
        destinationZipCodes: ['99660'],
      };

      await controller.calculateDistances(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Parâmetros inválidos. originZipCode e destinationZipCodes são obrigatórios.',
      });
    });

    it('should return 400 for missing destinationZipCodes', async () => {
      mockRequest.body = {
        originZipCode: '99509',
      };

      await controller.calculateDistances(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Parâmetros inválidos. originZipCode e destinationZipCodes são obrigatórios.',
      });
    });

    it('should return 400 for empty destinationZipCodes array', async () => {
      mockRequest.body = {
        originZipCode: '99509',
        destinationZipCodes: [],
      };

      await controller.calculateDistances(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'A lista de códigos postais de destino não pode estar vazia.',
      });
    });

    it('should return 404 when origin zip code not found', async () => {
      mockRequest.body = {
        originZipCode: '99999',
        destinationZipCodes: ['99660'],
      };

      await controller.calculateDistances(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: `Código postal de origem não encontrado: 99999`,
      });
    });

    it('should include warnings for not found destination zip codes', async () => {
      mockRequest.body = {
        originZipCode: '99509',
        destinationZipCodes: ['99660', '99999', '88888'],
      };

      await controller.calculateDistances(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          warnings: {
            notFound: expect.arrayContaining(['99999', '88888']),
          },
        })
      );
    });

    it('should handle database errors gracefully', async () => {
      // Forçar erro passando um valor inválido
      mockRequest.body = {
        originZipCode: null,
        destinationZipCodes: null,
      };

      await controller.calculateDistances(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('healthCheck', () => {
    it('should return health status', () => {
      controller.healthCheck(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'OK',
        message: 'API de distância entre códigos postais funcionando',
        timestamp: expect.any(String),
      });
    });
  });
}); 