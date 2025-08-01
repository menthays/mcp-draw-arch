const { z } = require('zod');

/**
 * Architecture DSL Schema - Semantic description of architecture components
 * LLM generates this high-level structure, layout engine handles positioning
 */

const NodeTypeSchema = z.enum([
  'actor',      // User, external system
  'service',    // API, microservice, application
  'database',   // Database, storage
  'queue',      // Message queue, event bus
  'cache',      // Redis, memcached
  'gateway',    // API gateway, load balancer
  'ui',         // Web UI, mobile app
  'external'    // Third-party service
]);

const ConnectionTypeSchema = z.enum([
  'http',       // HTTP request/response
  'async',      // Async message, event
  'query',      // Database query
  'sync',       // Synchronous call
  'data_flow',  // Data flow direction
  'none'        // Simple connection, no specific type
]);

const NodeSchema = z.object({
  id: z.string(),
  type: NodeTypeSchema,
  label: z.string(),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional() // Additional properties
});

const ConnectionSchema = z.object({
  id: z.string().optional(),
  from: z.string(), // Node ID
  to: z.string(),   // Node ID
  type: ConnectionTypeSchema,
  label: z.string().optional(),
  bidirectional: z.boolean().optional().default(false)
});

const GroupSchema = z.object({
  id: z.string(),
  label: z.string(),
  contains: z.array(z.string()), // Node IDs
  type: z.enum(['layer', 'boundary', 'cluster']).optional().default('boundary')
});

const ArchitectureSchema = z.object({
  nodes: z.array(NodeSchema),
  connections: z.array(ConnectionSchema),
  groups: z.array(GroupSchema).optional().default([]),
  layout: z.object({
    type: z.enum(['hierarchical', 'grid', 'force', 'layered']).optional().default('hierarchical'),
    direction: z.enum(['TB', 'BT', 'LR', 'RL']).optional().default('TB'), // Top-Bottom, Left-Right etc
    spacing: z.object({
      node: z.number().optional().default(80),
      rank: z.number().optional().default(100)
    }).optional()
  }).optional()
});

/**
 * Node type to visual style mapping
 */
const NODE_STYLES = {
  actor: {
    shape: 'ellipse',
    fillColor: '#e1f5fe',
    strokeColor: '#0277bd',
    width: 120,
    height: 80
  },
  service: {
    shape: 'rectangle',
    fillColor: '#f3e5f5',
    strokeColor: '#7b1fa2',
    width: 140,
    height: 80
  },
  database: {
    shape: 'rectangle', // Could be custom cylinder shape
    fillColor: '#e8f5e8',
    strokeColor: '#388e3c',
    width: 120,
    height: 80
  },
  queue: {
    shape: 'rectangle',
    fillColor: '#fff3e0',
    strokeColor: '#f57c00',
    width: 130,
    height: 70
  },
  cache: {
    shape: 'rectangle',
    fillColor: '#fce4ec',
    strokeColor: '#c2185b',
    width: 110,
    height: 70
  },
  gateway: {
    shape: 'diamond',
    fillColor: '#f1f8e9',
    strokeColor: '#689f38',
    width: 100,
    height: 100
  },
  ui: {
    shape: 'rectangle',
    fillColor: '#e3f2fd',
    strokeColor: '#1976d2',
    width: 130,
    height: 80
  },
  external: {
    shape: 'rectangle',
    fillColor: '#fafafa',
    strokeColor: '#616161',
    width: 120,
    height: 80
  }
};

/**
 * Connection type to visual style mapping
 */
const CONNECTION_STYLES = {
  http: {
    strokeColor: '#1976d2',
    strokeStyle: 'solid',
    arrowType: 'arrow'
  },
  async: {
    strokeColor: '#f57c00',
    strokeStyle: 'dashed',
    arrowType: 'arrow'
  },
  query: {
    strokeColor: '#388e3c',
    strokeStyle: 'solid',
    arrowType: 'arrow'
  },
  sync: {
    strokeColor: '#7b1fa2',
    strokeStyle: 'solid',
    arrowType: 'arrow'
  },
  data_flow: {
    strokeColor: '#616161',
    strokeStyle: 'dotted',
    arrowType: 'arrow'
  }
};

module.exports = {
  ArchitectureSchema,
  NodeSchema,
  ConnectionSchema,
  GroupSchema,
  NodeTypeSchema,
  ConnectionTypeSchema,
  NODE_STYLES,
  CONNECTION_STYLES
};
