const { CONNECTION_STYLES } = require('./schema');

// Excalidraw element types
const EXCALIDRAW_ELEMENT_TYPES = {
  RECTANGLE: 'rectangle',
  ELLIPSE: 'ellipse',
  DIAMOND: 'diamond',
  ARROW: 'arrow',
  TEXT: 'text'
};

/**
 * Excalidraw Renderer - Converts positioned layout to Excalidraw elements
 * Final step in the pipeline: DSL -> Layout -> Excalidraw Elements
 */

class ExcalidrawRenderer {
  constructor() {
    this.idCounter = 0;
  }

  /**
   * Generate unique ID for elements
   */
  generateId() {
    return `${Date.now()}_${++this.idCounter}`;
  }

  /**
   * Render complete layout to Excalidraw format
   * @param {Object} layout - Positioned layout from LayoutEngine
   * @returns {Object} Excalidraw diagram data
   */
  render(layout) {
    const elements = [];
    
    // Render groups first (so they appear behind nodes)
    if (layout.groups) {
      layout.groups.forEach(group => {
        const groupElements = this.renderGroup(group);
        elements.push(...groupElements);
      });
    }
    
    // Render nodes
    layout.nodes.forEach(node => {
      const nodeElements = this.renderNode(node);
      elements.push(...nodeElements);
    });
    
    // Render connections
    layout.connections.forEach(connection => {
      const connectionElements = this.renderConnection(connection);
      elements.push(...connectionElements);
    });
    
    return {
      type: "excalidraw",
      version: 2,
      source: "draw-arch-dsl-renderer",
      elements,
      appState: {
        viewBackgroundColor: "#ffffff",
        gridSize: 20,
        zoom: {
          value: 1
        },
        scrollX: 0,
        scrollY: 0
      }
    };
  }

  /**
   * Render a single node to Excalidraw elements
   */
  renderNode(node) {
    const elements = [];
    const timestamp = Date.now();
    const { style } = node;
    
    // Create shape element
    const shapeId = `node_${this.generateId()}`;
    const shapeElement = {
      id: shapeId,
      type: this.getExcalidrawShapeType(style.shape),
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height,
      backgroundColor: style.fillColor,
      strokeColor: style.strokeColor,
      fillStyle: 'solid',
      strokeWidth: 2,
      strokeStyle: 'solid',
      roughness: 1,
      opacity: 100,
      angle: 0,
      groupIds: [],
      strokeSharpness: 'sharp',
      seed: Math.floor(Math.random() * 1000000),
      version: 1,
      versionNonce: Math.floor(Math.random() * 1000000),
      isDeleted: false,
      boundElements: [],
      updated: timestamp,
      createdAt: new Date(timestamp).toISOString(),
      updatedAt: new Date(timestamp).toISOString(),
      link: null,
      locked: false
    };
    
    elements.push(shapeElement);
    
    // Create label text element
    const textId = `text_${this.generateId()}`;
    
    // Calculate text dimensions for proper centering
    const textWidth = Math.min(node.label.length * 9, node.width - 20); // Approximate text width
    const textHeight = 20; // Standard text height
    
    const textElement = {
      id: textId,
      type: EXCALIDRAW_ELEMENT_TYPES.TEXT,
      x: node.x + (node.width - textWidth) / 2, // Center horizontally
      y: node.y + (node.height - textHeight) / 2, // Center vertically
      width: textWidth,
      height: textHeight,
      text: node.label,
      fontSize: 16,
      fontFamily: 1,
      textAlign: 'center',
      verticalAlign: 'middle',
      containerId: shapeId,
      autoResize: false, // Disable auto-resize for better control
      backgroundColor: 'transparent',
      strokeColor: '#000000',
      fillStyle: 'hachure',
      strokeWidth: 1,
      strokeStyle: 'solid',
      roughness: 1,
      opacity: 100,
      angle: 0,
      groupIds: [],
      strokeSharpness: 'sharp',
      seed: Math.floor(Math.random() * 1000000),
      version: 1,
      versionNonce: Math.floor(Math.random() * 1000000),
      isDeleted: false,
      boundElements: null,
      updated: timestamp,
      createdAt: new Date(timestamp).toISOString(),
      updatedAt: new Date(timestamp).toISOString(),
      link: null,
      locked: false
    };
    
    elements.push(textElement);
    
    // Update shape's bound elements
    shapeElement.boundElements.push({
      type: 'text',
      id: textId
    });
    
    return elements;
  }

