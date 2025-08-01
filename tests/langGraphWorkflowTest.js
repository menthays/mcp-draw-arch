/**
 * LangGraph StateGraph Workflow Test
 * 
 * This test verifies the end-to-end functionality of the LangGraph StateGraph workflow
 * for architecture diagram generation.
 */

const { executeArchitectureWorkflow } = require('../lib/workflow/graph');
const fs = require('fs');
const path = require('path');

// Test function
async function testLangGraphWorkflow() {
  console.log('🧪 Testing LangGraph StateGraph workflow...');
  
  // Test cases with different architecture descriptions
  const testCases = [
    {
      name: 'simple-web-app',
      description: 'A simple web application with React frontend and Node.js Express backend. The frontend communicates with the backend via REST API calls. The backend stores data in a MongoDB database.'
    },
    {
      name: 'microservices',
      description: 'A microservices architecture with an API Gateway, User Service, Product Service, and Order Service. Each service has its own database. Services communicate via REST APIs and message queues.'
    }
  ];
  
  // Run each test case
  for (const testCase of testCases) {
    console.log(`\n📋 Testing case: ${testCase.name}`);
    console.log(`Description: ${testCase.description}`);
    
    try {
      // Execute the workflow
      const startTime = Date.now();
      const result = await executeArchitectureWorkflow(testCase.description);
      const duration = (Date.now() - startTime) / 1000;
      
      // Validate the result
      if (!result || !result.elements || result.elements.length === 0) {
        throw new Error('Workflow did not produce valid Excalidraw data');
      }
      
      // Count elements by type
      const elementTypes = {};
      result.elements.forEach(el => {
        elementTypes[el.type] = (elementTypes[el.type] || 0) + 1;
      });
      
      console.log(`✅ Test passed in ${duration.toFixed(2)}s`);
      console.log(`Generated ${result.elements.length} elements:`);
      Object.entries(elementTypes).forEach(([type, count]) => {
        console.log(`  - ${type}: ${count}`);
      });
      
      // Save the result
      const outputDir = path.join(__dirname, '..', 'output');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const outputPath = path.join(outputDir, `${testCase.name}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
      console.log(`Result saved to ${outputPath}`);
    } catch (error) {
      console.error(`❌ Test failed: ${error.message}`);
      console.error(error.stack);
    }
  }
}

// Run the test
testLangGraphWorkflow()
  .then(() => console.log('\n✅ LangGraph workflow tests completed'))
  .catch(err => console.error('\n❌ Tests failed:', err));
