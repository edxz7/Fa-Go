const canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height= window.innerHeight; 
const ctx = canvas.getContext('2d');
// ctx.fillStyle="#F8038B"
ctx.fillRect(0, 0, canvas.width, canvas.height)
const INFINITY = Infinity;
/**
 *  The {@code Cell} class represents a cell as a rigid sphere. This
 *  class will be the parent class from Players and enemies will inherit
 *  <p>
 *  This code was inspired by the one published on
 *  <i>Algorithms, 4th Edition</i> by Robert Sedgewick and Kevin Wayne.
 *  @author Eduardo Chávez Colorado
 */
class Cell {
    constructor(rx = 400 + (Math.random()*window.innerWidth-300), 
                ry = Math.random()*window.innerHeight, 
                vx = -1*Math.random() + Math.random(), 
                vy = -1*Math.random() + Math.random(), 
                radius = Math.random()*50 + 20, 
                color = "green"){
            this.rx     = rx;
            this.ry     = ry;
            this.vx     = vx//0*StdRandom.uniform(-0.005, 0.005);
            this.vy     = vy//0.01*StdRandom.uniform(-0.005, 0.005);
            this.radius = radius;
            this.mass   = 2*Math.PI*radius*radius; 
            this.color  = color;
            this.dead = false;
    }
    area() {
		return Math.PI * this.radius * this.radius;
    }
    getDistance(particle) {
		let dx = this.rx - particle.rx;
		let dy = this.ry - particle.ry;
		return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    }
    isTouching(particle) {
        return this.getDistance(particle) < this.radius + particle.radius;        
    }
}


class Particle extends Cell {
    constructor(rx, ry, vx, vy, radius, color){
        super(rx, ry, vx, vy, radius, color)
        this.e      = 1.0; //restitution coefficient
        this.count  = 0;
        this.score  = 0;
    }
    /**
     * Moves this particle in a straight line (based on its velocity)
     * for the specified amount of time.
     *
     * @param  dt the amount of time
     */
    move(dt) {
        this.rx += this.vx * dt;
        this.ry += this.vy * dt;
    }
    /**
     * Returns the number of collisions involving this particle with
     * vertical walls, horizontal walls, or other particles.
     * This is equal to the number of calls to {@link #bounceOff},
     * {@link #bounceOffVerticalWall}, and
     * {@link #bounceOffHorizontalWall}.
     *
     * @return the number of collisions involving this particle with
     *         vertical walls, horizontal walls, or other particles
     */
    counter() {
        return this.count;
    }
    //Predict the time for particle-particle or particle-wall  collisions
    /**
     * ri and rj are the position vectors of the particles
     * sigma = sigma_i + sigma_j : sigma is the distance between the centers of the particles
     *
     * At the moment of the collision:  ri - rj = sigma. Therefore
     *
     * sigma^2 = (rx_j -  rx_i)^2 + (ry_j - ry_i)^2 = dr•dr    1)
     * where dr = rj - rj                                      2)
     *
     * Prior the collision the particles i and j move with trajectories ri + vi*dt amd
     * rj + vj*dt. Solving 1) for dt using 2) whe fount the dt we are going to return
     *
     * Returns the amount of time for this particle to collide with the specified
     * particle, assuming no intervening collisions.
     *
     * @param  that the other particle
     * @return the amount of time for this particle to collide with the specified
     *         particle, assuming no intervening collisions;
     *         {@code Double.POSITIVE_INFINITY} if the particles will not collide
     */
    timeToHit(that) {
        if (this === that) return INFINITY;
        let dx  = that.rx - this.rx;
        let dy  = that.ry - this.ry;
        let dvx = that.vx - this.vx;
        let dvy = that.vy - this.vy;
        let dvdr = dx*dvx + dy*dvy;
        if (dvdr > 0) return INFINITY;
        let dvdv = dvx*dvx + dvy*dvy;
        if (dvdv === 0) return INFINITY;
        let drdr = dx*dx + dy*dy;
        let sigma = this.radius + that.radius;
        let d = (dvdr*dvdr) - dvdv * (drdr - sigma*sigma);
        
        // if (drdr < sigma*sigma) StdOut.println("overlapping particles");
        if (d < 0) return INFINITY;
        return -(dvdr + Math.sqrt(d)) / dvdv;
    }

    /**
     * To get a collision between this particle and a vertical/horizontal wall)
     * its trajectory r + v*dt must be equal to its radius (bottom/left wall)
     * or equal to 1 - its radius (up/right wall)
     *
     * Returns the amount of time for this particle to collide with a vertical
     * wall, assuming no interening collisions.
     *
     * @return the amount of time for this particle to collide with a vertical wall,
     *         assuming no interening collisions;
     *         {@code Double.POSITIVE_INFINITY} if the particle will not collide
     *         with a vertical wall
     */

    timeToHitVerticalWall() {
        if      (this.vx > 0) return (window.innerWidth - this.rx - this.radius) / this.vx;
        else if (this.vx < 0) return (this.radius - this.rx) / this.vx;
        else             return INFINITY;
    }

    /**
     * Returns the amount of time for this particle to collide with a horizontal
     * wall, assuming no interening collisions.
     *
     * @return the amount of time for this particle to collide with a horizontal wall,
     *         assuming no interening collisions;
     *         {@code Double.POSITIVE_INFINITY} if the particle will not collide
     *         with a horizontal wall
     */
    timeToHitHorizontalWall() {
        if      (this.vy > 0) return (window.innerHeight - this.ry - this.radius) / this.vy;
        else if (this.vy < 0) return (this.radius - this.ry) / this.vy;
        else             return INFINITY;
    }
    // resolve the particle behavior after collision with other particles or walls
    /**
     * This part of the code uses impulse methods to changing the velocities of the
     * interacting objects.
     *
     * Updates the velocities of this particle and the specified particle according
     * to the laws of elastic collision. Assumes that the particles are colliding
     * at this instant.
     *
     * @param  that the other particle
     */

