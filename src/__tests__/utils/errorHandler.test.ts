/**
 * @jest-environment node
 * 
 * Unit tests for the error handler utility
 * This test suite verifies the functionality of error handling and response formatting
 */

import { handleError, formatSuccess } from '../../utils/errorHandler.js';
import { CustomError } from '../../ShopifyClient/ShopifyClientPort.js';

describe('Error Handler Utility', () => {
  // Setup console spy to verify logging
  let consoleErrorSpy: jest.SpyInstance;
  
  beforeEach(() => {
    // Mock console.error to prevent test output pollution
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Mock random for consistent error IDs
    jest.spyOn(Math, 'random').mockReturnValue(0.123456789);
    
    // Mock Date for consistent timestamps
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2025-04-19T00:00:00.000Z');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * Test handling standard Error objects
   * Verifies that standard Error objects are properly formatted
   */
  it('should format standard Error objects correctly', () => {
    // Arrange
    const defaultMsg = 'An error occurred';
    const error = new Error('Test error message');
    
    // Act
    const result = handleError(defaultMsg, error);
    
    // Assert
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain(defaultMsg);
    expect(result.content[0].text).toContain('Test error message');
    expect(result.content[0].text).toContain('Error ID:');
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  /**
   * Test handling CustomError objects
   * Verifies that CustomError objects with their metadata are properly formatted
   */
  it('should format CustomError objects with additional context', () => {
    // Arrange
    const defaultMsg = 'API error';
    const customError = new CustomError(
      'Custom error message', 
      'CUSTOM_ERROR_CODE',
      {
        customCode: 'SUB_CODE',
        contextData: { requestId: '123', endpoint: '/api/test' },
        innerError: { message: 'Inner error details' }
      }
    );
    
    // Act
    const result = handleError(defaultMsg, customError);
    
    // Assert
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain(defaultMsg);
    expect(result.content[0].text).toContain('Custom error message');
    expect(result.content[0].text).toContain('CUSTOM_ERROR_CODE.SUB_CODE');
    expect(result.content[0].text).toContain('requestId');
    expect(result.content[0].text).toContain('Inner error');
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  /**
   * Test handling non-Error objects
   * Verifies that non-Error objects are handled gracefully
   */
  it('should handle non-Error objects with default message', () => {
    // Arrange
    const defaultMsg = 'Unknown error';
    const nonError = { something: 'went wrong' };
    
    // Act
    const result = handleError(defaultMsg, nonError);
    
    // Assert
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain(defaultMsg);
    expect(result.content[0].text).toContain('Error ID:');
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  /**
   * Test formatSuccess function
   * Verifies that successful responses are properly formatted
   */
  it('should format successful responses correctly', () => {
    // Arrange
    const data = { 
      id: '123', 
      name: 'Test Product',
      price: 19.99
    };
    
    // Act
    const result = formatSuccess(data);
    
    // Assert
    expect(result.content[0].type).toBe('text');
    expect(JSON.parse(result.content[0].text)).toEqual(data);
    expect(result.isError).toBeUndefined();
  });
});