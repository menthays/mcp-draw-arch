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
  description: z.string().optional().nullable(),
  technologies: z.array(z.string()).optional().nullable().describe('Technology stack used in this component'),
  importance: z.number().optional().nullable().describe('Calculated importance score for layout'),
  metadata: z.record(z.any()).optional().nullable(), // Additional properties
  nodes: z.array(z.lazy(() => NodeSchema)).optional().nullable().describe('Sub-components for hierarchical structure'),
});

const ConnectionSchema = z.object({
  id: z.string().optional(),
  from: z.string(), // Node ID
  to: z.string(),   // Node ID
  type: ConnectionTypeSchema,
  label: z.string().nullable().optional(),
  bidirectional: z.boolean().optional().default(false)
});

const GroupSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(['layer', 'boundary', 'cluster']).optional().default('boundary'),
  nodes: z.array(NodeSchema), // Use full node objects instead of just IDs
});

const LLMAnalysisSchema = z.object({
  architectureType: z.string().describe('e.g., microservices, layered, event-driven, monolithic, serverless'),
  complexity: z.string().describe('e.g., simple, medium, complex'),
  domain: z.string().describe('e.g., web, mobile, data, ai, iot, blockchain')
});

const LLMComponentsSchema = z.object({
  rawComponents: z.array(z.string()).describe('List of component names as strings, extracted directly from the description'),
  nodes: z.array(NodeSchema.omit({ description: true, metadata: true, nodes: true })).describe('Array of structured component nodes')
});

const LLMRelationshipsSchema = z.object({
  rawRelationships: z.array(z.string()).describe('List of relationships described in natural language'),
  connections: z.array(ConnectionSchema.omit({ id: true, bidirectional: true })).describe('Array of structured connection objects')
});

const ArchitectureSchema = z.object({
  nodes: z.array(NodeSchema),
  connections: z.array(ConnectionSchema),
  groups: z.array(GroupSchema).optional().default([]), // Groups for logical layering
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
    height: 60
  },
  gateway: {
    shape: 'diamond',
    fillColor: '#e0f2f1',
    strokeColor: '#00796b',
    width: 140,
    height: 100
  },
  ui: {
    shape: 'rectangle',
    fillColor: '#e3f2fd',
    strokeColor: '#1976d2',
    width: 150,
    height: 90
  },
  external: {
    shape: 'rectangle',
    fillColor: '#f5f5f5',
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
    strokeStyle: 'solid',
    strokeColor: '#424242'
  },
  async: {
    strokeStyle: 'dashed',
    strokeColor: '#0277bd'
  },
  query: {
    strokeStyle: 'dotted',
    strokeColor: '#388e3c'
  },
  sync: {
    strokeStyle: 'solid',
    strokeColor: '#7b1fa2'
  },
  data_flow: {
    strokeStyle: 'solid',
    strokeColor: '#f57c00'
  },
  none: {
    strokeStyle: 'solid',
    strokeColor: '#9e9e9e'
  }
};

module.exports = { 
  ArchitectureSchema, 
  NodeSchema, 
  ConnectionSchema, 
  GroupSchema,
  NodeTypeSchema, 
  ConnectionTypeSchema,
  LLMAnalysisSchema,
  LLMComponentsSchema,
  LLMRelationshipsSchema,
  NODE_STYLES,
  CONNECTION_STYLES
};
