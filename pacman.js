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

let pacmanFullUpImage;
let pacmanFullDownImage;
let pacmanFullLeftImage;
let pacmanFullRightImage;

let pacmanCloseImage;

let wallImage;
let wallImages=[];

let smallCherryImage;
let bigCherryImage;

let heartImage;
let shieldImage;

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
    "Xs  X   X   X  o  X",
    "XX XX XXXXXXX X XXX",
    "X   Xb  X X   X   X",
    "X XXXXX X X XXXXX X",
    "O   l   X   X   l O",
    "X XXXXX X X XXXXX X",
    "X   Xp  XsX   X   X",
    "XX XX XXXXXXX X XXX",
    "X   X   X   X  r  X",
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

const hearts=new Set();
const shields=new Set();

let pacman;

let wallGrid=null;
const occupiedTiles=new Set();

function tileKey(col,row){
    return row*columnCount+col;
}

function pixelToTile(x,y){
    return {
        col:Math.floor(x/tileSize),
        row:Math.floor(y/tileSize)
    };
}

function setOccupiedFromEntities(){
    occupiedTiles.clear();

    if(pacman){
        const t=pixelToTile(pacman.x,pacman.y);
        occupiedTiles.add(tileKey(t.col,t.row));
    }
    for(const g of ghosts){
        const t=pixelToTile(g.x,g.y);
        occupiedTiles.add(tileKey(t.col,t.row));
    }
}

const directions=['U','D','L','R'];
let score=0;
let lives=3;
let gameStarted=false;
let gameOver=false;

let nextPacmanDirection=null;

const SHIELD_THRESHOLD=250;
const SHIELD_POWER_DURATION=5000;
const SHIELD_SPAWN_LIFETIME=10000;

let shieldActive=false;
let shieldTimer=0;
let shieldSpawnedAt=0;
let shieldStartScore=0;


const HEART_SPAWN_LIFETIME=10000;
let heartSpawnedAt=0;

let pacmanAnimIndex=0;
let pacmanAnimTick=0;
const PACMAN_ANIM_EVERY_TICKS=2;

const SETTINGS_KEY="pacman_settings";
const gameSettings={
    mapMode:"random",
    mapIndex:0,
    wallIndex:0,
};

let tempSettings={
    mapMode:"random",
    mapIndex:0,
    wallIndex:0,
};

function loadSettings(){
    try{
        const raw=localStorage.getItem(SETTINGS_KEY);
        if(!raw) return;
        const s=JSON.parse(raw);

        if(s && (s.mapMode==="random" || s.mapMode==="fixed")){
            gameSettings.mapMode=s.mapMode;
        }
        if(Number.isInteger(s.mapIndex) && s.mapIndex>=0 && s.mapIndex<tileMaps.length){
            gameSettings.mapIndex=s.mapIndex;
        }
        if(Number.isInteger(s.wallIndex) && s.wallIndex>=0 && s.wallIndex<4){
            gameSettings.wallIndex=s.wallIndex;
        }
        
    }
    catch(_e){}
}

function saveSettingsToStorage(){
    localStorage.setItem(SETTINGS_KEY,JSON.stringify(gameSettings));
}

function applyWallSelection(){
    if(wallImages.length>=4){
        wallImage=wallImages[gameSettings.wallIndex] || wallImages[0];
    }
}

function isLobbyVisible(){
    const lobby=document.getElementById("lobbyOverlay");
    return !!(lobby && !lobby.classList.contains("hidden"));
}

function isGameOverVisible(){
    const over=document.getElementById("gameOverOverlay");
    return !!(over && !over.classList.contains("hidden"));
}

function isSettingsVisible(){
    const settings=document.getElementById("settingsOverlay");
    return !!(settings && !settings.classList.contains("hidden"));
}

function showSettings(){
    const overlay=document.getElementById("settingsOverlay");
    if(!overlay) return;

    tempSettings={
        mapMode:gameSettings.mapMode,
        mapIndex:gameSettings.mapIndex,
        wallIndex:gameSettings.wallIndex,
    };

    overlay.classList.remove("hidden");
    renderSettings();
}

function hideSettings(){
    const overlay=document.getElementById("settingsOverlay");
    if(overlay) overlay.classList.add("hidden");
}

function setSelected(tile,selected){
    if(!tile) return;
    if(selected) tile.classList.add("selected");
    else tile.classList.remove("selected");
}

