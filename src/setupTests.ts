import dotenv from 'dotenv';

// Global test configurations
process.env.NODE_ENV = 'test';

// Load test environment variables
dotenv.config({ path: '.env.test' });

global.console = {
  ...console,
  error: jest.fn(),
  log: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};

// Note: Zippopotam.us API is free and doesn't require an API key 