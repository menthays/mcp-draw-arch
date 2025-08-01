const { NODE_STYLES } = require('./schema');

/**
 * Layout Engine - Converts semantic architecture to positioned layout
 * Handles automatic positioning and sizing of nodes and connections
 */

class LayoutEngine {
  constructor() {
    this.canvas = {
      width: 1200,
      height: 800,
      padding: 50
    };
  }

  /**
   * Generate layout from architecture description
   * @param {Object} architecture - Validated architecture DSL
   * @returns {Object} Layout with positioned nodes and connections
   */
  generateLayout(architecture) {
    const { nodes, connections, groups, layout = {} } = architecture;
    const layoutType = layout.type || 'hierarchical';
    
    switch (layoutType) {
      case 'hierarchical':
        return this.generateHierarchicalLayout(nodes, connections, groups, layout);
      case 'grid':
        return this.generateGridLayout(nodes, connections, groups, layout);
      case 'layered':
        return this.generateLayeredLayout(nodes, connections, groups, layout);
      default:
        return this.generateHierarchicalLayout(nodes, connections, groups, layout);
    }
  }

  /**
   * Hierarchical layout - organizes nodes in layers based on dependencies
   */
  generateHierarchicalLayout(nodes, connections, groups, layoutConfig) {
    const direction = layoutConfig.direction || 'TB';
    const spacing = layoutConfig.spacing || { node: 80, rank: 100 };
    
    // Build dependency graph
    const dependencyGraph = this.buildDependencyGraph(nodes, connections);
    
    // Assign layers based on dependencies
    const layers = this.assignLayers(nodes, dependencyGraph);
    
    // Position nodes within layers
    const positionedNodes = this.positionNodesInLayers(layers, direction, spacing);
    
    // Calculate connection paths
    const positionedConnections = this.calculateConnectionPaths(connections, positionedNodes);
    
    return {
      nodes: positionedNodes,
      connections: positionedConnections,
      groups: this.positionGroups(groups, positionedNodes),
      bounds: this.calculateBounds(positionedNodes)
    };
  }

  /**
   * Grid layout - arranges nodes in a regular grid
   */
  generateGridLayout(nodes, connections, groups, layoutConfig) {
    const spacing = layoutConfig.spacing || { node: 80, rank: 100 };
    const cols = Math.ceil(Math.sqrt(nodes.length));
    const rows = Math.ceil(nodes.length / cols);
    
    const positionedNodes = nodes.map((node, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      const style = NODE_STYLES[node.type] || NODE_STYLES.service;
      
      return {
        ...node,
        x: this.canvas.padding + col * (style.width + spacing.node),
        y: this.canvas.padding + row * (style.height + spacing.rank),
        width: style.width,
        height: style.height,
        style
      };
    });
    
    const positionedConnections = this.calculateConnectionPaths(connections, positionedNodes);
    
    return {
      nodes: positionedNodes,
      connections: positionedConnections,
      groups: this.positionGroups(groups, positionedNodes),
      bounds: this.calculateBounds(positionedNodes)
    };
  }

  /**
   * Layered layout - organizes nodes by logical layers (UI, Business, Data)
   */
  generateLayeredLayout(nodes, connections, groups, layoutConfig) {
    const direction = layoutConfig.direction || 'TB';
    const spacing = layoutConfig.spacing || { node: 80, rank: 120 };
    
    // Group nodes by type into logical layers
    const layers = this.groupNodesByType(nodes);
    
    // Position layers
    const positionedNodes = this.positionLayeredNodes(layers, direction, spacing);
    
    // Calculate connections
    const positionedConnections = this.calculateConnectionPaths(connections, positionedNodes);
    
    return {
      nodes: positionedNodes,
      connections: positionedConnections,
      groups: this.positionGroups(groups, positionedNodes),
      bounds: this.calculateBounds(positionedNodes)
    };
  }

