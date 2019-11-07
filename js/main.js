const startGame = document.querySelector(".single");
const gameMode = document.querySelector(".vs");
// geme
let mode2P = true;
let player2 = null;
if(mode2P) {
    player2 = new Player(canvas.width-200, canvas.height-200, 0, 0, 40, "#3CCB69");
    mode = true;
}
let particles = [];     // the array of particles
let players = [];
const player1 = new Player(100, 100, 0, 0, 40, "#9F1FD6");

for(let i = 0; i < 20; i++){
    particles.push(new Particle())
}
const system = new CollissionSystem(particles);

//Game Engine
window.onload = () => {
    document.querySelector('body').onclick = () => {
        startGame()
    }
    function startGame(){
        if(system.interval) return
        system.simulate(true);
    }    
}
