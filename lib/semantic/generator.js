const { ArchitectureSchema } = require('../core/schema');
const { LayoutEngine } = require('../core/layout');
const { ExcalidrawRenderer } = require('../core/renderer');

/**
 * Semantic Architecture Generator - Main orchestrator for the new pipeline
 * Natural Language -> Architecture DSL -> Layout -> Excalidraw Elements
 */

class SemanticArchitectureGenerator {
  constructor() {
    this.layoutEngine = new LayoutEngine();
    this.renderer = new ExcalidrawRenderer();
  }

  /**
   * Generate architecture diagram from semantic description
   * @param {Object} architectureDescription - Validated architecture DSL
   * @returns {Object} Excalidraw diagram data
   */
  async generateDiagram(architectureDescription) {
    try {
      console.log('Semantic Architecture Generator');
      console.log('===============================');
      
      // Step 1: Validate architecture description
      console.log('Step 1: Validating architecture description...');
      const validatedArchitecture = ArchitectureSchema.parse(architectureDescription);
      console.log(`✓ Validated ${validatedArchitecture.nodes.length} nodes, ${validatedArchitecture.connections.length} connections`);
      
      // Step 2: Generate layout
      console.log('Step 2: Generating layout...');
      const layout = this.layoutEngine.generateLayout(validatedArchitecture);
      console.log(`✓ Generated layout with bounds: ${layout.bounds.width}x${layout.bounds.height}`);
      
      // Step 3: Render to Excalidraw
      console.log('Step 3: Rendering to Excalidraw format...');
      const excalidrawData = this.renderer.render(layout);
      console.log(`✓ Generated ${excalidrawData.elements.length} Excalidraw elements`);
      
      return excalidrawData;
    } catch (error) {
      console.error('Error generating semantic architecture diagram:', error);
      throw error;
    }
  }

  /**
   * Generate diagram from example architecture patterns
   */
  async generateFromTemplate(templateName, params = {}) {
    const template = this.getTemplate(templateName);
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }
    
    const architectureDescription = template(params);
    return this.generateDiagram(architectureDescription);
  }

  /**
   * Get predefined architecture templates
   */
  getTemplate(templateName) {
    const templates = {
      'three-tier': (params) => ({
        nodes: [
          { id: 'user', type: 'actor', label: 'User' },
          { id: 'web', type: 'ui', label: params.frontend || 'Web App' },
          { id: 'api', type: 'service', label: params.backend || 'API Server' },
          { id: 'db', type: 'database', label: params.database || 'Database' }
        ],
        connections: [
          { from: 'user', to: 'web', type: 'http', label: 'Browse' },
          { from: 'web', to: 'api', type: 'http', label: 'API Calls' },
          { from: 'api', to: 'db', type: 'query', label: 'SQL' }
        ],
        groups: [
          { id: 'frontend', label: 'Frontend', contains: ['web'] },
          { id: 'backend', label: 'Backend', contains: ['api', 'db'] }
        ],
        layout: { type: 'hierarchical', direction: 'TB' }
      }),

      'microservices': (params) => ({
        nodes: [
          { id: 'user', type: 'actor', label: 'User' },
          { id: 'gateway', type: 'gateway', label: 'API Gateway' },
          { id: 'auth', type: 'service', label: 'Auth Service' },
          { id: 'user-service', type: 'service', label: 'User Service' },
          { id: 'order-service', type: 'service', label: 'Order Service' },
          { id: 'queue', type: 'queue', label: 'Message Queue' },
          { id: 'cache', type: 'cache', label: 'Redis' },
          { id: 'db1', type: 'database', label: 'User DB' },
          { id: 'db2', type: 'database', label: 'Order DB' }
        ],
        connections: [
          { from: 'user', to: 'gateway', type: 'http' },
          { from: 'gateway', to: 'auth', type: 'http' },
          { from: 'gateway', to: 'user-service', type: 'http' },
          { from: 'gateway', to: 'order-service', type: 'http' },
          { from: 'user-service', to: 'cache', type: 'query' },
          { from: 'user-service', to: 'db1', type: 'query' },
          { from: 'order-service', to: 'queue', type: 'async' },
          { from: 'order-service', to: 'db2', type: 'query' }
        ],
        groups: [
          { id: 'services', label: 'Microservices', contains: ['auth', 'user-service', 'order-service'] },
          { id: 'data', label: 'Data Layer', contains: ['cache', 'db1', 'db2'] }
        ],
        layout: { type: 'layered', direction: 'TB' }
      }),

      'event-driven': (params) => ({
        nodes: [
          { id: 'producer', type: 'service', label: 'Event Producer' },
          { id: 'broker', type: 'queue', label: 'Event Broker' },
          { id: 'consumer1', type: 'service', label: 'Consumer A' },
          { id: 'consumer2', type: 'service', label: 'Consumer B' },
          { id: 'store', type: 'database', label: 'Event Store' }
        ],
        connections: [
          { from: 'producer', to: 'broker', type: 'async', label: 'Publish' },
          { from: 'broker', to: 'consumer1', type: 'async', label: 'Subscribe' },
          { from: 'broker', to: 'consumer2', type: 'async', label: 'Subscribe' },
          { from: 'broker', to: 'store', type: 'data_flow', label: 'Persist' }
        ],
        layout: { type: 'hierarchical', direction: 'LR' }
      })
    };

    return templates[templateName];
  }

  /**
   * Get available template names
   */
  getAvailableTemplates() {
    return ['three-tier', 'microservices', 'event-driven'];
  }
}

module.exports = { SemanticArchitectureGenerator };
