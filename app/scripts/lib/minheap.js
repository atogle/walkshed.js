// http://www.digitaltsunami.net/projects/javascript/minheap/index.html

/**
 * @fileOverview Implementation of a min heap.  Allows a comparator
 * to be provided so that the heap may contain objects that involve a
 * more complex comparison.
 */

/**

 * Implementation of a min heap allowing for a comparator
 * to be provided so that the heap may contain objects that involve a
 * more complex comparison.
 * <br>
 * This constructor constructs a MinHeap instance and takes two optional
 * parameters: an array and comparator.  If the array is provided, it
 * will be used as the backing store for the heap. Therefore, all
 * operations on the heap will be reflected in the provided array.
 * Usage
 * @example
 * Sample Usage:
  var heapq = new MinHeap();
  heapq.push(5);
  heapq.push(2);
  heapq.push(1);
  heapq.pop()); // returns 1
  heapq.pop()); // returns 2
 * @param array Array to use heapify or null to start with an empty
 * heap.
 * @param comparator alternate comparator used to compare each
 * item within the heap.  If not provided, the default will perform
 * a simple comparison on the item.
 *
 * @returns instance of MinHeap
 * @constructor
 */
function MinHeap(array, comparator) {

    /**
     * Storage for heap.
     * @private
     */
  this.heap = array || new Array();

    /**
     * Default comparator used if an override is not provided.
     * @private
     */
  this.compare = comparator || function(item1, item2) {
    return item1 == item2 ? 0 : item1 < item2 ? -1 : 1;
  };

    /**
     * Retrieve the index of the left child of the node at index i.
     * @private
     */
  this.left = function(i) {
    return 2 * i + 1;
  };
    /**
     * Retrieve the index of the right child of the node at index i.
     * @private
     */
  this.right = function(i) {
    return 2 * i + 2;
  };
    /**
     * Retrieve the index of the parent of the node at index i.
     * @private
     */
  this.parent = function(i) {
    return Math.ceil(i / 2) - 1;
  };

    /**
     * Ensure that the contents of the heap don't violate the
     * constraint.
     * @private
     */
  this.heapify = function(i) {
    var lIdx = this.left(i);
    var rIdx = this.right(i);
    var smallest;
    if (lIdx < this.heap.length
        && this.compare(this.heap[lIdx], this.heap[i]) < 0) {
      smallest = lIdx;
    } else {
      smallest = i;
    }
    if (rIdx < this.heap.length
        && this.compare(this.heap[rIdx], this.heap[smallest]) < 0) {
      smallest = rIdx;
    }
    if (i != smallest) {
      var temp = this.heap[smallest];
      this.heap[smallest] = this.heap[i];
      this.heap[i] = temp;
      this.heapify(smallest);
    }
  };

    /**
     * Starting with the node at index i, move up the heap until parent value
     * is less than the node.
     * @private
     */
  this.siftUp = function(i) {
    var p = this.parent(i);
    if (p >= 0 && this.compare(this.heap[p], this.heap[i]) > 0) {
      var temp = this.heap[p];
      this.heap[p] = this.heap[i];
      this.heap[i] = temp;
      this.siftUp(p);
    }
  };

    /**
     * Heapify the contents of an array.
     * This function is called when an array is provided.
     * @private
     */
  this.heapifyArray = function() {
    // for loop starting from floor size/2 going up and heapify each.
    var i = Math.floor(this.heap.length / 2) - 1;
    for (; i >= 0; i--) {
    //  jstestdriver.console.log("i: ", i);
      this.heapify(i);
    }
  };

  // If an initial array was provided, then heapify the array.
  if (array != null) {
    this.heapifyArray();
  }
  ;
}

/**
 * Place an item in the heap.
 * @param item
 * @function
 */
MinHeap.prototype.push = function(item) {
  this.heap.push(item);
  this.siftUp(this.heap.length - 1);
};

/**
 * Insert an item into the heap.
 * @param item
 * @function
 */
MinHeap.prototype.insert = function(item) {
    this.push(item);
};

/**
 * Pop the minimum valued item off of the heap. The heap is then updated
 * to float the next smallest item to the top of the heap.
 * @returns the minimum value contained within the heap.
 * @function
 */
MinHeap.prototype.pop = function() {
  var value;
  if (this.heap.length > 1) {
    value = this.heap[0];
    // Put the bottom element at the top and let it drift down.
    this.heap[0] = this.heap.pop();
    this.heapify(0);
  } else {
    value = this.heap.pop();
  }
  return value;
};

/**
 * Remove the minimum item from the heap.
 * @returns the minimum value contained within the heap.
 * @function
 */
MinHeap.prototype.remove = function() {
    return this.pop();
};


/**
 * Returns the minimum value contained within the heap.  This will
 * not remove the value from the heap.
 * @returns the minimum value within the heap.
 * @function
 */
MinHeap.prototype.getMin = function() {
  return this.heap[0];
};

/**
 * Return the current number of elements within the heap.
 * @returns size of the heap.
 * @function
 */
MinHeap.prototype.size = function() {
  return this.heap.length;
};
