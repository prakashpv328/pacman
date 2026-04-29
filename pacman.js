let board; 
const rowCount=21;
const columnCount=19;
const tileSize=32;

const isMobile = window.matchMedia("(max-width: 480px)").matches;
const HUD_HEIGHT=isMobile ? 80 : 40;
const HUD_PADDING=isMobile ? 15 : 10;
const HUD_ICON_SIZE=isMobile ? 40 : 22;
const HUD_PAUSE_BUTTON_SIZE=isMobile ? 60 : 36;

const boardWidth=columnCount*tileSize;
const boardHeight=rowCount*tileSize+HUD_HEIGHT;
let context;

let isPaused = false;

const PAUSE_KEY = "Space";
const PAUSE_BTN_PLAY_SRC ="./Images/HeaderIcons/play.png";
const PAUSE_BTN_PAUSE_SRC ="./Images/HeaderIcons/pause.png";

const SOUND_KEY="KeyP";
const SOUND_BTN_ON_SRC="./Images/HeaderIcons/sound_on.png";
const SOUND_BTN_OFF_SRC="./Images/HeaderIcons/sound_off.png";

let pauseBtnPlayImage;
let pauseBtnPauseImage;
let pauseButtonVisible = false;
let pauseButtonRect = {x:0,y:0,width:0,height:0};

let soundBtnOnImage;
let soundBtnOffImage;
let soundEnabled=true;
let soundButtonVisible=false;
let soundButtonRect={x:0,y:0,width:0,height:0};

const GAME_START_DELAY_MS=4000;
const RESPAWN_DELAY_MS=3000;

const GHOST_RESPAWN_FREEZE_MS=2000;
const GHOST_RESPAWN_BLINK_INTERVAL_MS=160;

let bonusGhostBlueImg;
let bonusGhostWhiteImg;

const FRIGHTENED_DURATION_MS=7000;
const FRIGHTENED_BLINK_MS=2000;
const FRIGHTENED_BLINK_INTERVAL_MS=200;

const GHOST_EAT_SCORES = [200,400,600,800];
 
let frightenedActive=false;
let frightenedUntil=0;
let frightenedChainCount=0;

let hudScoreImg;
let hudLifeImg;
let hudShieldImg;

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

const SFX = {
	start:      null,
	eat:        null,
	fruit:      null,
	frightened: null,
	eatGhost:   null,
	fail:       null,
	ghostMove:  null,
};

let eatSfxAudioContext = null;
let eatSfxArrayBuffer = null;
let eatSfxBuffer = null;
let eatSfxCurrentSource = null;
let eatSfxGainNode = null;
let eatSfxReady = false;
let eatSfxPlaying = false;
let eatSfxGestureUnlocked = false;

function trimLeadingSilence(buffer, threshold=0.012, minLeadSeconds=0.06){
	if(!buffer || buffer.numberOfChannels===0) return buffer;

	const sampleRate   = buffer.sampleRate;
	const leadSamples  = Math.floor(minLeadSeconds * sampleRate);
	const channelCount = buffer.numberOfChannels;
	const channelData  = [];
	let firstNonSilent = buffer.length;

	for(let ci=0; ci<channelCount; ci++){
		const data = buffer.getChannelData(ci);
		channelData.push(data);
		for(let si=0; si<buffer.length; si++){
			if(Math.abs(data[si]) > threshold){
				if(si < firstNonSilent) firstNonSilent = si;
				break;
			}
		}
	}

	if(firstNonSilent === buffer.length) return buffer;
	if(firstNonSilent <= leadSamples)    return buffer;

	const trimLen = Math.max(1, buffer.length - firstNonSilent);
	const out     = eatSfxAudioContext.createBuffer(channelCount, trimLen, sampleRate);
	for(let ci=0; ci<channelCount; ci++){
		out.getChannelData(ci).set(channelData[ci].subarray(firstNonSilent));
	}
	return out;
}

function ensureEatSfxAudioContext(){
	const AudioContextClass = window.AudioContext || window.webkitAudioContext;
	if(!AudioContextClass) return null;

	if(!eatSfxAudioContext){
		eatSfxAudioContext = new AudioContextClass();
	}

	return eatSfxAudioContext;
}

