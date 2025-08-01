#!/usr/bin/env node
require('dotenv').config({ override: true, path: ['.env.local', '.env'] });
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

  
  // Default: natural language generation using agent
  const description = args[0];
  const outputFile = args[1] || 'architecture-diagram.svg';
  
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
 * Show help information
 */
function showHelp() {
  console.log('Draw Architecture - Generate Excalidraw architecture diagrams');
  console.log('');
  console.log('Usage:');
  console.log('  node cli.js "<description>" [output-file]     Generate from natural language');
  console.log('  node cli.js --help                           Show this help');
  console.log('');
  console.log('Examples:');
  console.log('  node cli.js "Create a web app with React and Node.js"');
}

// Run the CLI if this file is executed directly
if (require.main === module) {
  main();
}