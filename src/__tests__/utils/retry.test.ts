/**
 * @jest-environment node
 * 
 * Unit tests for the retry utility
 * This test suite verifies the functionality of the retry mechanism used for API requests
 */

import { withRetry } from '../../utils/retry.js';

describe('Retry Utility', () => {
  // Setup to control timing in tests
  beforeEach(() => {
    // Mock setTimeout to make tests run faster
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  /**
   * Test successful operation
   * Verifies that a successful operation returns its value without retrying
   */
  it('should return value of successful operation without retrying', async () => {
    // Arrange
    const operation = jest.fn().mockResolvedValue('success');
    
    // Act
    const promise = withRetry(operation);
    jest.runAllTimers();
    const result = await promise;
    
    // Assert
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  /**
   * Test retry on failure
   * Verifies that operation is retried on failure
   */
  it('should retry operation on failure', async () => {
    // Arrange
    const error = new Error('rate limit exceeded');
    const operation = jest.fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce('success after retry');
    
    // Act
    const promise = withRetry(operation, { initialDelay: 100 });
    jest.runAllTimers(); // Run the first attempt's timer
    const result = await promise;
    
    // Assert
    expect(result).toBe('success after retry');
    expect(operation).toHaveBeenCalledTimes(2);
  });

  /**
   * Test maximum retries
   * Verifies that operation stops retrying after maxRetries
   */
  it('should stop retrying after maxRetries attempts', async () => {
    // Arrange
    const error = new Error('network error');
    const operation = jest.fn().mockRejectedValue(error);
    
    // Act & Assert
    const promise = withRetry(operation, { maxRetries: 3, initialDelay: 100 });
    
    // Advance timers for all retry attempts
    jest.runAllTimers(); // First attempt
    jest.runAllTimers(); // First retry
    jest.runAllTimers(); // Second retry
    
    await expect(promise).rejects.toThrow(error);
    expect(operation).toHaveBeenCalledTimes(3); // Initial + 2 retries
  });

  /**
   * Test non-retryable errors
   * Verifies that operation is not retried for non-retryable errors
   */
  it('should not retry for non-retryable errors', async () => {
    // Arrange
    const error = new Error('validation error'); // Not in retryable errors list
    const operation = jest.fn().mockRejectedValue(error);
    
    // Act & Assert
    const promise = withRetry(operation);
    
    await expect(promise).rejects.toThrow(error);
    expect(operation).toHaveBeenCalledTimes(1); // No retries
  });

  /**
   * Test backoff delay
   * Verifies that retry delay increases with each attempt
   */
  it('should increase delay between retries', async () => {
    // Arrange
    const error = new Error('timeout');
    const operation = jest.fn()
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce('success after backoff');
    
    // Mock setTimeout to track delays
    const originalSetTimeout = global.setTimeout;
    const mockSetTimeout = jest.fn().mockImplementation((fn) => {
      // Still call the function to allow the test to proceed
      fn();
      return 123; // Mock timer id
    });
    global.setTimeout = mockSetTimeout;
    
    // Act
    await withRetry(operation, { 
      initialDelay: 1000, 
      backoffFactor: 2,
      maxDelay: 10000
    });
    
    // Assert - Check that the delays are increasing
    expect(mockSetTimeout.mock.calls[0][1]).toBe(1000); // First retry delay
    expect(mockSetTimeout.mock.calls[1][1]).toBe(2000); // Second retry delay (2x)
    
    // Restore the original setTimeout
    global.setTimeout = originalSetTimeout;
  });

  /**
   * Test custom retryable errors
   * Verifies that custom retryable errors are respected
   */
  it('should respect custom retryable errors', async () => {
    // Arrange
    const customError = new Error('custom retryable error');
    const operation = jest.fn()
      .mockRejectedValueOnce(customError)
      .mockResolvedValueOnce('success after retry');
    
    // Act
    const promise = withRetry(operation, { 
      initialDelay: 100,
      retryableErrors: ['custom retryable'] 
    });
    jest.runAllTimers();
    const result = await promise;
    
    // Assert
    expect(result).toBe('success after retry');
    expect(operation).toHaveBeenCalledTimes(2);
  });
});