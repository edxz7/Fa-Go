const initGame = document.querySelector("body");
const game = document.querySelector("#splash-screen");
const vs = document.querySelector(".vs");
let player2 = null;
let mode2P = false;
let particles = [];     // the array of particles
let players = [];
const player1 = new Player(100, 100, 0, 0, 50, "#9F1FD6");
canvas.style.display = "none";
for(let i = 0; i < 20; i++){
    particles.push(new Particle())
}

const system = new CollissionSystem(particles);
//Game Engine
function startGame(){
    if(system.interval) return
    system.simulate(true);
} 
const sound = new Audio("assets/music.m4a")
window.onload = () => {
    initGame.addEventListener('click', e => {
        if(e.target.classList.contains('vs')){
            player2 = new Player(canvas.width-200, canvas.height-200, 0, 0, 50, "#3CCB69");
            mode = true;
            mode2P = true;
            game.style.display = "none"
            canvas.style.display = "block";
            startGame();
            sound.play();
        }
        else if(e.target.classList.contains('single')){
            game.style.display = "none"
            canvas.style.display = "block";
            startGame();
            sound.play();
        }
    })
// initGame.onclick = () => {
//         startGame() 
//     }  
}
