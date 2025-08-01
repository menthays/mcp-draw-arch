const excalidrawToSvg = require('excalidraw-to-svg');

/**
 * Converts Excalidraw diagram data to SVG format
 * @param {Object} excalidrawData - Excalidraw diagram data
 * @returns {Promise<string>} - SVG string representation of the diagram
 */
async function convertToSvg(excalidrawData) {
  try {
    // Use the excalidraw-to-svg library to convert to SVG
    // This will properly convert all Excalidraw elements to SVG format with the correct styling
    const svg = await excalidrawToSvg(excalidrawData);
    
    // Serialize the SVG element to string
    const svgString = svg.outerHTML;
    
    return svgString;
  } catch (error) {
    console.error('Error converting to SVG:', error);
    throw error;
  }
}

module.exports = { convertToSvg };
