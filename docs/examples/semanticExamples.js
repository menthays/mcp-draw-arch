const { SemanticArchitectureGenerator } = require('../src/semanticArchitectureGenerator');

/**
 * Examples demonstrating the new semantic architecture generation approach
 */

async function runExamples() {
  const generator = new SemanticArchitectureGenerator();
  
  console.log('=== Semantic Architecture Generation Examples ===\n');
  
  // Example 1: Simple three-tier architecture
  console.log('1. Three-tier Architecture Example:');
  const threeTierArch = {
    nodes: [
      { id: 'user', type: 'actor', label: 'User' },
      { id: 'web', type: 'ui', label: 'Web Application' },
      { id: 'api', type: 'service', label: 'API Server' },
      { id: 'db', type: 'database', label: 'PostgreSQL' }
    ],
    connections: [
      { from: 'user', to: 'web', type: 'http', label: 'Browse' },
      { from: 'web', to: 'api', type: 'http', label: 'REST API' },
      { from: 'api', to: 'db', type: 'query', label: 'SQL Queries' }
    ],
    groups: [
      { id: 'frontend', label: 'Frontend Layer', contains: ['web'] },
      { id: 'backend', label: 'Backend Layer', contains: ['api', 'db'] }
    ],
    layout: { type: 'hierarchical', direction: 'TB' }
  };
  
  try {
    const result1 = await generator.generateDiagram(threeTierArch);
    console.log(`✓ Generated diagram with ${result1.elements.length} elements\n`);
  } catch (error) {
    console.error('✗ Error:', error.message, '\n');
  }
  
  // Example 2: Microservices architecture using template
  console.log('2. Microservices Template Example:');
  try {
    const result2 = await generator.generateFromTemplate('microservices', {
      frontend: 'React App',
      backend: 'Node.js Services',
      database: 'MongoDB'
    });
    console.log(`✓ Generated microservices template with ${result2.elements.length} elements\n`);
  } catch (error) {
    console.error('✗ Error:', error.message, '\n');
  }
  
  // Example 3: Event-driven architecture
  console.log('3. Event-driven Architecture Example:');
  const eventDrivenArch = {
    nodes: [
      { id: 'order-service', type: 'service', label: 'Order Service' },
      { id: 'payment-service', type: 'service', label: 'Payment Service' },
      { id: 'inventory-service', type: 'service', label: 'Inventory Service' },
      { id: 'event-bus', type: 'queue', label: 'Event Bus' },
      { id: 'notification-service', type: 'service', label: 'Notification Service' },
      { id: 'email-gateway', type: 'external', label: 'Email Gateway' }
    ],
    connections: [
      { from: 'order-service', to: 'event-bus', type: 'async', label: 'Order Created' },
      { from: 'event-bus', to: 'payment-service', type: 'async', label: 'Process Payment' },
      { from: 'event-bus', to: 'inventory-service', type: 'async', label: 'Update Stock' },
      { from: 'event-bus', to: 'notification-service', type: 'async', label: 'Send Notification' },
      { from: 'notification-service', to: 'email-gateway', type: 'http', label: 'Email API' }
    ],
    layout: { type: 'hierarchical', direction: 'LR' }
  };
  
  try {
    const result3 = await generator.generateDiagram(eventDrivenArch);
    console.log(`✓ Generated event-driven architecture with ${result3.elements.length} elements\n`);
  } catch (error) {
    console.error('✗ Error:', error.message, '\n');
  }
  
  // Example 4: Complex layered architecture
  console.log('4. Complex Layered Architecture Example:');
  const layeredArch = {
    nodes: [
      { id: 'mobile', type: 'ui', label: 'Mobile App' },
      { id: 'web', type: 'ui', label: 'Web App' },
      { id: 'cdn', type: 'external', label: 'CDN' },
      { id: 'load-balancer', type: 'gateway', label: 'Load Balancer' },
      { id: 'api-gateway', type: 'gateway', label: 'API Gateway' },
      { id: 'auth-service', type: 'service', label: 'Auth Service' },
      { id: 'user-service', type: 'service', label: 'User Service' },
      { id: 'order-service', type: 'service', label: 'Order Service' },
      { id: 'redis', type: 'cache', label: 'Redis Cache' },
      { id: 'message-queue', type: 'queue', label: 'RabbitMQ' },
      { id: 'user-db', type: 'database', label: 'User DB' },
      { id: 'order-db', type: 'database', label: 'Order DB' }
    ],
    connections: [
      { from: 'mobile', to: 'cdn', type: 'http', label: 'Static Assets' },
      { from: 'web', to: 'cdn', type: 'http', label: 'Static Assets' },
      { from: 'mobile', to: 'load-balancer', type: 'http', label: 'API Requests' },
      { from: 'web', to: 'load-balancer', type: 'http', label: 'API Requests' },
      { from: 'load-balancer', to: 'api-gateway', type: 'http' },
      { from: 'api-gateway', to: 'auth-service', type: 'http', label: 'Authentication' },
      { from: 'api-gateway', to: 'user-service', type: 'http', label: 'User Operations' },
      { from: 'api-gateway', to: 'order-service', type: 'http', label: 'Order Operations' },
      { from: 'user-service', to: 'redis', type: 'query', label: 'Cache' },
      { from: 'user-service', to: 'user-db', type: 'query', label: 'User Data' },
      { from: 'order-service', to: 'message-queue', type: 'async', label: 'Order Events' },
      { from: 'order-service', to: 'order-db', type: 'query', label: 'Order Data' }
    ],
    groups: [
      { id: 'client', label: 'Client Layer', contains: ['mobile', 'web'] },
      { id: 'gateway', label: 'Gateway Layer', contains: ['load-balancer', 'api-gateway'] },
      { id: 'services', label: 'Service Layer', contains: ['auth-service', 'user-service', 'order-service'] },
      { id: 'data', label: 'Data Layer', contains: ['redis', 'message-queue', 'user-db', 'order-db'] }
    ],
    layout: { type: 'layered', direction: 'TB' }
  };
  
  try {
    const result4 = await generator.generateDiagram(layeredArch);
    console.log(`✓ Generated complex layered architecture with ${result4.elements.length} elements\n`);
  } catch (error) {
    console.error('✗ Error:', error.message, '\n');
  }
  
  console.log('=== Examples completed ===');
}

// Export for use in other files
module.exports = { runExamples };

// Run examples if this file is executed directly
if (require.main === module) {
  runExamples().catch(console.error);
}
