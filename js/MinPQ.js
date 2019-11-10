// #******************************************************************************/
// #  Min priority queue
// #
// #  @author Eduardo Ch. Colorado
// #******************************************************************************/

// #   PRIORITY QUEUES 
// # API principal ops:
// # Insert an element into the heap
// # Remove the minimum/maximum (like a queue remove the oldest and a stack removes the newest)
// # A priority queue gets items on the fly and dispach the largest(smallest) on demand.
// # In this implementation of a min priority queue, a heap is used. 
// # A heap is conceptualized as a complete binary tree that satisfy the heap ordered property 
// #
// # DEF: A binary tree is heap ordered if any key in a node is greater (smaller) than its two child nodes 
// #
// # Each entry in the array is thought of as a leaf of a binary tree. The largest(smallest) key is
// # always put in the root. For convenience the zero entry is ignore
// #
// #   Conceptual visualization of a priority queue.
// #     0   1   2   3   4   5   6   7   8   9
// #   null  T   S   R   P   N   O   A   E   I
// #
// #                           1 | T
// #                         /       \                  This arragement allows us 
// #                        /         \                 find the parent of each leaf 
// #                   2 | S           3 | R            using integer divisions
// #                  /     \         /     \           for example  6//2 = 3 , 7//2 = 3,  
// #                 /       \       /       \          the entries 6 and 7 have 3 as its parent 
// #            4 | P    5 | N      6 | O     7 | A
// #          /       \
// #         /         \
// #    8 | E          9 | I
// #        
// #        A heap-ordered complete binary three

class MinPQ {
    constructor(){
        this.pq = [0]; // The zero is added to shift the root index from zero to one
        this.N  = 0;
    }
    isEmpty(){return this.N===0}
    delMin(){
        // raise a underflow exception if the priority queue is empty
        if(this.N ===0) throw("Priority queue underflow")
        let min_el = this.pq[1]; // save the root value
        try {this.pq[1] = this.pq.pop();}
        catch {pass}
        this.N -= 1; 
        //sink the element to its rigth place
        this.__sink(1);
        return min_el
    }
    min() {return this.pq[1]}

    insert(x) {
        this.N += 1;
        this.pq.push(x);
        this.__swim(this.N)
    }

    size(){return this.N}

    __sink(k) {
        let N = this.N // Last enntry on the list
        //sink the node k to its last leaf (which is in the last entry of the list)
        while(2*k <= N){
            let j = 2*k;
            // First we select the greatest of the two childs of the node k
            if(j < N && this.__greater(j,j+1)) j += 1
            //If the value of node k is not less than the value of the selected node we 
            //break the loop (the node k obey the heap oreder)
            if(!this.__greater(k,j)) break;
            //if we don't break the loop, we exchange the value of the child node with the value of the parent
            this.__exch(k, j)
            //finally we go up one level on the tree and repeate the process util we reach the root of the tree
            k = j
            // when we left this iteration we will end up with a complete oredered binary heap
        }
    }

    __swim(k){
        while(k > 1 && this.__greater(Math.floor(k / 2),k)){
            this.__exch(k, Math.floor(k / 2))
            k = Math.floor(k / 2)
        }
    }

    __greater(i, j){//I put a explicit field because I can't find a coparator in JS
        try {
            return this.pq[j].time < this.pq[i].time
        } catch (error) {
            return this.pq[j] < this.pq[i]
        }
        
    }
    __exch(i, j){
        let temp = this.pq[i]
        this.pq[i] = this.pq[j]
        this.pq[j] = temp
    }
} 