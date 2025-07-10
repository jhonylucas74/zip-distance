import axios from 'axios';
import { LoggerService } from './loggerService';

interface ZippopotamResponse {
  'post code': string;
  country: string;
  'country abbreviation': string;
  places: Array<{
    'place name': string;
    longitude: string;
    latitude: string;
    state: string;
    'state abbreviation': string;
  }>;
}

export class ExternalApiService {
  private static readonly BASE_URL = 'https://api.zippopotam.us';

  /**
   * Get coordinates from Zippopotam.us API and calculate distance
   */
  static async getDistance(
    fromZipCode: string,
    toZipCode: string,
    unit: string = 'km'
  ): Promise<number | null> {
    try {
      // Get coordinates for both zip codes
      const [fromResponse, toResponse] = await Promise.all([
        axios.get<ZippopotamResponse>(`${this.BASE_URL}/US/${fromZipCode}`),
        axios.get<ZippopotamResponse>(`${this.BASE_URL}/US/${toZipCode}`)
      ]);

      const fromPlace = fromResponse.data.places[0];
      const toPlace = toResponse.data.places[0];

      if (!fromPlace || !toPlace) {
        LoggerService.logBenchmark('Could not find coordinates for one or both zip codes');
        return null;
      }

      // Calculate distance using Haversine formula
      const fromLat = parseFloat(fromPlace.latitude);
      const fromLon = parseFloat(fromPlace.longitude);
      const toLat = parseFloat(toPlace.latitude);
      const toLon = parseFloat(toPlace.longitude);

      const distance = this.calculateHaversineDistance(fromLat, fromLon, toLat, toLon, unit);
      return distance;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        LoggerService.logBenchmark('External API Error Details:');
        LoggerService.logBenchmark(`  Status: ${error.response?.status}`);
        LoggerService.logBenchmark(`  Status Text: ${error.response?.statusText}`);
        LoggerService.logBenchmark(`  URL: ${error.config?.url}`);
        LoggerService.logBenchmark(`  Response Data: ${JSON.stringify(error.response?.data)}`);
        LoggerService.logBenchmark(`  Message: ${error.message}`);
      } else {
        LoggerService.logBenchmark(`Non-Axios Error: ${error}`);
      }
      return null;
    }
  }

  /**
   * Calculate distance using Haversine formula
   */
  private static calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
    unit: string = 'km'
  ): number {
    const R = unit === 'km' ? 6371 : unit === 'miles' ? 3959 : unit === 'meters' ? 6371000 : 20902231;
    
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Compare distances between our API and external API
   */
  static async compareDistances(
    fromZipCode: string,
    toZipCode: string,
    ourDistance: number,
    unit: string = 'km'
  ): Promise<{
    ourDistance: number;
    externalDistance: number | null;
    difference: number | null;
    percentageDifference: number | null;
    isWithinThreshold: boolean;
  }> {
    const externalDistance = await this.getDistance(fromZipCode, toZipCode, unit);
    
    if (externalDistance === null) {
      return {
        ourDistance,
        externalDistance: null,
        difference: null,
        percentageDifference: null,
        isWithinThreshold: false
      };
    }

    const difference = Math.abs(ourDistance - externalDistance);
    const percentageDifference = (difference / externalDistance) * 100;
    
    // Threshold: 10km difference is acceptable
    const isWithinThreshold = difference <= 10;

    return {
      ourDistance,
      externalDistance,
      difference,
      percentageDifference,
      isWithinThreshold
    };
  }
} 