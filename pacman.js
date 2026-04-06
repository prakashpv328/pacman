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

let redGhostImgs,pinkGhostImgs,orangeGhostImgs,blueGhostImgs;

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
    "Xs  X   X   X  oX X",
    "XXX X XXXXXXX X XXX",
    "X   Xb  X X   X   X",
    "X XXXXX X X XXXXX X",
    "O   l   X   X l   O",
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

const tileMap3=[
    "XXXXXXXXXXXXXXXXXXX",
    "Xs       X       sX",
    "X XXXXX  X  XXXXX X",
    "X X   X     X   X X",
    "X X X XXXXXXX X X X",
    "X   X   XsX   X   X",
    "X XXXXX X X XXXXX X",
    "X        r        X",
    "XXXXX X XXX X XXXXX",
    "O l   X b p X   l O",
    "X XXX X XXX X XXX X",
    "X X   X  o  X   X X",
    "X X XXX X X XXX X X",
    "X   X   XsX   X   X",
    "X X X XXXXXXX X X X",
    "X X   X     X   X X",
    "X XXXXX  X  XXXXX X",
    "X        P        X",
    "X XXXXX  X  XXXXX X",
    "X s             s X",
    "XXXXXXXXXXXXXXXXXXX"
];

const tileMap4=[
    "XXXXXXXXXXXXXXXXXXX",
    "X   s   XXX    s  X",
    "X XXXXX X X XXXXX X",
    "X X   X     X     X",
    "X X X XXXXXXX XX XX",
    "X   X   Xs X   X  X",
    "XXX XXX XX XX XXX X",
    "X     X           X",
    "X XXX X XXXXXXXX XX",
    "O l   X r b p o l O",
    "X XXX X XXXXXXXX XX",
    "X     X           X",
    "XXX XXX XX XX XXX X",
    "X   X   Xs X   X  X",
    "X X X XXXXXXX XX XX",
    "X X   X     X     X",
    "X XXXXX X X XXXXX X",
    "X        P        X",
    "X XXXXX X X XXXXX X",
    "X s     XXX     s X",
    "XXXXXXXXXXXXXXXXXXX"
]

const tileMap5=[
    "XXXXXXXXXXXXXXXXXXX",
    "X s             s X",
    "X XXX XXXXXXX XXX X",
    "X   X   X   X X   X",
    "XXX X X X X X X X X",
    "X   X X  sX     X X",
    "X XXX XXXXXXX XXX X",
    "X   X    r      X X",
    "X XXXXXXX XXXXXXX X",
    "O l   X b p X   l O",
    "X XXXXXXX XXXXXXX X",
    "X X      o    X   X",
    "X XXX XXXXXXX XXX X",
    "X X   X  sX   X   X",
    "X X X X X X X X XXX",
    "X   X   X   X X   X",
    "X XXX XXXXXXX XXX X",
    "X        P        X",
    "X XXX XXXXXXX XXX X",
    "X s             s X",
    "XXXXXXXXXXXXXXXXXXX",
];

const tileMap6=[
    "XXXXXXXXXXXXXXXXXXX",
    "X s             s X",
    "X XXX XXX XXX XXX X",
    "X   X   X X   X   X",
    "XXX XXX X X XXX XXX",
    "X       X X       X",
    "X XXX XXXXXXX XXX X",
    "X X   r   X   b X X",
    "X XXX XXX X XXX XXX",
    "O l   Xs     sX l O",
    "X XXX XXX X XXX XXX",
    "X X   p   X   o X X",
    "X XXX XXXXXXX XXX X",
    "X       X X       X",
    "XXX XXX X X XXX XXX",
    "X   X   X X   X   X",
    "X XXX XXX XXX XXX X",
    "X        P        X",
    "X XXX XXXXXXX XXX X",
    "X s             s X",
    "XXXXXXXXXXXXXXXXXXX",
];

