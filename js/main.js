const initGame = document.querySelector("body");
const game = document.querySelector("#splash-screen");
const controls = document.querySelector("#controls");
const vs = document.querySelector("#vs");
const options = document.querySelector('#options')
let player2 = null;
let mode2P = false;
let particles = [];     // the array of particles
let player1 = new Player(100, 100, 0, 0, 50, "#9F1FD6");
// hide the canvas and the controls screen. They shoould appear only when a 
// button is click 
canvas.style.display    = "none";
controls.style.display  = "none";
options.style.display   = "none";
let sound = new Audio("assets/music.m4a")

function generateCells(numEnemies){
    for(let i = 0; i < numEnemies; i++){
        particles.push(new Particle())
    }
}
generateCells(12)
let system = new CollissionSystem(particles);

function goBack(){
    document.location.href=""   
}

function restart(){
    system.restart();
    particles=[];
    player1 = new Player(100, 100, 0, 0, 50, "#9F1FD6");
    generateCells(12);
    system = new CollissionSystem(particles);
    options.style.display   = "none";
}

//Game Engine
function startGame(){
    if(system.interval) return
    system.simulate(true);
} 


window.onload = () => {
    let flag = false;
    initGame.addEventListener('keyup', e =>{
        e.preventDefault();
        if(e.keyCode===13 && !flag && game.style.display ){
            options.style.display='block';
            flag = !flag;
        }
        else if(flag){
            options.style.display='none';
            flag = !flag; 
        }
    })
    initGame.addEventListener('click', e => {
        if(e.target.classList.contains('vs')){
            player2 = new Player(canvas.width- 200, canvas.height-200, 0, 0, 50, "#3CCB69");
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
        else if(e.target.classList.contains('controls')){
            game.style.display = "none"
            controls.style.display = "block";
        }
        else if(e.target.classList.contains('go-back')){
            goBack()
        }
        else if(e.target.classList.contains('restart')){
            restart()
            startGame();
            sound.play();
        }
        else if(e.target.classList.contains('main-menu')){
            goBack()
        }
    })
// initGame.onclick = () => {
//         startGame() 
//     }  
}
