// Refactored old code

class WorkerPool{
	constructor(size){
		this.size = size;
		this.inUse = (new Array(size)).fill(false);
		this.avalible = size;
		this.slotQueue = [];
		this.executingTasks = 0;
		this.waitingForEnd = [];
	}
	/**
     * Detects when all workers terminate and fires off the apporiate promises
     *
     * @memberof WorkerPool
     */
    updateTaskExecStatus(){
		if(this.executingTasks == 0){
			this.waitingForEnd.forEach((resolve) => resolve());
		}
	}
	/**
     * Wait for all workers to finish. 
     *
     * @return {*} 
     * @memberof WorkerPool
     */
    waitForAllTasks(){
		return new Promise((resolve, reject) => {
			this.waitingForEnd.push(resolve);
		});
	}
	/**
     * Tries to find a slot in the slots array. 
     *
     * @return {*} 
     * @memberof WorkerPool
     */
    findSlot(){
		if(this.avalible == 0){
			return -1;
		}
		for(let i = 0; i < this.size; i ++){
			if(!this.inUse[i]){
				return i;
			}
		}
		return -1;
	}

	/**
     * Marks a slot as being used. 
     *
     * @param {*} index
     * @memberof WorkerPool
     */
    markSlotinUse(index){
		// console.log("Slot",index,"is now in use");
		this.inUse[index] = true;
		this.avalible --;
	}
	/**
     * Releases a worker slot. 
     *
     * @param {*} index
     * @memberof WorkerPool
     */
    releaseSlot(index){
		// console.log("Slot",index,"is no longer in use");
		this.inUse[index] = false;
		if(this.slotQueue.length > 0){
			//console.log(this.slotQueue);
			let resolve = this.slotQueue.shift();
			//console.log("Got a",resolve);
			resolve(index);
		}
		this.avalible ++;
	}

	/**
     * Acquires a worker, if none can be acquired when called, the promise is put into a queue.
     * The method returns when your promise is fufilled aka when your request gets dequed.  
     *
     * @return {*} 
     * @memberof WorkerPool
     */
    async acquireWorker(){
        
		if(this.avalible == 0){
			let slot = await (new Promise((resolve, reject) => {
				//console.log("Pushed",resolve);
				this.slotQueue.push(resolve);
			}));
			//console.log("Acquire Slot",slot);
			this.markSlotinUse(slot);
			let releaseFunc = () => this.releaseSlot(slot);
			return releaseFunc;
		}else{
			let slot = this.findSlot();
			//console.log("Acquire Slot Instant",slot);
			this.markSlotinUse(slot);
			let savedThis = this;
			let releaseFunc = function(){
				savedThis.releaseSlot(slot);
			};
			return releaseFunc;
		}
	}
    /**
     * Waits to acquire a worker and then runs code, returns when code is done running. 
     *
     * @param {Function} func
     * @memberof WorkerPool
     */
	async runInWorker(func){
		let onFinish = await this.acquireWorker();
		this.executingTasks ++;
		this.updateTaskExecStatus();
		try{
			await func(...Array.from(arguments).slice(1));
		}catch(ex){
			
		}
		this.executingTasks --;
		this.updateTaskExecStatus();
		await onFinish();
	}

	/**
     * Waits to acquire a worker and then runs code asynchronously
     *
     * @param {Function} func
     * @memberof WorkerPool
     */
    async runInWorkerNowait(func){
		let onFinish = await this.acquireWorker();
		(async () => {
			this.executingTasks ++;
			this.updateTaskExecStatus();
			try{
				await func(...Array.from(arguments).slice(1));
			}catch(ex){

			}
			await onFinish();
			this.executingTasks --;
			this.updateTaskExecStatus();
		})();
	}
}

export default WorkerPool;