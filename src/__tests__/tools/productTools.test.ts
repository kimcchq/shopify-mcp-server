/**
 * @jest-environment node
 * 
 * Unit tests for productTools module
 * This test suite verifies the functionality of product-related tools
 */

import { 
  getVariantPrice, 
  getProductInventoryStatus,
  getProductFullDetails,
  searchProductsByAttributes,
  getProductAnalytics,
  bulkUpdateProducts,
  generateProductReport,
  registerProductTools
} from '../../tools/productTools.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ProductVariant, ShopifyClientPort } from '../../ShopifyClient/ShopifyClientPort.js';
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

describe('Product Tools', () => {
  let mockClient: ShopifyClientPort;
  
  beforeEach(() => {
    // Create a mock ShopifyClient
    mockClient = {
      loadProducts: jest.fn().mockResolvedValue({
        products: [
          {
            id: 'gid://shopify/Product/1',
            title: 'Test Product',
            description: 'A test product',
            handle: 'test-product',
            publishedAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-02T00:00:00Z',
            options: [],
            variants: {
              edges: [
                {
                  node: {
                    id: 'gid://shopify/ProductVariant/1',
                    title: 'Default',
                    price: '19.99',
                    sku: 'TEST-1',
                    availableForSale: true,
                    inventoryPolicy: 'DENY',
                    selectedOptions: [],
                    image: null
                  }
                }
              ]
            },
            images: {
              edges: [
                {
                  node: {
                    src: 'https://example.com/image.jpg',
                    height: 800,
                    width: 600,
                    alt: 'Test product image'
                  }
                }
              ]
            }
          }
        ],
        currencyCode: 'USD'
      }),
      loadProductsByCollectionId: jest.fn().mockResolvedValue({
        products: [
          {
            id: 'gid://shopify/Product/2',
            title: 'Collection Product',
            handle: 'collection-product',
            description: 'A product in a collection',
            publishedAt: '2025-01-03T00:00:00Z',
            updatedAt: '2025-01-04T00:00:00Z',
            options: [],
            variants: {
              edges: [
                {
                  node: {
                    id: 'gid://shopify/ProductVariant/2',
                    title: 'Default',
                    price: '29.99',
                    sku: 'TEST-2',
                    availableForSale: true,
                    inventoryPolicy: 'CONTINUE',
                    selectedOptions: [],
                    image: null
                  }
                }
              ]
            },
            images: {
              edges: []
            }
          }
        ],
        currencyCode: 'USD'
      }),
      searchProductsByPriceRange: jest.fn().mockResolvedValue({
        products: [
          {
            id: 'gid://shopify/Product/3',
            title: 'Price Range Product',
            handle: 'price-range-product',
            description: 'A product in the price range',
            publishedAt: '2025-01-05T00:00:00Z',
            updatedAt: '2025-01-06T00:00:00Z',
            options: [],
            variants: {
              edges: [
                {
                  node: {
                    id: 'gid://shopify/ProductVariant/3',
                    title: 'Default',
                    price: '15.99',
                    sku: 'TEST-3',
                    availableForSale: true,
                    inventoryPolicy: 'DENY',
                    selectedOptions: [],
                    image: null
                  }
                }
              ]
            },
            images: {
              edges: []
            }
          }
        ],
        currencyCode: 'USD'
      }),
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
      subscribeWebhook: jest.fn()
    };
  });

  /**
   * Test getVariantPrice utility function
   * Verifies that variant price is correctly retrieved
   */
  it('should get variant price correctly', async () => {
    // Arrange
    const variant: ProductVariant = {
      id: 'gid://shopify/ProductVariant/1',
      title: 'Default',
      price: '19.99',
      sku: 'TEST-1',
      availableForSale: true,
      inventoryPolicy: 'DENY',
      selectedOptions: [],
      image: null
    };
    
    // Act
    const price = await getVariantPrice(
      mockClient,
      'test_token',
      'test-store.myshopify.com',
      variant
    );
    
    // Assert
    expect(price).toBe('19.99');
  });

  /**
   * Test getProductInventoryStatus utility function
   * Verifies that product inventory status is correctly retrieved
   */
  it('should get product inventory status correctly', async () => {
    // Arrange
    const variant: ProductVariant = {
      id: 'gid://shopify/ProductVariant/1',
      title: 'Default',
      price: '19.99',
      sku: 'TEST-1',
      availableForSale: true,
      inventoryPolicy: 'DENY',
      selectedOptions: [],
      image: null
    };
    
    // Act
    const status = await getProductInventoryStatus(
      mockClient,
      'test_token',
      'test-store.myshopify.com',
      variant
    );
    
    // Assert
    expect(status.isAvailable).toBe(true);
    expect(status.inventoryPolicy).toBe('DENY');
  });

  /**
   * Test getProductFullDetails function
   * Verifies that full product details are correctly retrieved
   */
  it('should get full product details correctly', async () => {
    // Act
    const details = await getProductFullDetails(
      mockClient,
      'test_token',
      'test-store.myshopify.com',
      'gid://shopify/Product/1'
    );
    
    // Assert
    expect(details.product).toBeDefined();
    expect(details.product.id).toBe('gid://shopify/Product/1');
    expect(details.product.title).toBe('Test Product');
    expect(details.product.description).toBe('A test product');
    expect(details.product.variants).toHaveLength(1);
    expect(details.product.images).toHaveLength(1);
  });

  /**
   * Test searchProductsByAttributes function with title
   * Verifies that products can be searched by title
   */
  it('should search products by title correctly', async () => {
    // Act
    const products = await searchProductsByAttributes(
      mockClient,
      'test_token',
      'test-store.myshopify.com',
      { title: 'Test' }
    );
    
    // Assert
    expect(products).toHaveLength(1);
    expect(products[0].title).toBe('Test Product');
    expect(products[0].price).toBe('19.99');
    expect(mockClient.loadProducts).toHaveBeenCalledWith(
      'test_token',
      'test-store.myshopify.com',
      'Test'
    );
  });

  /**
   * Test searchProductsByAttributes function with price range
   * Verifies that products can be searched by price range
   */
  it('should search products by price range correctly', async () => {
    // Act
    const products = await searchProductsByAttributes(
      mockClient,
      'test_token',
      'test-store.myshopify.com',
      { priceRange: { min: 10, max: 20 } }
    );
    
    // Assert
    expect(products).toHaveLength(1);
    expect(products[0].title).toBe('Price Range Product');
    expect(products[0].price).toBe('15.99');
    expect(mockClient.searchProductsByPriceRange).toHaveBeenCalledWith(
      'test_token',
      'test-store.myshopify.com',
      { minPrice: 10, maxPrice: 20 }
    );
  });

  /**
   * Test searchProductsByAttributes function with collection
   * Verifies that products can be searched by collection
   */
  it('should search products by collection correctly', async () => {
    // Act
    const products = await searchProductsByAttributes(
      mockClient,
      'test_token',
      'test-store.myshopify.com',
      { collection: 'gid://shopify/Collection/1' }
    );
    
    // Assert
    expect(products).toHaveLength(1);
    expect(products[0].title).toBe('Collection Product');
    expect(products[0].price).toBe('29.99');
    expect(mockClient.loadProductsByCollectionId).toHaveBeenCalledWith(
      'test_token',
      'test-store.myshopify.com',
      'gid://shopify/Collection/1'
    );
  });

  /**
   * Test getProductAnalytics function
   * Verifies that product analytics are correctly mocked
   * (since this function returns mock data)
   */
  it('should get product analytics correctly', async () => {
    // Act
    const analytics = await getProductAnalytics(
      mockClient,
      'test_token',
      'test-store.myshopify.com',
      'gid://shopify/Product/1'
    );
    
    // Assert
    expect(analytics).toBeDefined();
    expect(analytics.views).toBe(1000);
    expect(analytics.addToCart).toBe(100);
    expect(analytics.purchases).toBe(50);
    expect(analytics.revenue).toBe(2500);
    expect(analytics.conversionRate).toBe(5);
  });

  /**
   * Test bulkUpdateProducts function
   * Verifies that bulk product updates work correctly
   * (since this function returns mock data)
   */
  it('should bulk update products correctly', async () => {
    // Arrange
    const updates = [
      {
        id: 'gid://shopify/Product/1',
        price: '29.99',
        compareAtPrice: '39.99',
        title: 'Updated Test Product'
      }
    ];
    
    // Act
    const result = await bulkUpdateProducts(
      mockClient,
      'test_token',
      'test-store.myshopify.com',
      updates
    );
    
    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('gid://shopify/Product/1');
    expect(result[0].success).toBe(true);
  });

  /**
   * Test generateProductReport function
   * Verifies that product reports are correctly generated
   */
  it('should generate product report correctly', async () => {
    // Arrange
    const options = {
      includeVariants: true,
      includeInventory: true,
      includePricing: true,
      includeAnalytics: true
    };
    
    // Act
    const report = await generateProductReport(
      mockClient,
      'test_token',
      'test-store.myshopify.com',
      options
    );
    
    // Assert
    expect(report).toBeDefined();
    expect(report.generatedAt).toBeTruthy();
    expect(report.products).toHaveLength(1);
    expect(report.products[0].title).toBe('Test Product');
    expect(report.products[0].variants).toBeDefined();
    expect(report.products[0].analytics).toBeDefined();
  });

  /**
   * Test tool registration
   * Verifies that product tools are correctly registered with the MCP server
   */
  it('should register product tools with MCP server', () => {
    // Arrange
    const server = new McpServer();
    
    // Act
    registerProductTools(server);
    
    // Assert
    expect(server.tool).toHaveBeenCalledTimes(2);
    expect(server.tool).toHaveBeenCalledWith(
      'get-products',
      expect.any(String),
      expect.any(Object),
      expect.any(Function)
    );
    expect(server.tool).toHaveBeenCalledWith(
      'get-product-details',
      expect.any(String),
      expect.any(Object),
      expect.any(Function)
    );
  });
});