const fs = require('fs');
const path = require('path');
const { 
  generateArchitectureDiagramSemantic, 
  generateArchitectureDiagramFromTemplate 
} = require('../lib/main');

/**
 * Test suite for semantic architecture generation
 */

async function testSemanticGeneration() {
  console.log('=== Semantic Architecture Generation Tests ===\n');
  
  const outputDir = path.join(__dirname, '../output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Test 1: Simple three-tier architecture
  console.log('Test 1: Simple Three-tier Architecture');
  try {
    const simpleArch = {
      nodes: [
        { id: 'user', type: 'actor', label: 'User' },
        { id: 'web', type: 'ui', label: 'Web App' },
        { id: 'api', type: 'service', label: 'API Server' },
        { id: 'db', type: 'database', label: 'Database' }
      ],
      connections: [
        { from: 'user', to: 'web', type: 'http', label: 'Browse' },
        { from: 'web', to: 'api', type: 'http', label: 'API Calls' },
        { from: 'api', to: 'db', type: 'query', label: 'SQL' }
      ],
      layout: { type: 'hierarchical', direction: 'TB' }
    };
    
    const result = await generateArchitectureDiagramSemantic(simpleArch);
    
    // Save result to file
    const outputPath = path.join(outputDir, 'simple-three-tier.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    
    console.log(`✓ Generated ${result.elements.length} elements`);
    console.log(`✓ Saved to: ${outputPath}\n`);
    
  } catch (error) {
    console.error('✗ Test 1 failed:', error.message, '\n');
  }
  
  // Test 2: Template generation
  console.log('Test 2: Microservices Template');
  try {
    const result = await generateArchitectureDiagramFromTemplate('microservices', {
      frontend: 'React Dashboard',
      backend: 'Node.js Services',
      database: 'MongoDB Cluster'
    });
    
    const outputPath = path.join(outputDir, 'microservices-template.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    
    console.log(`✓ Generated ${result.elements.length} elements`);
    console.log(`✓ Saved to: ${outputPath}\n`);
    
  } catch (error) {
    console.error('✗ Test 2 failed:', error.message, '\n');
  }
  
  // Test 3: Complex event-driven architecture
  console.log('Test 3: Event-driven Architecture');
  try {
    const eventArch = {
      nodes: [
        { id: 'order-api', type: 'service', label: 'Order API' },
        { id: 'payment-api', type: 'service', label: 'Payment API' },
        { id: 'inventory-api', type: 'service', label: 'Inventory API' },
        { id: 'event-bus', type: 'queue', label: 'Apache Kafka' },
        { id: 'notification', type: 'service', label: 'Notification Service' },
        { id: 'analytics', type: 'service', label: 'Analytics Service' },
        { id: 'email-service', type: 'external', label: 'SendGrid' },
        { id: 'metrics-db', type: 'database', label: 'InfluxDB' }
      ],
      connections: [
        { from: 'order-api', to: 'event-bus', type: 'async', label: 'OrderCreated' },
        { from: 'event-bus', to: 'payment-api', type: 'async', label: 'ProcessPayment' },
        { from: 'event-bus', to: 'inventory-api', type: 'async', label: 'UpdateInventory' },
        { from: 'event-bus', to: 'notification', type: 'async', label: 'SendNotification' },
        { from: 'event-bus', to: 'analytics', type: 'async', label: 'TrackEvent' },
        { from: 'notification', to: 'email-service', type: 'http', label: 'Send Email' },
        { from: 'analytics', to: 'metrics-db', type: 'query', label: 'Store Metrics' }
      ],
      groups: [
        { id: 'core-services', label: 'Core Services', contains: ['order-api', 'payment-api', 'inventory-api'] },
        { id: 'support-services', label: 'Support Services', contains: ['notification', 'analytics'] }
      ],
      layout: { type: 'hierarchical', direction: 'LR' }
    };
    
    const result = await generateArchitectureDiagramSemantic(eventArch);
    
    const outputPath = path.join(outputDir, 'event-driven-arch.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    
    console.log(`✓ Generated ${result.elements.length} elements`);
    console.log(`✓ Saved to: ${outputPath}\n`);
    
  } catch (error) {
    console.error('✗ Test 3 failed:', error.message, '\n');
  }
  
  // Test 4: Grid layout
  console.log('Test 4: Grid Layout Test');
  try {
    const gridArch = {
      nodes: [
        { id: 'service1', type: 'service', label: 'Service A' },
        { id: 'service2', type: 'service', label: 'Service B' },
        { id: 'service3', type: 'service', label: 'Service C' },
        { id: 'service4', type: 'service', label: 'Service D' },
        { id: 'cache', type: 'cache', label: 'Redis' },
        { id: 'db', type: 'database', label: 'PostgreSQL' }
      ],
      connections: [
        { from: 'service1', to: 'cache', type: 'query' },
        { from: 'service2', to: 'cache', type: 'query' },
        { from: 'service3', to: 'db', type: 'query' },
        { from: 'service4', to: 'db', type: 'query' }
      ],
      layout: { type: 'grid' }
    };
    
    const result = await generateArchitectureDiagramSemantic(gridArch);
    
    const outputPath = path.join(outputDir, 'grid-layout.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    
    console.log(`✓ Generated ${result.elements.length} elements`);
    console.log(`✓ Saved to: ${outputPath}\n`);
    
  } catch (error) {
    console.error('✗ Test 4 failed:', error.message, '\n');
  }
  
  console.log('=== All Tests Completed ===');
  console.log(`Results saved in: ${outputDir}`);
  console.log('You can import these JSON files into Excalidraw to view the diagrams.');
}

// Export for use in other files
module.exports = { testSemanticGeneration };

// Run tests if this file is executed directly
if (require.main === module) {
  testSemanticGeneration().catch(console.error);
}