function renderSettings(){
    const randomTile=document.getElementById("mapRandomTile");
    setSelected(randomTile,tempSettings.mapMode==="random");

    for(let i=0;i<tileMaps.length;i++){
        const tile=document.getElementById(`mapTile${i}`);
        const selected=(tempSettings.mapMode==="fixed" && tempSettings.mapIndex===i);
        setSelected(tile,selected);
    }

    for(let w=0;w<4;w++){
        const tile = document.getElementById(`wallTile${w}`);
        setSelected(tile,tempSettings.wallIndex===w);
    }
}

function bindSettingsTileEvents(){
    const randomTile=document.getElementById("mapRandomTile");
    if(randomTile){
        randomTile.addEventListener("click",()=>{
            tempSettings.mapMode="random";
            renderSettings();
        });
    }

    for(let i=0;i<tileMaps.length;i++){
        const tile=document.getElementById(`mapTile${i}`);
        if(tile){
            tile.addEventListener("click",()=>{
                tempSettings.mapMode="fixed";
                tempSettings.mapIndex=i;
                renderSettings();

            });
        }
    }

    for(let w=0;w<4;w++){
        const tile=document.getElementById(`wallTile${w}`);
        if(tile){
            tile.addEventListener("click",()=>{
                tempSettings.wallIndex=w;
                renderSettings();
            });
        }
    }
}

function saveSettings(){
    gameSettings.mapMode=tempSettings.mapMode;
    gameSettings.mapIndex=tempSettings.mapIndex;
    gameSettings.wallIndex=tempSettings.wallIndex;

    applyWallSelection();
    saveSettingsToStorage();
}

function selectMapBySettings(){
    if(tileMaps.length==0) return;

    if(gameSettings.mapMode==="fixed"){
        const idx=gameSettings.mapIndex;
        lastMapIndex=idx;
        tileMap=tileMaps[idx];
        return;
    }

    let idx=Math.floor(Math.random()*tileMaps.length);

    if(tileMaps.length>1){
        while(idx===lastMapIndex){
            idx=Math.floor(Math.random()*tileMaps.length);
        }
    }

    lastMapIndex=idx;
    tileMap=tileMaps[idx];
}

const parsedMaps=tileMaps.map(parseTileMap);

function parseTileMap(mapRows){
    const wallCoords=[];
    const foodCoords=[];
    const cherrySmall=[];
    const cherryBig=[];
    const ghostSpawns=[];

    let pacmanSpawn={r:0,c:0};

    for(let r=0;r<rowCount;r++){
        const row=mapRows[r];
        for(let c=0;c<columnCount;c++){
            const ch=row[c];

            if(ch==="X") wallCoords.push({r,c});
            else if(ch===" ") foodCoords.push({r,c});
            else if(ch==="s") cherrySmall.push({r,c});
            else if(ch==="l") cherryBig.push({r,c});
            else if(ch==="P") pacmanSpawn={r,c};
            else if(ch==="b" || ch==="r" || ch==="p" || ch==="o") ghostSpawns.push({r,c,key:ch});
        }
    }

    return {wallCoords,foodCoords,cherrySmall,cherryBig,pacmanSpawn,ghostSpawns};
}

function getPacmanIdleImageByDirection(dir){
    if(dir==='U') return pacmanUpImage;
    if(dir==='D') return pacmanDownImage;
    if(dir==='L') return pacmanLeftImage;
    return pacmanRightImage;
}

function getPacmanFullImageByDirection(dir){
    if(dir==='U') return pacmanFullUpImage;
    if(dir==='D') return pacmanFullDownImage;
    if(dir==='L') return pacmanFullLeftImage;
    return pacmanFullRightImage;
}

function getPacmanOpenImageByDirection(dir){
    return pacmanCloseImage;
}

function updatePacmanAnimation(){
    const isMoving=(pacman.velocityX!==0 || pacman.velocityY!==0);

    if(!isMoving){
        pacman.image=getPacmanIdleImageByDirection(pacman.direction);
        pacmanAnimIndex=0;
        pacmanAnimTick=0;
        return;
    }

    pacmanAnimTick++;
    if(pacmanAnimTick>=PACMAN_ANIM_EVERY_TICKS){
        pacmanAnimTick=0;
        pacmanAnimIndex=(pacmanAnimIndex+1)%3;
    }

    if(pacmanAnimIndex===0){
        pacman.image=getPacmanIdleImageByDirection(pacman.direction);
    }
    else if(pacmanAnimIndex===1){
        pacman.image=getPacmanFullImageByDirection(pacman.direction);
    }
    else{
        pacman.image=getPacmanOpenImageByDirection(pacman.direction);
    }
}

