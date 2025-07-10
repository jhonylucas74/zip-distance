// Global test configurations
process.env.NODE_ENV = 'test';

global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
}; 