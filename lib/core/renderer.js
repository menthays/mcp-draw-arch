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

    // Create label text element for the main node
    const textId = `text_${this.generateId()}`;

    // Calculate text dimensions for proper centering
    const textWidth = Math.min(node.label.length * 9, node.width - 20);
    const textHeight = 20;

    const textElement = {
      id: textId,
      type: EXCALIDRAW_ELEMENT_TYPES.TEXT,
      x: node.x + (node.width - textWidth) / 2,
      y: node.y + (node.height - textHeight) / 2,
      width: textWidth,
      height: textHeight,
      text: node.label,
      fontSize: 16,
      fontFamily: 1,
      textAlign: 'center',
      verticalAlign: 'middle',
      containerId: shapeId,
      autoResize: false,
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

    // For nodes with children, place the label at the top
    if (node.nodes && node.nodes.length > 0) {
      textElement.y = node.y + 10;
      textElement.verticalAlign = 'top';
    }

    elements.push(textElement);

    // If the node has sub-nodes, render them recursively
    if (node.nodes && node.nodes.length > 0) {
      const padding = { top: 40, left: 20 };
      let currentY = node.y + padding.top;

      node.nodes.forEach(subNode => {
        const subNodeX = node.x + (node.width - subNode.width) / 2;
        subNode.x = subNodeX;
        subNode.y = currentY;

        const subElements = this.renderNode(subNode);
        elements.push(...subElements);

        currentY += subNode.height + 10;
      });
    }

    return elements;
  }

  /**
   * Render a connection to Excalidraw elements
   */
  renderConnection(connection) {
    const elements = [];
    const timestamp = Date.now();
    const style = CONNECTION_STYLES[connection.type] || CONNECTION_STYLES.none;

    // Create arrow element
    const arrowId = `arrow_${this.generateId()}`;
    const arrowElement = {
      id: arrowId,
      type: EXCALIDRAW_ELEMENT_TYPES.ARROW,
      x: connection.fromPoint.x,
      y: connection.fromPoint.y,
      width: connection.toPoint.x - connection.fromPoint.x,
      height: connection.toPoint.y - connection.fromPoint.y,
      points: [[0, 0], [connection.toPoint.x - connection.fromPoint.x, connection.toPoint.y - connection.fromPoint.y]],
      backgroundColor: 'transparent',
      strokeColor: style.strokeColor,
      fillStyle: 'solid',
      strokeWidth: 2,
      strokeStyle: style.strokeStyle,
      roughness: 1,
      opacity: 100,
      angle: 0,
      groupIds: [],
      strokeSharpness: 'round',
      seed: Math.floor(Math.random() * 1000000),
      version: 1,
      versionNonce: Math.floor(Math.random() * 1000000),
      isDeleted: false,
      boundElements: null,
      updated: timestamp,
      startBinding: null,
      endBinding: null,
      lastCommittedPoint: null,
      startArrowhead: null,
      endArrowhead: 'arrow',
      createdAt: new Date(timestamp).toISOString(),
      updatedAt: new Date(timestamp).toISOString(),
      link: null,
      locked: false
    };

    elements.push(arrowElement);

    // Add label if present
    if (connection.label && connection.label.trim() !== '') {
      const labelId = `label_${this.generateId()}`;

      const labelX = connection.fromPoint.x + (connection.toPoint.x - connection.fromPoint.x) / 2;
      const labelY = connection.fromPoint.y + (connection.toPoint.y - connection.fromPoint.y) / 2;

      let processedLabel = connection.label;
      const fontSize = 12;
      const estimatedWidth = Math.min(processedLabel.length * 7, 150);
      const estimatedHeight = 16;

      const labelElement = {
        id: labelId,
        type: EXCALIDRAW_ELEMENT_TYPES.TEXT,
        x: labelX - estimatedWidth / 2,
        y: labelY - estimatedHeight / 2,
        width: estimatedWidth,
        height: estimatedHeight,
        text: processedLabel,
        fontSize: fontSize,
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