const tileMap7=[
    "XXXXXXXXXXXXXXXXXXX",
    "X s             s X",
    "X XXX XXXXXXX XXX X",
    "X X   X     X   X X",
    "X X XXX XXX XXX X X",
    "X X   X   X  sX X X",
    "X X X XXX X XXX X X",
    "X X X   r   X   X X",
    "XXX XXXXX XXXXX XXX",
    "O l   X b p X   l O",
    "XXX XXXXX XXXXX XXX",
    "X X X     o X   X X",
    "X X X XXX X XXX X X",
    "X X   X   X  sX X X",
    "X X XXX XXX XXX X X",
    "X X   X     X   X X",
    "X XXX XXXXXXX XXX X",
    "X        P        X",
    "X XXX XXXXXXX XXX X",
    "X s             s X",
    "XXXXXXXXXXXXXXXXXXX"
];

const tileMap8=[
    "XXXXXXXXXXXXXXXXXXX",
    "X s             s X",
    "X XXX XXX XXX XXX X",
    "X   X X     X   X X",
    "XXX X XXX XXX X XXX",
    "X   X   X Xs  X   X",
    "X XXX XXX XXX XXX X",
    "X X     r   b     X",
    "X XXX XXXXXX XXX XX",
    "O l             l O",
    "XX XXX XXXXXX XXX X",
    "X     p   o     X X",
    "X XXX XXX XXX XXX X",
    "X   X  sX X   X   X",
    "XXX X XXX XXX X XXX",
    "X X   X     X X   X",
    "X XXX XXX XXX XXX X",
    "X        P        X",
    "X XXX XXXXXXX XXX X",
    "X s             s X",
    "XXXXXXXXXXXXXXXXXXX",
];

const tileMaps = [tileMap1, tileMap2, tileMap3, tileMap4, tileMap5, tileMap6, tileMap7, tileMap8];
let lastMapIndex=-1;

let currentWallIndex=0;
let lastWallIndex=-1;

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

const GHOST_TURN_PROB_AT_INTERSECTION=0.35;
const GHOST_ALLOW_REVERSE_AT_INTERSECTION=false;

function isAlignedtoTile(block){
    return (block.x % tileSize === 0) && (block.y % tileSize===0)
}

function oppositeDirection(dir){
    if(dir==='U') return "D";
    if(dir==='D') return "U";
    if(dir==='L') return "R";
    return "L";
}

function ensureGhostHasValidDirection(ghost){
    const options=availableDirectionsForGhost(ghost);
    if(options.length===0){
        ghost.velocityX=0;
        ghost.velocityY=0;
        return;
    }

    if(options.includes(ghost.direction)){
        ghost.updateDirection(ghost.direction);
        return;
    }

    const back=oppositeDirection(ghost.direction);
    let pool=options.filter(d=>d!==back);
    if(pool.length===0) pool =options;

    ghost.updateDirection(pickRandomDirection(pool));
}

function respawnGhostAtStartAndMove(ghost){
    ghost.x=ghost.startX;
    ghost.y=ghost.startY;

    ghost.x=Math.round(ghost.x/tileSize)*tileSize;
    ghost.y=Math.round(ghost.y/tileSize)*tileSize;

    ensureGhostHasValidDirection(ghost);

    if(ghost.velocityX===0 && ghost.velocityY===0){
        ghost.direction="R";
        ghost.updateVelocity();
        ensureGhostHasValidDirection(ghost);
    }
}

function availableDirectionsForGhost(ghost){
    const options=[];
    for(const d of directions){
        if(canMoveInDirection(ghost,d)){
            options.push(d);
        }
    }
    return options;
}

function pickRandomDirection(opts){
    return opts[Math.floor(Math.random()*opts.length)];
}

