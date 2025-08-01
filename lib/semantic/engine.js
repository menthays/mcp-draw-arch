const { ARCHITECTURE_PATTERNS } = require('../knowledge/patterns');

/**
 * The Semantic Engine processes natural language descriptions to generate a structured
 * architecture model based on a domain-specific knowledge base.
 */
class SemanticEngine {
  constructor(patterns) {
    this.patterns = patterns;
  }

  /**
   * Analyzes a text description to produce a structured architecture representation.
   * This is the main entry point for the engine.
   * @param {string} description - The user's natural language description of the architecture.
   * @returns {Object} A structured architecture object that conforms to ArchitectureSchema.
   */
  analyze(description) {
    // 1. Detect the most likely architecture pattern
    const pattern = this._detectPattern(description);
    if (!pattern) {
      throw new Error('Could not determine a suitable architecture pattern from the description.');
    }

    // 2. Identify components mentioned in the description
    const mentionedComponents = this._identifyComponents(description, pattern);

    // 3. Infer and add missing core components
    const allComponents = this._inferCoreComponents(mentionedComponents, pattern);

    // 4. Structure components into layers/groups
    const groupedNodes = this._groupComponentsIntoLayers(allComponents, pattern);

    // 5. Generate connections
    const connections = this._generateConnections(allComponents, pattern);

    return {
      nodes: groupedNodes,
      connections,
      layout: { type: 'layered', direction: 'TB' } // Default layout
    };
  }

  /**
   * Detects the architecture pattern from the description based on keywords.
   * @private
   */
  _detectPattern(description) {
    const lowerDescription = description.toLowerCase();
    let bestMatch = null;
    let highestScore = 0;

    for (const key in this.patterns) {
      const pattern = this.patterns[key];
      let score = 0;
      for (const keyword of pattern.keywords) {
        if (lowerDescription.includes(keyword)) {
          score++;
        }
      }
      if (score > highestScore) {
        highestScore = score;
        bestMatch = pattern;
      }
    }
    return bestMatch;
  }

  /**
   * Identifies specific components mentioned in the text.
   * @private
   */
  _identifyComponents(description, pattern) {
    const lowerDescription = description.toLowerCase();
    const foundComponents = new Map();

    for (const compId in pattern.components) {
      const component = pattern.components[compId];
      for (const keyword of component.keywords) {
        if (lowerDescription.includes(keyword) && !foundComponents.has(compId)) {
          foundComponents.set(compId, { ...component, id: compId });
        }
      }
    }
    return Array.from(foundComponents.values());
  }

  /**
   * Ensures all core components of the pattern are included.
   * @private
   */
  _inferCoreComponents(mentionedComponents, pattern) {
    const allComponents = new Map(mentionedComponents.map(c => [c.id, c]));

    for (const coreCompId of pattern.coreComponents) {
      if (!allComponents.has(coreCompId)) {
        const coreComponent = pattern.components[coreCompId];
        allComponents.set(coreCompId, { ...coreComponent, id: coreCompId });
      }
    }
    return Array.from(allComponents.values());
  }

  /**
   * Groups components into their designated layers.
   * @private
   */
  _groupComponentsIntoLayers(components, pattern) {
    // This is a simplified grouping. For full hierarchical support as per the new schema,
    // this would need to be more sophisticated, creating nested `nodes` within groups.
    // For now, we return a flat list of nodes, and grouping will be handled by the layout engine.
    return components.map(c => ({
      id: c.id,
      label: c.name,
      type: c.type,
      // We will need to map the layer `id` to a group/rank for layout purposes later.
      metadata: { layer: c.layer }
    }));
  }

  /**
   * Generates connections based on the pattern's default rules.
   * @private
   */
  _generateConnections(components, pattern) {
    const componentIds = new Set(components.map(c => c.id));
    const connections = [];

    for (const rule of pattern.defaultConnections) {
      if (rule.from && rule.to) {
        if (componentIds.has(rule.from) && componentIds.has(rule.to)) {
          connections.push({ from: rule.from, to: rule.to, type: rule.type, label: rule.label || '' });
        }
      } else if (rule.fromLayer) { // Handle layer-to-component connections
        const fromNodes = components.filter(c => c.layer === rule.fromLayer);
        if (componentIds.has(rule.to)) {
          for (const fromNode of fromNodes) {
            connections.push({ from: fromNode.id, to: rule.to, type: rule.type, label: rule.label || '' });
          }
        }
      }
    }
    return connections;
  }
}

module.exports = { SemanticEngine };
