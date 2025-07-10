import * as sqlite3 from 'sqlite3';
import * as path from 'path';
import { ZipCodeLocation } from '../types';

export class DatabaseService {
  private db: sqlite3.Database;
  private static instance: DatabaseService;

  private constructor() {
    const dbPath = path.join(__dirname, '../../data/zipcodes.db');
    this.db = new sqlite3.Database(dbPath);
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Find a postal code by number
   */
  public getZipCode(zipCode: string): Promise<ZipCodeLocation | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM zipcodes WHERE postal_code = ?',
        [zipCode],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row as ZipCodeLocation || null);
          }
        }
      );
    });
  }

  /**
   * Find multiple postal codes
   */
  public getZipCodes(zipCodes: string[]): Promise<ZipCodeLocation[]> {
    return new Promise((resolve, reject) => {
      const placeholders = zipCodes.map(() => '?').join(',');
      const query = `SELECT * FROM zipcodes WHERE postal_code IN (${placeholders})`;
      
      this.db.all(query, zipCodes, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as ZipCodeLocation[]);
        }
      });
    });
  }

  /**
   * Close database connection
   */
  public close(): void {
    this.db.close();
  }
} 