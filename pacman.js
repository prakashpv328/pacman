let board; 
const rowCount=21;
const columnCount=19;
const tileSize=32;
const boardWidth=columnCount*tileSize;
const boardHeight=rowCount*tileSize;
let context;

let blueGhostImage;
let orangeGhostImage;
let pinkGhostImage;
let redGhostImage;

let pacmanUpImage;
let pacmanDownImage;
let pacmanLeftImage;
let pacmanRightImage;

let wallImage;

const tileMap = [
    "XXXXXXXXXXXXXXXXXXX",
    "X        X        X",
    "X XX XXX X XXX XX X",
    "X                 X",
    "X XX X XXXXX X XX X",
    "X    X       X    X",
    "XXXX XXXX XXXX XXXX",
    "OOOX X       X XOOO",
    "XXXX X XXrXX X XXXX",
    "O       bpo       O",
    "XXXX X XXXXX X XXXX",
    "OOOX X       X XOOO",
    "XXXX X XXXXX X XXXX",
    "X        X        X",
    "X XX XXX X XXX XX X",
    "X  X     P     X  X",
    "XX X X XXXXX X X XX",
    "X    X   X   X    X",
    "X XXXXXX X XXXXXX X",
    "X                 X",
    "XXXXXXXXXXXXXXXXXXX" 
];

const walls=new Set();
const foods=new Set();
const ghosts=new Set();

let pacman;

const directions=['U','D','L','R'];
let score=0;
let lives=3;
let gameOver=false;

let nextPacmanDirection=null;

window.onload=function(){
    board=document.getElementById("board");
    board.height=boardHeight;
    board.width=boardWidth;
    context=board.getContext("2d");

    loadImages();
    loadMap();

    // console.log(walls.size);
    // console.log(foods.size);
    // console.log(ghosts.size);

    for(let ghost of ghosts.values()){
        const newDirection=directions[Math.floor(Math.random()*4)];
        ghost.updateDirection(newDirection);
    }
    update();
    document.addEventListener("keydown",movePacman);
}

function loadImages(){
    wallImage=new Image();
    wallImage.src="./wall.png";

    blueGhostImage=new Image();
    blueGhostImage.src="./blueGhost.png";
    orangeGhostImage=new Image();
    orangeGhostImage.src="./orangeGhost.png";
    pinkGhostImage=new Image();
    pinkGhostImage.src="./pinkGhost.png";
    redGhostImage=new Image();
    redGhostImage.src="./redGhost.png";

    pacmanUpImage=new Image();
    pacmanUpImage.src="./pacmanUp.png";
    pacmanDownImage=new Image();
    pacmanDownImage.src="./pacmanDown.png";
    pacmanLeftImage=new Image();
    pacmanLeftImage.src="./pacmanLeft.png";
    pacmanRightImage=new Image();
    pacmanRightImage.src="./pacmanRight.png";
}

function loadMap(){
    walls.clear();
    foods.clear();
    ghosts.clear();

    for(let r=0;r<rowCount;r++){
        for(let c=0;c<columnCount;c++){
            const row=tileMap[r];
            const tileMapChar=row[c];

            const x=c*tileSize;
            const y=r*tileSize;

            if(tileMapChar==='X'){
                const wall = new Block(wallImage,x,y,tileSize,tileSize);
                walls.add(wall);
            }
            else if(tileMapChar==='b'){
                const ghost =new Block(blueGhostImage,x,y,tileSize,tileSize);
                ghosts.add(ghost);
            }
            else if(tileMapChar==='r'){
                const ghost=new Block(redGhostImage,x,y,tileSize,tileSize);
                ghosts.add(ghost);
            }
            else if(tileMapChar==='p'){
                const ghost=new Block(pinkGhostImage,x,y,tileSize,tileSize);
                ghosts.add(ghost);
            }
            else if(tileMapChar==='o'){
                const ghost=new Block(orangeGhostImage,x,y,tileSize,tileSize);
                ghosts.add(ghost);
            }
            else if(tileMapChar==='P'){
                pacman=new Block(pacmanRightImage,x,y,tileSize,tileSize);
            }
            else if(tileMapChar===' '){
                const food=new Block(null,x+14,y+14,4,4);
                foods.add(food);
            }
        }
    }
    nextPacmanDirection=null;
}


function update(){
    if(gameOver){
        return;
    }
    move();
    draw();
    setTimeout(update,50);
}

function draw(){
    context.clearRect(0,0,board.width,board.height);
    context.drawImage(pacman.image,pacman.x,pacman.y,pacman.width,pacman.height);


    for(let ghost of ghosts.values()){
        context.drawImage(ghost.image,ghost.x,ghost.y,ghost.width,ghost.height);
    }

    for(let wall of walls.values()){
        context.drawImage(wall.image,wall.x,wall.y,wall.width,wall.height);
    }

    context.fillStyle="white";

    for(let food of foods.values()){
        context.fillRect(food.x,food.y,food.width,food.height);
    }

    context.fillStyle="white";
    context.font="14px sans-serif";

    if(gameOver){
        context.fillText("Game Over: "+String(score),tileSize/2,tileSize/2);
    }
    else{
        context.fillText("x"+String(lives)+ " "+String(score),tileSize/2,tileSize/2)
    }
}

function wrapEntity(entity){
    if(entity.x<-entity.width){
        entity.x=boardWidth;
    }
    else if(entity.x>boardWidth){
        entity.x=-entity.width;
    }
}

