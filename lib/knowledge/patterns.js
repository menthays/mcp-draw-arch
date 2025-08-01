/**
 * Domain-Specific Knowledge Base for Architecture Patterns
 * 
 * This file contains structured information about common software architecture patterns.
 * It's used by the semantic engine to:
 * 1. Identify the most likely architecture pattern from a user's description.
 * 2. Infer and add missing but essential components (component completion).
 * 3. Establish default relationships between components.
 * 4. Provide metadata for layout and rendering decisions.
 */

const BI_SYSTEM_PATTERN = {
  name: 'BI System',
  type: 'bi-system',
  description: 'A standard Business Intelligence architecture for data analysis and reporting.',
  keywords: ['bi', 'business intelligence', 'data warehouse', 'dashboard', 'reporting', 'analytics'],
  
  // Defines the layers and their vertical order
  layers: [
    { id: 'source', name: 'Data Sources', rank: 0 },
    { id: 'integration', name: 'Integration', rank: 1 },
    { id: 'storage', name: 'Storage', rank: 2 },
    { id: 'processing', name: 'Processing', rank: 3 },
    { id: 'presentation', name: 'Presentation', rank: 4 },
  ],

  // Defines all possible components within this pattern
  components: {
    // --- Data Sources ---
    'mysql': { name: 'MySQL', type: 'database', layer: 'source', keywords: ['mysql', 'sql', 'relational'] },
    'postgres': { name: 'PostgreSQL', type: 'database', layer: 'source', keywords: ['postgres', 'postgresql', 'sql'] },
    'mongodb': { name: 'MongoDB', type: 'database', layer: 'source', keywords: ['mongodb', 'nosql', 'document'] },
    'kafka': { name: 'Kafka', type: 'queue', layer: 'source', keywords: ['kafka', 'stream', 'events', 'real-time'] },
    'rest-api': { name: 'REST API', type: 'external', layer: 'source', keywords: ['api', 'rest', 'third-party'] },
    'file-system': { name: 'File System', type: 'database', layer: 'source', keywords: ['files', 'csv', 'json', 's3', 'gcs'] },

    // --- Integration ---
    'etl': { name: 'ETL / ELT', type: 'service', layer: 'integration', keywords: ['etl', 'elt', 'talend', 'informatica', 'data integration', 'data pipeline'] },
    'quality': { name: 'Data Quality', type: 'service', layer: 'integration', keywords: ['quality', 'validation', 'dq'] },
    'metadata': { name: 'Metadata Mgmt', type: 'service', layer: 'integration', keywords: ['metadata', 'catalog', 'governance'] },

    // --- Storage ---
    'dwh': { name: 'Data Warehouse', type: 'database', layer: 'storage', keywords: ['dwh', 'warehouse', 'redshift', 'bigquery', 'snowflake'] },
    'datalake': { name: 'Data Lake', type: 'database', layer: 'storage', keywords: ['lake', 'datalake', 's3', 'hdfs'] },
    'olap': { name: 'OLAP Cube', type: 'database', layer: 'storage', keywords: ['olap', 'cube', 'analysis services'] },

    // --- Processing ---
    'reporting': { name: 'Reporting Engine', type: 'service', layer: 'processing', keywords: ['reporting', 'reports', 'cognos'] },
    'realtime': { name: 'Real-time Compute', type: 'service', layer: 'processing', keywords: ['real-time', 'spark streaming', 'flink'] },
    'mining': { name: 'Data Mining', type: 'service', layer: 'processing', keywords: ['mining', 'machine learning', 'ml'] },

    // --- Presentation ---
    'dashboard': { name: 'Dashboard', type: 'ui', layer: 'presentation', keywords: ['dashboard', 'tableau', 'powerbi', 'visualization', 'charts'] },
    'self-service': { name: 'Self-service BI', type: 'ui', layer: 'presentation', keywords: ['self-service', 'ad-hoc analysis'] },
  },

  // Defines the core components that should almost always be present
  coreComponents: ['etl', 'dwh', 'dashboard'],

  // Defines default connections to draw if components are present
  defaultConnections: [
    { fromLayer: 'source', to: 'etl', type: 'data_flow' },
    { from: 'etl', to: 'dwh', type: 'data_flow' },
    { from: 'etl', to: 'datalake', type: 'data_flow' },
    { from: 'dwh', to: 'olap', type: 'query' },
    { from: 'dwh', to: 'reporting', type: 'query' },
    { from: 'datalake', to: 'mining', type: 'query' },
    { from: 'reporting', to: 'dashboard', type: 'http' },
    { from: 'olap', to: 'self-service', type: 'http' },
  ]
};

const THREE_TIER_PATTERN = {
  name: 'Three-Tier',
  type: 'three-tier',
  description: 'A classic architecture separating presentation, logic, and data layers.',
  keywords: ['3-tier', 'three-tier', 'frontend', 'backend', 'database'],
  layers: [
    { id: 'presentation', name: 'Presentation Tier', rank: 0 },
    { id: 'logic', name: 'Logic Tier', rank: 1 },
    { id: 'data', name: 'Data Tier', rank: 2 },
  ],
  components: {
    'user': { name: 'User', type: 'actor', layer: 'presentation', keywords: ['user', 'client', 'actor'] },
    'browser': { name: 'Web Browser', type: 'ui', layer: 'presentation', keywords: ['browser', 'frontend', 'react', 'vue', 'angular'] },
    'api-server': { name: 'API Server', type: 'service', layer: 'logic', keywords: ['api', 'backend', 'server', 'node.js', 'java', 'python'] },
    'database': { name: 'Database', type: 'database', layer: 'data', keywords: ['db', 'database', 'mysql', 'postgres', 'mongodb'] },
    'cache': { name: 'Cache', type: 'cache', layer: 'data', keywords: ['cache', 'redis', 'memcached'] },
  },
  coreComponents: ['browser', 'api-server', 'database'],
  defaultConnections: [
    { from: 'user', to: 'browser', type: 'http' },
    { from: 'browser', to: 'api-server', type: 'http', label: 'API Calls' },
    { from: 'api-server', to: 'database', type: 'query' },
    { from: 'api-server', to: 'cache', type: 'query' },
  ]
};


const ARCHITECTURE_PATTERNS = {
  'bi-system': BI_SYSTEM_PATTERN,
  'three-tier': THREE_TIER_PATTERN,
};

module.exports = { ARCHITECTURE_PATTERNS };
