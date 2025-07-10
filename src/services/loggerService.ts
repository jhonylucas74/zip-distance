import fs from 'fs';
import path from 'path';

export class LoggerService {
  private static logDir = path.join(process.cwd(), 'logs');
  private static testLogFile = path.join(LoggerService.logDir, 'test.log');
  private static benchmarkLogFile = path.join(LoggerService.logDir, 'benchmark.log');

  static {
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(LoggerService.logDir)) {
      fs.mkdirSync(LoggerService.logDir, { recursive: true });
    }
  }

  static log(message: string, type: 'test' | 'benchmark' = 'test'): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    
    const logFile = type === 'benchmark' ? this.benchmarkLogFile : this.testLogFile;
    
    fs.appendFileSync(logFile, logEntry);
    
    // Also log to console for immediate feedback
    console.log(message);
  }

  static logBenchmark(message: string): void {
    this.log(message, 'benchmark');
  }

  static logTest(message: string): void {
    this.log(message, 'test');
  }

  static clearLogs(): void {
    if (fs.existsSync(this.testLogFile)) {
      fs.unlinkSync(this.testLogFile);
    }
    if (fs.existsSync(this.benchmarkLogFile)) {
      fs.unlinkSync(this.benchmarkLogFile);
    }
  }

  static getLogContent(type: 'test' | 'benchmark' = 'test'): string {
    const logFile = type === 'benchmark' ? this.benchmarkLogFile : this.testLogFile;
    
    if (fs.existsSync(logFile)) {
      return fs.readFileSync(logFile, 'utf-8');
    }
    
    return '';
  }
} 