function canMoveInDirection(block,direction){
    const vx=(direction==='L' ? -tileSize/4 : direction==='R' ? tileSize/4 :0);
    const vy=(direction==='U' ? -tileSize/4 : direction==='D' ? tileSize/4 :0);

    const test ={
        x:block.x+vx,
        y:block.y+vy,
        width:block.width,
        height:block.height
    };

    for(let wall of walls.values()){
        if(collision(test,wall)) return false;
    }
    return true;
}

function setPacmanImageByDirection(){
    if(pacman.direction=='U') pacman.image=pacmanUpImage;
    else if(pacman.direction=='D') pacman.image=pacmanDownImage;
    else if(pacman.direction=='L') pacman.image=pacmanLeftImage;
    else if(pacman.direction=='R') pacman.image=pacmanRightImage;
}

function move(){

    if(nextPacmanDirection && canMoveInDirection(pacman,nextPacmanDirection)){
        pacman.direction=nextPacmanDirection;
        pacman.updateVelocity();
        setPacmanImageByDirection();
    }

    pacman.x+=pacman.velocityX;
    pacman.y+=pacman.velocityY;

    wrapEntity(pacman);

    for(let wall of walls.values()){
        if(collision(pacman,wall)){
            pacman.x-=pacman.velocityX;
            pacman.y-=pacman.velocityY;
            break;
        }
    }

    for(let ghost of ghosts.values()){
        if(collision(ghost,pacman)){
            lives-=1;
            if(lives==0){
                gameOver=true;
                return;
            }
            resetPositions();
        }

        if(ghost.y==tileSize*9 && ghost.direction !='U' && ghost.direction!='D'){
            ghost.updateDirection('U');
        }

        ghost.x+=ghost.velocityX;
        ghost.y+=ghost.velocityY;

        for(let wall of walls.values()){
            if(collision(ghost,wall) || ghost.x<=0 || ghost.x+ghost.width>=boardWidth){
                ghost.x-=ghost.velocityX;
                ghost.y-=ghost.velocityY;
                const newDirection=directions[Math.floor(Math.random()*4)];
                ghost.updateDirection(newDirection);
            }
        }
    }

    let foodEaten=null;
    for(let food of foods.values()){
        if(collision(pacman,food)){
            foodEaten=food;
            score+=10;
            break;
        }
    }
    foods.delete(foodEaten);

    if(foods.size==0){
        loadMap();
        resetPositions();
    }
}

function movePacman(e){

    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","keyW","KeyA","keyS","KeyD"].includes(e.code)){
        e.preventDefault();
    }

    if(gameOver){
        loadMap();
        resetPositions();
        lives=3;
        score=0;
        gameOver=false;
        update();
        return;
    }

    if(e.code==="ArrowUp" || e.code==="KeyW"){
        nextPacmanDirection='U';
    }
    else if(e.code==="ArrowDown" || e.code==="KeyS"){
        nextPacmanDirection='D';
    }
    else if(e.code==='ArrowRight' || e.code==="KeyD"){
        nextPacmanDirection='R';
    }
    else if(e.code==='ArrowLeft' || e.code==="KeyA"){
        nextPacmanDirection='L';
    }
    
    // if(pacman.direction=='U'){
    //     pacman.image=pacmanUpImage;
    // }
    // else if(pacman.direction=='D'){
    //     pacman.image=pacmanDownImage;
    // }
    // else if(pacman.direction=='L'){
    //     pacman.image=pacmanLeftImage;
    // }
    // else if(pacman.direction=='R'){
    //     pacman.image=pacmanRightImage;
    // }
}

function collision(a,b){
    return a.x<b.x+b.width &&
            a.x+a.width>b.x &&
            a.y<b.y+b.height &&
            a.y+a.height>b.y
}

function resetPositions(){
    pacman.reset();
    pacman.velocityX=0;
    pacman.velocityY=0;

    nextPacmanDirection=null;

    for(let ghost of ghosts.values()){
        ghost.reset();
        const newDirection=directions[Math.floor(Math.random()*4)];
        ghost.updateDirection(newDirection);
    }
}


class Block{
    constructor(image,x,y,width,height){
        this.image=image;
        this.x=x;
        this.y=y;
        this.width=width;
        this.height=height;

        this.startX=x;
        this.startY=y;

        this.direction='R';
        this.velocityX=0;
        this.velocityY=0;
    }

    updateDirection(direction){
        const prevDirection=this.direction;
        this.direction=direction;
        this.updateVelocity();

        this.x+=this.velocityX;
        this.y+=this.velocityY;

        for(let wall of walls.values()){
            if(collision(this,wall)){
                this.x-=this.velocityX;
                this.y-=this.velocityY;

                this.direction=prevDirection;
                this.updateVelocity();
                return;
            }
        }
    }

    updateVelocity(){
        if(this.direction=='U'){
            this.velocityX=0;
            this.velocityY=-tileSize/4;
        }
        else if(this.direction=='D'){
            this.velocityX=0;
            this.velocityY=tileSize/4;
        }
        else if(this.direction=='L'){
            this.velocityX=-tileSize/4;
            this.velocityY=0;
        }
        else if(this.direction=='R'){
            this.velocityX=tileSize/4;
            this.velocityY=0;
        }
    }

    reset(){
        this.x=this.startX;
        this.y=this.startY;
    }
}