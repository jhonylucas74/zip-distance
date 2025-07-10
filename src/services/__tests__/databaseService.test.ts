import { DatabaseService } from '../databaseService';
import { ZipCodeLocation } from '../../types';

// Mock do sqlite3
jest.mock('sqlite3', () => ({
  Database: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    all: jest.fn(),
    close: jest.fn(),
  })),
}));

describe('DatabaseService', () => {
  let dbService: DatabaseService;
  let mockDb: any;

  beforeEach(() => {
    // Limpar todas as instâncias
    (DatabaseService as any).instance = null;
    
    // Criar nova instância
    dbService = DatabaseService.getInstance();
    mockDb = (dbService as any).db;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should return the same instance (singleton)', () => {
      const instance1 = DatabaseService.getInstance();
      const instance2 = DatabaseService.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('getZipCode', () => {
    it('should return zip code data when found', async () => {
      const mockZipCode: ZipCodeLocation = {
        id: 1,
        country_code: 'US',
        postal_code: '99509',
        place_name: 'Anchorage',
        admin_name1: 'Alaska',
        admin_code1: 'AK',
        admin_name2: 'Anchorage Municipality',
        admin_code2: '20',
        latitude: 61.2181,
        longitude: -149.9003,
      };

      mockDb.get.mockImplementation((query, params, callback) => {
        expect(query).toBe('SELECT * FROM zipcodes WHERE postal_code = ?');
        expect(params).toEqual(['99509']);
        callback(null, mockZipCode);
      });

      const result = await dbService.getZipCode('99509');
      
      expect(result).toEqual(mockZipCode);
      expect(mockDb.get).toHaveBeenCalledTimes(1);
    });

    it('should return null when zip code not found', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      const result = await dbService.getZipCode('99999');
      
      expect(result).toBeNull();
      expect(mockDb.get).toHaveBeenCalledTimes(1);
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(error, null);
      });

      await expect(dbService.getZipCode('99509')).rejects.toThrow('Database error');
    });
  });

  describe('getZipCodes', () => {
    it('should return multiple zip codes when found', async () => {
      const mockZipCodes: ZipCodeLocation[] = [
        {
          id: 1,
          country_code: 'US',
          postal_code: '99509',
          place_name: 'Anchorage',
          admin_name1: 'Alaska',
          admin_code1: 'AK',
          admin_name2: 'Anchorage Municipality',
          admin_code2: '20',
          latitude: 61.2181,
          longitude: -149.9003,
        },
        {
          id: 2,
          country_code: 'US',
          postal_code: '99660',
          place_name: 'Saint Paul Island',
          admin_name1: 'Alaska',
          admin_code1: 'AK',
          admin_name2: 'Aleutians West (CA)',
          admin_code2: '16',
          latitude: 57.1842,
          longitude: -170.2764,
        },
      ];

      mockDb.all.mockImplementation((query, params, callback) => {
        expect(query).toBe('SELECT * FROM zipcodes WHERE postal_code IN (?,?)');
        expect(params).toEqual(['99509', '99660']);
        callback(null, mockZipCodes);
      });

      const result = await dbService.getZipCodes(['99509', '99660']);
      
      expect(result).toEqual(mockZipCodes);
      expect(mockDb.all).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no zip codes found', async () => {
      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      const result = await dbService.getZipCodes(['99999', '88888']);
      
      expect(result).toEqual([]);
      expect(mockDb.all).toHaveBeenCalledTimes(1);
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      
      mockDb.all.mockImplementation((query, params, callback) => {
        callback(error, null);
      });

      await expect(dbService.getZipCodes(['99509', '99660'])).rejects.toThrow('Database error');
    });

    it('should handle single zip code in array', async () => {
      const mockZipCode: ZipCodeLocation = {
        id: 1,
        country_code: 'US',
        postal_code: '99509',
        place_name: 'Anchorage',
        admin_name1: 'Alaska',
        admin_code1: 'AK',
        admin_name2: 'Anchorage Municipality',
        admin_code2: '20',
        latitude: 61.2181,
        longitude: -149.9003,
      };

      mockDb.all.mockImplementation((query, params, callback) => {
        expect(query).toBe('SELECT * FROM zipcodes WHERE postal_code IN (?)');
        expect(params).toEqual(['99509']);
        callback(null, [mockZipCode]);
      });

      const result = await dbService.getZipCodes(['99509']);
      
      expect(result).toEqual([mockZipCode]);
    });
  });

  describe('close', () => {
    it('should close database connection', () => {
      dbService.close();
      
      expect(mockDb.close).toHaveBeenCalledTimes(1);
    });
  });
}); 