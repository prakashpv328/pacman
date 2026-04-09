# PAC-MAN
A browser-based Pac-Man style game build with HTML,CSS and JavaScript using the canvas

## Feature

- Classic grid movement for pac-man and ghosts
- 8 map layouts with random or fixed map selection
- Collectibles and scoring:
- Pellets (+10)
- Small cherry (+50)
- Big cherry (+100, triggers frightened mode)
- Heart pickup (extra life when lives are below 3)
- Shield pickup (temporary protection)
- Ghost frightened mode with score chain on ghost eat
- Respawn countdown after hit
- Start countdown before movement begins
- In-game HUD:
- Lives, score, shield timer
- Pause icon control
- Sound on/off icon control
- Audio system with movement/eat/fail/fruit/frightened sounds

## Controls

- Move: Arrow keys or W A S D
- Pause/Resume: Space
- Sound On/Off: P
- Lobby Start: Enter
- Game Over Restart: Enter
- Game Over Back to Lobby: Backspace
- Settings/Zoom close: Esc
- Map zoom select: Enter
- Map zoom navigation: Left/Right arrows

## Gameplay Notes

- Movement is locked during start/respawn countdown.
- Sound toggle affects all game audio through a global sound state.
- Ghost movement sound resumes automatically when gameplay is active and not paused/frightened.

## Tech Stack

- HTML5
- CSS3
- JavaScript (ES6+)
- Canvas 2D API
- Web Audio / HTML Audio