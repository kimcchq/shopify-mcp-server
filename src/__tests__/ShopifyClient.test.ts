/**
 * @jest-environment node
 * 
 * Unit tests for ShopifyClient
 * This test suite verifies the core functionality of the ShopifyClient
 * using mocks to avoid real API calls
 */

import { ShopifyClient } from '../../ShopifyClient/ShopifyClient.js';
import {
  LoadProductsResponse,
  LoadVariantsByIdResponse,
  LoadProductsByIdsResponse,
  LoadCollectionsResponse,
  ShopifyCollection
} from '../../ShopifyClient/ShopifyClientPort.js';

// Mock the graphql-request module
jest.mock('graphql-request', () => {
  return {
    GraphQLClient: jest.fn().mockImplementation(() => {
      return {
        request: jest.fn().mockImplementation(async (query, variables) => {
          // Return different mocked responses based on the query
          if (query.includes('products')) {
            return mockProductsResponse;
          } else if (query.includes('productVariants')) {
            return mockVariantsResponse;
          } else if (query.includes('collections')) {
            return mockCollectionsResponse;
          }
          return {};
        })
      };
    })
  };
});

// Mock responses
const mockProductsResponse = {
  products: {
    edges: [
      {
        node: {
          id: 'gid://shopify/Product/1',
          title: 'Test Product 1',
          description: 'Description for test product 1',
          handle: 'test-product-1',
          publishedAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          options: [
            {
              id: 'gid://shopify/ProductOption/1',
              name: 'Size',
              values: ['S', 'M', 'L']
            }
          ],
          variants: {
            edges: [
              {
                node: {
                  id: 'gid://shopify/ProductVariant/1',
                  title: 'Small',
                  price: '19.99',
                  sku: 'TEST-1-S',
                  availableForSale: true,
                  inventoryPolicy: 'DENY',
                  selectedOptions: [
                    { name: 'Size', value: 'S' }
                  ]
                }
              }
            ]
          },
          images: {
            edges: [
              {
                node: {
                  src: 'https://example.com/image1.jpg',
                  height: 800,
                  width: 600
                }
              }
            ]
          }
        }
      }
    ],
    pageInfo: {
      hasNextPage: false,
      endCursor: 'end123'
    }
  },
  shop: {
    paymentSettings: {
      currencyCode: 'USD'
    }
  }
};

const mockVariantsResponse = {
  nodes: [
    {
      id: 'gid://shopify/ProductVariant/1',
      title: 'Small',
      price: '19.99',
      sku: 'TEST-1-S',
      availableForSale: true,
      inventoryPolicy: 'DENY',
      selectedOptions: [
        { name: 'Size', value: 'S' }
      ],
      product: {
        id: 'gid://shopify/Product/1',
        title: 'Test Product 1',
        description: 'Description for test product 1',
        images: {
          edges: [
            {
              node: {
                src: 'https://example.com/image1.jpg',
                height: 800,
                width: 600
              }
            }
          ]
        }
      }
    }
  ]
};

const mockCollectionsResponse = {
  collections: {
    edges: [
      {
        node: {
          id: 'gid://shopify/Collection/1',
          title: 'Featured Products',
          description: 'Our featured products collection',
          handle: 'featured-products',
          updatedAt: '2025-01-01T00:00:00Z'
        }
      }
    ],
    pageInfo: {
      hasNextPage: false,
      endCursor: 'end123'
    }
  }
};

describe('ShopifyClient', () => {
  let client: ShopifyClient;
  const accessToken = 'test_token';
  const myshopifyDomain = 'test-store.myshopify.com';
  
  beforeEach(() => {
    client = new ShopifyClient();
    jest.clearAllMocks();
  });

  /**
   * Test loadProducts functionality
   * Verifies that products are properly loaded and transformed
   */
  it('should load products correctly', async () => {
    // Act
    const result = await client.loadProducts(
      accessToken,
      myshopifyDomain,
      null
    );
    
    // Assert
    expect(result).toBeDefined();
    expect(result.products).toHaveLength(1);
    expect(result.products[0].title).toBe('Test Product 1');
    expect(result.currencyCode).toBe('USD');
  });

  /**
   * Test loadVariantsByIds functionality
   * Verifies that variants are properly loaded by IDs
   */
  it('should load variants by IDs correctly', async () => {
    // Arrange
    const variantIds = ['gid://shopify/ProductVariant/1'];
    
    // Act
    const result = await client.loadVariantsByIds(
      accessToken,
      myshopifyDomain,
      variantIds
    );
    
    // Assert
    expect(result).toBeDefined();
    expect(result.variants).toHaveLength(1);
    expect(result.variants[0].title).toBe('Small');
    expect(result.variants[0].product).toBeDefined();
    expect(result.variants[0].product.title).toBe('Test Product 1');
  });

  /**
   * Test loadProductsByCollectionId functionality
   * Verifies that products in a collection are properly loaded
   */
  it('should load products by collection ID correctly', async () => {
    // Arrange
    const collectionId = 'gid://shopify/Collection/1';
    
    // Act
    const result = await client.loadProductsByCollectionId(
      accessToken,
      myshopifyDomain,
      collectionId
    );
    
    // Assert
    expect(result).toBeDefined();
    expect(result.products).toHaveLength(1);
    expect(result.products[0].title).toBe('Test Product 1');
  });

  /**
   * Test loadProductsByIds functionality
   * Verifies that products are properly loaded by IDs
   */
  it('should load products by IDs correctly', async () => {
    // Arrange
    const productIds = ['gid://shopify/Product/1'];
    
    // Act
    const result = await client.loadProductsByIds(
      accessToken,
      myshopifyDomain,
      productIds
    );
    
    // Assert
    expect(result).toBeDefined();
    expect(result.products).toHaveLength(1);
    expect(result.products[0].title).toBe('Test Product 1');
  });

  /**
   * Test loadCollections functionality
   * Verifies that collections are properly loaded
   */
  it('should load collections correctly', async () => {
    // Arrange
    const queryParams = {
      limit: 10,
      query: '',
      sinceId: undefined,
      name: undefined
    };
    
    // Act
    const result = await client.loadCollections(
      accessToken,
      myshopifyDomain,
      queryParams
    );
    
    // Assert
    expect(result).toBeDefined();
    expect(result.collections).toHaveLength(1);
    expect(result.collections[0].title).toBe('Featured Products');
  });

  /**
   * Test getIdFromGid utility function
   * Verifies that Shopify GIDs are properly parsed
   */
  it('should extract ID from Shopify GID', () => {
    // Arrange
    const gid = 'gid://shopify/Product/12345678';
    
    // Act
    const result = client.getIdFromGid(gid);
    
    // Assert
    expect(result).toBe('12345678');
  });
});