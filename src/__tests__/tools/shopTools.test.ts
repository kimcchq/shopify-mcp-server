/**
 * @jest-environment node
 * 
 * Unit tests for shopTools module
 * This test suite verifies the functionality of shop-related tools
 */

import { registerShopTools } from '../../tools/shopTools.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ShopifyClientPort } from '../../ShopifyClient/ShopifyClientPort.js';
import { config } from '../../config/index.js';

// Mock the MCP server
jest.mock('@modelcontextprotocol/sdk/server/mcp.js', () => ({
  McpServer: jest.fn().mockImplementation(() => ({
    tool: jest.fn()
  }))
}));

// Mock the config
jest.mock('../../config/index.js', () => ({
  config: {
    accessToken: 'mock_token',
    shopDomain: 'mock-store.myshopify.com'
  }
}));

// Mock ShopifyClient
jest.mock('../../ShopifyClient/ShopifyClient.js', () => ({
  ShopifyClient: jest.fn().mockImplementation(() => ({
    loadShop: jest.fn().mockResolvedValue({
      shop: {
        id: 'gid://shopify/Shop/1',
        name: 'Test Shop',
        email: 'shop@example.com',
        url: 'https://test-shop.myshopify.com',
        myshopifyDomain: 'test-shop.myshopify.com',
        primaryDomain: {
          url: 'https://test-shop.myshopify.com',
          host: 'test-shop.myshopify.com'
        },
        shipsToCountries: ['US', 'CA', 'GB']
      }
    }),
    loadShopDetail: jest.fn().mockResolvedValue({
      data: {
        shop: {
          name: 'Test Shop',
          email: 'shop@example.com',
          currencyCode: 'USD',
          primaryDomain: {
            url: 'https://test-shop.myshopify.com',
            host: 'test-shop.myshopify.com'
          },
          shipsToCountries: ['US', 'CA', 'GB'],
          billingAddress: {
            address1: '123 Example St',
            city: 'San Francisco',
            province: 'California',
            country: 'United States',
            zip: '94103'
          }
        }
      }
    })
  }))
}));

describe('Shop Tools', () => {
  /**
   * Test tool registration
   * Verifies that shop tools are correctly registered with the MCP server
   */
  it('should register shop tools with MCP server', () => {
    // Arrange
    const server = new McpServer();
    
    // Act
    registerShopTools(server);
    
    // Assert
    expect(server.tool).toHaveBeenCalled();
    // Note: The exact number of tool registrations will depend on the implementation
    // of registerShopTools, so we're just checking it was called at least once
  });
});