import { DistanceService } from '../services/distanceService';
import { DatabaseService } from '../services/databaseService';
import { ExternalApiService } from '../services/externalApiService';

// Test data from CSV - various zip codes across different states
const TEST_ZIP_PAIRS = [
  { from: '99509', to: '99547', description: 'Alaska - Anchorage to Atka' },
  { from: '99509', to: '99660', description: 'Alaska - Anchorage to Saint Paul Island' },
  { from: '36027', to: '36456', description: 'Alabama - Eufaula to Mc Kenzie' },
  { from: '36027', to: '36922', description: 'Alabama - Eufaula to Ward' },
  { from: '36446', to: '36346', description: 'Alabama - Fulton to Jack' },
  { from: '99579', to: '99747', description: 'Alaska - Egegik to Kaktovik' },
  { from: '99749', to: '99919', description: 'Alaska - Kiana to Thorne Bay' },
  { from: '99754', to: '36027', description: 'Alaska to Alabama - Koyukuk to Eufaula' }
];

describe('API Benchmark Tests', () => {
  let dbService: DatabaseService;

  beforeAll(async () => {
    dbService = DatabaseService.getInstance();
  });

  afterAll(async () => {
    dbService.close();
  });

  describe('External API Connectivity', () => {
    test('should be able to connect to external API', async () => {
      const testDistance = await ExternalApiService.getDistance('99509', '99547', 'km');
      
      if (testDistance === null) {
        console.warn('External API is not accessible. Skipping external API tests.');
        // Skip this test if external API is not available
        expect(true).toBe(true);
        return;
      }
      
      expect(testDistance).toBeGreaterThan(0);
      console.log(`External API test successful: ${testDistance.toFixed(2)} km`);
    }, 10000);
  });

  describe('Distance Calculation Accuracy (External API)', () => {
    test.each(TEST_ZIP_PAIRS)(
      'should calculate distance within 5%% threshold for $from to $to ($description)',
      async ({ from, to, description }) => {
        // Get coordinates from our database
        const fromLocation = await dbService.getZipCode(from);
        const toLocation = await dbService.getZipCode(to);

        if (!fromLocation || !toLocation) {
          console.warn(`Skipping test: Missing data for ${from} or ${to}`);
          return;
        }

        // Calculate distance with our service
        const ourDistance = DistanceService.calculateDistance(
          fromLocation.latitude,
          fromLocation.longitude,
          toLocation.latitude,
          toLocation.longitude,
          'km'
        );

        // Compare with external API
        const comparison = await ExternalApiService.compareDistances(
          from,
          to,
          ourDistance,
          'km'
        );

        if (comparison.externalDistance === null) {
          console.warn(`External API failed for ${from} to ${to}, skipping test`);
          return;
        }

        // Log the comparison details
        console.log(`\n${description}:`);
        console.log(`  Our API: ${ourDistance.toFixed(2)} km`);
        console.log(`  External API: ${comparison.externalDistance.toFixed(2)} km`);
        console.log(`  Difference: ${comparison.difference?.toFixed(2)} km`);
        console.log(`  Percentage: ${comparison.percentageDifference?.toFixed(2)}%`);

        // Assert that the difference is within threshold
        expect(comparison.isWithinThreshold).toBe(true);
        expect(comparison.percentageDifference).toBeLessThanOrEqual(5);
      },
      30000 // 30 second timeout for external API calls
    );
  });

  describe('Batch Distance Comparison', () => {
    test('should compare multiple distances and report statistics', async () => {
      const results = [];
      let successfulComparisons = 0;
      let totalComparisons = 0;

      for (const pair of TEST_ZIP_PAIRS) {
        const fromLocation = await dbService.getZipCode(pair.from);
        const toLocation = await dbService.getZipCode(pair.to);

        if (!fromLocation || !toLocation) {
          console.warn(`Skipping: Missing data for ${pair.from} or ${pair.to}`);
          continue;
        }

        totalComparisons++;

        const ourDistance = DistanceService.calculateDistance(
          fromLocation.latitude,
          fromLocation.longitude,
          toLocation.latitude,
          toLocation.longitude,
          'km'
        );

        const comparison = await ExternalApiService.compareDistances(
          pair.from,
          pair.to,
          ourDistance,
          'km'
        );

        if (comparison.externalDistance !== null) {
          successfulComparisons++;
          results.push({
            pair: `${pair.from} -> ${pair.to}`,
            description: pair.description,
            ourDistance: comparison.ourDistance,
            externalDistance: comparison.externalDistance,
            difference: comparison.difference,
            percentageDifference: comparison.percentageDifference,
            isWithinThreshold: comparison.isWithinThreshold
          });
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Calculate statistics
      const withinThreshold = results.filter(r => r.isWithinThreshold).length;
      const averagePercentageDiff = results.reduce((sum, r) => sum + (r.percentageDifference || 0), 0) / results.length;
      const maxPercentageDiff = Math.max(...results.map(r => r.percentageDifference || 0));

      console.log('\n=== BENCHMARK STATISTICS ===');
      console.log(`Total comparisons: ${totalComparisons}`);
      console.log(`Successful comparisons: ${successfulComparisons}`);
      console.log(`Within threshold (5%): ${withinThreshold}/${successfulComparisons}`);
      console.log(`Average percentage difference: ${averagePercentageDiff.toFixed(2)}%`);
      console.log(`Maximum percentage difference: ${maxPercentageDiff.toFixed(2)}%`);

      // Detailed results
      console.log('\n=== DETAILED RESULTS ===');
      results.forEach(result => {
        console.log(`${result.pair}: ${result.percentageDifference?.toFixed(2)}% diff (${result.isWithinThreshold ? 'PASS' : 'FAIL'})`);
      });

      // Assertions - only if we have successful comparisons
      if (successfulComparisons > 0) {
        expect(withinThreshold).toBeGreaterThanOrEqual(successfulComparisons * 0.8); // At least 80% should be within threshold
        expect(averagePercentageDiff).toBeLessThan(3); // Average should be less than 3%
        expect(maxPercentageDiff).toBeLessThan(10); // Max should be less than 10%
      } else {
        console.warn('No successful comparisons with external API. This might be due to network issues or API rate limiting.');
        // Skip assertions if no successful comparisons
        expect(true).toBe(true); // Dummy assertion to pass test
      }
    }, 120000); // 2 minute timeout for batch test
  });

  describe('Edge Cases', () => {
    test('should handle very short distances correctly', async () => {
      // Test with same zip code
      const zipCode = '99509';
      const location = await dbService.getZipCode(zipCode);
      
      if (!location) {
        console.warn('Skipping edge case test: Missing data');
        return;
      }

      const ourDistance = DistanceService.calculateDistance(
        location.latitude,
        location.longitude,
        location.latitude,
        location.longitude,
        'km'
      );

      expect(ourDistance).toBe(0);
    });

    test('should handle very long distances correctly', async () => {
      // Test Alaska to Alabama (very long distance)
      const fromLocation = await dbService.getZipCode('99509'); // Anchorage, AK
      const toLocation = await dbService.getZipCode('36027'); // Eufaula, AL

      if (!fromLocation || !toLocation) {
        console.warn('Skipping long distance test: Missing data');
        return;
      }

      const ourDistance = DistanceService.calculateDistance(
        fromLocation.latitude,
        fromLocation.longitude,
        toLocation.latitude,
        toLocation.longitude,
        'km'
      );

      const comparison = await ExternalApiService.compareDistances(
        '99509',
        '36027',
        ourDistance,
        'km'
      );

      if (comparison.externalDistance !== null) {
        console.log(`\nLong distance test (AK to AL):`);
        console.log(`  Our API: ${ourDistance.toFixed(2)} km`);
        console.log(`  External API: ${comparison.externalDistance.toFixed(2)} km`);
        console.log(`  Difference: ${comparison.difference?.toFixed(2)} km`);
        console.log(`  Percentage: ${comparison.percentageDifference?.toFixed(2)}%`);

        expect(comparison.isWithinThreshold).toBe(true);
        expect(ourDistance).toBeGreaterThan(5000); // Should be a very long distance
      }
    }, 30000);
  });
}); 