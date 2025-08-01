const { executeSimpleWorkflow } = require('../lib/workflow/simple');

/**
 * Workflow Examples
 * Demonstrates the new multi-stage architecture generation workflow
 */

async function runWorkflowExamples() {
  console.log('🚀 Draw-Arch Workflow Examples');
  console.log('================================');
  console.log('');

  const examples = [
    {
      name: 'Simple Web Application',
      description: 'Create a simple web application with React frontend and Node.js backend'
    },
    {
      name: 'Microservices E-commerce',
      description: 'Create a microservices e-commerce platform with user service, product service, order service, payment gateway, Redis cache, and PostgreSQL database'
    },
    {
      name: 'Event-Driven System',
      description: 'Design an event-driven system with message queues, event processors, and multiple data stores for real-time analytics'
    },
    {
      name: 'Serverless Architecture',
      description: 'Build a serverless architecture with AWS Lambda functions, API Gateway, DynamoDB, and S3 for file processing'
    },
    {
      name: 'Data Pipeline',
      description: 'Create a data pipeline with Kafka, Spark processing, data lake storage, and real-time dashboards'
    }
  ];

  for (let i = 0; i < examples.length; i++) {
    const example = examples[i];
    console.log(`\n📋 Example ${i + 1}: ${example.name}`);
    console.log('─'.repeat(50));
    
    try {
      const startTime = Date.now();
      const result = await executeSimpleWorkflow(example.description);
      const duration = Date.now() - startTime;
      
      console.log(`✅ Generated successfully in ${duration}ms`);
      console.log(`📊 Elements: ${result.elements.length}`);
      console.log('');
      
      // Save example result
      const fs = require('fs');
      const filename = `example-${i + 1}-${example.name.toLowerCase().replace(/\s+/g, '-')}.excalidraw`;
      fs.writeFileSync(filename, JSON.stringify(result, null, 2));
      console.log(`💾 Saved: ${filename}`);
      
    } catch (error) {
      console.error(`❌ Failed: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(60));
  }
}

/**
 * Performance comparison between old and new approaches
 */
async function performanceComparison() {
  console.log('\n🏁 Performance Comparison');
  console.log('=========================');
  
  const testDescription = 'Create a microservices platform with 5 services and database';
  
  // Test new workflow
  console.log('\n🆕 New Multi-Stage Workflow:');
  const startNew = Date.now();
  try {
    await executeSimpleWorkflow(testDescription);
    const durationNew = Date.now() - startNew;
    console.log(`✅ Completed in ${durationNew}ms`);
  } catch (error) {
    console.error(`❌ Failed: ${error.message}`);
  }
  
  // Note: Old direct LLM approach would be tested here for comparison
  console.log('\n📊 Benefits of New Workflow:');
  console.log('• 🎯 Better architecture analysis and component identification');
  console.log('• 🔗 More accurate relationship mapping');
  console.log('• 📐 Intelligent layout selection based on architecture type');
  console.log('• 🛠️ Modular stages for easier debugging and customization');
  console.log('• 🔄 Extensible for future enhancements');
}

/**
 * Architecture type detection examples
 */
async function architectureTypeExamples() {
  console.log('\n🏗️ Architecture Type Detection Examples');
  console.log('=======================================');
  
  const architectureExamples = [
    { type: 'Layered', description: 'Web app with presentation, business, and data layers' },
    { type: 'Microservices', description: 'Distributed system with independent services' },
    { type: 'Event-Driven', description: 'System with event publishers, subscribers, and message queues' },
    { type: 'Serverless', description: 'Cloud functions with managed services and APIs' },
    { type: 'Monolithic', description: 'Single deployable unit with integrated components' }
  ];
  
  for (const example of architectureExamples) {
    console.log(`\n🔍 ${example.type} Architecture:`);
    console.log(`   "${example.description}"`);
    // In a real implementation, we would run just the analysis stage here
  }
}

// Main execution
if (require.main === module) {
  (async () => {
    try {
      await runWorkflowExamples();
      await performanceComparison();
      await architectureTypeExamples();
    } catch (error) {
      console.error('Example execution failed:', error);
    }
  })();
}

module.exports = {
  runWorkflowExamples,
  performanceComparison,
  architectureTypeExamples
};
