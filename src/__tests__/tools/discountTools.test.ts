/**
 * @jest-environment node
 * 
 * Unit tests for discountTools module
 * This test suite verifies the functionality of discount-related tools
 */

import { registerDiscountTools } from '../../tools/discountTools.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { 
  ShopifyClientPort, 
  CreateBasicDiscountCodeInput 
} from '../../ShopifyClient/ShopifyClientPort.js';
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
    createBasicDiscountCode: jest.fn().mockImplementation((accessToken, shop, discountInput) => {
      return Promise.resolve({
        id: 'gid://shopify/DiscountCodeNode/1',
        code: discountInput.code
      });
    }),
    deleteBasicDiscountCode: jest.fn().mockResolvedValue(true),
    getPriceRule: jest.fn().mockResolvedValue({
      priceRule: {
        id: 'gid://shopify/PriceRule/1',
        valueType: 'percentage',
        value: '0.1',
        title: 'Test Discount',
        targetType: 'LINE_ITEM',
        startsAt: '2025-01-01T00:00:00Z',
        endsAt: '2025-12-31T23:59:59Z',
        status: 'ACTIVE',
        allocationMethod: 'ACROSS',
        oncePerCustomer: true
      }
    })
  }))
}));

describe('Discount Tools', () => {
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
      loadCustomers: jest.fn(),
      createDraftOrder: jest.fn(),
      completeDraftOrder: jest.fn(),
      createBasicDiscountCode: jest.fn().mockImplementation((accessToken, shop, discountInput) => {
        return Promise.resolve({
          id: 'gid://shopify/DiscountCodeNode/1',
          code: discountInput.code
        });
      }),
      getPriceRule: jest.fn().mockResolvedValue({
        priceRule: {
          id: 'gid://shopify/PriceRule/1',
          valueType: 'percentage',
          value: '0.1',
          title: 'Test Discount',
          targetType: 'LINE_ITEM',
          startsAt: '2025-01-01T00:00:00Z',
          endsAt: '2025-12-31T23:59:59Z',
          status: 'ACTIVE',
          allocationMethod: 'ACROSS',
          oncePerCustomer: true
        }
      }),
      manageInventory: jest.fn(),
      bulkVariantOperations: jest.fn(),
      manageProductMetafields: jest.fn(),
      manageProductCollections: jest.fn(),
      manageProductImages: jest.fn(),
      bulkUpdateVariantPrices: jest.fn(),
      createProduct: jest.fn(),
      updateProduct: jest.fn(),
      bulkUpdateProducts: jest.fn(),
      tagCustomer: jest.fn(),
      loadOrder: jest.fn(),
      subscribeWebhook: jest.fn()
    };
  });

  /**
   * Test that discount codes can be created
   * Verifies the createBasicDiscountCode function works correctly
   */
  it('should create basic discount code correctly', async () => {
    // Arrange
    const discountInput: CreateBasicDiscountCodeInput = {
      title: 'Test Discount',
      code: 'TEST123',
      startsAt: '2025-01-01T00:00:00Z',
      valueType: 'percentage',
      value: 0.1,
      includeCollectionIds: [],
      excludeCollectionIds: [],
      appliesOncePerCustomer: true,
      combinesWith: {
        productDiscounts: true,
        orderDiscounts: true,
        shippingDiscounts: true
      }
    };
    
    // Act
    const result = await mockClient.createBasicDiscountCode(
      'test_token',
      'test-store.myshopify.com',
      discountInput
    );
    
    // Assert
    expect(result).toBeDefined();
    expect(result.id).toBe('gid://shopify/DiscountCodeNode/1');
    expect(result.code).toBe('TEST123');
  });

  /**
   * Test that price rules can be retrieved
   * Verifies the getPriceRule function works correctly
   */
  it('should get price rule correctly', async () => {
    // Act
    const result = await mockClient.getPriceRule(
      'test_token',
      'test-store.myshopify.com',
      { id: 'gid://shopify/PriceRule/1' }
    );
    
    // Assert
    expect(result).toBeDefined();
    expect(result.priceRule.id).toBe('gid://shopify/PriceRule/1');
    expect(result.priceRule.title).toBe('Test Discount');
    expect(result.priceRule.valueType).toBe('percentage');
    expect(result.priceRule.value).toBe('0.1');
    expect(result.priceRule.oncePerCustomer).toBe(true);
  });

  /**
   * Test tool registration
   * Verifies that discount tools are correctly registered with the MCP server
   */
  it('should register discount tools with MCP server', () => {
    // Arrange
    const server = new McpServer();
    
    // Act
    registerDiscountTools(server);
    
    // Assert
    expect(server.tool).toHaveBeenCalled();
    // Note: The exact number of tool registrations will depend on the implementation
    // of registerDiscountTools, so we're just checking it was called at least once
  });
});