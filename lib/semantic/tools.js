const { z } = require('zod');
const { Tool } = require('@langchain/core/tools');
const { SemanticArchitectureGenerator } = require('./generator');
const { ArchitectureSchema } = require('../core/schema');

/**
 * Generate complete architecture diagram from semantic description
 */
class GenerateArchitectureTool extends Tool {
  constructor() {
    super();
    this.name = "generate_architecture";
    this.description = "Generate a complete architecture diagram from semantic description. Specify nodes, connections, and optional groups. Layout will be automatically calculated.";
    this.schema = ArchitectureSchema;
    this.generator = new SemanticArchitectureGenerator();
  }
  
  async _call(input) {
    console.log('Generating architecture from semantic description...');
    
    const excalidrawData = await this.generator.generateDiagram(input);
    
    // LangChain tools must return strings, so we return JSON string
    // but mark it clearly for extraction
    return JSON.stringify(excalidrawData);
  }
}

/**
 * Generate architecture from predefined templates
 */
class GenerateFromTemplateTool extends Tool {
  constructor() {
    super();
    this.name = "generate_from_template";
    this.description = "Generate architecture diagram from predefined template. Available templates: three-tier, microservices, event-driven. Params can customize labels.";
    this.schema = z.object({
      template: z.enum(['three-tier', 'microservices', 'event-driven']),
      params: z.record(z.string()).optional().default({})
    });
    this.generator = new SemanticArchitectureGenerator();
  }
  
  async _call(input) {
    console.log(`Generating architecture from template: ${input.template}`);
    
    const excalidrawData = await this.generator.generateFromTemplate(input.template, input.params);
    
    // LangChain tools must return strings, so we return JSON string
    // but mark it clearly for extraction
    return JSON.stringify(excalidrawData);
  }
}

/**
 * Describe available architecture components and options
 */
class DescribeArchitectureComponentsTool extends Tool {
  constructor() {
    super();
    this.name = "describe_architecture_components";
    this.description = "Get information about available node types, connection types, and layout options for architecture generation.";
    this.schema = z.object({
      query: z.string().optional()
    });
  }
  
  async _call(input) {
    const info = {
      nodeTypes: {
        actor: "User, external system - typically entry points",
        service: "API, microservice, application - business logic",
        database: "Database, storage - data persistence",
        queue: "Message queue, event bus - async communication",
        cache: "Redis, memcached - caching layer",
        gateway: "API gateway, load balancer - traffic management",
        ui: "Web UI, mobile app - user interface",
        external: "Third-party service - external dependencies"
      },
      connectionTypes: {
        http: "HTTP request/response - synchronous web communication",
        async: "Async message, event - asynchronous communication",
        query: "Database query - data access",
        sync: "Synchronous call - direct service communication",
        data_flow: "Data flow direction - information movement"
      },
      layoutTypes: {
        hierarchical: "Organizes nodes in layers based on dependencies",
        grid: "Arranges nodes in a regular grid pattern",
        layered: "Groups nodes by type into logical layers"
      },
      directions: {
        TB: "Top to Bottom",
        BT: "Bottom to Top", 
        LR: "Left to Right",
        RL: "Right to Left"
      },
      templates: ['three-tier', 'microservices', 'event-driven']
    };
    
    return JSON.stringify({ 
      success: true, 
      info,
      usage: "Use generate_architecture with nodes/connections arrays, or generate_from_template for quick starts"
    });
  }
}

module.exports = { 
  GenerateArchitectureTool, 
  GenerateFromTemplateTool, 
  DescribeArchitectureComponentsTool 
};
