/**
 * GRAPH ANALYZER (DFS/BFS IMPLEMENTATION)
 * 
 * Data Structure: Adjacency List Graph
 * Algorithms: Depth-First Search (DFS) and Breadth-First Search (BFS)
 * Purpose: Detect interconnected fraud networks via shared IPs, locations, or patterns
 * 
 * Time Complexity:
 * - Build Graph: O(V + E) where V = vertices, E = edges
 * - DFS: O(V + E)
 * - BFS: O(V + E)
 * 
 * This analyzer identifies fraud rings by finding connected components
 * of users sharing suspicious attributes (same IP, rapid succession, etc.)
 */

class FraudNetworkGraph {
  constructor() {
    this.adjacencyList = new Map();
  }

  // Add vertex (user/transaction)
  addVertex(vertex) {
    if (!this.adjacencyList.has(vertex)) {
      this.adjacencyList.set(vertex, []);
    }
  }

  // Add edge (connection between entities)
  addEdge(vertex1, vertex2, weight = 1) {
    this.addVertex(vertex1);
    this.addVertex(vertex2);
    
    this.adjacencyList.get(vertex1).push({ node: vertex2, weight });
    this.adjacencyList.get(vertex2).push({ node: vertex1, weight });
  }

  // Depth-First Search to find connected fraud network
  dfs(startVertex, visited = new Set()) {
    if (!this.adjacencyList.has(startVertex)) return [];
    
    const result = [];
    const stack = [startVertex];
    
    while (stack.length > 0) {
      const vertex = stack.pop();
      
      if (visited.has(vertex)) continue;
      
      visited.add(vertex);
      result.push(vertex);
      
      const neighbors = this.adjacencyList.get(vertex) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.node)) {
          stack.push(neighbor.node);
        }
      }
    }
    
    return result;
  }

  // Breadth-First Search to find shortest fraud path
  bfs(startVertex) {
    if (!this.adjacencyList.has(startVertex)) return [];
    
    const visited = new Set();
    const queue = [startVertex];
    const result = [];
    
    visited.add(startVertex);
    
    while (queue.length > 0) {
      const vertex = queue.shift();
      result.push(vertex);
      
      const neighbors = this.adjacencyList.get(vertex) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.node)) {
          visited.add(neighbor.node);
          queue.push(neighbor.node);
        }
      }
    }
    
    return result;
  }

  // Find all connected components (fraud rings)
  findConnectedComponents() {
    const visited = new Set();
    const components = [];
    
    for (const vertex of this.adjacencyList.keys()) {
      if (!visited.has(vertex)) {
        const component = this.dfs(vertex, visited);
        if (component.length > 1) {
          components.push(component);
        }
      }
    }
    
    return components;
  }

  // Check if two entities are connected (potential fraud ring)
  areConnected(vertex1, vertex2) {
    if (!this.adjacencyList.has(vertex1)) return false;
    
    const visited = new Set();
    const queue = [vertex1];
    visited.add(vertex1);
    
    while (queue.length > 0) {
      const current = queue.shift();
      
      if (current === vertex2) return true;
      
      const neighbors = this.adjacencyList.get(current) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.node)) {
          visited.add(neighbor.node);
          queue.push(neighbor.node);
        }
      }
    }
    
    return false;
  }

  // Get network statistics
  getNetworkStats() {
    const components = this.findConnectedComponents();
    
    return {
      totalVertices: this.adjacencyList.size,
      totalEdges: this.getTotalEdges(),
      fraudRings: components.length,
      largestRing: components.length > 0 
        ? Math.max(...components.map(c => c.length))
        : 0,
      components: components
    };
  }

  // Get total edges
  getTotalEdges() {
    let count = 0;
    for (const edges of this.adjacencyList.values()) {
      count += edges.length;
    }
    return count / 2; // Undirected graph
  }
}

export default FraudNetworkGraph;
