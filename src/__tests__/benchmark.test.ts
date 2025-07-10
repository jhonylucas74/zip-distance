import { DistanceService } from '../services/distanceService';
import { DatabaseService } from '../services/databaseService';
import { BenchmarkService } from '../services/benchmarkService';
import { LoggerService } from '../services/loggerService';

// Get test pairs from static data (FreeMapTools)
const TEST_ZIP_PAIRS = BenchmarkService.getTestPairs();

describe('API Benchmark Tests', () => {
  let dbService: DatabaseService;

  beforeAll(async () => {
    dbService = DatabaseService.getInstance();
    // Clear previous logs
    LoggerService.clearLogs();
  });

  afterAll(async () => {
    dbService.close();
  });

  describe('Distance Calculation Accuracy (FreeMapTools Data)', () => {
    test.each(TEST_ZIP_PAIRS)(
      'should calculate distance within 5% threshold for $from to $to ($description)',
      async ({ from, to, description }) => {
        // Get coordinates from our database
        const fromLocation = await dbService.getZipCode(from);
        const toLocation = await dbService.getZipCode(to);

        if (!fromLocation || !toLocation) {
          LoggerService.logBenchmark(`Skipping test: Missing data for ${from} or ${to}`);
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

        // Compare with static data (FreeMapTools)
        const comparison = BenchmarkService.compareWithStaticData(
          from,
          to,
          ourDistance
        );

        if (comparison.staticDistance === null) {
          LoggerService.logBenchmark(`No static data available for ${from} to ${to}`);
          return;
        }

        // Log the comparison details
        LoggerService.logBenchmark(`\n${description} (${from} → ${to}):`);
        LoggerService.logBenchmark(`  Our API: ${ourDistance.toFixed(2)} km`);
        LoggerService.logBenchmark(`  FreeMapTools: ${comparison.staticDistance.toFixed(2)} km`);
        LoggerService.logBenchmark(`  Difference: ${comparison.difference?.toFixed(2)} km`);
        LoggerService.logBenchmark(`  Percentage: ${comparison.percentageDifference?.toFixed(2)}%`);

        // Assert that the difference is within threshold
        expect(comparison.isWithinThreshold).toBe(true);
        expect(comparison.percentageDifference).toBeLessThanOrEqual(5);
      }
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
          LoggerService.logBenchmark(`Skipping: Missing data for ${pair.from} or ${pair.to}`);
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

        const comparison = BenchmarkService.compareWithStaticData(
          pair.from,
          pair.to,
          ourDistance
        );

        if (comparison.staticDistance !== null) {
          successfulComparisons++;
          results.push({
            pair: `${pair.from} -> ${pair.to}`,
            description: pair.description,
            ourDistance: ourDistance,
            staticDistance: comparison.staticDistance,
            difference: comparison.difference,
            percentageDifference: comparison.percentageDifference,
            isWithinThreshold: comparison.isWithinThreshold
          });
        }

        // No delay needed for static data
      }

      // Calculate statistics
      const withinThreshold = results.filter(r => r.isWithinThreshold).length;
      const averagePercentageDiff = results.reduce((sum, r) => sum + (r.percentageDifference || 0), 0) / results.length;
      const maxPercentageDiff = Math.max(...results.map(r => r.percentageDifference || 0));

      LoggerService.logBenchmark('\n=== BENCHMARK STATISTICS ===');
      LoggerService.logBenchmark(`Total comparisons: ${totalComparisons}`);
      LoggerService.logBenchmark(`Successful comparisons: ${successfulComparisons}`);
      LoggerService.logBenchmark(`Within threshold (5%): ${withinThreshold}/${successfulComparisons}`);
      LoggerService.logBenchmark(`Average percentage difference: ${averagePercentageDiff.toFixed(2)}%`);
      LoggerService.logBenchmark(`Maximum percentage difference: ${maxPercentageDiff.toFixed(2)}%`);

      // Detailed results
      LoggerService.logBenchmark('\n=== DETAILED RESULTS ===');
      results.forEach(result => {
        LoggerService.logBenchmark(`${result.description} (${result.pair}): ${result.percentageDifference?.toFixed(2)}% diff (${result.isWithinThreshold ? 'PASS' : 'FAIL'})`);
      });

      // Assertions - only if we have successful comparisons
      if (successfulComparisons > 0) {
        expect(withinThreshold).toBeGreaterThanOrEqual(successfulComparisons * 0.8); // At least 80% should be within threshold
        expect(averagePercentageDiff).toBeLessThan(3); // Average should be less than 3%
        expect(maxPercentageDiff).toBeLessThan(10); // Max should be less than 10%
      } else {
        LoggerService.logBenchmark('No successful comparisons with static data. This might be due to missing data in the static dataset.');
        throw new Error('No successful comparisons with static data. Check if the data is available.');
      }
          }); // No timeout needed for static data
  });

  describe('Edge Cases', () => {
    test('should handle very short distances correctly', async () => {
      // Test with same zip code
      const zipCode = '99509';
      const location = await dbService.getZipCode(zipCode);
      
      if (!location) {
        LoggerService.logBenchmark('Skipping edge case test: Missing data');
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
        LoggerService.logBenchmark('Skipping long distance test: Missing data');
        return;
      }

      const ourDistance = DistanceService.calculateDistance(
        fromLocation.latitude,
        fromLocation.longitude,
        toLocation.latitude,
        toLocation.longitude,
        'km'
      );

      const comparison = BenchmarkService.compareWithStaticData(
        '99509',
        '36027',
        ourDistance
      );

      if (comparison.staticDistance !== null) {
        LoggerService.logBenchmark(`\nLong distance test (AK to AL) (99509 → 36027):`);
        LoggerService.logBenchmark(`  Our API: ${ourDistance.toFixed(2)} km`);
        LoggerService.logBenchmark(`  FreeMapTools: ${comparison.staticDistance.toFixed(2)} km`);
        LoggerService.logBenchmark(`  Difference: ${comparison.difference?.toFixed(2)} km`);
        LoggerService.logBenchmark(`  Percentage: ${comparison.percentageDifference?.toFixed(2)}%`);

        expect(comparison.isWithinThreshold).toBe(true);
        expect(ourDistance).toBeGreaterThan(5000); // Should be a very long distance
      } else {
        LoggerService.logBenchmark('No static data available for long distance test (AK to AL)');
        return;
      }
    });
  });
}); 