function maybeTurnGhostAtIntersection(ghost){
    if(!isAlignedtoTile(ghost)) return;

    const options=availableDirectionsForGhost(ghost);

    if(options.length<=2) return;

    if(Math.random()>GHOST_TURN_PROB_AT_INTERSECTION) return;

    let pool=options;

    if(!GHOST_ALLOW_REVERSE_AT_INTERSECTION){
        const back=oppositeDirection(ghost.direction);
        const filtered=options.filter(d=>d!==back);
        if(filtered.length>0) pool=filtered;
    }

    ghost.updateDirection(pickRandomDirection(pool));
}

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

    wallMode:"random",
    wallIndex:0,
};

let tempSettings={
    mapMode:"random",
    mapIndex:0,

    wallMode:"random",
    wallIndex:0,
};

function isTunnelTile(col,row){
    if(!tileMap) return false;
    if(row<0 || row>=rowCount || col<0 || col>=columnCount) return false;
    return tileMap[row][col]==='O';
}

function handlePacmanTunnel(){
    if(!pacman) return;

    if(pacman.tunnelCooldown && pacman.tunnelCooldown>0){
        pacman.tunnelCooldown--;
        return;
    }

    if(!isAlignedtoTile(pacman)) return;

    const t=pixelToTile(pacman.x,pacman.y);
    if(!isTunnelTile(t.col,t.row)) return;

    const leftEdge=0;
    const rightEdge=columnCount-1;

    if(t.col===leftEdge){
        pacman.x=rightEdge*tileSize;
        pacman.y=t.row*tileSize;
        pacman.tunnelCooldown=6;
    }
    else if(t.col===rightEdge){
        pacman.x=leftEdge*tileSize;
        pacman.y=t.row*tileSize;
        pacman.tunnelCooldown=6;
    }
}

function pacmanInTunnelNow(){
    if(!pacman) return false;
    if(!isAlignedtoTile(pacman)) return false;

    const t=pixelToTile(pacman.x,pacman.y);
    return isTunnelTile(t.col,t.row);
}

function handleGhostTunnelRespawn(ghost){
    if(!ghost) return false;
    if(!isAlignedtoTile(ghost)) return false;

    const t=pixelToTile(ghost.x,ghost.y);
    if(!isTunnelTile(t.col,t.row)) return false;

    respawnGhostAtStartAndMove(ghost);
    return true;
}

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
        if(s && (s.wallMode==="random" || s.wallMode==="fixed")){
            gameSettings.wallMode=s.wallMode;
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
        const idx=Number.isInteger(currentWallIndex) ?currentWallIndex:gameSettings.wallIndex;
        wallImage=wallImages[idx] || wallImages[0];
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
        wallMode:gameSettings.wallMode,
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

    const wallRandomTile=document.getElementById("wallRandomTile");
    setSelected(wallRandomTile,tempSettings.wallMode==="random");

    for(let w=0;w<4;w++){
        const tile = document.getElementById(`wallTile${w}`);
        const selected=(tempSettings.wallMode==="fixed" && tempSettings.wallIndex===w);
        setSelected(tile,selected);
    }

    renderMapPreviews();
}

