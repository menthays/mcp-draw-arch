#!/usr/bin/env node
require('dotenv').config({ override: true });
const { convertToSvg } = require('./lib/core/svg');
const { 
  generateArchitectureDiagram,
  generateArchitectureDiagramFromTemplate
} = require('./lib/main');
const fs = require('fs');
/**
 * Main CLI function
 */
async function main() {
  // Get command line arguments
  const args = process.argv.slice(2);
  
  // Check for help flag
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }
  
  // Check for template generation
  if (args[0] === '--template' || args[0] === '-t') {
    await generateFromTemplate(args.slice(1));
    return;
  }
  
  // Check for test mode
  if (args[0] === '--test') {
    await runTests();
    return;
  }
  
  // Default: natural language generation using agent
  let description = '';
  let outputFile = 'architecture-diagram.svg';
  
  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (!description) {
      description = args[i];
    } else {
      outputFile = args[i];
    }
  }
  
  if (!description) {
    showHelp();
    return;
  }
  
  try {
    console.log('Using ReAct Agent approach (with semantic tools)...');
    const excalidrawData = await generateArchitectureDiagram(description);
    
    // Save excalidraw file
    const excalidrawFile = outputFile.replace(/\.[^.]+$/, '.excalidraw');
    fs.writeFileSync(excalidrawFile, JSON.stringify(excalidrawData, null, 2));
    console.log(`✓ Excalidraw file saved: ${excalidrawFile}`);
    
    // Convert to SVG
    console.log('Converting to SVG...');
    const svgData = await convertToSvg(excalidrawData);
    fs.writeFileSync(outputFile, svgData);
    console.log(`✓ SVG file saved: ${outputFile}`);
    
    console.log('\n🎉 Diagram generated successfully!');
  } catch (error) {
    console.error('❌ Error generating diagram:', error.message);
    process.exit(1);
  }
}

/**
 * Generate from template
 */
async function generateFromTemplate(args) {
  const templateName = args[0];
  const outputFile = args[1] || `${templateName}-diagram.svg`;
  
  if (!templateName) {
    console.log('Available templates: three-tier, microservices, event-driven');
    console.log('Usage: node cli.js --template <template-name> [output-file]');
    return;
  }
  
  try {
    console.log(`Generating ${templateName} template...`);
    const excalidrawData = await generateArchitectureDiagramFromTemplate(templateName);
    
    // Save files
    const excalidrawFile = outputFile.replace(/\.[^.]+$/, '.excalidraw');
    fs.writeFileSync(excalidrawFile, JSON.stringify(excalidrawData, null, 2));
    console.log(`✓ Excalidraw file saved: ${excalidrawFile}`);
    
    const svgData = await convertToSvg(excalidrawData);
    fs.writeFileSync(outputFile, svgData);
    console.log(`✓ SVG file saved: ${outputFile}`);
    
    console.log('\n🎉 Template diagram generated successfully!');
  } catch (error) {
    console.error('❌ Error generating template:', error.message);
    process.exit(1);
  }
}

/**
 * Run tests
 */
async function runTests() {
  try {
    const { testSemanticGeneration } = require('./tests/test');
    await testSemanticGeneration();
  } catch (error) {
    console.error('❌ Error running tests:', error.message);
    process.exit(1);
  }
}

/**
 * Show help information
 */
function showHelp() {
  console.log('Draw Architecture - Generate Excalidraw architecture diagrams');
  console.log('');
  console.log('Usage:');
  console.log('  node cli.js "<description>" [output-file]     Generate from natural language');
  console.log('  node cli.js --template <name> [output-file]   Generate from template');
  console.log('  node cli.js --test                           Run semantic generation tests');
  console.log('  node cli.js --help                           Show this help');
  console.log('');
  console.log('Templates:');
  console.log('  three-tier      Traditional web application architecture');
  console.log('  microservices   Distributed services architecture');
  console.log('  event-driven    Event-based communication patterns');
  console.log('');
  console.log('Examples:');
  console.log('  node cli.js "Create a web app with React and Node.js"');
  console.log('  node cli.js --template microservices my-arch.svg');
  console.log('  node cli.js --test');
}

// Run the CLI if this file is executed directly
if (require.main === module) {
  main();
}