  /**
   * Render a connection to Excalidraw elements
   */
  renderConnection(connection) {
    const elements = [];
    const timestamp = Date.now();
    const connectionStyle = CONNECTION_STYLES[connection.type] || CONNECTION_STYLES.sync;
    
    // Create arrow/line element
    const arrowId = `conn_${this.generateId()}`;
    const { fromPoint, toPoint } = connection;
    
    const arrowElement = {
      id: arrowId,
      type: EXCALIDRAW_ELEMENT_TYPES.ARROW,
      x: Math.min(fromPoint.x, toPoint.x),
      y: Math.min(fromPoint.y, toPoint.y),
      width: Math.abs(toPoint.x - fromPoint.x),
      height: Math.abs(toPoint.y - fromPoint.y),
      backgroundColor: 'transparent',
      strokeColor: connectionStyle.strokeColor,
      fillStyle: 'hachure',
      strokeWidth: 2,
      strokeStyle: connectionStyle.strokeStyle,
      roughness: 1,
      opacity: 100,
      angle: 0,
      groupIds: [],
      strokeSharpness: 'sharp',
      seed: Math.floor(Math.random() * 1000000),
      version: 1,
      versionNonce: Math.floor(Math.random() * 1000000),
      isDeleted: false,
      boundElements: [],
      updated: timestamp,
      createdAt: new Date(timestamp).toISOString(),
      updatedAt: new Date(timestamp).toISOString(),
      link: null,
      locked: false,
      points: [
        [0, 0],
        [toPoint.x - Math.min(fromPoint.x, toPoint.x), toPoint.y - Math.min(fromPoint.y, toPoint.y)]
      ],
      startArrowhead: null,
      endArrowhead: connectionStyle.arrowType === 'arrow' ? 'arrow' : null,
      startBinding: {
        elementId: connection.from,
        focus: 0,
        gap: 0
      },
      endBinding: {
        elementId: connection.to,
        focus: 0,
        gap: 0
      }
    };
    
    elements.push(arrowElement);
    
    // Add label if present
    if (connection.label) {
      const labelId = `label_${this.generateId()}`;
      
      // Calculate connection angle to determine optimal label placement
      const dx = toPoint.x - fromPoint.x;
      const dy = toPoint.y - fromPoint.y;
      const angle = Math.atan2(dy, dx);
      
      // Calculate optimal label position based on connection angle
      // Place label to the side of the connection line rather than directly on it
      const distance = 15; // Distance from connection line
      const midX = (fromPoint.x + toPoint.x) / 2;
      const midY = (fromPoint.y + toPoint.y) / 2;
      
      // Calculate offset perpendicular to the connection line
      const offsetX = -Math.sin(angle) * distance;
      const offsetY = Math.cos(angle) * distance;
      
      const labelX = midX + offsetX;
      const labelY = midY + offsetY;
      
      // Use the connection label directly - no processing in renderer
      // LLM workflow should provide appropriately sized labels
      let processedLabel = connection.label;
      
      // Use smaller font size for better fit
      const fontSize = 12;
      
      // Calculate dimensions based on text
      const estimatedWidth = Math.min(processedLabel.length * 7, 150);
      const estimatedHeight = 16; // Single line height
      
      const labelElement = {
        id: labelId,
        type: EXCALIDRAW_ELEMENT_TYPES.TEXT,
        x: labelX - estimatedWidth / 2, // Position based on calculated offset
        y: labelY - estimatedHeight / 2,
        width: estimatedWidth,
        height: estimatedHeight,
        text: processedLabel,
        fontSize: fontSize, // Use the calculated font size
        fontFamily: 1,
        textAlign: 'center',
        verticalAlign: 'middle',
        containerId: null,
        autoResize: true,
        backgroundColor: '#ffffff',
        strokeColor: '#000000',
        fillStyle: 'solid',
        strokeWidth: 1,
        strokeStyle: 'solid',
        roughness: 1,
        opacity: 100,
        angle: 0,
        groupIds: [],
        strokeSharpness: 'sharp',
        seed: Math.floor(Math.random() * 1000000),
        version: 1,
        versionNonce: Math.floor(Math.random() * 1000000),
        isDeleted: false,
        boundElements: null,
        updated: timestamp,
        createdAt: new Date(timestamp).toISOString(),
        updatedAt: new Date(timestamp).toISOString(),
        link: null,
        locked: false
      };
      
      elements.push(labelElement);
    }
    
    return elements;
  }