async function prepareEatSfx(){
	if(eatSfxReady && eatSfxBuffer) return;
	if(!eatSfxArrayBuffer) return;

	const ctx = ensureEatSfxAudioContext();
	if(!ctx) return;

	try{
		if(ctx.state === "suspended"){
			await ctx.resume();
		}

		const decodedBuffer = await ctx.decodeAudioData(eatSfxArrayBuffer.slice(0));
		eatSfxBuffer = trimLeadingSilence(decodedBuffer);
		eatSfxReady = true;
	}catch(_){
		eatSfxReady = false;
	}
}

function loadSounds(){
	function mk(src, loop=false, volume=1.0){
		const a = new Audio(src);
		a.loop   = loop;
		a.volume = volume;
		return a;
	}

	SFX.start      = mk("./Sounds/start.mp3",           false, 1.0);
	SFX.eat        = mk("./Sounds/pacmanEatDots.mp3",   false, 0.6);
	SFX.fruit      = mk("./Sounds/pacmanEatFruit.mp3",  false, 0.8);
	SFX.frightened = mk("./Sounds/ghostBlue.mp3",       false, 0.8);
	SFX.eatGhost   = mk("./Sounds/pacmanEatGhost.mp3",  false, 0.8);
	SFX.fail       = mk("./Sounds/fail.mp3",            false, 1.0);
	SFX.ghostMove  = mk("./Sounds/ghostSound.mp3",      true,  0.35);

	(async()=>{
		try{
			const response = await fetch("./Sounds/pacmanEatDots.mp3");
			eatSfxArrayBuffer = await response.arrayBuffer();
			if(eatSfxGestureUnlocked){
				await prepareEatSfx();
			}
		}catch(_){
			eatSfxReady = false;
		}
	})();
}

function playSound(sfx){
	if(!sfx || !soundEnabled) return;
	try{
		sfx.currentTime = 0;
		sfx.play().catch(()=>{});
	}catch(_){}
}

// Eat-dot: loops while dots are being eaten, stops instantly when not
function playEatDotSound(){
    if(!soundEnabled) return;
	if(!eatSfxReady || !eatSfxAudioContext || !eatSfxBuffer){
		if(SFX.eat && !eatSfxPlaying){
			eatSfxPlaying = true;
			SFX.eat.loop = true;
			SFX.eat.currentTime = 0;
			SFX.eat.play().catch(()=>{});
		}
		return;
	}

	if(eatSfxAudioContext.state === "suspended"){
		eatSfxAudioContext.resume().catch(()=>{});
	}

	if(eatSfxPlaying) return;

	eatSfxPlaying = true;

	const source = eatSfxAudioContext.createBufferSource();
	source.buffer = eatSfxBuffer;
	source.loop = true;

	const gain = eatSfxAudioContext.createGain();
	gain.gain.value = 0.6;

	source.connect(gain);
	gain.connect(eatSfxAudioContext.destination);
	source.start(0);

	eatSfxCurrentSource = source;
	eatSfxGainNode = gain;

	source.onended = () => {
		eatSfxPlaying = false;
		eatSfxCurrentSource = null;
		eatSfxGainNode = null;
	};
}

function stopEatDotSound(){
	if(!eatSfxPlaying) return;
	eatSfxPlaying = false;

	if(eatSfxCurrentSource){
		try{ eatSfxCurrentSource.stop(); }catch(_){}
		eatSfxCurrentSource = null;
		eatSfxGainNode = null;
	}

	if(SFX.eat){
		SFX.eat.pause();
		SFX.eat.currentTime = 0;
		SFX.eat.loop = false;
	}
}

function resetEatSound(){
	stopEatDotSound();
	if(SFX.eat) SFX.eat.onended = null;
}

function startGhostMoveSound(){
    if(!soundEnabled || !SFX.ghostMove || !SFX.ghostMove.paused) return;
	try{
		SFX.ghostMove.currentTime = 0;
		SFX.ghostMove.play().catch(()=>{});
	}catch(_){}
}

function stopGhostMoveSound(){
	if(!SFX.ghostMove) return;
	try{
		SFX.ghostMove.pause();
		SFX.ghostMove.currentTime = 0;
	}catch(_){}
}

