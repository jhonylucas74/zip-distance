import { DistanceUnit, DistanceResult } from '../types';

export class DistanceService {
  private static readonly EARTH_RADIUS_KM = 6371;
  private static readonly EARTH_RADIUS_MILES = 3959;
  private static readonly EARTH_RADIUS_METERS = 6371000;
  private static readonly EARTH_RADIUS_FEET = 20902231;

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
    unit: DistanceUnit = 'km'
  ): number {
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    let radius: number;
    switch (unit) {
      case 'km':
        radius = this.EARTH_RADIUS_KM;
        break;
      case 'miles':
        radius = this.EARTH_RADIUS_MILES;
        break;
      case 'meters':
        radius = this.EARTH_RADIUS_METERS;
        break;
      case 'feet':
        radius = this.EARTH_RADIUS_FEET;
        break;
      default:
        radius = this.EARTH_RADIUS_KM;
    }
    
    return radius * c;
  }

  /**
   * Convert degrees to radians
   */
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Format distance with appropriate decimal places
   */
  static formatDistance(distance: number, unit: DistanceUnit): number {
    switch (unit) {
      case 'km':
        return Math.round(distance * 100) / 100; // 2 decimal places
      case 'miles':
        return Math.round(distance * 100) / 100; // 2 decimal places
      case 'meters':
        return Math.round(distance); // No decimal places
      case 'feet':
        return Math.round(distance); // No decimal places
      default:
        return Math.round(distance * 100) / 100;
    }
  }
} 