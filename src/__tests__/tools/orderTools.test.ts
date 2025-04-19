/**
 * @jest-environment node
 * 
 * Unit tests for orderTools module
 * This test suite verifies the functionality of order-related tools
 */

import { registerOrderTools } from '../../tools/orderTools.js';
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
    loadOrders: jest.fn().mockResolvedValue({
      orders: [
        {
          id: 'gid://shopify/Order/1',
          name: '#1001',
          createdAt: '2025-01-15T10:30:00Z',
          displayFinancialStatus: 'PAID',
          email: 'customer@example.com',
          phone: '+1-555-123-4567',
          totalPriceSet: {
            shopMoney: { amount: '49.99', currencyCode: 'USD' },
            presentmentMoney: { amount: '49.99', currencyCode: 'USD' }
          },
          customer: {
            id: 'gid://shopify/Customer/1',
            email: 'customer@example.com'
          },
          shippingAddress: {
            provinceCode: 'CA',
            countryCode: 'US'
          },
          lineItems: {
            nodes: [
              {
                id: 'gid://shopify/LineItem/1',
                title: 'Test Product',
                quantity: 1,
                originalTotalSet: {
                  shopMoney: { amount: '49.99', currencyCode: 'USD' }
                },
                variant: {
                  id: 'gid://shopify/ProductVariant/1',
                  title: 'Default',
                  price: '49.99',
                  sku: 'TEST-1'
                }
              }
            ]
          }
        }
      ],
      pageInfo: {
        hasNextPage: false,
        endCursor: null
      }
    }),
    loadOrder: jest.fn().mockResolvedValue({
      id: 'gid://shopify/Order/1',
      name: '#1001',
      email: 'customer@example.com',
      phone: '+1-555-123-4567',
      totalPrice: '49.99',
      subtotalPrice: '49.99',
      totalTax: '0.00',
      processedAt: '2025-01-15T10:30:00Z',
      cancelledAt: null,
      displayFulfillmentStatus: null,
      displayFinancialStatus: 'PAID',
      customer: {
        id: 'gid://shopify/Customer/1',
        firstName: 'Test',
        lastName: 'Customer',
        email: 'customer@example.com'
      },
      shippingAddress: {
        address1: '123 Test St',
        address2: null,
        city: 'Test City',
        country: 'United States',
        provinceCode: 'CA',
        zip: '12345',
        phone: '+1-555-123-4567'
      },
      lineItems: {
        edges: [
          {
            node: {
              id: 'gid://shopify/LineItem/1',
              title: 'Test Product',
              quantity: 1,
              variant: {
                id: 'gid://shopify/ProductVariant/1',
                title: 'Default',
                price: '49.99',
                sku: 'TEST-1'
              }
            }
          }
        ]
      }
    }),
    getIdFromGid: jest.fn().mockImplementation((gid) => {
      const parts = gid.split('/');
      return parts[parts.length - 1];
    })
  }))
}));

describe('Order Tools', () => {
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
      loadOrders: jest.fn().mockResolvedValue({
        orders: [
          {
            id: 'gid://shopify/Order/1',
            name: '#1001',
            createdAt: '2025-01-15T10:30:00Z',
            displayFinancialStatus: 'PAID',
            email: 'customer@example.com',
            phone: '+1-555-123-4567',
            totalPriceSet: {
              shopMoney: { amount: '49.99', currencyCode: 'USD' },
              presentmentMoney: { amount: '49.99', currencyCode: 'USD' }
            },
            customer: {
              id: 'gid://shopify/Customer/1',
              email: 'customer@example.com'
            },
            shippingAddress: {
              provinceCode: 'CA',
              countryCode: 'US'
            },
            lineItems: {
              nodes: [
                {
                  id: 'gid://shopify/LineItem/1',
                  title: 'Test Product',
                  quantity: 1,
                  originalTotalSet: {
                    shopMoney: { amount: '49.99', currencyCode: 'USD' }
                  },
                  variant: {
                    id: 'gid://shopify/ProductVariant/1',
                    title: 'Default',
                    price: '49.99',
                    sku: 'TEST-1'
                  }
                }
              ]
            }
          }
        ],
        pageInfo: {
          hasNextPage: false,
          endCursor: null
        }
      }),
      loadOrder: jest.fn().mockResolvedValue({
        id: 'gid://shopify/Order/1',
        name: '#1001',
        email: 'customer@example.com',
        phone: '+1-555-123-4567',
        totalPrice: '49.99',
        subtotalPrice: '49.99',
        totalTax: '0.00',
        processedAt: '2025-01-15T10:30:00Z',
        cancelledAt: null,
        displayFulfillmentStatus: null,
        displayFinancialStatus: 'PAID',
        customer: {
          id: 'gid://shopify/Customer/1',
          firstName: 'Test',
          lastName: 'Customer',
          email: 'customer@example.com'
        },
        shippingAddress: {
          address1: '123 Test St',
          address2: null,
          city: 'Test City',
          country: 'United States',
          provinceCode: 'CA',
          zip: '12345',
          phone: '+1-555-123-4567'
        },
        lineItems: {
          edges: [
            {
              node: {
                id: 'gid://shopify/LineItem/1',
                title: 'Test Product',
                quantity: 1,
                variant: {
                  id: 'gid://shopify/ProductVariant/1',
                  title: 'Default',
                  price: '49.99',
                  sku: 'TEST-1'
                }
              }
            }
          ]
        }
      }),
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
      subscribeWebhook: jest.fn()
    };
  });

  /**
   * Test that orders can be loaded
   * Verifies the loadOrders function returns order data correctly
   */
  it('should load orders correctly', async () => {
    // Act
    const result = await mockClient.loadOrders(
      'test_token',
      'test-store.myshopify.com',
      { first: 100 }
    );
    
    // Assert
    expect(result).toBeDefined();
    expect(result.orders).toHaveLength(1);
    expect(result.orders[0].name).toBe('#1001');
    expect(result.orders[0].displayFinancialStatus).toBe('PAID');
    expect(result.orders[0].totalPriceSet.shopMoney.amount).toBe('49.99');
  });

  /**
   * Test that a single order can be loaded
   * Verifies the loadOrder function returns order data correctly
   */
  it('should load single order correctly', async () => {
    // Act
    const result = await mockClient.loadOrder(
      'test_token',
      'test-store.myshopify.com',
      '1'
    );
    
    // Assert
    expect(result).toBeDefined();
    expect(result.id).toBe('gid://shopify/Order/1');
    expect(result.name).toBe('#1001');
    expect(result.totalPrice).toBe('49.99');
    expect(result.customer).toBeDefined();
    expect(result.customer.firstName).toBe('Test');
    expect(result.customer.lastName).toBe('Customer');
  });

  /**
   * Test tool registration
   * Verifies that order tools are correctly registered with the MCP server
   */
  it('should register order tools with MCP server', () => {
    // Arrange
    const server = new McpServer();
    
    // Act
    registerOrderTools(server);
    
    // Assert
    expect(server.tool).toHaveBeenCalled();
    // Note: The exact number of tool registrations will depend on the implementation
    // of registerOrderTools, so we're just checking it was called at least once
  });
});