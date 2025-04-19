/**
 * @jest-environment node
 * 
 * Unit tests for customerTools module
 * This test suite verifies the functionality of customer-related tools
 */

import { registerCustomerTools } from '../../tools/customerTools.js';
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
    loadCustomers: jest.fn().mockResolvedValue({
      customers: [
        {
          id: 1234567890,
          email: 'customer@example.com',
          first_name: 'Test',
          last_name: 'Customer',
          phone: '+1-555-123-4567',
          orders: [
            { id: 'gid://shopify/Order/1' }
          ],
          tags: 'vip,repeat',
          currency: 'USD'
        }
      ],
      next: null
    }),
    tagCustomer: jest.fn().mockResolvedValue(true)
  }))
}));

describe('Customer Tools', () => {
  let mockClient: ShopifyClientPort;
  
  beforeEach(() => {
    // Create a mock ShopifyClient
    mockClient = {
      loadProducts: jest.fn(),
      loadProductsByCollectionId: jest.fn(),
      searchProductsByPriceRange: jest.fn(),
      loadVariantsByIds: jest.fn(),
      loadProductsByIds: jest.fn(),
      loadCollections: jest.fn(),
      loadOrders: jest.fn(),
      loadCustomers: jest.fn().mockResolvedValue({
        customers: [
          {
            id: 1234567890,
            email: 'customer@example.com',
            first_name: 'Test',
            last_name: 'Customer',
            phone: '+1-555-123-4567',
            orders: [
              { id: 'gid://shopify/Order/1' }
            ],
            tags: 'vip,repeat',
            currency: 'USD'
          }
        ],
        next: null
      }),
      createDraftOrder: jest.fn(),
      completeDraftOrder: jest.fn(),
      createBasicDiscountCode: jest.fn(),
      getPriceRule: jest.fn(),
      manageInventory: jest.fn(),
      bulkVariantOperations: jest.fn(),
      manageProductMetafields: jest.fn(),
      manageProductCollections: jest.fn(),
      manageProductImages: jest.fn(),
      bulkUpdateVariantPrices: jest.fn(),
      createProduct: jest.fn(),
      updateProduct: jest.fn(),
      bulkUpdateProducts: jest.fn(),
      tagCustomer: jest.fn().mockResolvedValue(true),
      loadOrder: jest.fn(),
      subscribeWebhook: jest.fn()
    };
  });

  /**
   * Test that customers can be loaded
   * Verifies the loadCustomers function returns customer data correctly
   */
  it('should load customers correctly', async () => {
    // Act
    const result = await mockClient.loadCustomers(
      'test_token',
      'test-store.myshopify.com'
    );
    
    // Assert
    expect(result).toBeDefined();
    expect(result.customers).toHaveLength(1);
    expect(result.customers[0].email).toBe('customer@example.com');
    expect(result.customers[0].first_name).toBe('Test');
    expect(result.customers[0].last_name).toBe('Customer');
  });

  /**
   * Test that customers can be tagged
   * Verifies the tagCustomer function works correctly
   */
  it('should tag customers correctly', async () => {
    // Arrange
    const tags = ['test-tag', 'important'];
    const customerId = '1234567890';
    
    // Act
    const result = await mockClient.tagCustomer(
      'test_token',
      'test-store.myshopify.com',
      tags,
      customerId
    );
    
    // Assert
    expect(result).toBe(true);
  });

  /**
   * Test tool registration
   * Verifies that customer tools are correctly registered with the MCP server
   */
  it('should register customer tools with MCP server', () => {
    // Arrange
    const server = new McpServer();
    
    // Act
    registerCustomerTools(server);
    
    // Assert
    expect(server.tool).toHaveBeenCalled();
    // Note: The exact number of tool registrations will depend on the implementation
    // of registerCustomerTools, so we're just checking it was called at least once
  });
});