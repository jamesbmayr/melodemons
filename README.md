# Melodemons

a real-time multiplayer music-based post-capturing platformer: http://www.melodemons.com

---
<pre>
  ____----____  
//            \\
                
||\\  //\\  //||
|| \\//  \\// ||
||  \\    //  ||
||   \\  //   ||
||    \\//    ||
</pre>
---

## Launch
Every game has a unique 4-character id. Go to the homepage to start a new one - or join a friend's!
On the settings screen, choose your heroes and demons, pick a theme, and start playing!

## Gameplay
In this real-time game, demons seek to control towers so they can play the song to end the world. The heroes must work together to stop them, performing music to cast magic spells and control the towers themselves.

With randomly generated maps, tons of unlockable spell songs, and a whole cast of heroes to choose from, Melodemons is an intense game that's different every time.

## Code
The app is powered by nodeJS and websockets, written in 100% raw javascript. 

---
<pre>
melodemons
|- package.json
|- index.js (handleRequest, parseRequest, routeRequest, \_302, \_403, \_404; handleSocket, parseSocket, routeSocket, \_400)
|- node_modules
|   |- websocket
|
|- main
|   |- logic.js (logError, logStatus, logMessage, logTime; getEnvironment, getAsset, getSchema; isNumLet, isBot; renderHTML, sanitizeString, duplicateObject; generateRandom, chooseRandom, sortRandom; determineSession, cleanDatabase)
|   |- stylesheet.css
|   |- audio.js (buildAudio; buildInstrument, getInstruments)
|   |- draw.js (drawLine, drawCircle, drawTriangle, drawRectangle, drawText, drawGradient; drawMap, drawSky, drawBackground, drawForeground; drawAvatar, drawArrow, drawPit, drawSections, drawTower, drawTowerLetters)
|   |- icon.png
|   |- logo.png
|   |- banner.png
|   |- background.png
|   |- \_404.html
|
|- home
|   |- logic.js (createGame, createPlayer; joinGame)
|   |- index.html
|   |- stylesheet.css
|   |- script.js (isNumLet, sendPost, displayError; createGame, joinGame; drawLoop)
|
|- about
|   |- index.html
|   |- stylesheet.css
|   |- script.js (sanitizeString, sendPost, displayError; submitFeedback; drawLoop)
|
|- game
    |- logic.js (addPlayer, removePlayer; submitArrow, submitNote, submitTeam; changeSelection, launchGame; createAvatar, createTower, createColumn, createStartPosition, createArrow; triggerMove, triggerNote; getAngle, getScalar, getCells, getAvatar, getTower, getMatch, getBeatAgo; updateBeat, updateState, updateEffects, updateArrow, updateTower, updateVelocity, updateCollisions, updatePosition, updateHealth, updateMusic, updateMessage, updateWinning)
    |- index.html
    |- stylesheet.css
    |- script.js (createSocket, checkLoop; submitClick, submitKey, submitTouch; receivePost; createOverlay, drawMessage, drawMenu; drawDPad, drawKeyboard, drawEscape, buildMobileControls; setInstruments, playMusic, playSoundEffects, playSoundtrack, playAvatarSounds)
</pre>
