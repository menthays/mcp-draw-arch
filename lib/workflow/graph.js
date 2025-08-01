const { StateGraph, END, START } = require('@langchain/langgraph');
const { WorkflowStateSchema, createInitialState } = require('./state');
const {
  analyzeArchitecture,
  identifyComponents,
  analyzeRelationships,
  selectLayout,
  generateDSL,
  renderDiagram,
  handleError
} = require('./nodes');

/**
 * Workflow routing functions
 */
function routeAfterAnalysis(state) {
  if (state.errors && state.errors.length > 0) {
    return 'handle_error';
  }
  if (!state.architectureType) {
    return 'handle_error';
  }
  return 'identify_components';
}

function routeAfterComponents(state) {
  if (state.errors && state.errors.length > 0) {
    return 'handle_error';
  }
  if (!state.nodes || state.nodes.length === 0) {
    return 'handle_error';
  }
  // Skip relationship analysis for now
  return 'select_layout';
}

function routeAfterRelationships(state) {
  if (state.errors && state.errors.length > 0) {
    return 'handle_error';
  }
  if (!state.connections) {
    return 'handle_error';
  }
  return 'select_layout';
}

function routeAfterLayout(state) {
  if (state.errors && state.errors.length > 0) {
    return 'handle_error';
  }
  if (!state.layoutStrategy) {
    return 'handle_error';
  }
  return 'generate_dsl';
}

function routeAfterDSL(state) {
  if (state.errors && state.errors.length > 0) {
    return 'handle_error';
  }
  if (!state.semanticDSL) {
    return 'handle_error';
  }
  return 'render_diagram';
}

function routeAfterRender(state) {
  if (state.errors && state.errors.length > 0) {
    return 'handle_error';
  }
  if (!state.excalidrawData) {
    return 'handle_error';
  }
  return END;
}

function routeAfterError(state) {
  const maxRetries = 3;
  if (state.retryCount >= maxRetries) {
    throw new Error(`Workflow failed after ${maxRetries} retries`);
  }
  
  // Route back to the current step for retry (errors are cleared in handleError)
  return state.currentStep || 'analyze_architecture';
}

/**
 * Create the workflow graph
 */
function createWorkflowGraph() {
  // Use WorkflowStateSchema from state.js for LangGraph state definition
  const workflow = new StateGraph({
    channels: WorkflowStateSchema.shape
  });

  // Add nodes
  workflow.addNode('analyze_architecture', analyzeArchitecture);
  workflow.addNode('identify_components', identifyComponents);
  workflow.addNode('analyze_relationships', analyzeRelationships);
  workflow.addNode('select_layout', selectLayout);
  workflow.addNode('generate_dsl', generateDSL);
  workflow.addNode('render_diagram', renderDiagram);
  workflow.addNode('handle_error', handleError);

  // Set entry point
  workflow.addEdge(START, 'analyze_architecture');

  // Add conditional edges
  workflow.addConditionalEdges('analyze_architecture', routeAfterAnalysis);
  workflow.addConditionalEdges('identify_components', routeAfterComponents);
  workflow.addConditionalEdges('analyze_relationships', routeAfterRelationships);
  workflow.addConditionalEdges('select_layout', routeAfterLayout);
  workflow.addConditionalEdges('generate_dsl', routeAfterDSL);
  workflow.addConditionalEdges('render_diagram', routeAfterRender);
  workflow.addConditionalEdges('handle_error', routeAfterError);

  // Compile workflow with increased recursion limit for complex diagrams
  return workflow.compile({
    recursionLimit: 50 // Increase recursion limit
  });
}

/**
 * Main workflow execution function
 */
/**
 * Main workflow execution function
 * @param {string} description - Natural language description of the architecture
 * @returns {Object} Excalidraw diagram data
 */
async function executeArchitectureWorkflow(description) {
  console.log('🚀 Starting Architecture Generation Workflow');
  console.log('============================================');
  console.log(`Input: ${description}`);
  console.log('');

  const workflow = createWorkflowGraph();
  const initialState = createInitialState(description);

  try {
    const result = await workflow.invoke(initialState);
    
    if (result.excalidrawData) {
      console.log('');
      console.log('✅ Workflow completed successfully!');
      console.log(`📊 Generated diagram with ${result.excalidrawData.elements.length} elements`);
      console.log(`🏗️ Architecture: ${result.architectureType} (${result.complexity})`);
      console.log(`🎯 Domain: ${result.domain}`);
      console.log(`📐 Layout: ${result.layoutStrategy}`);
      console.log(`🔧 Components: ${result.nodes.length} nodes, ${result.connections.length} connections`);
      
      return result.excalidrawData;
    } else {
      throw new Error('Workflow completed but no diagram was generated');
    }
  } catch (error) {
    console.error('');
    console.error('❌ Workflow failed:', error.message);
    throw error;
  }
}

/**
 * Workflow with streaming support (for future use)
 */
/**
 * Workflow with streaming support (for future use)
 * @param {string} description - Natural language description of the architecture
 * @returns {AsyncGenerator} Stream of workflow states
 */
async function* streamArchitectureWorkflow(description) {
  console.log('🚀 Starting Architecture Generation Workflow (Streaming)');
  
  const workflow = createWorkflowGraph();
  const initialState = createInitialState(description);

  for await (const step of workflow.stream(initialState)) {
    yield {
      step: step.currentStep,
      state: step,
      completed: step.currentStep === 'completed'
    };
  }
}

module.exports = {
  createWorkflowGraph,
  executeArchitectureWorkflow,
  streamArchitectureWorkflow
};
