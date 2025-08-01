/**
 * Text Centering Rendering Test
 * 
 * This test verifies that text is properly centered within nodes in the Excalidraw renderer.
 */

const { ExcalidrawRenderer } = require('../lib/core/renderer');
const fs = require('fs');
const path = require('path');

// Test function
async function testTextCentering() {
  console.log('🧪 Testing text centering in Excalidraw renderer...');
  
  // Create a renderer instance
  const renderer = new ExcalidrawRenderer();
  
  // Create test nodes with different sizes and label lengths
  const testLayout = {
    nodes: [
      {
        id: 'node1',
        x: 100,
        y: 100,
        width: 150,
        height: 80,
        label: 'Short Text',
        style: { shape: 'rectangle', fillColor: '#f5f5f5', strokeColor: '#000000' }
      },
      {
        id: 'node2',
        x: 300,
        y: 100,
        width: 200,
        height: 100,
        label: 'Medium Length Text Label',
        style: { shape: 'rectangle', fillColor: '#e1f5fe', strokeColor: '#0277bd' }
      },
      {
        id: 'node3',
        x: 100,
        y: 250,
        width: 400,
        height: 120,
        label: 'This is a very long text label that should be properly centered in the node',
        style: { shape: 'rectangle', fillColor: '#e8f5e9', strokeColor: '#2e7d32' }
      },
      {
        id: 'node4',
        x: 550,
        y: 100,
        width: 120,
        height: 120,
        label: 'Square',
        style: { shape: 'rectangle', fillColor: '#fff3e0', strokeColor: '#e65100' }
      },
      {
        id: 'node5',
        x: 550,
        y: 250,
        width: 120,
        height: 120,
        label: '圆形节点',
        style: { shape: 'ellipse', fillColor: '#f3e5f5', strokeColor: '#6a1b9a' }
      }
    ],
    connections: [],
    groups: []
  };
  
  // Render the test layout
  const excalidrawData = renderer.render(testLayout);
  
  // Verify text elements are centered
  const textElements = excalidrawData.elements.filter(el => el.type === 'text');
  const shapeElements = excalidrawData.elements.filter(el => el.type !== 'text' && el.type !== 'arrow');
  
  console.log(`Found ${textElements.length} text elements and ${shapeElements.length} shape elements`);
  
  // Check each text element's position relative to its container
  for (let i = 0; i < textElements.length; i++) {
    const textEl = textElements[i];
    const shapeEl = shapeElements.find(el => el.id === textEl.containerId) || 
                    shapeElements.find(el => {
                      // Find shape that contains this text (if containerId is not set)
                      return textEl.x >= el.x && 
                             textEl.x <= el.x + el.width &&
                             textEl.y >= el.y &&
                             textEl.y <= el.y + el.height;
                    });
    
    if (shapeEl) {
      // Calculate expected center position
      const expectedCenterX = shapeEl.x + shapeEl.width / 2;
      const expectedCenterY = shapeEl.y + shapeEl.height / 2;
      
      // Calculate text element center
      const textCenterX = textEl.x + textEl.width / 2;
      const textCenterY = textEl.y + textEl.height / 2;
      
      // Calculate offset from perfect center
      const offsetX = Math.abs(textCenterX - expectedCenterX);
      const offsetY = Math.abs(textCenterY - expectedCenterY);
      
      // Allow small tolerance for rounding errors
      const isWellCentered = offsetX < 10 && offsetY < 10;
      
      console.log(`Text "${textEl.text}" centering: ${isWellCentered ? '✅' : '❌'}`);
      console.log(`  X offset: ${offsetX.toFixed(2)}px, Y offset: ${offsetY.toFixed(2)}px`);
      
      if (!isWellCentered) {
        console.log(`  Expected center: (${expectedCenterX}, ${expectedCenterY})`);
        console.log(`  Actual center: (${textCenterX}, ${textCenterY})`);
      }
    } else {
      console.log(`❌ No container found for text "${textEl.text}"`);
    }
  }
  
  // Save the test diagram
  const outputPath = path.join(__dirname, '..', 'output', 'text-centering-test.json');
  fs.writeFileSync(outputPath, JSON.stringify(excalidrawData, null, 2));
  console.log(`Test diagram saved to ${outputPath}`);
  
  return excalidrawData;
}

// Run the test
testTextCentering()
  .then(() => console.log('✅ Text centering test completed'))
  .catch(err => console.error('❌ Test failed:', err));
