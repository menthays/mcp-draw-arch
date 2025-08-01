const { ChatOpenAI } = require('@langchain/openai');
const { LLMAnalysisSchema, LLMComponentsSchema, LLMRelationshipsSchema } = require('../core/schema');

/**
 * Initialize LLM for workflow nodes
 */
const llm = new ChatOpenAI({
  apiKey: process.env['API_KEY'],
  configuration: {
    baseURL: process.env['BASE_URL'],
  },
  model: process.env['MODEL'],
  temperature: 0.7,
});

/**
 * Architecture analysis node
 * Analyzes the input description to determine architecture type, complexity, and domain
 */
async function analyzeArchitecture(state) {
  console.log('🔍 Analyzing architecture type and complexity...');

  const structuredLlm = llm.withStructuredOutput(LLMAnalysisSchema);

  const prompt = `Analyze this architecture description and identify its type, complexity, and domain.

Description: "${state.description}"`;

  try {
    const analysis = await structuredLlm.invoke(prompt);
    console.log('Parsed LLM response:', analysis);
    
    // Validate required fields
    if (!analysis.architectureType || !analysis.complexity || !analysis.domain) {
      throw new Error('Missing required fields in analysis result');
    }
    
    console.log(`✓ Detected: ${analysis.architectureType} (${analysis.complexity}) in ${analysis.domain} domain`);
    
    return {
      ...state,
      architectureType: analysis.architectureType,
      complexity: analysis.complexity,
      domain: analysis.domain,
      currentStep: 'identify_components',
      errors: [],
      retryCount: 0
    };
  } catch (error) {
    console.error('❌ Architecture analysis failed:', error.message);
    return {
      ...state,
      errors: [...(state.errors || []), `Architecture analysis failed: ${error.message}`],
      retryCount: (state.retryCount || 0) + 1
    };
  }
}

/**
 * Component identification node
 * Identifies all components/services in the architecture
 */
async function identifyComponents(state) {
  console.log('🔧 Identifying architecture components...');

  const structuredLlm = llm.withStructuredOutput(LLMComponentsSchema);

  const architectureContext = state.architectureType ? 
    `This is a ${state.architectureType} architecture in the ${state.domain} domain.` : '';

  const prompt = `${architectureContext}

Identify all components/services in this architecture description:
"${state.description}"

Component type guidelines:
- actor: Users, external systems, clients
- service: APIs, microservices, business logic
- database: SQL/NoSQL databases, data stores
- queue: Message queues, event buses
- cache: Redis, memcached, caching layers
- gateway: API gateways, load balancers
- ui: Web frontends, mobile apps
- external: Third-party services, external APIs`;

  try {
    const components = await structuredLlm.invoke(prompt);
    
    console.log(`✓ Identified ${components.nodes.length} components`);
    
    return {
      ...state,
      rawComponents: components.rawComponents || [],
      nodes: components.nodes || [],
      connections: [], // Initialize connections to avoid errors when skipping relationship analysis
      currentStep: 'analyze_relationships',
      errors: [],
      retryCount: 0
    };
  } catch (error) {
    console.error('❌ Component identification failed:', error.message);
    return {
      ...state,
      errors: [...(state.errors || []), `Component identification failed: ${error.message}`],
      retryCount: (state.retryCount || 0) + 1
    };
  }
}

/**
 * Relationship analysis node
 * Analyzes relationships and connections between components
 */
async function analyzeRelationships(state) {
  console.log('🔗 Analyzing component relationships...');

  const structuredLlm = llm.withStructuredOutput(LLMRelationshipsSchema);

  const componentList = state.nodes.map(n => `${n.id} (${n.label})`).join(', ');
  
  const prompt = `Analyze the relationships between these components based on the original description.

Components: ${componentList}
Original description: "${state.description}"

Connection type guidelines:
- http: REST APIs, HTTP requests
- async: Message queues, events, pub/sub
- query: Database queries, data access
- sync: Direct service calls, RPC
- data_flow: Data pipelines, ETL processes

Labeling guidelines: Keep labels VERY concise (max 15 chars). Use symbols like '→' where appropriate. Examples: 'API Call', 'DB Query', 'Events →', 'Auth'.`;

  try {
    const relationships = await structuredLlm.invoke(prompt);
    
    console.log(`✓ Identified ${relationships.connections ? relationships.connections.length : relationships.length} connections`);
    
    return {
      ...state,
      rawRelationships: relationships.rawRelationships || [],
      connections: relationships.connections || [],
      currentStep: 'select_layout',
      errors: [],
      retryCount: 0
    };
  } catch (error) {
    console.error('❌ Relationship analysis failed:', error.message);
    return {
      ...state,
      errors: [...(state.errors || []), `Relationship analysis failed: ${error.message}`],
      retryCount: (state.retryCount || 0) + 1
    };
  }
}

