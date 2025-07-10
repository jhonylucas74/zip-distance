import { Request, Response } from 'express';
import { DatabaseService } from '../services/databaseService';
import { DistanceService } from '../services/distanceService';
import { DistanceRequest, DistanceResponse, DistanceResult, DistanceUnit } from '../types';

export class DistanceController {
  private dbService: DatabaseService;

  constructor() {
    this.dbService = DatabaseService.getInstance();
  }

  /**
   * Calculate distances between an origin postal code and multiple destinations
   */
  public async calculateDistances(req: Request, res: Response): Promise<void> {
    try {
      const { originZipCode, destinationZipCodes, unit = 'km' }: DistanceRequest = req.body;

      // Parameter validation
      if (!originZipCode || !destinationZipCodes || !Array.isArray(destinationZipCodes)) {
        res.status(400).json({
          error: 'Invalid parameters. originZipCode and destinationZipCodes are required.'
        });
        return;
      }

      if (destinationZipCodes.length === 0) {
        res.status(400).json({
          error: 'The destination postal codes list cannot be empty.'
        });
        return;
      }

      // Find origin postal code
      const origin = await this.dbService.getZipCode(originZipCode);
      if (!origin) {
        res.status(404).json({
          error: `Origin postal code not found: ${originZipCode}`
        });
        return;
      }

      // Find destination postal codes
      const destinations = await this.dbService.getZipCodes(destinationZipCodes);
      
      // Create map for easier lookup
      const destinationMap = new Map(destinations.map(d => [d.postal_code, d]));
      
      // Calculate distances
      const results: DistanceResult[] = [];
      const notFound: string[] = [];

      for (const destZipCode of destinationZipCodes) {
        const destination = destinationMap.get(destZipCode);
        
        if (!destination) {
          notFound.push(destZipCode);
          continue;
        }

        const distance = DistanceService.calculateDistance(
          origin.latitude,
          origin.longitude,
          destination.latitude,
          destination.longitude,
          unit as DistanceUnit
        );

        const formattedDistance = DistanceService.formatDistance(distance, unit as DistanceUnit);

        results.push({
          zipCode: destination.postal_code,
          placeName: destination.place_name,
          distance: formattedDistance,
          unit: unit as DistanceUnit,
          latitude: destination.latitude,
          longitude: destination.longitude
        });
      }

      // Sort by distance (closest first)
      results.sort((a, b) => a.distance - b.distance);

      // Prepare response
      const response: DistanceResponse = {
        origin: {
          zipCode: origin.postal_code,
          placeName: origin.place_name,
          latitude: origin.latitude,
          longitude: origin.longitude
        },
        destinations: results
      };

      // Add warning about not found codes
      if (notFound.length > 0) {
        response.warnings = {
          notFound: notFound
        };
      }

      res.json(response);

    } catch (error) {
      console.error('Error calculating distances:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * API health check endpoint
   */
  public healthCheck(req: Request, res: Response): void {
    res.json({
      status: 'OK',
      message: 'Postal code distance API is running',
      timestamp: new Date().toISOString()
    });
  }
} 