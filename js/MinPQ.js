class MinPQ {
    constructor(){
        this.pq = [0];
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