function pauseAllSounds(){
	for(const key of Object.keys(SFX)){
		const sfx = SFX[key];
		if(sfx && !sfx.paused) sfx.pause();
	}
	resetEatSound();
}

function resumeGhostMoveIfNeeded(){
	if(gameStarted && !gameOver && !isPaused && !frightenedActive){
		startGhostMoveSound();
	}
}

// add sound toggle helpers
function setSoundButtonVisible(visible){
    soundButtonVisible = visible;
    if(!visible){
        soundButtonRect = { x: 0, y: 0, width: 0, height: 0 };
    }
}

function toggleSound(){
    soundEnabled = !soundEnabled;

    if(!soundEnabled){
        pauseAllSounds();
    }else{
        if(gameStarted && !gameOver && !isPaused){
            resumeGhostMoveIfNeeded();
        }
    }

    draw();
}

function isSoundOn(){
    return soundEnabled;
}

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

let movementLockUntil=0;
let movementLockLabel="";

function beginMovementLock(ms,label){
	movementLockUntil=Date.now()+ms;
	movementLockLabel=label;
}

function clearMovementLock(){
	movementLockUntil=0;
	movementLockLabel="";
}

function isMovementLocked(){
	return gameStarted && !gameOver && Date.now()<movementLockUntil;
}

function getMovementLockSecondsLeft(){
	if(!isMovementLocked()) return 0;
	const msLeft=Math.max(0,movementLockUntil-Date.now());
	return Math.max(1,Math.ceil(msLeft/1000));
}

let pendingRespawnReset=false;

const SHIELD_THRESHOLD=250;
const SHIELD_POWER_DURATION=5000;
const SHIELD_SPAWN_LIFETIME=10000;


let shieldActive=false;
let shieldTimer=0;
let shieldSpawnedAt=0;
let shieldStartScore=0;

const HEART_THRESHOLD=150;
let heartStartScore=0;

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

    startGhostRespawnBlink(ghost);
    return true;
}

function setGhostNormalImage(ghost){
	if(!ghost.dirImages) return;
	ghost.image = ghost.dirImages[ghost.direction] || ghost.image;
}

function getFrightenedGhostImage(){
	const msLeft = frightenedUntil - Date.now();

	if(msLeft <= FRIGHTENED_BLINK_MS){
		return bonusGhostWhiteImg;
	}
	return bonusGhostBlueImg;
}

function setGhostFrightenedImage(ghost){
	const img = getFrightenedGhostImage();
	if(img && img.complete) ghost.image = img;
}
 
function startFrightenedMode(){
	frightenedActive = true;
	frightenedUntil = Date.now() + FRIGHTENED_DURATION_MS;
	frightenedChainCount = 0;

    stopGhostMoveSound();
	playSound(SFX.frightened);

	for(const g of ghosts){
		const rev = oppositeDirection(g.direction);
		if(canMoveInDirection(g, rev)){
			g.updateDirection(rev);
		}
		setGhostFrightenedImage(g);
	}
}

function updateFrightenedMode(){
	if(!frightenedActive) return;
 
	if(Date.now() >= frightenedUntil){
		frightenedActive = false;
		frightenedUntil = 0;
		frightenedChainCount = 0;
 
		for(const g of ghosts){
			if(g.isEaten){
				startGhostRespawnBlink(g);
				continue;
			}
			setGhostNormalImage(g);
			g.updateVelocity();
		}
        startGhostMoveSound();
		return;
	}
 
	for(const g of ghosts){
		if(g.isEaten || g.isRespawning) continue;
		setGhostFrightenedImage(g);
	}
}

function eatGhost(ghost){
	const idx = Math.min(frightenedChainCount, GHOST_EAT_SCORES.length - 1);
	score += GHOST_EAT_SCORES[idx];
	frightenedChainCount++;
 
	ghost.isEaten = true;
	ghost.velocityX = 0;
	ghost.velocityY = 0;
	ghost.x = -tileSize * 2;
	ghost.y = -tileSize * 2;
}

