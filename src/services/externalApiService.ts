import axios from 'axios';

interface ExternalApiResponse {
  json: {
    result: Array<{
      type: string;
      attributes: {
        distance: number;
        unit: string;
        from: {
          countryCode: string;
          postalCode: string;
        };
        to: {
          countryCode: string;
          postalCode: string;
        };
      };
    }>;
  };
  limitExceeded: boolean | null;
}

export class ExternalApiService {
  private static readonly BASE_URL = 'https://zip-api.eu/api/v2';

  /**
   * Get distance from external API
   */
  static async getDistance(
    fromZipCode: string,
    toZipCode: string,
    unit: string = 'km'
  ): Promise<number | null> {
    try {
      const url = `${this.BASE_URL}/distance/zip`;
      const params = {
        'countryCode[from]': 'US',
        'postalCode[from]': fromZipCode,
        'countryCode[to]': 'US',
        'postalCode[to]': toZipCode,
        unit: unit
      };

      const response = await axios.get<ExternalApiResponse>(url, { params });
      
      if (response.data.json?.result?.[0]?.attributes?.distance) {
        return response.data.json.result[0].attributes.distance;
      }
      
      return null;
    } catch (error) {
      console.error('Error calling external API:', error);
      return null;
    }
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
    
    // Threshold: 5km difference is acceptable
    const isWithinThreshold = difference <= 5;

    return {
      ourDistance,
      externalDistance,
      difference,
      percentageDifference,
      isWithinThreshold
    };
  }
} 