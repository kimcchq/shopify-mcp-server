/**
 * @jest-environment node
 * 
 * Unit tests for the Cache utility
 * This test suite verifies the functionality of the cache mechanism used for API responses
 */

import { Cache } from '../../utils/cache.js';

describe('Cache Utility', () => {
  // Setup a new cache instance before each test to ensure tests are isolated
  let cache: Cache;
  
  beforeEach(() => {
    cache = new Cache();
    // Mock the Date.now function to control time-based testing
    jest.spyOn(Date, 'now').mockImplementation(() => 1000);
  });

  afterEach(() => {
    // Clean up mocks after each test
    jest.restoreAllMocks();
  });

  /**
   * Test basic set and get functionality
   * Verifies that values can be stored and retrieved from the cache
   */
  it('should store and retrieve values', () => {
    // Arrange & Act
    cache.set('testKey', 'testValue');
    const value = cache.get('testKey');
    
    // Assert
    expect(value).toBe('testValue');
  });

  /**
   * Test cache expiration
   * Verifies that expired entries are not returned
   */
  it('should return null for expired entries', () => {
    // Arrange
    cache.set('expiredKey', 'expiredValue', { ttl: 500 });
    
    // Act - Advance time beyond TTL
    jest.spyOn(Date, 'now').mockImplementation(() => 1501);
    const value = cache.get('expiredKey');
    
    // Assert
    expect(value).toBeNull();
  });

  /**
   * Test getOrSet functionality
   * Verifies that getOrSet will return cached values when available
   * and fetch new ones when needed
   */
  it('should return cached value with getOrSet if available', async () => {
    // Arrange
    cache.set('cachedKey', 'cachedValue');
    const getter = jest.fn().mockResolvedValue('newValue');
    
    // Act
    const value = await cache.getOrSet('cachedKey', getter);
    
    // Assert
    expect(value).toBe('cachedValue');
    expect(getter).not.toHaveBeenCalled();
  });

  /**
   * Test getOrSet with cache miss
   * Verifies that getOrSet calls the getter function on cache miss
   */
  it('should call getter function with getOrSet on cache miss', async () => {
    // Arrange
    const getter = jest.fn().mockResolvedValue('fetchedValue');
    
    // Act
    const value = await cache.getOrSet('missKey', getter);
    
    // Assert
    expect(value).toBe('fetchedValue');
    expect(getter).toHaveBeenCalledTimes(1);
  });

  /**
   * Test delete functionality
   * Verifies that entries can be deleted from cache
   */
  it('should delete entries from cache', () => {
    // Arrange
    cache.set('deleteKey', 'deleteValue');
    
    // Act
    cache.delete('deleteKey');
    const value = cache.get('deleteKey');
    
    // Assert
    expect(value).toBeNull();
  });

  /**
   * Test clear functionality
   * Verifies that the entire cache can be cleared
   */
  it('should clear all entries from cache', () => {
    // Arrange
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    
    // Act
    cache.clear();
    
    // Assert
    expect(cache.get('key1')).toBeNull();
    expect(cache.get('key2')).toBeNull();
  });

  /**
   * Test cleanup functionality
   * Verifies that expired entries are removed during cleanup
   */
  it('should remove expired entries during cleanup', () => {
    // Arrange
    cache.set('freshKey', 'freshValue', { ttl: 2000 });
    cache.set('expiredKey', 'expiredValue', { ttl: 500 });
    
    // Act - Advance time beyond one TTL but not the other
    jest.spyOn(Date, 'now').mockImplementation(() => 1501);
    cache.cleanup();
    
    // Assert - Expired key should be removed, fresh key should remain
    expect(cache.get('expiredKey')).toBeNull();
    expect(cache.get('freshKey')).toBe('freshValue');
  });
});