function startGhostRespawnBlink(ghost){
	ghost.x = Math.round(ghost.startX / tileSize) * tileSize;
	ghost.y = Math.round(ghost.startY / tileSize) * tileSize;
 
	ghost.isEaten = false;
	ghost.isRespawning = true;
	ghost.respawnUntil = Date.now() + GHOST_RESPAWN_FREEZE_MS;
 
	ghost.velocityX = 0;
	ghost.velocityY = 0;
 
	if(bonusGhostWhiteImg && bonusGhostWhiteImg.complete){
		ghost.image = bonusGhostWhiteImg;
	}
}

function updateGhostRespawnBlink(ghost){
	if(!ghost.isRespawning) return false;
 
	const msLeft = ghost.respawnUntil - Date.now();
	if(msLeft <= 0){
		ghost.isRespawning = false;
		ghost.respawnUntil = 0;
 
		ensureGhostHasValidDirection(ghost);
		setGhostNormalImage(ghost);
		return false;
	}

	ghost.velocityX = 0;
	ghost.velocityY = 0;
 
	const phase = Math.floor(Date.now() / GHOST_RESPAWN_BLINK_INTERVAL_MS) % 2;
	if(phase === 0 && bonusGhostWhiteImg && bonusGhostWhiteImg.complete){
		ghost.image = bonusGhostWhiteImg;
	}else{
		setGhostNormalImage(ghost);
	}
 
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

function setPauseButtonVisible(visible){
    pauseButtonVisible = visible;
    if(!visible){
        pauseButtonRect = {x:0,y:0,width:0,height:0};
    }
}

function renderPauseIcon(){
    if(gameStarted && !gameOver){
        draw();
    }
}

function pauseGame(){
    if(!gameStarted || gameOver) return;
    if(isPaused) return;
    if(isMovementLocked()) return;
	isPaused = true;
	renderPauseIcon();
	pauseAllSounds();
	stopLoop();
}

function resumeGame(){
	if(!gameStarted || gameOver) return;
	if(!isPaused) return;
	isPaused = false;
	renderPauseIcon();
	resumeGhostMoveIfNeeded();
	startLoop();
}

function togglePause(){
	if(!gameStarted || gameOver) return;
	if(isMovementLocked()) return;
	if(isPaused) resumeGame();
	else pauseGame();
}

function isInsideRect(x,y,rect){
    return x>=rect.x && x<=rect.x+rect.width && y>=rect.y && y<=rect.y+rect.height;
}

function handleBoardClick(event){
    if((!soundButtonVisible && !pauseButtonVisible) || !gameStarted || gameOver) return;

    const canvasRect = board.getBoundingClientRect();
    if(canvasRect.width===0 || canvasRect.height===0) return;

    const scaleX = board.width / canvasRect.width;
    const scaleY = board.height / canvasRect.height;

    const x = (event.clientX - canvasRect.left) * scaleX;
    const y = (event.clientY - canvasRect.top) * scaleY;

    if(soundButtonVisible && isInsideRect(x, y, soundButtonRect)){
        toggleSound();
        return;
    }

    if(pauseButtonVisible && isInsideRect(x, y, pauseButtonRect)){
        togglePause();
    }
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
        U:mk(`./Images/Ghosts/${prefix}_up_ghost.png`),
        D:mk(`./Images/Ghosts/${prefix}_down_ghost.png`),
        L:mk(`./Images/Ghosts/${prefix}_left_ghost.png`),
        R:mk(`./Images/Ghosts/${prefix}_right_ghost.png`),
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
	loadSounds();
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

    board.addEventListener("click",handleBoardClick);

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

    renderPauseIcon();
    setPauseButtonVisible(false);
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

    if(e.code === PAUSE_KEY){
        e.preventDefault();
        togglePause();
        return;
    }

    if(e.code === SOUND_KEY){
        e.preventDefault();
        toggleSound();
        return;
    }

    if(e.code === PAUSE_KEY){
        e.preventDefault();
        togglePause();
        return;
    }

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

window.addEventListener("load", function() {
    const mobileControls = document.getElementById("mobileControls");
    if (!mobileControls) return;

    if (isMobile) {
        mobileControls.style.display = "flex";
    } else {
        mobileControls.style.display = "none";
    }

    const ctrlButtons = mobileControls.querySelectorAll(".ctrl-btn");
    
    ctrlButtons.forEach(button => {
        button.addEventListener("touchstart",function(e){
            e.preventDefault();
            handleMobileInput(button.dataset.dir);
        });

        button.addEventListener("click",function(e){
            e.preventDefault();
            handleMobileInput(button.dataset.dir);
        })
    });
});

function handleMobileInput(direction){
    if(!gameStarted) return;
    if(isMovementLocked()) return;
    if(gameOver) return;

    switch(direction){
        case "up":
            nextPacmanDirection="U";
            break;
        case "down":
            nextPacmanDirection="D";
            break;
        case "left":
            nextPacmanDirection="L";
            break;
        case "right":
            nextPacmanDirection="R";
            break;
    }

    if(pacman && pacman.velocityX===0 && pacman.velocityY===0 && nextPacmanDirection){
        pacman.direction=nextPacmanDirection;
        pacman.updateVelocity();
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
    setPauseButtonVisible(false);
    setPauseButtonVisible(false);
    setSoundButtonVisible(false);
}

function hideGameOverPopup(){
    const overlay=document.getElementById("gameOverOverlay");
    if(overlay) overlay.classList.add("hidden");
}

function goToLobby(){
    stopLoop();
	stopGhostMoveSound();
	resetEatSound();
	hideGameOverPopup();
	hideSettings();
	closeMapZoom();

	isPaused=false;
	renderPauseIcon();
	setPauseButtonVisible(false);
	clearMovementLock();
	pendingRespawnReset=false;

    setPauseButtonVisible(true);
    setSoundButtonVisible(true);

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
	eatSfxGestureUnlocked = true;
	prepareEatSfx();

	isPaused=false;
	renderPauseIcon();
	setPauseButtonVisible(true);
	beginMovementLock(GAME_START_DELAY_MS,"STARTS IN");
	pendingRespawnReset=false;

    setPauseButtonVisible(true);
    setSoundButtonVisible(true);

    gameStarted=true;
    gameOver=false;

    lives=3;
    score=0;

    heartStartScore=0;

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

    stopGhostMoveSound();
	if(SFX.start){
		SFX.start.currentTime=0;
		SFX.start.play().catch(()=>{});
		SFX.start.onended=null;
	}

    startLoop();
}


function restartGame(){
    hideGameOverPopup();
	hideSettings();
	closeMapZoom();
	eatSfxGestureUnlocked = true;
	prepareEatSfx();

	isPaused=false;
	renderPauseIcon();
	setPauseButtonVisible(true);
	beginMovementLock(GAME_START_DELAY_MS,"STARTS IN");
	pendingRespawnReset=false;

    setPauseButtonVisible(true);
    setSoundButtonVisible(true);

    lives=3;
    score=0;
    heartStartScore=score;

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

    stopGhostMoveSound();
	if(SFX.start){
		SFX.start.currentTime=0;
		SFX.start.play().catch(()=>{});
		SFX.start.onended=null;
	}

    startLoop();
}

function loadImages(){

    wallImages=[];
    for(let i=1;i<=4;i++){
        const img=new Image();
        img.src=`./Images/Walls/wall${i}.png`;
        wallImages.push(img);
    }

    blueGhostImage=new Image();
    blueGhostImage.src="./Images/Ghosts/blue_right_ghost.png";
    orangeGhostImage=new Image();
    orangeGhostImage.src="./Images/Ghosts/orange_right_ghost.png";
    pinkGhostImage=new Image();
    pinkGhostImage.src="./Images/Ghosts/pink_right_ghost.png";
    redGhostImage=new Image();
    redGhostImage.src="./Images/Ghosts/red_right_ghost.png";

    redGhostImgs=loadDirGhostImages("red");
    pinkGhostImgs=loadDirGhostImages("pink");
    blueGhostImgs=loadDirGhostImages("blue");
    orangeGhostImgs=loadDirGhostImages("orange");


    pacmanFullUpImage=new Image();
    pacmanFullUpImage.src="./Images/Pacman/pacmanFullUp.png";
    pacmanFullDownImage=new Image();
    pacmanFullDownImage.src="./Images/Pacman/pacmanFullDown.png";
    pacmanFullLeftImage=new Image();
    pacmanFullLeftImage.src="./Images/Pacman/pacmanFullLeft.png";
    pacmanFullRightImage=new Image();
    pacmanFullRightImage.src="./Images/Pacman/pacmanFullRight.png";

    pacmanUpImage=new Image();
    pacmanUpImage.src="./Images/Pacman/pacmanUp.png";
    pacmanDownImage=new Image();
    pacmanDownImage.src="./Images/Pacman/pacmanDown.png";
    pacmanLeftImage=new Image();
    pacmanLeftImage.src="./Images/Pacman/pacmanLeft.png";
    pacmanRightImage=new Image();
    pacmanRightImage.src="./Images/Pacman/pacmanRight.png";

    pacmanCloseImage=new Image();
    pacmanCloseImage.src="./Images/Pacman/pacmanClose.png";

    smallCherryImage=new Image();
    smallCherryImage.src="./Images/Powers/smallCherry.png";
    bigCherryImage=new Image();
    bigCherryImage.src="./Images/Powers/bigCherry.png";

    shieldImage=new Image();
    shieldImage.src="./Images/Powers/shield.png";

    heartImage=new Image();
    heartImage.src="./Images/Powers/life.png";

    pauseBtnPlayImage = new Image();
    pauseBtnPlayImage.src = PAUSE_BTN_PLAY_SRC;

    pauseBtnPauseImage = new Image();
    pauseBtnPauseImage.src = PAUSE_BTN_PAUSE_SRC;

    bonusGhostBlueImg = new Image();
	bonusGhostBlueImg.src = "./Images/Ghosts/bonus_ghost_blue.png";
 
	bonusGhostWhiteImg = new Image();
	bonusGhostWhiteImg.src = "./Images/Ghosts/bonus_ghost_white.png";

    soundBtnOnImage = new Image();
    soundBtnOnImage.src = SOUND_BTN_ON_SRC;

    soundBtnOffImage = new Image();
    soundBtnOffImage.src = SOUND_BTN_OFF_SRC;

    hudLifeImg=heartImage;
    hudShieldImg=shieldImage;

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
		g.isGhost=true;
		g.isEaten=false;
		g.isRespawning=false;
		g.respawnUntil=0;
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
    heartStartScore=score;
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
    if(isMovementLocked()) return;

    if(pendingRespawnReset){
		pendingRespawnReset=false;
		resetPositions();
		setOccupiedFromEntities();
		return;
	}

    resumeGhostMoveIfNeeded();
	updateFrightenedMode();
	move();
}

function drawCountdownOverlay(){
	if(!isMovementLocked()) return;

	const centerX=boardWidth/2;
	const playableHeight=boardHeight-HUD_HEIGHT;
	const centerY=HUD_HEIGHT+(playableHeight/2);
	const seconds=getMovementLockSecondsLeft();

	context.fillStyle="rgba(0,0,0,0.45)";
	context.fillRect(0,HUD_HEIGHT,boardWidth,playableHeight);

	context.textAlign="center";
	context.textBaseline="middle";

	context.fillStyle="#ffd54a";
	context.font="bold 56px sans-serif";
	context.fillText(String(seconds),centerX,centerY-10);

	context.fillStyle="#fff";
	context.font="bold 16px sans-serif";
	context.fillText(movementLockLabel||"READY",centerX,centerY+38);

	context.textAlign="start";
}

function drawHud(){
    context.fillStyle = "rgba(0,0,0,0.85)";
    context.fillRect(0, 0, boardWidth, HUD_HEIGHT);

    context.fillStyle = "rgba(255,255,255,0.18)";
    context.fillRect(0, HUD_HEIGHT - 1, boardWidth, 1);

    context.font = isMobile ? "bold 30px sans-serif" : "16px sans-serif";
    context.textBaseline = "middle";
    context.fillStyle = "#fff";

    const cy =  HUD_HEIGHT / 2;
    const iconSize = HUD_ICON_SIZE;
    const controlIconSize = isMobile ? 60 : 30;

    let x = HUD_PADDING;

    if (hudLifeImg && hudLifeImg.complete) {
        context.drawImage(hudLifeImg, x, cy - iconSize/2, iconSize, iconSize);
        x += iconSize + 8;
    }
    context.fillText(`x${lives}`, x, cy);
    x += context.measureText(`x${lives}`).width + 16;

    if (shieldActive) {
        const msLeft = Math.max(0, shieldTimer - Date.now());
        const shieldText = `${(msLeft / 1000).toFixed(1)}s`;

        if (hudShieldImg && hudShieldImg.complete) {
            context.drawImage(hudShieldImg, x, cy - iconSize/2, iconSize, iconSize);
            x += iconSize + 8;
        }
        context.fillText(shieldText, x, cy);
    }

    const scoreText = String(score);
    const scoreW = context.measureText(scoreText).width;
    context.fillText(scoreText, (boardWidth - scoreW) / 2, cy);

    if(soundButtonVisible){
        const btnSize=HUD_PAUSE_BUTTON_SIZE;
        const btnX=boardWidth-HUD_PADDING-btnSize*2-8;
        const btnY=(HUD_HEIGHT-btnSize)/2;
        const icon=soundEnabled?soundBtnOnImage:soundBtnOffImage;

        if(icon && icon.complete){
            const iconX = btnX + (btnSize - controlIconSize) / 2;
            const iconY = btnY + (btnSize - controlIconSize) / 2;
            context.drawImage(icon, iconX, iconY, controlIconSize, controlIconSize);
        }

        soundButtonRect = { x: btnX, y: btnY, width: btnSize, height: btnSize };
    }else{
        soundButtonRect = { x: 0, y: 0, width: 0, height: 0 };
    }

    if(pauseButtonVisible){
        const btnSize = HUD_PAUSE_BUTTON_SIZE;
        const btnX = boardWidth - HUD_PADDING - btnSize;
        const btnY = (HUD_HEIGHT - btnSize) / 2;
        const icon = isPaused ? pauseBtnPlayImage : pauseBtnPauseImage;

        if(icon && icon.complete){
            const iconX = btnX + (btnSize - controlIconSize) / 2;
            const iconY = btnY + (btnSize - controlIconSize) / 2;
            context.drawImage(icon, iconX, iconY, controlIconSize, controlIconSize);
        }

        pauseButtonRect = {x:btnX,y:btnY,width:btnSize,height:btnSize};
    }else{
        pauseButtonRect = {x:0,y:0,width:0,height:0};
    }
}

function draw(){
    context.clearRect(0,0,board.width,board.height);

    drawHud();

    const oy = HUD_HEIGHT;

    for(const wall of walls){
        context.drawImage(wall.image, wall.x, wall.y + oy, wall.width, wall.height);
    }

    context.fillStyle="white";
    for(const food of foods){
        context.fillRect(food.x, food.y + oy, food.width, food.height);
    }

    for(const cherry of cherries){
        context.drawImage(cherry.image, cherry.x, cherry.y + oy, cherry.width, cherry.height);
    }

    for(const heart of hearts){
        context.drawImage(heart.image, heart.x, heart.y + oy, heart.width, heart.height);
    }

    for(const shield of shields){
        context.drawImage(shield.image, shield.x, shield.y + oy, shield.width, shield.height);
    }

    for(const ghost of ghosts){
        if(ghost.isEaten) continue;
        context.drawImage(ghost.image, ghost.x, ghost.y + oy, ghost.width, ghost.height);
    }

    if(pacman && pacman.image){
        context.drawImage(pacman.image, pacman.x, pacman.y + oy, pacman.width, pacman.height);
    }

    drawCountdownOverlay();
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

    if(score-heartStartScore <HEART_THRESHOLD) return;

    if(Math.random()>0.02) return;

    const pos=randomEmptyTile();
    if(!pos) return;

    hearts.add(makePickup(heartImage,pos.col,pos.row));
    heartSpawnedAt=Date.now();

    heartStartScore=score;
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
		if(ghost.isEaten) continue;
 
		if(updateGhostRespawnBlink(ghost)){
			continue;
		}
 
		if(collision(ghost, pacman)){
			if(frightenedActive){
				eatGhost(ghost);
				continue;
			}
 
			if(!shieldActive){
				lives -= 1;

				stopGhostMoveSound();
				stopEatDotSound();
				playSound(SFX.fail);

				if(lives===0){
					gameOver=true;
					showGameOverPopup();
					stopLoop();
					return;
				}

				pacman.velocityX=0;
				pacman.velocityY=0;
				nextPacmanDirection=null;
				pacmanAnimIndex=0;
				pacmanAnimTick=0;
				pacman.image=getPacmanIdleImageByDirection(pacman.direction);

				for(const g of ghosts){
					g.velocityX=0;
					g.velocityY=0;
				}

				setOccupiedFromEntities();
				pendingRespawnReset=true;
				beginMovementLock(RESPAWN_DELAY_MS,"RESPAWN IN");
				return;
			}
		}
 
		if(ghost.y==tileSize*9 && ghost.direction!='U' && ghost.direction!='D'){
			ghost.updateDirection('U');
		}
 
		maybeTurnGhostAtIntersection(ghost);
 
		ghost.x += ghost.velocityX;
		ghost.y += ghost.velocityY;
 
		if(handleGhostTunnelRespawn(ghost)){
			continue;
		}
 
		let hit=false;
		for(const wall of walls){
			if(collision(ghost,wall)){
				hit=true;
				break;
			}
		}
		if(ghost.x<=0 || ghost.x+ghost.width>=boardWidth){
			hit=true;
		}
 
		if(hit){
			ghost.x -= ghost.velocityX;
			ghost.y -= ghost.velocityY;
 
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
    if(foodEaten){
		foods.delete(foodEaten);
		playEatDotSound();
	}else{
		stopEatDotSound();
	}

    let cherryEaten=null;
    for(const cherry of cherries){
        if(collision(pacman,cherry)){
            cherryEaten=cherry;
            score+=cherry.points;
            break;
        }
    }
    if(cherryEaten){
		cherries.delete(cherryEaten);
        playSound(SFX.fruit);
		if(cherryEaten.points===100){
			startFrightenedMode();
		}
	}


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
		heartStartScore=score;
		playSound(SFX.fruit);
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
		playSound(SFX.fruit);
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
    if(isMovementLocked()) return;
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
    resetEatSound();

    pacman.reset();
    pacman.velocityX=0;
    pacman.velocityY=0;

    nextPacmanDirection=null;

    pacmanAnimIndex=0;
    pacmanAnimTick=0;
    pacman.image=getPacmanIdleImageByDirection(pacman.direction);

    for(const ghost of ghosts){
		ghost.isEaten = false;
		ghost.isRespawning = false;
		ghost.respawnUntil = 0;
		ghost.reset();
		respawnGhostAtStartAndMove(ghost);
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

        this.isGhost = false;
		this.isEaten = false;
		this.isRespawning = false;
		this.respawnUntil = 0;
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
				this.image=prevImage;
				return;
			}
		}

        this.x-=this.velocityX;
        this.y-=this.velocityY;
    }

    updateVelocity(){
        const baseSpeed = tileSize/4;
		const speed = (this.isGhost && frightenedActive) ? (baseSpeed/2) : baseSpeed;

        if(this.direction=='U'){
			this.velocityX=0;
			this.velocityY=-speed;
		}
		else if(this.direction=='D'){
			this.velocityX=0;
			this.velocityY=speed;
		}
		else if(this.direction=='L'){
			this.velocityX=-speed;
			this.velocityY=0;
		}
		else if(this.direction=='R'){
			this.velocityX=speed;
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
        img.src=`./Images/Walls/wall${w+1}.png`;
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
        "./Images/Pacman/pacmanFullRight.png",
        "./Images/Pacman/pacmanRight.png",
        "./Images/Pacman/pacmanClose.png",
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
        if(dir==="R") return `./Images/Ghosts/${color}_right_ghost.png`;
        if(dir==="L") return `./Images/Ghosts/${color}_left_ghost.png`;
        if(dir==="U") return `./Images/Ghosts/${color}_up_ghost.png`;
        if(dir==="D") return `./Images/Ghosts/${color}_down_ghost.png`;
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