  /**
   * Build dependency graph from connections
   */
  buildDependencyGraph(nodes, connections) {
    const graph = {};
    nodes.forEach(node => {
      graph[node.id] = { incoming: [], outgoing: [] };
    });
    
    connections.forEach(conn => {
      if (graph[conn.from] && graph[conn.to]) {
        graph[conn.from].outgoing.push(conn.to);
        graph[conn.to].incoming.push(conn.from);
      }
    });
    
    return graph;
  }

  /**
   * Assign nodes to layers based on dependencies (topological sort)
   */
  assignLayers(nodes, dependencyGraph) {
    const layers = [];
    const visited = new Set();
    const nodeToLayer = {};
    
    // Find nodes with no incoming dependencies (layer 0)
    const rootNodes = nodes.filter(node => 
      dependencyGraph[node.id].incoming.length === 0
    );
    
    if (rootNodes.length === 0) {
      // Circular dependencies or isolated nodes - use simple grouping
      return this.groupNodesByType(nodes);
    }
    
    // BFS to assign layers
    let currentLayer = 0;
    let queue = [...rootNodes];
    
    while (queue.length > 0) {
      if (!layers[currentLayer]) layers[currentLayer] = [];
      
      const nextQueue = [];
      
      queue.forEach(node => {
        if (!visited.has(node.id)) {
          visited.add(node.id);
          layers[currentLayer].push(node);
          nodeToLayer[node.id] = currentLayer;
          
          // Add dependent nodes to next layer
          dependencyGraph[node.id].outgoing.forEach(depId => {
            const depNode = nodes.find(n => n.id === depId);
            if (depNode && !visited.has(depId)) {
              nextQueue.push(depNode);
            }
          });
        }
      });
      
      queue = nextQueue;
      currentLayer++;
    }
    
    // Add any remaining unvisited nodes
    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        if (!layers[currentLayer]) layers[currentLayer] = [];
        layers[currentLayer].push(node);
      }
    });
    
    return layers;
  }

  /**
   * Group nodes by type for layered layout
   */
  groupNodesByType(nodes) {
    const typeOrder = ['actor', 'ui', 'gateway', 'service', 'queue', 'cache', 'database', 'external'];
    const layers = [];
    
    typeOrder.forEach(type => {
      const nodesOfType = nodes.filter(node => node.type === type);
      if (nodesOfType.length > 0) {
        layers.push(nodesOfType);
      }
    });
    
    // Add any remaining nodes not in typeOrder
    const remainingNodes = nodes.filter(node => !typeOrder.includes(node.type));
    if (remainingNodes.length > 0) {
      layers.push(remainingNodes);
    }
    
    return layers;
  }

  /**
   * Position nodes within layers
   */
  positionNodesInLayers(layers, direction, spacing) {
    const positionedNodes = [];
    const isVertical = direction === 'TB' || direction === 'BT';
    
    layers.forEach((layer, layerIndex) => {
      const layerNodes = layer.map((node, nodeIndex) => {
        const style = NODE_STYLES[node.type] || NODE_STYLES.service;
        
        let x, y;
        if (isVertical) {
          // Vertical layout (TB/BT)
          const totalWidth = layer.length * style.width + (layer.length - 1) * spacing.node;
          const startX = (this.canvas.width - totalWidth) / 2;
          x = startX + nodeIndex * (style.width + spacing.node);
          y = direction === 'TB' 
            ? this.canvas.padding + layerIndex * (style.height + spacing.rank)
            : this.canvas.height - this.canvas.padding - (layerIndex + 1) * (style.height + spacing.rank);
        } else {
          // Horizontal layout (LR/RL)
          const totalHeight = layer.length * style.height + (layer.length - 1) * spacing.node;
          const startY = (this.canvas.height - totalHeight) / 2;
          y = startY + nodeIndex * (style.height + spacing.node);
          x = direction === 'LR'
            ? this.canvas.padding + layerIndex * (style.width + spacing.rank)
            : this.canvas.width - this.canvas.padding - (layerIndex + 1) * (style.width + spacing.rank);
        }
        
        return {
          ...node,
          x,
          y,
          width: style.width,
          height: style.height,
          style
        };
      });
      
      positionedNodes.push(...layerNodes);
    });
    
    return positionedNodes;
  }

  /**
   * Position nodes for layered layout
   */
  positionLayeredNodes(layers, direction, spacing) {
    return this.positionNodesInLayers(layers, direction, spacing);
  }

  /**
   * Calculate connection paths between positioned nodes
   */
  calculateConnectionPaths(connections, positionedNodes) {
    const nodeMap = {};
    positionedNodes.forEach(node => {
      nodeMap[node.id] = node;
    });
    
    return connections.map(conn => {
      const fromNode = nodeMap[conn.from];
      const toNode = nodeMap[conn.to];
      
      if (!fromNode || !toNode) {
        console.warn(`Connection references missing node: ${conn.from} -> ${conn.to}`);
        return null;
      }
      
      // Calculate optimal connection points
      const connectionPoints = this.calculateOptimalConnectionPoints(fromNode, toNode);
      
      return {
        ...conn,
        ...connectionPoints,
        id: conn.id || `conn_${conn.from}_${conn.to}`
      };
    }).filter(Boolean);
  }

  /**
   * Calculate optimal connection points between two nodes
   */
  calculateOptimalConnectionPoints(fromNode, toNode) {
    const fromCenter = {
      x: fromNode.x + fromNode.width / 2,
      y: fromNode.y + fromNode.height / 2
    };
    const toCenter = {
      x: toNode.x + toNode.width / 2,
      y: toNode.y + toNode.height / 2
    };
    
    // Determine connection direction
    const dx = toCenter.x - fromCenter.x;
    const dy = toCenter.y - fromCenter.y;
    
    let fromPoint, toPoint;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal connection
      if (dx > 0) {
        // Left to right
        fromPoint = { x: fromNode.x + fromNode.width, y: fromCenter.y };
        toPoint = { x: toNode.x, y: toCenter.y };
      } else {
        // Right to left
        fromPoint = { x: fromNode.x, y: fromCenter.y };
        toPoint = { x: toNode.x + toNode.width, y: toCenter.y };
      }
    } else {
      // Vertical connection
      if (dy > 0) {
        // Top to bottom
        fromPoint = { x: fromCenter.x, y: fromNode.y + fromNode.height };
        toPoint = { x: toCenter.x, y: toNode.y };
      } else {
        // Bottom to top
        fromPoint = { x: fromCenter.x, y: fromNode.y };
        toPoint = { x: toCenter.x, y: toNode.y + toNode.height };
      }
    }
    
    return {
      fromPoint,
      toPoint,
      path: [fromPoint, toPoint]
    };
  }

  /**
   * Position groups around their contained nodes
   */
  positionGroups(groups, positionedNodes) {
    const nodeMap = {};
    positionedNodes.forEach(node => {
      nodeMap[node.id] = node;
    });
    
    return groups.map(group => {
      const containedNodes = group.contains
        .map(nodeId => nodeMap[nodeId])
        .filter(Boolean);
      
      if (containedNodes.length === 0) return null;
      
      // Calculate bounding box
      const bounds = this.calculateBounds(containedNodes);
      const padding = 20;
      
      return {
        ...group,
        x: bounds.minX - padding,
        y: bounds.minY - padding,
        width: bounds.width + 2 * padding,
        height: bounds.height + 2 * padding
      };
    }).filter(Boolean);
  }

  /**
   * Calculate bounding box for a set of nodes
   */
  calculateBounds(nodes) {
    if (nodes.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
    }
    
    const minX = Math.min(...nodes.map(n => n.x));
    const minY = Math.min(...nodes.map(n => n.y));
    const maxX = Math.max(...nodes.map(n => n.x + n.width));
    const maxY = Math.max(...nodes.map(n => n.y + n.height));
    
    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY
    };
  }
}

module.exports = { LayoutEngine };
