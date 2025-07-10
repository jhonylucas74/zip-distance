import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';
import * as sqlite3 from 'sqlite3';

const CSV_FILE_PATH = path.join(__dirname, '../../data/20231227.csv');
const DB_PATH = path.join(__dirname, '../../data/zipcodes.db');

async function importCsvToSqlite(): Promise<void> {
  console.log('Starting CSV import to SQLite...');
  
  // Create database connection
  const db = new sqlite3.Database(DB_PATH);
  
  return new Promise((resolve, reject) => {
    // Create table
    db.run(`
      CREATE TABLE IF NOT EXISTS zipcodes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        country_code TEXT,
        postal_code TEXT,
        place_name TEXT,
        admin_name1 TEXT,
        admin_code1 TEXT,
        admin_name2 TEXT,
        admin_code2 TEXT,
        latitude REAL,
        longitude REAL
      )
    `, (err) => {
      if (err) {
        console.error('Error creating table:', err);
        reject(err);
        return;
      }
      
      console.log('Table created successfully');
      
      // Prepare insert statement
      const stmt = db.prepare(`
        INSERT INTO zipcodes 
        (country_code, postal_code, place_name, admin_name1, admin_code1, admin_name2, admin_code2, latitude, longitude)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      let count = 0;
      
      // Read CSV and insert data
      fs.createReadStream(CSV_FILE_PATH)
        .pipe(csv())
        .on('data', (row) => {
          stmt.run([
            row['country code'],
            row['postal code'],
            row['place name'],
            row['admin name1'],
            row['admin code1'],
            row['admin name2'],
            row['admin code2'],
            parseFloat(row.latitude),
            parseFloat(row.longitude)
          ]);
          count++;
          
          if (count % 10000 === 0) {
            console.log(`Imported ${count} records...`);
          }
        })
        .on('end', () => {
          stmt.finalize((err) => {
            if (err) {
              console.error('Error finalizing statement:', err);
              reject(err);
              return;
            }
            
            // Create index for postal_code search
            db.run('CREATE INDEX IF NOT EXISTS idx_postal_code ON zipcodes(postal_code)', (err) => {
              if (err) {
                console.error('Error creating index:', err);
                reject(err);
                return;
              }
              
              console.log(`Import completed! ${count} records imported.`);
              db.close();
              resolve();
            });
          });
        })
        .on('error', (err) => {
          console.error('Error reading CSV:', err);
          reject(err);
        });
    });
  });
}

// Execute import
importCsvToSqlite()
  .then(() => {
    console.log('Import completed successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Import error:', err);
    process.exit(1);
  }); 