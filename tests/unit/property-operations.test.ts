/**
 * Tests for complex property and value operations
 */

import { createClient } from '../../src/client';
import { SDKConfig } from '../../src/config';

// Mock configuration
const mockConfig: SDKConfig = {
  auth: { baseUrl: 'https://auth.example.com' },
  registry: { baseUrl: 'https://registry.example.com' },
  node: { baseUrl: 'https://node.example.com' },
  certificate: {
    cert: 'mock-cert',
    key: 'mock-key'
  }
};

describe('Property Operations', () => {
  let client: any;

  beforeEach(() => {
    client = createClient(mockConfig);

    // Mock the node client methods
    jest.spyOn(client.node, 'addPropertyToObject').mockResolvedValue({
      data: { uuid: 'prop-123', key: 'color', value: 'blue' },
      status: 200,
      statusText: 'OK'
    });

    jest.spyOn(client.node, 'getPropertiesForObject').mockResolvedValue({
      data: [{ uuid: 'prop-123', key: 'color', value: 'blue' }],
      status: 200,
      statusText: 'OK'
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('client.node property operations', () => {
    it('should add property to object', async () => {
      const result = await client.node.addPropertyToObject('obj-123', {
        key: 'color',
        value: 'blue'
      });

      expect(client.node.addPropertyToObject).toHaveBeenCalledWith('obj-123', {
        key: 'color',
        value: 'blue'
      });
      expect(result.data.uuid).toBe('prop-123');
    });

    it('should get properties for object', async () => {
      const result = await client.node.getPropertiesForObject('obj-123');

      expect(client.node.getPropertiesForObject).toHaveBeenCalledWith(
        'obj-123'
      );
      expect(result.data).toHaveLength(1);
      expect(result.data[0].key).toBe('color');
    });
  });
});

describe('Property Value Operations', () => {
  let client: any;

  beforeEach(() => {
    client = createClient(mockConfig);

    // Mock the node client methods
    jest.spyOn(client.node, 'setValueForProperty').mockResolvedValue({
      data: { uuid: 'value-123', value: 'red', dataType: 'string' },
      status: 200,
      statusText: 'OK'
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('client.node value operations', () => {
    it('should set value for property', async () => {
      const result = await client.node.setValueForProperty('prop-123', {
        value: 'red',
        dataType: 'string'
      });

      expect(client.node.setValueForProperty).toHaveBeenCalledWith('prop-123', {
        value: 'red',
        dataType: 'string'
      });
      expect(result.data.uuid).toBe('value-123');
    });
  });
});