window.onload=function(){
    board=document.getElementById("board");

    if(!board){
        console.error("Board not found. Make sure Html has a canvas element with board id");
        return;
    }

    board.height=boardHeight;
    board.width=boardWidth;
    context=board.getContext("2d");

    loadSettings();
    loadImages();

    bindSettingsTileEvents();


    const startBtn=this.document.getElementById("startBtn");
    if(startBtn) startBtn.addEventListener("click",startGame);

    const restartBtn=this.document.getElementById("restartBtn");
    if(restartBtn){
        restartBtn.addEventListener("click",restartGame)
    }

    const lobbyBtn=this.document.getElementById("lobbyBtn");
    if(lobbyBtn) lobbyBtn.addEventListener("click",goToLobby);

    const settingsBtn=this.document.getElementById("settingsBtn");
    if(settingsBtn) settingsBtn.addEventListener("click",()=>{
        if(isLobbyVisible()) showSettings();
    })

    const settingsCloseBtn=this.document.getElementById("settingsCloseBtn");
    if(settingsCloseBtn) settingsCloseBtn.addEventListener("click",hideSettings);

    const settingsSaveBtn=this.document.getElementById("settingsSaveBtn");
    if(settingsSaveBtn) settingsSaveBtn.addEventListener("click",()=>{
        saveSettings();
        hideSettings();
    });

    showLobby();

    this.document.addEventListener("keydown",movePacman);

    this.document.addEventListener("keydown",handleUiKeys);

    this.document.addEventListener("keydown",(e)=>{
        if(isSettingsVisible() && e.code==="Escape"){
            e.preventDefault();
            hideSettings();
        }
    });


    // selectRandomMap();
    // loadMap();

    // console.log(walls.size);
    // console.log(foods.size);
    // console.log(ghosts.size);

    // for(let ghost of ghosts.values()){
    //     const newDirection=directions[Math.floor(Math.random()*4)];
    //     ghost.updateDirection(newDirection);
    // }
    // update();
    // document.addEventListener("keydown",movePacman);

    // const closeBtn=this.document.getElementById("closeBtn");
    // if(closeBtn){
    //     closeBtn.addEventListener("click",()=>{
    //         hideGameOverPopup();
    //     })
    // }
}

function handleUiKeys(e){
    if(isSettingsVisible()){
        if(e.code==="Enter"){
            e.preventDefault();
            saveSettings();
            hideSettings();
        }
        return;
    }


    if(isLobbyVisible()){
        if(e.code==="Enter"){
            e.preventDefault();
            startGame();
        }
        return;
    }

    if(isGameOverVisible()){
        if(e.code==="Enter"){
            e.preventDefault();
            restartGame();
            return;
        }
        if(e.code==="Backspace"){
            e.preventDefault();
            goToLobby();
            return;
        }
        return;
    }
}

function showLobby(){
    const lobby=document.getElementById("lobbyOverlay");
    if(lobby) lobby.classList.remove("hidden");
}

function hideLobby(){
    const lobby=document.getElementById("lobbyOverlay");
    if(lobby) lobby.classList.add("hidden");
}

function showGameOverPopup(){
    const overlay=document.getElementById("gameOverOverlay");
    const scoreEl=document.getElementById("finalScoreText");
    if(scoreEl) scoreEl.textContent=String(score);
    if(overlay) overlay.classList.remove("hidden");
}

function hideGameOverPopup(){
    const overlay=document.getElementById("gameOverOverlay");
    if(overlay) overlay.classList.add("hidden");
}

function goToLobby(){
    stopLoop();
    hideGameOverPopup();
    hideSettings();

    gameStarted=false;
    gameOver=false;

    walls.clear();
    foods.clear();
    ghosts.clear();
    cherries.clear();
    hearts.clear();
    shields.clear();

    shieldActive=false;
    shieldTimer=0;
    shieldSpawnedAt=0;
    shieldStartScore=0;

    heartSpawnedAt=0;

    showLobby();
}

