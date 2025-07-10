interface StaticDistanceData {
  from: string;
  to: string;
  distance: number; // in km
}

export class StaticDataService {
  private static readonly DISTANCE_DATA: StaticDistanceData[] = [
    { from: '99509', to: '99547', distance: 1771.813 },
    { from: '99509', to: '99660', distance: 1237.117 },
    { from: '36027', to: '36456', distance: 152.126 },
    { from: '36027', to: '36922', distance: 283.642 },
    { from: '36446', to: '36346', distance: 160.268 },
    { from: '99579', to: '99747', distance: 1468.037 },
    { from: '99749', to: '99919', distance: 1946.686 },
    { from: '99754', to: '36027', distance: 6008.615 }
  ];

  /**
   * Get distance from static data (FreeMapTools)
   */
  static getDistance(fromZipCode: string, toZipCode: string): number | null {
    const data = this.DISTANCE_DATA.find(
      item => item.from === fromZipCode && item.to === toZipCode
    );
    
    return data ? data.distance : null;
  }

  /**
   * Check if static data exists for the given zip codes
   */
  static hasData(fromZipCode: string, toZipCode: string): boolean {
    return this.getDistance(fromZipCode, toZipCode) !== null;
  }

  /**
   * Get all available zip code pairs
   */
  static getAllPairs(): StaticDistanceData[] {
    return [...this.DISTANCE_DATA];
  }
} 