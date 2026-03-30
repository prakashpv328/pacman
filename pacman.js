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

let smallCherryImage;
let bigCherryImage;

let tileMap=[];

const tileMap1=[
    "XXXXXXXXXXXXXXXXXXX",
    "X        X        X",
    "X XX XXX X XXX XX X",
    "X        s        X",
    "X XX X XXXXX X XX X",
    "Xs   X       X   sX",
    "XXXX XXXX XXXX XXXX",
    "OOOX X       X XOOO",
    "XXXX X XXrXX X XXXX",
    "O l     bpo     l O",
    "XXXX X XXXXX X XXXX",
    "OOOX X   s   X XOOO",
    "XXXX X XXXXX X XXXX",
    "X        X        X",
    "X XX XXX X XXX XX X",
    "X  X     P     X  X",
    "XX X X XXXXX X X XX",
    "X    X   X   X    X",
    "X XXXXXX X XXXXXX X",
    "Xs               sX",
    "XXXXXXXXXXXXXXXXXXX"
];

const tileMap2=[
    "XXXXXXXXXXXXXXXXXXX",
  "X       s X      sX", 
  "X XXXXXXX X XXXXX X",
  "X X     X X X     X",
  "X X XXX X X X XXX X",
  "Xs  X   X   X  oX X",
  "XXX X XXXXXXX X XXX",
  "X   Xb  X X   X   X",
  "X XXXXX X X XXXXX X",
  "O   l   X   X   l O",
  "X XXXXX X X XXXXX X",
  "X   Xp  XsX   X   X",
  "XXX X XXXXXXX X XXX",
  "X   X   X   X  rX X",
  "X X XXX X X X XXX X",
  "X X     X X X     X",
  "X XXXXXXX X XXXXX X",
  "X         P       X",
  "X XXXXXXX X XXXXX X",
  "X s       X      sX",
  "XXXXXXXXXXXXXXXXXXX"
];

const tileMap3 = [
  "XXXXXXXXXXXXXXXXXXX",
  "X s      X      s X",
  "X XXXXX  X  XXXXX X",
  "X X   X     X   X X",
  "X X X XXXXXXX X X X",
  "X   X   X X   X   X",
  "X XXXXX X X XXXXX X",
  "X        r        X",
  "X XXX X XXX X XXX X",
  "O l   X obp X   l O",
  "X XXX X XXX X XXX X",
  "X     X  s  X     X",
  "X X XXX X X XXX X X",
  "X   X   X X   X   X",
  "X X X XXXXXXX X X X",
  "X X   X     X   X X",
  "X XXXXX  X  XXXXX X",
  "X   s    P    s   X",
  "X XXXXX  X  XXXXX X",
  "X s             s X",
  "XXXXXXXXXXXXXXXXXXX"
];

const tileMap4=[
  "XXXXXXXXXXXXXXXXXXX",
  "X   s   XXX    s  X",
  "X XXXXX X X  XXXX X",
  "X X   X        X  X",
  "X X X XXXXXXXX X  X",
  "X   X   X  X   X  X",
  "XXX XXX XX XX XXX X",
  "X     X        X  X",
  "X XXX X XXXXXXXX XX",
  "O l   X r b p o l O",
  "X XXX X XXXXXXXX XX",
  "X         s       X",
  "XXX XXX XX XX XXX X",
  "X   X   X  X   X  X",
  "X X X XXXXXXXX X XX",
  "X   X        X    X",
  "X XXXXX X X XXXXX X",
  "X   s    P      s X",
  "X XXXXX X X XXXXX X",
  "X s     XXX     s X",
  "XXXXXXXXXXXXXXXXXXX"
]

const tileMaps=[tileMap1,tileMap2,tileMap3,tileMap4];
let lastMapIndex=-1;

const walls=new Set();
const foods=new Set();
const ghosts=new Set();
const cherries=new Set();

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
    selectRandomMap();
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

function selectRandomMap(){
    if(tileMaps.length==0) return;

    let idx=Math.floor(Math.random()*tileMaps.length);

    if(tileMaps.length>1){
        while(idx===lastMapIndex){
            idx=Math.floor(Math.random()*tileMaps.length);
        }
    }

    lastMapIndex=idx;
    tileMap=tileMaps[idx];
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

    smallCherryImage=new Image();
    smallCherryImage.src="./smallCherry.png";
    bigCherryImage=new Image();
    bigCherryImage.src="./bigCherry.png";
}

function loadMap(){
    walls.clear();
    foods.clear();
    ghosts.clear();
    cherries.clear();

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
            else if(tileMapChar==='s'){
                cherries.add(makeCherry(smallCherryImage,c,r,50));
            }
            else if(tileMapChar==='l'){
                cherries.add(makeCherry(bigCherryImage,c,r,100));
            }
            else if(tileMapChar===' '){
                const food=new Block(null,x+14,y+14,4,4);
                foods.add(food);
            }
        }
    }

    // placeCherriesAndRemoveDots();

    nextPacmanDirection=null;
}

function makeCherry(image,col,row,points){
    const x=col*tileSize;
    const y=row*tileSize;

    const size=20;
    const offset=(tileSize-size)/2;

    const cherry=new Block(image,x+offset,y+offset,size,size);
    cherry.points=points;

    return cherry;
}

// function tileCenterToDotBlock(col,row){
//     return {x:col*tileSize+14,y:row*tileSize+14};
// }

// function removeDotAtTile(col,row){
//     const dotPos=tileCenterToDotBlock(col,row);
//     let dotToRemove=null;

//     for(let food of foods.values()){
//         if(food.x===dotPos.x && food.y===dotPos.y){
//             dotToRemove=food;
//             break;
//         }
//     }

//     if(dotToRemove) foods.delete(dotToRemove);
// }

// function isWallTile(col,row){
//     const x=col*tileSize;
//     const y=row*tileSize;

//     for(let w of walls.values()){
//         if(w.x===x && w.y===y) return true;
//     }

//     return false;
// }

// function placeCherriesAndRemoveDots(){
//     const smallPositions=[
//         {c:1,r:5},
//         {c:17,r:5},
//         {c:1,r:19},
//         {c:17,r:19},
//         {c:9,r:3},
//         {c:9,r:11},
//     ];

//     const bigPositions=[
//         {c:1,r:9},
//         {c:17,r:9},
//     ];

//     for(const p of smallPositions){
//         if(!isWallTile(p.c,p.r)){
//             cherries.add(makeCherry(smallCherryImage,p.c,p.r,50));
//             removeDotAtTile(p.c,p.r);
//         }
//     }

//     for(const p of bigPositions){
//         if(!isWallTile(p.c,p.r)){
//             cherries.add(makeCherry(bigCherryImage,p.c,p.r,100));
//             removeDotAtTile(p.c,p.r);
//         }
//     }
// }


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

    for(let cherry of cherries.values()){
        context.drawImage(cherry.image,cherry.x,cherry.y,cherry.width,cherry.height);
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

    let cherryEaten=null;
    for(let cherry of cherries.values()){
        if(collision(pacman,cherry)){
            cherryEaten=cherry;
            score+=cherry.points;
            break;
        }
    }
    if(cherryEaten) cherries.delete(cherryEaten);

    if(foods.size==0 && cherries.size==0){
        selectRandomMap();
        loadMap();
        resetPositions();
    }
}

function movePacman(e){

    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","keyW","KeyA","keyS","KeyD"].includes(e.code)){
        e.preventDefault();
    }

    if(gameOver){
        selectRandomMap();
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