function startGame(){
    hideLobby();
    hideSettings();

    gameStarted=true;
    gameOver=false;

    lives=3;
    score=0;

    hearts.clear();
    shields.clear();
    heartSpawnedAt=0;
    shieldSpawnedAt=0

    shieldActive=false;
    shieldTimer=0;
    shieldStartScore=0;

    selectMapBySettings();
    loadMap();

    for(const ghost of ghosts){
        ghost.updateDirection(directions[Math.floor(Math.random()*4)]);
    }

    startLoop();
}


function restartGame(){
    hideGameOverPopup();
    hideSettings();

    lives=3;
    score=0;
    gameStarted=true;
    gameOver=false;


    shieldActive=false;
    shieldTimer=0;
    shieldSpawnedAt=0;
    shieldStartScore=0;
    shields.clear();


    heartSpawnedAt=0;
    hearts.clear();

    selectMapBySettings();
    loadMap();
    resetPositions();

    startLoop();
}

// function selectRandomMap(){
//     if(tileMaps.length==0) return;

//     let idx=Math.floor(Math.random()*tileMaps.length);

//     if(tileMaps.length>1){
//         while(idx===lastMapIndex){
//             idx=Math.floor(Math.random()*tileMaps.length);
//         }
//     }

//     lastMapIndex=idx;
//     tileMap=tileMaps[idx];
// }

function loadImages(){

    wallImages=[];
    for(let i=1;i<=4;i++){
        const img=new Image();
        img.src=`./wall${i}.png`;
        wallImages.push(img);
    }
    applyWallSelection();

    blueGhostImage=new Image();
    blueGhostImage.src="./blueGhost.png";
    orangeGhostImage=new Image();
    orangeGhostImage.src="./orangeGhost.png";
    pinkGhostImage=new Image();
    pinkGhostImage.src="./pinkGhost.png";
    redGhostImage=new Image();
    redGhostImage.src="./redGhost.png";

    pacmanFullUpImage=new Image();
    pacmanFullUpImage.src="./pacmanFullUp.png";
    pacmanFullDownImage=new Image();
    pacmanFullDownImage.src="./pacmanFullDown.png";
    pacmanFullLeftImage=new Image();
    pacmanFullLeftImage.src="./pacmanFullLeft.png";
    pacmanFullRightImage=new Image();
    pacmanFullRightImage.src="./pacmanFullRight.png";

    pacmanUpImage=new Image();
    pacmanUpImage.src="./pacmanUp.png";
    pacmanDownImage=new Image();
    pacmanDownImage.src="./pacmanDown.png";
    pacmanLeftImage=new Image();
    pacmanLeftImage.src="./pacmanLeft.png";
    pacmanRightImage=new Image();
    pacmanRightImage.src="./pacmanRight.png";

    pacmanCloseImage=new Image();
    pacmanCloseImage.src="./pacmanClose.png";

    smallCherryImage=new Image();
    smallCherryImage.src="./smallCherry.png";
    bigCherryImage=new Image();
    bigCherryImage.src="./bigCherry.png";

    shieldImage=new Image();
    shieldImage.src="./shield.png";

    heartImage=new Image();
    heartImage.src="./life.png";
}

function rebuildWallGrid(wallCoords){
    wallGrid=Array.from({length:rowCount},()=>Array(columnCount).fill(false));
    for(const {r,c} of wallCoords) wallGrid[r][c]=true;
}