/**
 * Layout selection node
 * Selects the best layout strategy based on architecture characteristics
 */
async function selectLayout(state) {
  console.log('📐 Selecting optimal layout strategy...');
  
  const nodeCount = state.nodes.length;
  const connectionCount = state.connections.length;
  
  // Rule-based layout selection
  let layoutStrategy = 'hierarchical';
  let layoutConfig = { direction: 'TB', spacing: { node: 100, rank: 120 } };
  
  if (state.architectureType === 'microservices' && nodeCount > 8) {
    layoutStrategy = 'grid';
    layoutConfig = { columns: Math.ceil(Math.sqrt(nodeCount)), spacing: 120 };
  } else if (state.architectureType === 'layered') {
    layoutStrategy = 'layered';
    layoutConfig = { direction: 'TB', layers: 'auto', spacing: { node: 100, layer: 150 } };
  } else if (connectionCount > nodeCount * 1.5) {
    // High connectivity - use grid for clarity
    layoutStrategy = 'grid';
    layoutConfig = { columns: Math.ceil(nodeCount / 3), spacing: { node: 100, rank: 100 } };
  }
  
  console.log(`✓ Selected ${layoutStrategy} layout`);
  
  return {
    ...state,
    layoutStrategy,
    layoutConfig,
    currentStep: 'generate_dsl',
    errors: [],
    retryCount: 0
  };
}

/**
 * DSL generation node
 * Generates the final semantic DSL from analyzed components and relationships
 */
async function generateDSL(state) {
  console.log('📝 Generating semantic DSL...');
  
  const semanticDSL = {
    nodes: state.nodes,
    connections: state.connections,
    layout: {
      type: state.layoutStrategy,
      ...state.layoutConfig
    }
  };
  
  // Add groups if applicable
  if (state.architectureType === 'microservices') {
    const serviceNodes = state.nodes.filter(n => n.type === 'service').map(n => n.id);
    if (serviceNodes.length > 2) {
      semanticDSL.groups = [{
        id: 'services',
        label: 'Microservices',
        contains: serviceNodes,
        type: 'cluster'
      }];
    }
  }
  
  console.log('✓ Generated semantic DSL');
  
  return {
    ...state,
    semanticDSL,
    currentStep: 'render_diagram',
    errors: [],
    retryCount: 0
  };
}

/**
 * Diagram rendering node
 * Renders the final Excalidraw diagram using existing semantic generator
 */
async function renderDiagram(state) {
  console.log('🎨 Rendering Excalidraw diagram...');
  
  try {
    const { SemanticArchitectureGenerator } = require('../semantic/generator');
    const generator = new SemanticArchitectureGenerator();
    
    const excalidrawData = await generator.generateDiagram(state.semanticDSL);
    
    console.log(`✓ Generated diagram with ${excalidrawData.elements.length} elements`);
    
    return {
      ...state,
      excalidrawData,
      currentStep: 'completed',
      errors: [],
      retryCount: 0
    };
  } catch (error) {
    console.error('❌ Diagram rendering failed:', error.message);
    return {
      ...state,
      errors: [...(state.errors || []), `Diagram rendering failed: ${error.message}`],
      retryCount: (state.retryCount || 0) + 1
    };
  }
}

/**
 * Error handling node
 * Handles errors and determines retry strategy
 */
async function handleError(state) {
  console.log('⚠️ Handling workflow error...');
  console.log('Current errors:', state.errors);
  console.log('Retry count:', state.retryCount);
  
  const maxRetries = 3;
  if (state.retryCount >= maxRetries) {
    throw new Error(`Workflow failed after ${maxRetries} retries. Errors: ${state.errors?.join(', ') || 'Unknown errors'}`);
  }
  
  console.log(`Retrying step: ${state.currentStep} (attempt ${state.retryCount + 1})`);
  
  // Clear errors for retry and increment retry count
  return {
    ...state,
    errors: [], // Clear errors for fresh retry
    retryCount: state.retryCount + 1
  };
}

module.exports = {
  analyzeArchitecture,
  identifyComponents,
  analyzeRelationships,
  selectLayout,
  generateDSL,
  renderDiagram,
  handleError
};
