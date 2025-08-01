const { executeArchitectureWorkflow } = require('./workflow/graph');


/**
 * Generates an architecture diagram using LangGraph workflow approach
 * @param {string} description - Natural language description of the architecture
 * @returns {Promise<Object>} - Excalidraw diagram data
 */
async function generateArchitectureDiagram(description) {
  return await executeArchitectureWorkflow(description);
}

module.exports = { 
  generateArchitectureDiagram,
};
