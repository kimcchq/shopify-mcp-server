/**
 * @jest-environment node
 * 
 * Unit tests for the formatters utility
 * This test suite verifies the functionality of data formatting helpers
 */

import { formatProduct, formatVariant, formatOrder } from '../../utils/formatters.js';
import { 
  ProductNode, 
  ProductVariant, 
  ShopifyOrderGraphql 
} from '../../ShopifyClient/ShopifyClientPort.js';

describe('Formatters Utility', () => {
  /**
   * Test product formatting
   * Verifies that product data is correctly formatted as a string
   */
  it('should format product data correctly', () => {
    // Arrange
    const product: ProductNode = {
      id: 'gid://shopify/Product/123456',
      handle: 'test-product',
      title: 'Test Product',
      description: 'A product for testing',
      publishedAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-02T00:00:00Z',
      options: [
        {
          id: 'opt1',
          name: 'Size',
          values: ['S', 'M', 'L']
        }
      ],
      images: {
        edges: [
          {
            node: {
              src: 'https://example.com/image.jpg',
              height: 800,
              width: 600
            }
          }
        ]
      },
      variants: {
        edges: [
          {
            node: {
              id: 'gid://shopify/ProductVariant/789',
              title: 'Small',
              price: '19.99',
              sku: 'TEST-S',
              availableForSale: true,
              inventoryPolicy: 'DENY',
              selectedOptions: [
                { name: 'Size', value: 'S' }
              ],
              image: null
            }
          }
        ]
      }
    };
    
    // Act
    const result = formatProduct(product);
    
    // Assert
    expect(result).toContain('Test Product');
    expect(result).toContain('A product for testing');
    expect(result).toContain('test-product');
    expect(result).toContain('Small');
    expect(result).toContain('19.99');
    expect(result).toContain('TEST-S');
    expect(result).toContain('DENY');
  });

  /**
   * Test variant formatting
   * Verifies that product variant data is correctly formatted as a string
   */
  it('should format variant data correctly', () => {
    // Arrange
    const variant: ProductVariant = {
      id: 'gid://shopify/ProductVariant/789',
      title: 'Medium',
      price: '24.99',
      sku: 'TEST-M',
      availableForSale: true,
      inventoryPolicy: 'CONTINUE',
      selectedOptions: [
        { name: 'Size', value: 'M' }
      ],
      image: null
    };
    
    // Act
    const result = formatVariant(variant);
    
    // Assert
    expect(result).toContain('Medium');
    expect(result).toContain('gid://shopify/ProductVariant/789');
    expect(result).toContain('24.99');
    expect(result).toContain('TEST-M');
    expect(result).toContain('CONTINUE');
    expect(result).toContain('true');
  });

  /**
   * Test variant formatting with missing SKU
   * Verifies that null/undefined SKUs are handled correctly
   */
  it('should format variant with missing SKU as N/A', () => {
    // Arrange
    const variant: ProductVariant = {
      id: 'gid://shopify/ProductVariant/790',
      title: 'Large',
      price: '29.99',
      sku: '',
      availableForSale: false,
      inventoryPolicy: 'DENY',
      selectedOptions: [
        { name: 'Size', value: 'L' }
      ],
      image: null
    };
    
    // Act
    const result = formatVariant(variant);
    
    // Assert
    expect(result).toContain('N/A');
  });

  /**
   * Test order formatting
   * Verifies that order data is correctly formatted as a string
   */
  it('should format order data correctly', () => {
    // Arrange
    const order: ShopifyOrderGraphql = {
      id: 'gid://shopify/Order/12345',
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
        id: 'gid://shopify/Customer/789',
        email: 'customer@example.com'
      },
      shippingAddress: {
        provinceCode: 'CA',
        countryCode: 'US'
      },
      lineItems: {
        nodes: [
          {
            id: 'gid://shopify/LineItem/111',
            title: 'Test Product - Medium',
            quantity: 2,
            originalTotalSet: {
              shopMoney: { amount: '49.98', currencyCode: 'USD' }
            },
            variant: {
              id: 'gid://shopify/ProductVariant/789',
              title: 'Medium',
              price: '24.99',
              sku: 'TEST-M'
            }
          }
        ]
      }
    };
    
    // Act
    const result = formatOrder(order);
    
    // Assert
    expect(result).toContain('#1001');
    expect(result).toContain('gid://shopify/Order/12345');
    expect(result).toContain('2025-01-15T10:30:00Z');
    expect(result).toContain('PAID');
    expect(result).toContain('customer@example.com');
    expect(result).toContain('49.99 USD');
    expect(result).toContain('Test Product - Medium x2');
  });

  /**
   * Test order formatting with guest checkout
   * Verifies that orders with no customer information are formatted correctly
   */
  it('should format order with guest checkout correctly', () => {
    // Arrange
    const guestOrder: ShopifyOrderGraphql = {
      id: 'gid://shopify/Order/12346',
      name: '#1002',
      createdAt: '2025-01-16T12:30:00Z',
      displayFinancialStatus: 'PENDING',
      email: null,
      phone: null,
      totalPriceSet: {
        shopMoney: { amount: '29.99', currencyCode: 'USD' },
        presentmentMoney: { amount: '29.99', currencyCode: 'USD' }
      },
      customer: null,
      shippingAddress: null,
      lineItems: {
        nodes: [
          {
            id: 'gid://shopify/LineItem/112',
            title: 'Test Product - Large',
            quantity: 1,
            originalTotalSet: {
              shopMoney: { amount: '29.99', currencyCode: 'USD' }
            },
            variant: null
          }
        ]
      }
    };
    
    // Act
    const result = formatOrder(guestOrder);
    
    // Assert
    expect(result).toContain('#1002');
    expect(result).toContain('Guest checkout');
    expect(result).toContain('N/A');
  });
});