function saveSettings(){
    gameSettings.mapMode=tempSettings.mapMode;
    gameSettings.mapIndex=tempSettings.mapIndex;
    gameSettings.wallMode=tempSettings.wallMode;
    gameSettings.wallIndex=tempSettings.wallIndex;

    currentWallIndex=gameSettings.wallIndex;

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

function selectWallBySettings(){
    if(wallImages.length===0) return;

    if(gameSettings.wallMode==="fixed"){
        currentWallIndex=gameSettings.wallIndex;
        lastWallIndex=currentWallIndex;
        return;
    }

    let idx=Math.floor(Math.random()*wallImages.length);
    if(wallImages.length>1){
        while(idx===lastWallIndex){
            idx=Math.floor(Math.random()*wallImages.length);
        }
    }

    currentWallIndex=idx;
    lastWallIndex=idx;
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

function getPacmanOpenImageByDirection(_dir){
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

function loadDirGhostImages(prefix){
    const mk=(src)=>{
        const i=new Image();
        i.src=src;
        return i;
    };

    return {
        U:mk(`./${prefix}_up_ghost.png`),
        D:mk(`./${prefix}_down_ghost.png`),
        L:mk(`./${prefix}_left_ghost.png`),
        R:mk(`./${prefix}_right_ghost.png`),
    };
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

    currentWallIndex=gameSettings.wallIndex;

    loadImages();

    buildSettingsUi();


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

    const  zoomCloseBtn=this.document.getElementById("zoomCloseBtn");
    if(zoomCloseBtn) zoomCloseBtn.addEventListener("click",closeMapZoom);

    const zoomSelectBtn=this.document.getElementById("zoomSelectBtn");
    if(zoomSelectBtn) zoomSelectBtn.addEventListener("click",confirmZoomSelection);

    const zoomOverlay=this.document.getElementById("mapZoomOverlay");
    if(zoomOverlay){
        zoomOverlay.addEventListener("click",(e)=>{
            if(e.target===zoomOverlay) closeMapZoom();
        })
    }

    showLobby();

    this.document.addEventListener("keydown",movePacman);

    this.document.addEventListener("keydown",handleUiKeys);

    this.document.addEventListener("keydown",(e)=>{
        if(isSettingsVisible() && e.code==="Escape"){
            e.preventDefault();
            hideSettings();
        }
        if(isMapZoomVisible() && e.code==="Escape"){
            e.preventDefault();
            closeMapZoom();
        }
    });
};

function zoomPrevMap(){
    if(tileMaps.length===0) return;
    if(zoomSelectedMapIndex<0) zoomSelectedMapIndex=0;
    zoomSelectedMapIndex=(zoomSelectedMapIndex-1+tileMaps.length)%tileMaps.length;
    openMapZoom(zoomSelectedMapIndex);
}

function zoomNextMap(){
    if(tileMaps.length===0) return;
    if(zoomSelectedMapIndex<0) zoomSelectedMapIndex=0;
    zoomSelectedMapIndex=(zoomSelectedMapIndex+1)%tileMaps.length;
    openMapZoom(zoomSelectedMapIndex);
}

function handleUiKeys(e){
    if(isMapZoomVisible()){
        if(e.code==="Enter"){
            e.preventDefault();
            confirmZoomSelection();
            return;
        }

        if(e.code==="Escape"){
            e.preventDefault();
            closeMapZoom();
            return;
        }

        if(e.code==="ArrowLeft"){
            e.preventDefault();
            zoomPrevMap();
            return;
        }

        if(e.code==="ArrowRight"){
            e.preventDefault();
            zoomNextMap();
            return;
        }
        return;

    }


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
    closeMapZoom();

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
    closeMapZoom();

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
    selectWallBySettings();
    loadMap();

    for(const ghost of ghosts){
        ghost.updateDirection(directions[Math.floor(Math.random()*4)]);
    }

    startLoop();
}


function restartGame(){
    hideGameOverPopup();
    hideSettings();
    closeMapZoom();

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
    selectWallBySettings();
    loadMap();
    resetPositions();

    startLoop();
}

function loadImages(){

    wallImages=[];
    for(let i=1;i<=4;i++){
        const img=new Image();
        img.src=`./wall${i}.png`;
        wallImages.push(img);
    }

    blueGhostImage=new Image();
    blueGhostImage.src="./blueGhost.png";
    orangeGhostImage=new Image();
    orangeGhostImage.src="./orangeGhost.png";
    pinkGhostImage=new Image();
    pinkGhostImage.src="./pinkGhost.png";
    redGhostImage=new Image();
    redGhostImage.src="./redGhost.png";

    redGhostImgs=loadDirGhostImages("red");
    pinkGhostImgs=loadDirGhostImages("pink");
    blueGhostImgs=loadDirGhostImages("blue");
    orangeGhostImgs=loadDirGhostImages("orange");


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

    applyWallSelection();
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

        const imgs=
            key==="b"? blueGhostImgs:
            key==="r"? redGhostImgs:
            key==="p"? pinkGhostImgs:
            orangeGhostImgs;
        
        const g=new Block(imgs.R,x,y,tileSize,tileSize);
        g.dirImages=imgs;
        g.direction="R";
        g.updateVelocity();
        ghosts.add(g);
    }

    if(!pacman){
        pacman=new Block(pacmanRightImage,0,0,tileSize,tileSize);
    }
    pacman.x=parsed.pacmanSpawn.c*tileSize;
    pacman.y=parsed.pacmanSpawn.r*tileSize;
    pacman.startX=pacman.x;
    pacman.startY=pacman.y;
    pacman.width=tileSize;
    pacman.height=tileSize;

    pacman.direction='R';
    pacman.velocityX=0;
    pacman.velocityY=0;
    pacman.image=getPacmanIdleImageByDirection(pacman.direction);

    pacman.tunnelCooldown=0;
    nextPacmanDirection=null;

    heartSpawnedAt=0;
    shieldSpawnedAt=0;


    shieldActive=false;
    shieldTimer=0;

    shieldStartScore=score;

    pacmanAnimIndex=0;
    pacmanAnimTick=0;
    

    for(const ghost of ghosts){
        respawnGhostAtStartAndMove(ghost);
    }

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

function activateShield(){
    shieldActive=true;
    shieldTimer=Date.now()+SHIELD_POWER_DURATION;
    shieldSpawnedAt=0;
}

function move(){

    if(!pacman) return;

    heartSpawn();
    shieldSpawn();

    const pacTunnelBlocked=(pacman.tunnelCooldown && pacman.tunnelCooldown>0) || pacmanInTunnelNow();

    if(!pacTunnelBlocked && nextPacmanDirection && canMoveInDirection(pacman,nextPacmanDirection)){
        pacman.direction=nextPacmanDirection;
        pacman.updateVelocity();
    }

    pacman.x+=pacman.velocityX;
    pacman.y+=pacman.velocityY;

    handlePacmanTunnel();

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

        maybeTurnGhostAtIntersection(ghost);

        ghost.x+=ghost.velocityX;
        ghost.y+=ghost.velocityY;

        if(handleGhostTunnelRespawn(ghost)){
            continue;
        }


        let hit=false;
        for(const wall of walls){
            if(collision(ghost,wall)){
                hit =true;
                break;
            }
        }
        if(ghost.x<=0 || ghost.x+ghost.width>=boardWidth){
            hit =true;
        }
        // Direction=directions[Math.floor(Math.random()*4)];
        // ghost.updateDirection(newDirection);const new
        
        if(hit){
            ghost.x-=ghost.velocityX;
            ghost.y-=ghost.velocityY;

            const options=availableDirectionsForGhost(ghost);
            if(options.length>0){
                let pool=options;
                const back=oppositeDirection(ghost.direction);
                const filtered=options.filter(d=>d!==back);
                if(filtered.length>0) pool=filtered;

                ghost.updateDirection(pickRandomDirection(pool));
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
        selectWallBySettings();
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

    if(pacman && pacman.velocityX===0 && pacman.velocityY===0 && nextPacmanDirection){
        pacman.direction=nextPacmanDirection;
        pacman.updateVelocity();
    }
}

function collision(a,b){
    return a.x<b.x+b.width &&
            a.x+a.width>b.x &&
            a.y<b.y+b.height &&
            a.y+a.height>b.y;
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
        respawnGhostAtStartAndMove(ghost);
        // Direction=directions[Math.floor(Math.random()*4)];
        // ghost.updateDirection(newDirection);const new
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

        this.tunnelCooldown=0;

        this.dirImages=null;
    }

    updateDirection(direction){
        const prevDirection=this.direction;
        const prevImage=this.image;

        this.direction=direction;
        this.updateVelocity();

        if(this.dirImages){
            this.image=this.dirImages[this.direction] || this.image;
        }

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

        this.x-=this.velocityX;
        this.y-=this.velocityY;
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

function buildSettingsUi(){
    const mapStrip=document.getElementById("mapStrip");
    const wallStrip=document.getElementById("wallStrip");

    if(!mapStrip || !wallStrip) return;

    for(let i=0;i<tileMaps.length;i++){
        const btn=document.createElement("button");
        btn.className="option-tile";
        btn.type="button";
        btn.id=`mapTile${i}`;

        const canvas=document.createElement("canvas");
        canvas.className="tile-thumb";
        canvas.width=190;
        canvas.height=210;

        const label=document.createElement("div");
        label.className="tile-label"
        label.textContent=`Map ${i+1}`;

        btn.appendChild(canvas);
        btn.appendChild(label);

        btn.addEventListener("click",()=>{
            tempSettings.mapMode="fixed";
            tempSettings.mapIndex=i;
            renderSettings();
            openMapZoom(i);
        });

        mapStrip.appendChild(btn);
    }

    for(const child of Array.from(wallStrip.children)){
        if(child.id!=="wallRandomTile") child.remove();
    }

    for(let w=0;w<4;w++){
        const btn=document.createElement("button");
        btn.className="option-tile";
        btn.type="button";
        btn.id=`wallTile${w}`;

        const img=document.createElement("img");
        img.className="wall-thumb";
        img.src=`./wall${w+1}.png`;
        img.alt=`Wall ${w+1}`;

        const label=document.createElement("div");
        label.className="tile-label";
        label.textContent=`Wall ${w+1}`;

        btn.appendChild(img);
        btn.appendChild(label);

        btn.addEventListener("click",()=>{
            tempSettings.wallMode="fixed";
            tempSettings.wallIndex=w;
            renderSettings();
        });

        wallStrip.appendChild(btn);
    }

    const randomTile=document.getElementById("mapRandomTile");
    if(randomTile){
        randomTile.addEventListener("click",()=>{
            tempSettings.mapMode="random";
            renderSettings();
        });
    }

    const wallRandomTile=document.getElementById("wallRandomTile");
    if(wallRandomTile){
        wallRandomTile.addEventListener("click",()=>{
            tempSettings.wallMode="random";
            renderSettings();
        });
    }

    renderSettings();
}

function renderMapPreviews(){

    const previewWallIndex=(tempSettings.wallMode==="fixed") ? tempSettings.wallIndex:0;
    const wallImg=wallImages[previewWallIndex] || wallImages[0];

    for(let i=0;i<tileMaps.length;i++){
        const tile=document.getElementById(`mapTile${i}`);
        if(!tile) continue;

        const canvas=tile.querySelector("canvas");
        if(!canvas) continue;

        drawMapPreview(canvas,tileMaps[i],wallImg,10);
    }

    if(isMapZoomVisible() && zoomSelectedMapIndex>=0){
        const zc=document.getElementById("mapZoomCanvas");
        if(zc) drawMapPreview(zc,tileMaps[zoomSelectedMapIndex],wallImg,zoomCellSize);
        updateZoomTitle();
    }
}

function drawMapPreview(canvas,mapRows,wallImg,cellSize){
    const ctx=canvas.getContext("2d");
    canvas.width=columnCount*cellSize;
    canvas.height=rowCount*cellSize;

    ctx.fillStyle="black";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    for(let r=0;r<rowCount;r++){
        for(let c=0;c<columnCount;c++){
            const ch=mapRows[r][c];
            const x=c*cellSize;
            const y=r*cellSize;

            if(ch=="X"){
                if(wallImg && wallImg.complete){
                    ctx.drawImage(wallImg,x,y,cellSize,cellSize);
                }
                else{
                    ctx.fillStyle="#2b74ff";
                    ctx.fillRect(x,y,cellSize,cellSize);
                }
            }

            else if(ch===" "){
                const s=Math.max(1,Math.floor(cellSize/6));
                const ox=Math.floor((cellSize-s)/2);
                const oy=Math.floor((cellSize-s)/2);
                ctx.fillStyle="rgba(255,255,255,0.9)";
                ctx.fillRect(x+ox,y+oy,s,s);
            }
            else if(ch==="s"){
                if(smallCherryImage && smallCherryImage.complete){
                    ctx.drawImage(smallCherryImage,x+1,y+1,cellSize-2,cellSize-2);
                }
            }
            else if(ch==="l"){
                if(bigCherryImage && bigCherryImage.complete){
                    ctx.drawImage(bigCherryImage,x+1,y+1,cellSize-2,cellSize-2);
                }
            }
        }
    }
}

let zoomSelectedMapIndex=-1;
let zoomCellSize=20;

function isMapZoomVisible(){
    const el=document.getElementById("mapZoomOverlay");
    return !!(el && !el.classList.contains("hidden"));
}

function updateZoomTitle(){
    const title=document.getElementById("mapZoomTitle");
    if(!title) return;
    if(zoomSelectedMapIndex<0){
        title.textContent="";
        return;
    }
    title.textContent=`Map ${zoomSelectedMapIndex+1}/${tileMaps.length}`;
}

function openMapZoom(mapIndex){
    zoomSelectedMapIndex=mapIndex;

    const overlay=document.getElementById("mapZoomOverlay");
    const canvas=document.getElementById("mapZoomCanvas");
    if(!overlay || !canvas) return;
    
    overlay.classList.remove("hidden");
    zoomCellSize=24;

    const previewWallIndex=(tempSettings.wallMode==="fixed") ? tempSettings.wallIndex:0;
    const wallImg=wallImages[previewWallIndex] || wallImages[0];
    drawMapPreview(canvas,tileMaps[mapIndex],wallImg,zoomCellSize);
    updateZoomTitle();
}

function closeMapZoom(){
    const overlay=document.getElementById("mapZoomOverlay");
    if(overlay) overlay.classList.add("hidden");
    zoomSelectedMapIndex=-1;
    updateZoomTitle();
}

function confirmZoomSelection(){
    if(zoomSelectedMapIndex<0) return;
    tempSettings.mapMode="fixed";
    tempSettings.mapIndex=zoomSelectedMapIndex;
    renderSettings();
    closeMapZoom();
}


(function(){
    const DOT_SPEED_PX_PER_SEC=80;
    const MOUTH_FPS=8;

    const PAC_FRAMES=[
        "./pacmanFullRight.png",
        "./pacmanRight.png",
        "./pacmanClose.png",
    ];

    let raf=0;
    let lastTs=0;

    let mouthTimer=0;
    let mouthIndex=0;

    let dotsOffset=0;
    let dotSpacing=0;

    function isLobbyVisible(){
        const lobby=document.getElementById("lobbyOverlay");
        return !!(lobby && !lobby.classList.contains("hidden"));
    }

    function computeDotSpacing(dotsEl){
        const spans=dotsEl.querySelectorAll("span");
        if(spans.length>=2){
            const a=spans[0].offsetLeft;
            const b=spans[1].offsetLeft;
            return Math.max(10,b-a);
        }
        return 16;
    }

    function stop(){
        if(raf) cancelAnimationFrame(raf);
        raf=0;
        lastTs=0;
    }

    function tick(ts){
        if(!isLobbyVisible()){
            stop();
            return;
        }

        raf=requestAnimationFrame(tick);

        if(!lastTs) lastTs=ts;
        const dt=Math.min(0.05,(ts-lastTs)/1000);
        lastTs=ts;

        const  pac=document.getElementById("lobbyPacman");
        const dots=document.querySelector(".chase-dots");
        if(!pac || !dots) return;

        mouthTimer+=dt;
        const mouthStep=1/MOUTH_FPS;
        if(mouthTimer>=mouthStep){
            mouthTimer-=mouthStep;
            mouthIndex=(mouthIndex+1)%PAC_FRAMES.length;
            pac.src=PAC_FRAMES[mouthIndex];
        }

        if(!dotSpacing) dotSpacing=computeDotSpacing(dots);

        dotsOffset+=DOT_SPEED_PX_PER_SEC*dt;
        if(dotsOffset>=dotSpacing) dotsOffset-=dotSpacing;
        dots.style.transform=`translateX(${-dotsOffset}px)`;
    }
    function start(){
        if(raf) return;
        const dots=document.querySelector(".chase-dots");
        if(dots) dotSpacing=computeDotSpacing(dots);
        raf=requestAnimationFrame(tick);
    };

    window.addEventListener("load",()=>{
        if(isLobbyVisible()) start();
        const lobby=document.getElementById("lobbyOverlay");
        if(!lobby) return;
        const obs=new MutationObserver(()=>{
            if(isLobbyVisible()) start();
            else stop();
        });
        obs.observe(lobby,{attributes:true,attributeFilter:["class"]});
    }); 
})();

(function (){
    const FPS=3;
    const STEP_SECONDS=1/FPS;

    const DIRS=['R','U','L','D'];

    function dirForGhost(ghostIndex,step){
        const baseIndex=(ghostIndex-1);
        const dirIndex=(0-step-baseIndex)%4;
        return DIRS[(dirIndex+4)%4];
    }

    function srcFor(color,dir){
        if(dir==="R") return `./${color}_right_ghost.png`;
        if(dir==="L") return `./${color}_left_ghost.png`;
        if(dir==="U") return `./${color}_up_ghost.png`;
        if(dir==="D") return `./${color}_down_ghost.png`;
    }

    function isLobbyVisible(){
        const lobby=document.getElementById("lobbyOverlay");
        return !!(lobby && !lobby.classList.contains("hidden"));
    }

    let raf=0;
    let lastTs=0;
    let acc=0;
    let step=0;

    function stop(){
        if(raf) cancelAnimationFrame(raf);
        raf=0;
        lastTs=0;
        acc=0;
    }

    function tick(ts){
        if(!isLobbyVisible()){
            stop();
            return;
        }

        raf=requestAnimationFrame(tick);

        if(!lastTs) lastTs=ts;
        const dt=Math.min(0.05,(ts-lastTs)/1000);
        lastTs=ts;

        acc+=dt;
        if(acc<STEP_SECONDS) return;
        acc-=STEP_SECONDS;

        const g1=document.getElementById("lobbyGhost1");
        const g2=document.getElementById("lobbyGhost2");
        const g3=document.getElementById("lobbyGhost3");
        const g4=document.getElementById("lobbyGhost4");

        if(!g1 || !g2 || !g3 || !g4) return;

        const d1=dirForGhost(1,step);
        const d2=dirForGhost(2,step);
        const d3=dirForGhost(3,step);
        const d4=dirForGhost(4,step);

        g1.src=srcFor("red",d1);
        g2.src=srcFor("pink",d2);
        g3.src=srcFor("blue",d3);
        g4.src=srcFor("orange",d4);

        step++;
    }

    function start(){
        if(raf) return;
        raf=requestAnimationFrame(tick);
    }

    window.addEventListener("load",()=>{
        if(isLobbyVisible()) start();

        const lobby=document.getElementById("lobbyOverlay");

        if(!lobby) return;

        const obs=new MutationObserver(()=>{
            if(isLobbyVisible()) start();
            else stop();
        })
        obs.observe(lobby,{attributes:true,attributeFilter:["class"]});
    })
})();