const endScreen = document.querySelector("#end-screen");
let frames;
const HZ = 0.5;    // number of redraw events per clock tick
let minimumRadius = 10;
endScreen.style.display = "none"; 
/**
 *  The {@code CollisionSystem} class represents a collection of particles
 *  moving in the unit box, according to the laws of elastic collision.
 *  This event-based simulation relies on a priority queue.
 *
 *  This simulations support the elastic restitution coefficient and angular impulse
 *  effects for a more robust implementation.
 *
 *  <p>
 *  This code was inspired by the one published on
 *  <i>Algorithms, 4th Edition</i> by Robert Sedgewick and Kevin Wayne.
 *
 *  @author Eduardo Chávez Colorado
 */
class CollissionSystem {
    constructor(particles) {
        this.interval;
        this.pq;   // event priority queue
        this.t=0;  // simulation clock time
        this.particles = [...particles]; //defensive copy
    }
    // updates priority queue with all new events for a particle
    predict(particleA, isRunning) {
        if (particleA === null) return;
        // particle-particle collisions
        for (var i = 0; i < this.particles.length; i++) {
            let dt = particleA.timeToHit(this.particles[i]);
            if ((dt!==Infinity)&&isRunning)
                this.pq.insert(new Event(this.t + dt, particleA, this.particles[i]));
        }
        // particle-wall collisions
        let dtX = particleA.timeToHitVerticalWall();
        let dtY = particleA.timeToHitHorizontalWall();
        if (isRunning) this.pq.insert(new Event(this.t + dtX, particleA, null));
        if (isRunning) this.pq.insert(new Event(this.t + dtY, null, particleA));
    }
    // redraw all particles
    redraw(isRunning) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.draw_background()
        for (var i = 0; i < this.particles.length; i++) {
            this.particles[i].draw();
            if(!isNaN(this.particles[i].radius)) {
                this.checkCollition(player1, this.particles[i]);
                if(mode2P) this.checkCollition(player2, this.particles[i]);
            } else {
                this.particles.splice(i,1)
                i--;
            }
            player1.draw(this.t);
            if(mode2P) player2.draw(this.t);
        } 
        if(mode2P) this.checkCollition(player1, player2);       
        if (isRunning) {
            this.pq.insert(new Event(this.t + 1.0 / HZ, null, null));
        }
    }
    checkCollition(player, particle) {
        if (player.isTouching(particle)) {
        this.phagocytosis(player, particle)
        }
    }
    printScore() {
        ctx.font = "90px Ubuntu Mono"
        ctx.fillStyle = "Red";
        ctx.fillText(message, canvas.width/2 -130, canvas.height/2-30);
    }
    phagocytosis(cellA, cellB) {
		// Determine bigger cell
		let bigger = cellA;
		let smaller = cellB;
		if (cellB.radius > cellA.radius) {
			bigger = cellB;
			smaller = cellA;
		}
		// Overlap amount will affect transfer amount
		let overlap = (cellA.radius + cellB.radius - cellA.getDistance(cellB)) / (2 * smaller.radius);
		if (overlap > 1) overlap = 1;
		// overlap *= overlap;
		let mass_exchange = overlap * smaller.area() ;//overlap * smaller.area() * * (this.t/1000);	
        smaller.radius -= mass_exchange / (2*Math.PI*smaller.radius) //smaller.radius > 2 ? mass_exchange / (2*Math.PI*smaller.radius) : 0; 
        smaller.mass=2*Math.PI*smaller.radius*smaller.radius; 
        bigger.radius += mass_exchange / (2*Math.PI*bigger.radius);
        bigger.mass=2*Math.PI*bigger.radius*bigger.radius;
	
		// Check if we just killed one of the cells
		if (smaller.radius <=2) {
            smaller.radius = 0;
			smaller.dead = true;
            // If we just killed the player, callback.
            // console.log(cellA.constructor.name)
			if (smaller === cellA && cellA.constructor.name === 'Player')
                this.player_did_die();
            if (smaller === cellB && cellB.constructor.name === 'Player')
                this.player_did_die();
        }   
    };

    player_win() {
        if(this.particles.length === 0 || particles.reduce((acc,el) => acc + el.radius, 0) === 0){
            clearInterval(this.interval)
            ctx.font = "60px Arial"
            ctx.fillStyle = "green";
            ctx.shadowColor = "red";
            ctx.shadowBlur = 40;
            ctx.fillText("You win!!!", canvas.width/2 -150, canvas.height/2);
            ctx.restore();
        }        
    }
    //if a player cell has died print the appropriate message in the screen 
    player_did_die(){
        clearInterval(this.interval); //stop the main loop
        // this.interval = null;
        // system = null;
        ctx.font = "60px Arial"
        ctx.fillStyle = "green";
        ctx.shadowColor = "red";
        ctx.shadowBlur = 40;
        let message;
        
        if(!mode2P){
            message = "Game Over";
        } 
        else {
            let s = player1.dead ? 2 : 1;
            ctx.fillStyle = player1.dead ? player1.color : player2.color;
            message =`player ${s} wins!!!`
        }
        ctx.fillText(message, canvas.width/2 -150, canvas.height/2);
        ctx.restore();
        sound.pause();
        endScreen.style.display = "block"

    }
    draw_background(){
        let backgroundGradient = ctx.createLinearGradient(0,0,0, canvas.height);
        backgroundGradient.addColorStop(0,"#2B180F");
        backgroundGradient.addColorStop(1,"#000000");
        ctx.fillStyle = backgroundGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    warning1(player) {
        let warning = "not enough mass to propel"
        ctx.font = "40px Arial"
        ctx.fillStyle = "yellow";
        if(!player.dead && player.radius < minimumRadius) {
            ctx.fillText(warning, canvas.width/2 -150, canvas.height/2);
        }
        // ctx.restore();
    }

    warning2(player) {
        ctx.font = "40px Arial"
        ctx.fillStyle = "yellow";
        let message;
        let s = player1.radius  < minimumRadius ? 1 : 2;
        if(!player.dead && player.radius < minimumRadius) {
            message = `player ${s} has not enough mass to propel!!!`;
            ctx.fillText(message, canvas.width/2 -150, canvas.height/2);
        }
        // ctx.restore();
    }
    
    /**
     * Simulates the system of particles.
     *
     * @param  isRunning is a boolean indicating if the simulation is running 
     */
    simulate(isRunning) {
        // initialize PQ with collision events and redraw event
        this.pq = new MinPQ();
        for (let i = 0; i < this.particles.length; i++) {
            this.predict(this.particles[i], isRunning);
        }
        
        this.pq.insert(new Event(0, null, null));        // redraw event
        // the main event-driven simulation loop
        const loop = ()=>{            
            frames++;
            if(!mode2P) this.warning1(player1)
            else {
                this.warning2(player1)
                this.warning2(player2)
            }
            // get impending event, discard if invalidated
            let e = this.pq.delMin();
            if (!e.isValid()) return;
            let a = e.particleA;
            let b = e.particleB;
            // physical collision, so update positions, and the simulation clock
            for (var i = 0; i < this.particles.length; i++){ 
                this.particles[i].move(e.time - this.t);
            }
            
            this.t = e.time;            
            // process event
            if      (a !== null && b !== null) a.bounceOff(b);              // particle-particle collision
            else if (a !== null && b === null) a.bounceOffVerticalWall();   // particle-wall collision
            else if (a === null && b !== null) b.bounceOffHorizontalWall(); // particle-wall collision
            else if (a === null && b === null) this.redraw(isRunning);      // redraw event
            
            // update the priority queue with new collisions involving a or b
            this.predict(a, isRunning);
            this.predict(b, isRunning);
            /////          
            this.player_win();
            document.onkeydown = (e) => {
                // Checking if Arrow keys are pressed
                e.preventDefault();
                // console.log(e.target)
                switch (e.keyCode) {
                    case 37:
                        if(player1.radius < minimumRadius) return
                        let newCellLeft = player1.propel_from(-1,0);
                        this.particles.push(newCellLeft)
                        this.predict(newCellLeft, isRunning);
                        break;
                    case 38:
                        if(player1.radius < minimumRadius) return
                        let newCellUp = player1.propel_from(0,-1)
                        this.particles.push(newCellUp)
                        this.predict(newCellUp, isRunning);
                        break;
                    case 39:
                        if(player1.radius < minimumRadius) return
                        let newCellRight = player1.propel_from(1,0)
                        this.particles.push(newCellRight)
                        this.predict(newCellRight, isRunning);
                        break;
                    case 40:
                        if(player1.radius < minimumRadius) return
                        let newCellDown = player1.propel_from(0,1)
                        this.particles.push(newCellDown)
                        this.predict(newCellDown, isRunning);
                        break;
                    case 65:
                        if(player2.radius < minimumRadius) return
                        let newCellLeft2 = player2.propel_from(-1,0);
                        this.particles.push(newCellLeft2)
                        this.predict(newCellLeft2, isRunning);
                        break;
                    case 87:
                        if(player2.radius < minimumRadius) return
                        let newCellUp2 = player2.propel_from(0,-1)
                        this.particles.push(newCellUp2)
                        this.predict(newCellUp2, isRunning);
                        break;
                    case 68:
                        if(player2.radius < minimumRadius) return
                        let newCellRight2 = player2.propel_from(1, 0)
                        this.particles.push(newCellRight2)
                        this.predict(newCellRight2, isRunning);
                        break;
                    case 83:
                        if(player2.radius < minimumRadius) return
                        let newCellDown2 = player2.propel_from(0, 1)
                        this.particles.push(newCellDown2)
                        this.predict(newCellDown2, isRunning);
                        break;
                    default:
                        break;
                    }
                    
              };
        }

        this.interval = setInterval(loop, 1000 / 60);
    }
}
/***************************************************************************
 *  An event during a particle collision simulation. Each event contains
 *  the time at which it will occur (assuming no supervening actions)
 *  and the particles a and b involved.
 *
 *    -  a and b both null:      redraw event
 *    -  a null, b not null:     collision with vertical wall
 *    -  a not null, b null:     collision with horizontal wall
 *    -  a and b both not null:  binary collision between a and b
 *
 ***************************************************************************/
class Event  {
    // create a new event to occur at time t involving a and b
    constructor(t, particleA, particleB) {
        this.time = t;                    // time that event is scheduled to occur
        // particles involved in event, possibly null
        this.particleA    = particleA;
        this.particleB    = particleB;
        // countA, countB;  // collision counts at event creation
        if (particleA !== null) this.countA = particleA.counter();
        else           this.countA = -1;
        if (particleB !== null) this.countB = particleB.counter();
        else           this.countB = -1;
    }

    // has any collision occurred between when event was created and now?
    isValid() {
        if (this.particleA !== null && this.particleA.counter() !== this.countA) return false;
        if (this.particleB !== null && this.particleB.counter() !== this.countB) return false;
        if (this.particleA !== null && this.particleA.dead) return false;
        if (this.particleB !== null && this.particleB.dead) return false;
        return true;
    }
}
