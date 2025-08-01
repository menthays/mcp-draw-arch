const { executeArchitectureWorkflow } = require('./workflow/graph');
const { SemanticArchitectureGenerator } = require('./semantic/generator');


/**
 * Generates an architecture diagram using LangGraph workflow approach
 * @param {string} description - Natural language description of the architecture
 * @returns {Promise<Object>} - Excalidraw diagram data
 */
async function generateArchitectureDiagram(description) {
  return await executeArchitectureWorkflow(description);
}

/**
 * Generates an architecture diagram using semantic DSL approach (RECOMMENDED)
 * @param {Object} architectureDescription - Semantic architecture description
 * @returns {Promise<Object>} - Excalidraw diagram data
 */
async function generateArchitectureDiagramSemantic(architectureDescription) {
  console.log('Semantic Architecture Generator');
  console.log('==============================');
  console.log('Generating architecture diagram from semantic description');
  
  try {
    const generator = new SemanticArchitectureGenerator();
    return await generator.generateDiagram(architectureDescription);
  } catch (error) {
    console.error('Error generating semantic diagram:', error);
    throw error;
  }
}

/**
 * Generates an architecture diagram from template (QUICK START)
 * @param {string} templateName - Template name (three-tier, microservices, event-driven)
 * @param {Object} params - Template parameters
 * @returns {Promise<Object>} - Excalidraw diagram data
 */
async function generateArchitectureDiagramFromTemplate(templateName, params = {}) {
  console.log('Template Architecture Generator');
  console.log('===============================');
  console.log(`Generating architecture diagram from template: ${templateName}`);
  
  try {
    const generator = new SemanticArchitectureGenerator();
    return await generator.generateFromTemplate(templateName, params);
  } catch (error) {
    console.error('Error generating template diagram:', error);
    throw error;
  }
}

module.exports = { 
  generateArchitectureDiagram,
  generateArchitectureDiagramSemantic,
  generateArchitectureDiagramFromTemplate
};
