/**
 * PRIORITY QUEUE IMPLEMENTATION (MIN-HEAP)
 * 
 * Data Structure: Binary Min-Heap
 * Purpose: Efficiently manage and retrieve high-risk transactions for admin review
 * 
 * Time Complexity:
 * - Insert: O(log n)
 * - Extract Min: O(log n)
 * - Peek: O(1)
 * 
 * This priority queue orders transactions by risk score (descending),
 * ensuring admins always see the most suspicious transactions first.
 */

class PriorityQueue {
  constructor() {
    this.heap = [];
  }

  // Get parent index
  getParentIndex(index) {
    return Math.floor((index - 1) / 2);
  }

  // Get left child index
  getLeftChildIndex(index) {
    return 2 * index + 1;
  }

  // Get right child index
  getRightChildIndex(index) {
    return 2 * index + 2;
  }

  // Swap elements
  swap(index1, index2) {
    [this.heap[index1], this.heap[index2]] = [this.heap[index2], this.heap[index1]];
  }

  // Insert transaction (O(log n))
  enqueue(transaction) {
    this.heap.push(transaction);
    this.heapifyUp(this.heap.length - 1);
  }

  // Bubble up to maintain heap property
  heapifyUp(index) {
    while (index > 0) {
      const parentIndex = this.getParentIndex(index);
      
      // Max heap: parent should have higher risk score
      if (this.heap[parentIndex].riskScore >= this.heap[index].riskScore) {
        break;
      }
      
      this.swap(parentIndex, index);
      index = parentIndex;
    }
  }

  // Extract highest risk transaction (O(log n))
  dequeue() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const max = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.heapifyDown(0);
    
    return max;
  }

  // Bubble down to maintain heap property
  heapifyDown(index) {
    while (true) {
      let maxIndex = index;
      const leftIndex = this.getLeftChildIndex(index);
      const rightIndex = this.getRightChildIndex(index);

      if (leftIndex < this.heap.length && 
          this.heap[leftIndex].riskScore > this.heap[maxIndex].riskScore) {
        maxIndex = leftIndex;
      }

      if (rightIndex < this.heap.length && 
          this.heap[rightIndex].riskScore > this.heap[maxIndex].riskScore) {
        maxIndex = rightIndex;
      }

      if (maxIndex === index) break;

      this.swap(index, maxIndex);
      index = maxIndex;
    }
  }

  // Peek at highest risk transaction (O(1))
  peek() {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  // Get all transactions sorted by risk
  getAll() {
    return [...this.heap].sort((a, b) => b.riskScore - a.riskScore);
  }

  // Get size
  size() {
    return this.heap.length;
  }

  // Check if empty
  isEmpty() {
    return this.heap.length === 0;
  }
}

export default PriorityQueue;