function loadMap(){
    walls.clear();
    foods.clear();
    ghosts.clear();
    cherries.clear();
    hearts.clear();
    shields.clear();

    applyWallSelection();

    const mapIndex=tileMaps.indexOf(tileMap);
    const parsed=parsedMaps[mapIndex>=0?mapIndex:0];

    rebuildWallGrid(parsed.wallCoords);

    for(const {r,c} of parsed.wallCoords){
        const x=c*tileSize;
        const y=r*tileSize;
        walls.add(new Block(wallImage,x,y,tileSize,tileSize));
    }

    for(const {r,c} of parsed.foodCoords){
        const x=c*tileSize;
        const y=r*tileSize;
        foods.add(new Block(null,x+14,y+14,4,4));
    }

    for(const {r,c} of parsed.cherrySmall){
        cherries.add(makeCherry(smallCherryImage,c,r,50));
    }

    for(const {r,c} of parsed.cherryBig){
        cherries.add(makeCherry(bigCherryImage,c,r,100));
    }

    for(const {r,c,key} of parsed.ghostSpawns){
        const x=c*tileSize;
        const y=r*tileSize;

        const img=
            key==="b"? blueGhostImage:
            key==="r"? redGhostImage:
            key==="p"? pinkGhostImage:
            orangeGhostImage;
        
        ghosts.add(new Block(img,x,y,tileSize,tileSize));
    }

    // for(let r=0;r<rowCount;r++){
    //     for(let c=0;c<columnCount;c++){
    //         const row=tileMap[r];
    //         const tileMapChar=row[c];

    //         const x=c*tileSize;
    //         const y=r*tileSize;

    //         if(tileMapChar==='X'){
    //             const wall = new Block(wallImage,x,y,tileSize,tileSize);
    //             walls.add(wall);
    //         }
    //         else if(tileMapChar==='b'){
    //             const ghost =new Block(blueGhostImage,x,y,tileSize,tileSize);
    //             ghosts.add(ghost);
    //         }
    //         else if(tileMapChar==='r'){
    //             const ghost=new Block(redGhostImage,x,y,tileSize,tileSize);
    //             ghosts.add(ghost);
    //         }
    //         else if(tileMapChar==='p'){
    //             const ghost=new Block(pinkGhostImage,x,y,tileSize,tileSize);
    //             ghosts.add(ghost);
    //         }
    //         else if(tileMapChar==='o'){
    //             const ghost=new Block(orangeGhostImage,x,y,tileSize,tileSize);
    //             ghosts.add(ghost);
    //         }
    //         else if(tileMapChar==='P'){
    //             pacman=new Block(pacmanRightImage,x,y,tileSize,tileSize);
    //         }
    //         else if(tileMapChar==='s'){
    //             cherries.add(makeCherry(smallCherryImage,c,r,50));
    //         }
    //         else if(tileMapChar==='l'){
    //             cherries.add(makeCherry(bigCherryImage,c,r,100));
    //         }
    //         else if(tileMapChar===' '){
    //             const food=new Block(null,x+14,y+14,4,4);
    //             foods.add(food);
    //         }
    //     }
    // }

    if(!pacman){
        pacman=new Block(pacmanRightImage,0,0,tileSize,tileSize);
    }
    pacman.x=parsed.pacmanSpawn.c*tileSize;
    pacman.y=parsed.pacmanSpawn.r*tileSize;
    pacman.startX=pacman.x;
    pacman.startY=pacman.y;
    pacman.width=tileSize;
    pacman.height=tileSize;
    pacman.image=pacmanRightImage;

    // placeCherriesAndRemoveDots();

    nextPacmanDirection=null;

    heartSpawnedAt=0;
    shieldSpawnedAt=0;


    shieldActive=false;
    shieldTimer=0;

    shieldStartScore=score;

    pacmanAnimIndex=0;
    pacmanAnimTick=0;
    pacman.direction='R';
    pacman.velocityX=0;
    pacman.velocityY=0;
    pacman.image=getPacmanIdleImageByDirection(pacman.direction);

    setOccupiedFromEntities();

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


function makePickup(image,col,row){
    const x=col*tileSize;
    const y=row*tileSize;
    const size=22;
    const offset=(tileSize-size)/2;

    return new Block(image,x+offset,y+offset,size,size);
}

function isWallTile(col,row){
    if(!wallGrid) return false;
    if(row <0 || row>=rowCount || col<0 || col>=columnCount) return false;
    return wallGrid[row][col]===true;
}

function isTileBlocked(col,row){
    if(isWallTile(col,row)) return true;

    return occupiedTiles.has(tileKey(col,row));
}

// function isTileBlocked(col,row){
//     const x=col*tileSize;
//     const y=row*tileSize;

//     for(let w of walls.values()){
//         if(w.x===x && w.y===y) return true;
//     }

//     if( pacman && pacman.x===x && pacman.y===y) return true;

//     for(let g of ghosts.values()){
//         if(g.x===x && g.y===y) return true;
//     }
//     return false;
// }


function randomEmptyTile(){
    let tries=0;


    while(tries<5000){
        tries++;
        const col=Math.floor(Math.random()*columnCount);
        const row=Math.floor(Math.random()*rowCount);

        const ch=tileMap[row][col];
        if(ch!==' ' && ch!=='O') continue;
        if(isTileBlocked(col,row)) continue;

        return{col,row};
    }
    return null;
}

let rafId=0;
let lastTs=0;
let accMs=0;
const FIXED_STEP_MS=50;

function startLoop(){
    stopLoop();
    lastTs=0;
    accMs=0;
    rafId=requestAnimationFrame(frame);
}

function stopLoop(){
    if(rafId) cancelAnimationFrame(rafId);
    rafId=0;
    lastTs=0;
    accMs=0;
}

function frame(ts){
    if(!gameStarted || gameOver){
        rafId=0;
        return;
    }

    if(!lastTs) lastTs=ts;
    const dt=ts-lastTs;
    lastTs=ts;

    accMs+=Math.min(dt,250);

    while(accMs>=FIXED_STEP_MS){
        tick();
        accMs-=FIXED_STEP_MS;
        if(gameOver) break;
    }

    draw();
    rafId=requestAnimationFrame(frame);
}

function tick(){
    move();
}

// function update(){
//     if(!gameStarted) return;
//     if(gameOver){
//         return;
//     }
//     move();
//     draw();
//     setTimeout(update,50);
// }

function draw(){
    context.clearRect(0,0,board.width,board.height);

    for(const wall of walls){
        context.drawImage(wall.image,wall.x,wall.y,wall.width,wall.height);
    }

    context.fillStyle="white";
    for(const food of foods){
        context.fillRect(food.x,food.y,food.width,food.height);
    }

    for(const cherry of cherries){
        context.drawImage(cherry.image,cherry.x,cherry.y,cherry.width,cherry.height);
    }

    for(const heart of hearts){
        context.drawImage(heart.image,heart.x,heart.y,heart.width,heart.height);
    }

    for(const shield of shields){
        context.drawImage(shield.image,shield.x,shield.y,shield.width,shield.height);
    }

    for(const ghost of ghosts){
        context.drawImage(ghost.image,ghost.x,ghost.y,ghost.width,ghost.height);
    }

    if(pacman && pacman.image){
        context.drawImage(pacman.image,pacman.x,pacman.y,pacman.width,pacman.height);
    }



    context.fillStyle="white";
    context.font="14px sans-serif";

    let shieldText="";
    if(shieldActive){
        const msLeft=Math.max(0,shieldTimer-Date.now());
        shieldText="Shield: "+(msLeft/1000).toFixed(1)+"s";
    }

    // if(gameOver){
    //     context.fillText("Game Over: "+String(score),tileSize/2,tileSize/2);
    // }
    // else{
    // }
    context.fillText("x"+String(lives)+ " "+String(score)+ " " +shieldText,tileSize/2,tileSize/2)
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

    for(const wall of walls){
        if(collision(test,wall)) return false;
    }
    return true;
}

// function setPacmanImageByDirection(){
//     if(pacman.direction=='U') pacman.image=pacmanUpImage;
//     else if(pacman.direction=='D') pacman.image=pacmanDownImage;
//     else if(pacman.direction=='L') pacman.image=pacmanLeftImage;
//     else if(pacman.direction=='R') pacman.image=pacmanRightImage;
// }

function heartSpawn(){

    if(hearts.size>0 && heartSpawnedAt>0 && (Date.now()-heartSpawnedAt)>=HEART_SPAWN_LIFETIME){
    hearts.clear();
    heartSpawnedAt=0;
}


    if(lives>=3) return;

    if(hearts.size>0) return;

    if(Math.random()>0.02) return;

    const pos=randomEmptyTile();
    if(!pos) return;

    hearts.add(makePickup(heartImage,pos.col,pos.row));
    heartSpawnedAt=Date.now();
}

function shieldSpawn(){

    if(shieldActive && Date.now()>=shieldTimer){
        shieldActive=false;
        shieldTimer=0;
        shieldStartScore=score;
    }

    if(shields.size>0 && shieldSpawnedAt>0 && Date.now()-shieldSpawnedAt>=SHIELD_SPAWN_LIFETIME){
        shields.clear();
        shieldSpawnedAt=0;
        shieldStartScore=score;
    }


    if(shields.size>0) return;

    if(shieldActive) return;

    if(score-shieldStartScore < SHIELD_THRESHOLD) return;

    const pos=randomEmptyTile();
    if(!pos) return;

    shields.add(makePickup(shieldImage,pos.col,pos.row));
    shieldSpawnedAt=Date.now();
}

// function updateShieldState(){
//     if(!shieldActive) return;

//     if(Date.now()>=shieldTimer){
//         shieldActive=false;
//         shieldTimer=0;
//     }
// }

function activateShield(){
    shieldActive=true;
    shieldTimer=Date.now()+SHIELD_POWER_DURATION;
    shieldSpawnedAt=0;
}

function move(){

    if(!pacman) return;

    // updateShieldState();
    heartSpawn();
    shieldSpawn();

    if(nextPacmanDirection && canMoveInDirection(pacman,nextPacmanDirection)){
        pacman.direction=nextPacmanDirection;
        pacman.updateVelocity();
    }

    pacman.x+=pacman.velocityX;
    pacman.y+=pacman.velocityY;

    wrapEntity(pacman);

    for(const wall of walls){
        if(collision(pacman,wall)){
            pacman.x-=pacman.velocityX;
            pacman.y-=pacman.velocityY;

            pacman.velocityX=0;
            pacman.velocityY=0;
            break;
        }
    }

    updatePacmanAnimation();

    setOccupiedFromEntities();

    for(const ghost of ghosts){
        if(collision(ghost,pacman)){
            if(!shieldActive){
                lives-=1;
                if(lives==0){
                    gameOver=true;
                    showGameOverPopup();
                    stopLoop();
                    return;
                }
                resetPositions();
                setOccupiedFromEntities();
                return;
            }
        }

        if(ghost.y==tileSize*9 && ghost.direction !='U' && ghost.direction!='D'){
            ghost.updateDirection('U');
        }

        ghost.x+=ghost.velocityX;
        ghost.y+=ghost.velocityY;

        for(const wall of walls){
            if(collision(ghost,wall) || ghost.x<=0 || ghost.x+ghost.width>=boardWidth){
                ghost.x-=ghost.velocityX;
                ghost.y-=ghost.velocityY;
                const newDirection=directions[Math.floor(Math.random()*4)];
                ghost.updateDirection(newDirection);
            }
        }
    }

    let foodEaten=null;
    for(const food of foods){
        if(collision(pacman,food)){
            foodEaten=food;
            score+=10;
            break;
        }
    }
    if(foodEaten) foods.delete(foodEaten);

    let cherryEaten=null;
    for(const cherry of cherries){
        if(collision(pacman,cherry)){
            cherryEaten=cherry;
            score+=cherry.points;
            break;
        }
    }
    if(cherryEaten) cherries.delete(cherryEaten);


    let heartEaten=null;
    for(const heart of hearts){
        if(collision(pacman,heart)){
            heartEaten=heart;
            lives=Math.min(3,lives+1);
            break;
        }
    }
    if(heartEaten){
        hearts.delete(heartEaten);
        heartSpawnedAt=0;
    } 
        

    let shieldEaten=null;
    for(const shield of shields){
        if(collision(pacman,shield)){
            shieldEaten=shield;
            break;
        }
    }
    if(shieldEaten){
        shields.delete(shieldEaten);
        activateShield();
    } 

    if(foods.size==0 && cherries.size==0){
        selectMapBySettings();
        loadMap();
        resetPositions();
    }
    setOccupiedFromEntities();
}

function movePacman(e){

    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","KeyW","KeyA","KeyS","KeyD"].includes(e.code)){
        e.preventDefault();
    }

    if(!gameStarted) return;

    if(gameOver){
        // selectRandomMap();
        // loadMap();
        // resetPositions();
        // lives=3;
        // score=0;
        // gameOver=false;
        // update();
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
};

function resetPositions(){
    pacman.reset();
    pacman.velocityX=0;
    pacman.velocityY=0;

    nextPacmanDirection=null;

    pacmanAnimIndex=0;
    pacmanAnimTick=0;
    pacman.image=getPacmanIdleImageByDirection(pacman.direction);

    for(const ghost of ghosts){
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

        this.points=0;
    }

    updateDirection(direction){
        const prevDirection=this.direction;
        this.direction=direction;
        this.updateVelocity();

        this.x+=this.velocityX;
        this.y+=this.velocityY;

        for(const wall of walls){
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