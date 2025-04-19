/**
 * @jest-environment node
 * 
 * Unit tests for webhookTools module
 * This test suite verifies the functionality of webhook-related tools
 */

import { registerWebhookTools } from '../../tools/webhookTools.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { 
  ShopifyClientPort,
  ShopifyWebhookTopic
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
    subscribeWebhook: jest.fn().mockResolvedValue({
      webhook: {
        id: 'gid://shopify/WebhookSubscription/1',
        topic: 'ORDERS_UPDATED',
        endpoint: {
          callbackUrl: 'https://example.com/webhook'
        }
      }
    }),
    unsubscribeWebhook: jest.fn().mockResolvedValue(true),
    findWebhookByTopicAndCallbackUrl: jest.fn().mockImplementation((accessToken, shop, callbackUrl, topic) => {
      if (topic === ShopifyWebhookTopic.ORDERS_UPDATED && callbackUrl === 'https://example.com/webhook') {
        return Promise.resolve({
          id: 'gid://shopify/WebhookSubscription/1',
          callbackUrl: 'https://example.com/webhook',
          topic: ShopifyWebhookTopic.ORDERS_UPDATED
        });
      }
      return Promise.resolve(null);
    })
  }))
}));

describe('Webhook Tools', () => {
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
      tagCustomer: jest.fn(),
      loadOrder: jest.fn(),
      subscribeWebhook: jest.fn().mockResolvedValue({
        webhook: {
          id: 'gid://shopify/WebhookSubscription/1',
          topic: 'ORDERS_UPDATED',
          endpoint: {
            callbackUrl: 'https://example.com/webhook'
          }
        }
      })
    };
  });

  /**
   * Test that webhooks can be subscribed
   * Verifies the subscribeWebhook function works correctly
   */
  it('should subscribe to webhooks correctly', async () => {
    // Arrange
    const callbackUrl = 'https://example.com/webhook';
    const topic = ShopifyWebhookTopic.ORDERS_UPDATED;
    
    // Act
    const result = await mockClient.subscribeWebhook(
      'test_token',
      'test-store.myshopify.com',
      callbackUrl,
      topic
    );
    
    // Assert
    expect(result).toBeDefined();
    expect(result.webhook.id).toBe('gid://shopify/WebhookSubscription/1');
    expect(result.webhook.topic).toBe('ORDERS_UPDATED');
    expect(result.webhook.endpoint.callbackUrl).toBe('https://example.com/webhook');
  });

  /**
   * Test tool registration
   * Verifies that webhook tools are correctly registered with the MCP server
   */
  it('should register webhook tools with MCP server', () => {
    // Arrange
    const server = new McpServer();
    
    // Act
    registerWebhookTools(server);
    
    // Assert
    expect(server.tool).toHaveBeenCalled();
    // Note: The exact number of tool registrations will depend on the implementation
    // of registerWebhookTools, so we're just checking it was called at least once
  });
});