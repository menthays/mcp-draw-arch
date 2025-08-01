const { z } = require('zod');
const { NodeSchema, ConnectionSchema } = require('../core/schema');

/**
 * Workflow state schema for architecture diagram generation
 */
const WorkflowStateSchema = z.object({
  // Input
  description: z.string().describe("Natural language description of the architecture"),
  
  // Analysis results
  architectureType: z.string().optional().describe("Detected architecture type (microservices, layered, event-driven, etc.)"),
  complexity: z.enum(['simple', 'medium', 'complex']).optional().describe("Architecture complexity level"),
  domain: z.string().optional().describe("Application domain (web, mobile, data, ai, etc.)"),
  
  // Component identification
  rawComponents: z.array(z.string()).optional().describe("Raw list of identified components"),
  nodes: z.array(NodeSchema).optional().describe("Structured node definitions"),
  
  // Relationship analysis
  rawRelationships: z.array(z.string()).optional().describe("Raw list of identified relationships"),
  connections: z.array(ConnectionSchema).optional().describe("Structured connection definitions"),
  
  // Layout configuration
  layoutStrategy: z.string().optional().describe("Selected layout strategy"),
  layoutConfig: z.record(z.any()).optional().describe("Layout-specific configuration"),
  
  // Final outputs
  semanticDSL: z.object({
    nodes: z.array(z.any()),
    connections: z.array(z.any()),
    groups: z.array(z.any()).optional(),
    layout: z.record(z.any())
  }).optional().describe("Generated semantic DSL"),
  
  excalidrawData: z.record(z.any()).optional().describe("Final Excalidraw diagram data"),
  
  // Workflow control
  currentStep: z.string().optional().describe("Current workflow step"),
  errors: z.array(z.string()).optional().describe("Accumulated errors"),
  retryCount: z.number().default(0).describe("Number of retries for current step")
});

/**
 * Initial state factory
 */
function createInitialState(description) {
  return {
    description,
    currentStep: 'analyze_architecture',
    errors: [],
    retryCount: 0
  };
}

/**
 * State update helpers
 */
const StateUpdaters = {
  setArchitectureAnalysis: (state, { architectureType, complexity, domain }) => ({
    ...state,
    architectureType,
    complexity,
    domain,
    currentStep: 'identify_components'
  }),
  
  setComponents: (state, { rawComponents, nodes }) => ({
    ...state,
    rawComponents,
    nodes,
    currentStep: 'analyze_relationships'
  }),
  
  setRelationships: (state, { rawRelationships, connections }) => ({
    ...state,
    rawRelationships,
    connections,
    currentStep: 'select_layout'
  }),
  
  setLayout: (state, { layoutStrategy, layoutConfig }) => ({
    ...state,
    layoutStrategy,
    layoutConfig,
    currentStep: 'generate_dsl'
  }),
  
  setSemanticDSL: (state, { semanticDSL }) => ({
    ...state,
    semanticDSL,
    currentStep: 'render_diagram'
  }),
  
  setFinalResult: (state, { excalidrawData }) => ({
    ...state,
    excalidrawData,
    currentStep: 'completed'
  }),
  
  addError: (state, error) => ({
    ...state,
    errors: [...(state.errors || []), error],
    retryCount: state.retryCount + 1
  }),
  
  resetRetry: (state) => ({
    ...state,
    retryCount: 0
  })
};

module.exports = {
  WorkflowStateSchema,
  createInitialState,
  StateUpdaters
};
