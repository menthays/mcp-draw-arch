/**
 * Draw Architecture - Main Entry Point
 * Generate Excalidraw architecture diagrams from natural language or semantic descriptions
 */
const { 
  generateArchitectureDiagram,
  generateArchitectureDiagramSemantic,
  generateArchitectureDiagramFromTemplate
} = require('./lib/main');

const { SemanticArchitectureGenerator } = require('./lib/semantic/generator');
const { ArchitectureSchema } = require('./lib/core/schema');
const { convertToSvg } = require('./lib/core/svg');

module.exports = {
  // Main generation functions
  generateArchitectureDiagram,
  generateArchitectureDiagramSemantic,
  generateArchitectureDiagramFromTemplate,
  
  // Core classes for advanced usage
  SemanticArchitectureGenerator,
  ArchitectureSchema,
  
  // Utilities
  convertToSvg
};