    bounceOff(that){
        let dx  = that.rx - this.rx;
        let dy  = that.ry - this.ry;
        let dvx = that.vx - this.vx;
        let dvy = that.vy - this.vy;
        let dvdr = dx*dvx + dy*dvy;             // dv dot dr
        let sigma = this.radius + that.radius;   //separation of the particles centers

        //magnitude of the impulse gain during the collision
        let J = (1 + this.e) * this.mass * that.mass * dvdr/((this.mass + that.mass) * sigma);

        // normal force, and in x and y directions
        let Jx = J*dx/sigma;
        let Jy = J*dy/sigma;

        // Update the velocities of each particle caused by the change of momentum
        // (impulse) after the collision (for conservation of momentum
        // the magnitudes are the same but they have opposite directions)
        this.vx += Jx/this.mass;
        this.vy += Jy/this.mass;
        that.vx -= Jx/that.mass;
        that.vy -= Jy/that.mass;

        //update the collision counts
        this.count++;
        that.count++;
    }

    /**
     * Updates the velocity of this particle upon collision with a vertical
     * wall (by reflecting the velocity in the <em>x</em>-direction).
     * Assumes that the particle is colliding with a vertical wall at this instant.
     */
    bounceOffVerticalWall() {
        this.vx = -this.vx;
        this.count++;
    }

    /**
     * Updates the velocity of this particle upon collision with a horizontal
     * wall (by reflecting the velocity in the <em>y</em>-direction).
     * Assumes that the particle is colliding with a horizontal wall at this instant.
     */
    bounceOffHorizontalWall() {
        this.vy = -this.vy;
        this.count++;
    }
    /**
     * Draws this particle to standard draw.
     */
    draw() {
        // ctx.clearRect(0, 0, canvas.width, canvas.height);
        const gradient = ctx.createRadialGradient(75, 50, 5, 90, 60, 100);
        gradient.addColorStop(0, '#3ABF61')
        gradient.addColorStop(1,'#C9FFFF')

        ctx.beginPath()
        // console.log(this.color)
        ctx.strokeStyle=this.color;
        ctx.arc(this.rx, this.ry, this.radius,0, 2*Math.PI, false);
        ctx.strokeStyle=gradient;
        ctx.lineCap = 'square'
        ctx.stroke();
        // ctx.fillStyle = gradient
        // ctx.fill();
        ctx.shadowColor = this.color//'#9F1FD6';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        // ctx.fillStyle = "#3CCB69";
        // ctx.fill();
        ctx.closePath();
        ctx.restore();
    }
}

class Player extends Cell {
    constructor(rx, ry, vx, vy, radius, color){
        super(rx, ry, vx, vy, radius, color)
        this.friction=0.999;
    }
    move(dt) {
        if(this.rx + this.radius > window.innerWidth || this.rx - this.radius < 0) 
            this.vx = -this.vx;
        if(this.ry +this.radius > window.innerHeight || this.ry -this.radius < 0) 
            this.vy = -this.vy;
        this.rx += this.vx * dt;
        this.ry += this.vy * dt;
        // Friction
		this.vx *= this.friction;
        this.vy *= this.friction;
    }
    horizontalBounce() { this.vx = -this.vx; };
    verticalBounce() { this.vy = -this.vy; };
	set_position(x, y) { this.rx = x; this.ry = y; };
    propel_from(x, y) {
		if (this && !this.dead) {
            let dx = x;
			let dy = y;
			// Normalize dx/dy
			let mag = Math.sqrt(2) //Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
			dx /= mag;
			dy /= mag;
			// Reduce force in proportion to area
			let area = this.area();
			let fx = dx*0.0005//dx * (5/9);// (400 / (area + 64));
			let fy = dy*0.0005//dy * (5/9);//(400 / (area + 64));
			
            // Push player
            this.vx += fx;
			this.vy += fy;
			// Lose 1/5 of the mass
			let expense = (area/5) / (2*Math.PI*this.radius);
            this.radius -= expense;
            this.mass = this.radius;
            let olakhease = true;
			
			// Shoot off the expended mass in opposite direction
            let newrad = Math.sqrt((area/20)/Math.PI);
            let newx = this.rx - (dx * (this.radius + newrad + 1)); // The +1 is for cushioning!
			let newy = this.ry - (dy * (this.radius + newrad + 1));
            let newcell = new Particle(newx, newy,-dx*0.5,-dy*0.5, newrad);//new Cell(newx, newy, newrad);
			return newcell;
        }
    }
    draw(dt) {
        const gradient = ctx.createRadialGradient(75, 50, 5, 90, 60, 100);
        gradient.addColorStop(0, '#3ABF61')
        gradient.addColorStop(1,'#C9FFFF')
        this.move(dt);
        ctx.beginPath();
        ctx.arc(this.rx, this.ry, this.radius, 0, Math.PI*2);
        ctx.strokeStyle = gradient; //"#3ABF61";
        ctx.lineWidth = 5;
        ctx.lineCap = 'square';
        ctx.stroke()
        ctx.shadowColor = this.color;//'#3CCB69';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.closePath();
        ctx.restore()
      }  
}