  /**
   * Render a group to Excalidraw elements
   */
  renderGroup(group) {
    const elements = [];
    const timestamp = Date.now();
    
    // Create group boundary rectangle
    const groupId = `group_${this.generateId()}`;
    const groupElement = {
      id: groupId,
      type: EXCALIDRAW_ELEMENT_TYPES.RECTANGLE,
      x: group.x,
      y: group.y,
      width: group.width,
      height: group.height,
      backgroundColor: 'transparent',
      strokeColor: '#cccccc',
      fillStyle: 'hachure',
      strokeWidth: 1,
      strokeStyle: 'dashed',
      roughness: 1,
      opacity: 50,
      angle: 0,
      groupIds: [],
      strokeSharpness: 'sharp',
      seed: Math.floor(Math.random() * 1000000),
      version: 1,
      versionNonce: Math.floor(Math.random() * 1000000),
      isDeleted: false,
      boundElements: [],
      updated: timestamp,
      createdAt: new Date(timestamp).toISOString(),
      updatedAt: new Date(timestamp).toISOString(),
      link: null,
      locked: false
    };
    
    elements.push(groupElement);
    
    // Add group label
    const labelId = `group_label_${this.generateId()}`;
    const labelElement = {
      id: labelId,
      type: EXCALIDRAW_ELEMENT_TYPES.TEXT,
      x: group.x + 10,
      y: group.y - 25,
      width: 100,
      height: 20,
      text: group.label,
      fontSize: 14,
      fontFamily: 1,
      textAlign: 'left',
      verticalAlign: 'top',
      containerId: null,
      autoResize: true,
      backgroundColor: 'transparent',
      strokeColor: '#666666',
      fillStyle: 'hachure',
      strokeWidth: 1,
      strokeStyle: 'solid',
      roughness: 1,
      opacity: 100,
      angle: 0,
      groupIds: [],
      strokeSharpness: 'sharp',
      seed: Math.floor(Math.random() * 1000000),
      version: 1,
      versionNonce: Math.floor(Math.random() * 1000000),
      isDeleted: false,
      boundElements: null,
      updated: timestamp,
      createdAt: new Date(timestamp).toISOString(),
      updatedAt: new Date(timestamp).toISOString(),
      link: null,
      locked: false
    };
    
    elements.push(labelElement);
    
    return elements;
  }

  /**
   * Map DSL shape types to Excalidraw element types
   */
  getExcalidrawShapeType(shapeType) {
    const mapping = {
      rectangle: EXCALIDRAW_ELEMENT_TYPES.RECTANGLE,
      ellipse: EXCALIDRAW_ELEMENT_TYPES.ELLIPSE,
      diamond: EXCALIDRAW_ELEMENT_TYPES.DIAMOND
    };
    
    return mapping[shapeType] || EXCALIDRAW_ELEMENT_TYPES.RECTANGLE;
  }
}

module.exports = { ExcalidrawRenderer };
