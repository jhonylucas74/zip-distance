import { StaticDataService } from './staticDataService';
import { LoggerService } from './loggerService';

export class BenchmarkService {
  /**
   * Compare our distance calculation with static data (FreeMapTools)
   */
  static compareWithStaticData(
    fromZipCode: string,
    toZipCode: string,
    ourDistance: number
  ): {
    staticDistance: number | null;
    difference: number | null;
    percentageDifference: number | null;
    isWithinThreshold: boolean;
  } {
    const staticDistance = StaticDataService.getDistance(fromZipCode, toZipCode);
    
    if (staticDistance === null) {
      LoggerService.logBenchmark(`No static data available for ${fromZipCode} to ${toZipCode}`);
      return {
        staticDistance: null,
        difference: null,
        percentageDifference: null,
        isWithinThreshold: false
      };
    }

    const difference = Math.abs(ourDistance - staticDistance);
    const percentageDifference = (difference / staticDistance) * 100;
    
    // Threshold: 5% difference is acceptable
    const isWithinThreshold = percentageDifference <= 5;

    return {
      staticDistance,
      difference,
      percentageDifference,
      isWithinThreshold
    };
  }

  /**
   * Get all available test pairs from static data
   */
  static getTestPairs(): Array<{
    from: string;
    to: string;
    description: string;
  }> {
    const pairs = StaticDataService.getAllPairs();
    
    // Map to descriptions (you can expand this as needed)
    const descriptions: Record<string, string> = {
      '99509-99547': 'Alaska - Anchorage to Atka',
      '99509-99660': 'Alaska - Anchorage to Saint Paul Island',
      '36027-36456': 'Alabama - Eufaula to Mc Kenzie',
      '36027-36922': 'Alabama - Eufaula to Ward',
      '36446-36346': 'Alabama - Fulton to Jack',
      '99579-99747': 'Alaska - Egegik to Kaktovik',
      '99749-99919': 'Alaska - Kiana to Thorne Bay',
      '99754-36027': 'Alaska to Alabama - Koyukuk to Eufaula'
    };

    return pairs.map(pair => ({
      from: pair.from,
      to: pair.to,
      description: descriptions[`${pair.from}-${pair.to}`] || `${pair.from} to ${pair.to}`
    }));
  }
} 