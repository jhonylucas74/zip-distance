import { DistanceService } from '../distanceService';

describe('DistanceService', () => {
  describe('calculateDistance', () => {
    it('should calculate distance in kilometers correctly', () => {
      // Coordenadas de Nova York e Los Angeles (aproximadamente)
      const lat1 = 40.7128; // Nova York
      const lon1 = -74.0060;
      const lat2 = 34.0522; // Los Angeles
      const lon2 = -118.2437;

      const distance = DistanceService.calculateDistance(lat1, lon1, lat2, lon2, 'km');
      
      // A distância real é aproximadamente 3935 km
      expect(distance).toBeGreaterThan(3900);
      expect(distance).toBeLessThan(4000);
    });

    it('should calculate distance in miles correctly', () => {
      const lat1 = 40.7128; // Nova York
      const lon1 = -74.0060;
      const lat2 = 34.0522; // Los Angeles
      const lon2 = -118.2437;

      const distance = DistanceService.calculateDistance(lat1, lon1, lat2, lon2, 'miles');
      
      // A distância real é aproximadamente 2445 miles
      expect(distance).toBeGreaterThan(2400);
      expect(distance).toBeLessThan(2500);
    });

    it('should calculate distance in meters correctly', () => {
      const lat1 = 40.7128;
      const lon1 = -74.0060;
      const lat2 = 34.0522;
      const lon2 = -118.2437;

      const distance = DistanceService.calculateDistance(lat1, lon1, lat2, lon2, 'meters');
      
      expect(distance).toBeGreaterThan(3900000);
      expect(distance).toBeLessThan(4000000);
    });

    it('should calculate distance in feet correctly', () => {
      const lat1 = 40.7128;
      const lon1 = -74.0060;
      const lat2 = 34.0522;
      const lon2 = -118.2437;

      const distance = DistanceService.calculateDistance(lat1, lon1, lat2, lon2, 'feet');
      
      expect(distance).toBeGreaterThan(12800000);
      expect(distance).toBeLessThan(13200000);
    });

    it('should use kilometers as default unit', () => {
      const lat1 = 40.7128;
      const lon1 = -74.0060;
      const lat2 = 34.0522;
      const lon2 = -118.2437;

      const distanceKm = DistanceService.calculateDistance(lat1, lon1, lat2, lon2, 'km');
      const distanceDefault = DistanceService.calculateDistance(lat1, lon1, lat2, lon2);

      expect(distanceDefault).toBe(distanceKm);
    });

    it('should return 0 for same coordinates', () => {
      const lat = 40.7128;
      const lon = -74.0060;

      const distance = DistanceService.calculateDistance(lat, lon, lat, lon, 'km');
      
      expect(distance).toBe(0);
    });

    it('should handle coordinates at poles', () => {
      const lat1 = 90; // Polo Norte
      const lon1 = 0;
      const lat2 = -90; // Polo Sul
      const lon2 = 0;

      const distance = DistanceService.calculateDistance(lat1, lon1, lat2, lon2, 'km');
      
      // Distância entre os polos é aproximadamente 20000 km
      expect(distance).toBeGreaterThan(19000);
      expect(distance).toBeLessThan(21000);
    });
  });

  describe('formatDistance', () => {
    it('should format kilometers with 2 decimal places', () => {
      const distance = 123.456789;
      const formatted = DistanceService.formatDistance(distance, 'km');
      
      expect(formatted).toBe(123.46);
    });

    it('should format miles with 2 decimal places', () => {
      const distance = 123.456789;
      const formatted = DistanceService.formatDistance(distance, 'miles');
      
      expect(formatted).toBe(123.46);
    });

    it('should format meters without decimal places', () => {
      const distance = 123.456789;
      const formatted = DistanceService.formatDistance(distance, 'meters');
      
      expect(formatted).toBe(123);
    });

    it('should format feet without decimal places', () => {
      const distance = 123.456789;
      const formatted = DistanceService.formatDistance(distance, 'feet');
      
      expect(formatted).toBe(123);
    });

    it('should handle zero distance', () => {
      const distance = 0;
      const formatted = DistanceService.formatDistance(distance, 'km');
      
      expect(formatted).toBe(0);
    });
  });
}); 