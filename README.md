# Zip Distance API

TypeScript API to calculate distances between postal codes using geographic data.

## 🚀 Features

- Calculates distances between postal codes using Haversine formula
- Supports multiple units of measurement (km, miles, meters, feet)
- Sorts results by distance (closest first)
- Uses SQLite for efficient data storage
- Simple and intuitive REST API

## 📋 Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

## 🛠️ Installation

### Option 1: Local Installation

1. Clone the repository or download the files
2. Install dependencies:

```bash
npm install
```

3. Import CSV data to SQLite:

```bash
npm run import-data
```

4. Compile TypeScript:

```bash
npm run build
```

5. Start the server:

```bash
npm start
```

For development, use:

```bash
npm run dev
```

### Option 2: Docker Installation

#### Quick Start with Docker

1. Build and start the container:

```bash
# Build the container
docker-compose build

# Start the service
docker-compose up -d

# Import CSV data
docker-compose exec zip-distance-api npm run import-data
```

2. Access the API at http://localhost:3001

#### Docker Commands

```bash
# Build container
docker-compose build

# Start service
docker-compose up -d

# Stop service
docker-compose down

# View logs
docker-compose logs -f

# Import data
docker-compose exec zip-distance-api npm run import-data

# Run tests
docker-compose exec zip-distance-api npm test

# Access container shell
docker-compose exec zip-distance-api sh
```

## 📊 Data Structure

The CSV file should have the following format:
```csv
country code,postal code,place name,admin name1,admin code1,admin name2,admin code2,latitude,longitude
US,99547,Atka,Alaska,AK,Aleutians West (CA),16,52.1961,-174.2006
```

## 🔌 API Endpoints

### GET /health
Checks API status.

**Response:**
```json
{
  "status": "OK",
  "message": "Postal code distance API is running",
  "timestamp": "2023-12-27T10:00:00.000Z"
}
```

### POST /api/distances
Calculates distances between an origin postal code and multiple destinations.

**Request Body:**
```json
{
  "originZipCode": "99509",
  "destinationZipCodes": ["99660", "99547"],
  "unit": "km"
}
```

**Parameters:**
- `originZipCode` (string, required): Origin postal code
- `destinationZipCodes` (array, required): List of destination postal codes
- `unit` (string, optional): Unit of measurement. Values: `km`, `miles`, `meters`, `feet`. Default: `km`

**Response:**
```json
{
  "origin": {
    "zipCode": "99509",
    "placeName": "Anchorage",
    "latitude": 61.2181,
    "longitude": -149.9003
  },
  "destinations": [
    {
      "zipCode": "99660",
      "placeName": "Saint Paul Island",
      "distance": 1234.56,
      "unit": "km",
      "latitude": 57.1842,
      "longitude": -170.2764
    },
    {
      "zipCode": "99547",
      "placeName": "Atka",
      "distance": 2345.67,
      "unit": "km",
      "latitude": 52.1961,
      "longitude": -174.2006
    }
  ],
  "warnings": {
    "notFound": ["12345"]
  }
}
```

**Notes:**
- Destinations are sorted by distance (closest first)
- If any postal code is not found, it will be included in `warnings.notFound`
- Distances are calculated using the Haversine formula

## 🧪 Usage Examples

### API Call
```bash
curl -X POST http://localhost:3001/api/distances \
  -H "Content-Type: application/json" \
  -d '{
    "originZipCode": "99509",
    "destinationZipCodes": ["99660", "99547"],
    "unit": "km"
  }'
```

### Health Check
```bash
curl http://localhost:3001/health
```

## 📁 Project Structure

```
zip-distance/
├── data/
│   ├── 20231227.csv          # Original data
│   └── zipcodes.db           # SQLite database (generated)
├── src/
│   ├── controllers/
│   │   └── distanceController.ts
│   ├── services/
│   │   ├── databaseService.ts
│   │   └── distanceService.ts
│   ├── scripts/
│   │   └── import-csv.ts
│   ├── types/
│   │   └── index.ts
│   └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Available Scripts

- `npm run build`: Compiles TypeScript
- `npm start`: Starts production server
- `npm run dev`: Starts development server
- `npm run import-data`: Imports CSV data to SQLite
- `npm test`: Runs unit tests
- `npm run test:watch`: Runs tests in watch mode
- `npm run test:coverage`: Runs tests with coverage report

## 🌐 Access

- **API**: http://localhost:3001
- **Documentation**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🧪 Testing

The API includes a complete suite of unit and integration tests:

### Unit Tests
- **DistanceService**: Tests distance calculations and formatting
- **DatabaseService**: Tests database operations
- **DistanceController**: Tests business logic and validations

### Integration Tests
- Tests API endpoints with supertest
- Validates HTTP responses and JSON formats
- Tests error and success scenarios

### Test Coverage
Run `npm run test:coverage` to see the code coverage report.

### Benchmark Tests
Run `npm run test:benchmark` to compare our API accuracy with external APIs.

The benchmark tests:
- Compare our distance calculations with zip-api.eu
- Use real postal codes from the CSV data
- Ensure accuracy within 5% threshold
- Test various distance ranges (short, medium, long)
- Provide detailed statistics and reports

## 📝 Notes

- The API uses the Haversine formula to calculate geographic distances
- Data is stored in SQLite for performance
- The API supports CORS for web application use
- All postal codes must exist in the database
- Automated tests ensure quality and reliability 