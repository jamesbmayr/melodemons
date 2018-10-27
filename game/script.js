/*** onload ***/
	/* defaults */
		document.addEventListener("dblclick", function(event) {
			event.preventDefault()
		})

		document.addEventListener("contextmenu", function(event) {
			event.preventDefault()
		})

	/* globals */
		var data        = window.data = {}
		var instruments = window.instruments = {}
		var socket      = null

	/* key mapping */
		var keyboard = {
			"ArrowLeft": "left",
			"ArrowUp": "up",
			"ArrowDown": "down",
			"ArrowRight": "right",
			"Digit1": "1-C3",
			"Digit2": "2-D3",
			"Digit3": "3-E3",
			"Digit5": "5-G3",
			"Digit6": "6-A3",
			"Digit8": "1-C4",
			"Digit9": "2-D4",
			"Digit0": "3-E4",
			"KeyQ": "1-C4",
			"KeyW": "2-D4",
			"KeyE": "3-E4",
			"KeyT": "5-G4",
			"KeyY": "6-A-4",
			"KeyI": "1-C5",
			"KeyO": "2-D5",
			"KeyP": "3-E5",
			"BracketRight": "5-G5",
			"Backslash": "6-A5",
			"KeyA": "1-C3",
			"KeyS": "2-D3",
			"KeyD": "3-E3",
			"KeyG": "5-G3",
			"KeyH": "6-A3",
			"KeyK": "1-C4",
			"KeyL": "2-D4",
			"Semicolon": "3-E4",
			"KeyZ": "1-C2",
			"KeyX": "2-D2",
			"KeyC": "3-E2",
			"KeyB": "5-G2",
			"KeyN": "6-A2",
			"Comma": "1-C3",
			"Period": "2-D3",
			"Slash": "3-E3"			
		}

		var keyNotes = {
			"1-C3": ["Digit1","KeyQ","KeyA","KeyZ"],
			"2-D3": ["Digit2","KeyW","KeyS","KeyX"],
			"3-E3": ["Digit3","KeyE","KeyD","KeyC"],
			"4-F3": [],
			"5-G3": ["Digit5","KeyT","KeyG","KeyB"],
			"6-A3": ["Digit6","KeyY","KeyH","KeyN"],
			"7-B3": [],
			"1-C4": ["Digit8","KeyI","KeyK","Comma"],
			"2-D4": ["Digit9","KeyO","KeyL","Period"],
			"3-E4": ["Digit0","KeyP","Semicolon","Slash"]
		}

/*** websocket ***/
	/* socket */
		createSocket()
		function createSocket() {
			socket = new WebSocket(location.href.replace("http","ws"))
			socket.onopen = function() { socket.send(null) }
			socket.onerror = function(error) {}
			socket.onclose = function() {
				socket = null
				window.location = "../../../../"
			}

			socket.onmessage = function(message) {
				try {
					var post = JSON.parse(message.data)
					if (post && (typeof post == "object")) {
						receivePost(post)
					}
				}
				catch (error) {}
			}
		}

	/* checkLoop */
		var checkLoop = setInterval(function() {
			if (!socket) {
				try {
					createSocket()
				}
				catch (error) {}
			}
			else {
				clearInterval(checkLoop)
			}
		}, 5000)

/*** submit ***/
	/* submitKey */
		document.addEventListener("keydown", submitKey)
		document.addEventListener("keyup",   submitKey)
		function submitKey(event) {
			if (data.clicked) {
				// variables
					var key   = keyboard[event.code] || null
					var type  = null
					var press = (event.type == "keydown") ? true : false

					if (["up","right","down","left"].includes(key)) {
						type = "Arrow"
					}
					else if (key) {
						type = "Note"
					}
					else if (event.code == "Escape" && press) {
						data.showControls = data.showControls ? false : true
					}

				// prevent spamming
					if (key && data.pressed.includes(event.code)) {
						if (press) {
							type = null
						}
						else {
							data.pressed = data.pressed.filter(function(k) {
								return (k !== event.code)
							}) || []
						}
					}
					else if (key) {
						if (press) {
							data.pressed.push(event.code)
						}
					}

				// submit data
					if (type && socket) {
						socket.send(JSON.stringify({
							action: "submit" + type,
							key:    key,
							press:  press
						}))
					}
			}
		}

	/* submitClick */
		function submitClick(event) {
			var firstClick = false

			// picking a team
				if (socket && event.target.id == "hero-button") {
					socket.send(JSON.stringify({
						action: "submitTeam",
						team:   "heroes"
					}))

					document.getElementById("overlay").remove()
					firstClick = true
				}
				else if (socket && event.target.id == "demon-button") {
					socket.send(JSON.stringify({
						action: "submitTeam",
						team:   "demons"
					}))

					document.getElementById("overlay").remove()
					firstClick = true
				}

			// rejoin
				else if (event.target.id == "rejoin") {
					event.target.remove()
					firstClick = true
				}

			// again
				else if (event.target.id == "again") {
					window.location = "../../../../"
				}

			// save click & create audio
				if (firstClick) {
					data.clicked = true
					document.body.className = "clicked"
					
					data.pressed = []
					buildAudio()
					setInstruments()

					if ((/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i).test(navigator.userAgent)) {
						buildMobileControls()
					}
					else {
						data.showControls = true
					}
				}
		}

	/* submitTouch */
		function submitTouch(event) {
			// adjust parameters
				var keyEvent = {
					code: event.target.id,
					type: (event.type == "touchstart") ? "keydown" : "keyup"
				}

			// send along
				submitKey(keyEvent)
		}

/*** receive ***/
	/* receivePost */
		function receivePost(post) {
			// redirect or update info
				if (post.location) {
					window.location = post.location
				}
				else {
					for (var k in post) {
						data[k] = post[k]
					}
				}

			// overlay or message
				if (post.intro || post.rejoin || (data.state && data.state.end && !data.again)) {
					createOverlay(post)
				}
				else if (post.message) {
					if (data.eraseTimer) {
						clearInterval(eraseTimer) 
					}

					data.eraseTimer = setTimeout(function() {
						clearInterval(data.eraseTimer)
						data.eraseTimer = null
						data.message    = null
					}, 3000)
				}

			// draw
				if (!data.state.start && data.clicked && data.team) {
					drawMap(data.sample, data.theme, data, true)
					drawMenu()
					drawMessage()
				}
				else if (data.state.start && data.map) {
					drawMap(data.map, data.theme, data)
					drawMessage()
				}
				if (data.clicked && !data.state.end && data.showControls) { // show controls
					drawDPad((13 * canvas.width / 16), (canvas.height / 4), (canvas.height / 8), data.pressed)
					drawKeyboard((5 * canvas.width / 16), (canvas.height / 4), (canvas.width / 2), (canvas.height / 4), data.pressed)
					drawEscape((canvas.width / 16), (3 * canvas.height / 8), 30)
				}

			// music
				if (data.clicked && !data.state.start && ((post.heroes[id] && !Object.keys(instruments).includes(post.heroes[id].instrument)) || (post.demons[id] && !Object.keys(instruments).includes(post.demons[id].instrument)))) {
					setInstruments()
				}
				if (data.clicked && post.launch) {
					data.pressed = []
					setInstruments()
				}
				if (data.clicked && post.beat) {
					playMusic()
				}
		}

/*** menu ***/	
	/* createOverlay */
		function createOverlay(post) {
			// intro
				if (post.intro) {
					var overlay = document.createElement("div")
						overlay.id = "overlay"

					var gameid = document.createElement("div")
						gameid.id = "gameid"
						gameid.innerText = "game id: " + post.id.toUpperCase()
					overlay.appendChild(gameid)

					var intro = document.createElement("div")
						intro.id = "intro"
						intro.innerHTML = post.intro
					overlay.appendChild(intro)

					var heroButton = document.createElement("button")
						heroButton.id = "hero-button"
						heroButton.innerText = "join heroes"
						heroButton.addEventListener("click", submitClick)
					overlay.appendChild(heroButton)

					var demonButton = document.createElement("button")
						demonButton.id = "demon-button"
						demonButton.innerText = "join demons"
						demonButton.addEventListener("click", submitClick)
					overlay.appendChild(demonButton)

					document.body.appendChild(overlay)
				}

			// rejoin
				else if (post.rejoin) {
					var rejoin = document.createElement("div")
						rejoin.id = "rejoin"
						rejoin.addEventListener("click", submitClick)

					var inner = document.createElement("div")
						inner.id = "rejoin-inner"
						inner.innerText = post.rejoin
					rejoin.append(inner)
						
					document.body.appendChild(rejoin)
				}

			// again
				else {
					data.again = true
					document.body.className = ""

					var again = document.createElement("a")
						again.id = "again"
						again.href = "../../../../"
						again.addEventListener("click", submitClick)

					var inner = document.createElement("div")
						inner.id = "again-inner"
						inner.innerText = "[ play again ]"
					again.append(inner)
						
					document.body.appendChild(again)
				}
		}

	/* drawMessage */
		function drawMessage() {
			// messages
				if (data.message) { // message (out of game)
					drawText(canvas.width / 2, (7 * canvas.height / 8), data.message                                  , {color: colors.black[4]})
				}
				else if (data.state.message.text) { // message (in game)
					drawText(canvas.width / 2, (7 * canvas.height / 8), data.state.message.text                       , {color: colors.black[4]})
				}
				else if (data.state && data.state.start && ((data.heroes && data.heroes[id] && !data.heroes[id].state.health) || (data.demons && data.demons[id] && !data.demons[id].state.health))) { // dead
					drawText(canvas.width / 2, (7 * canvas.height / 8), "resurrect at your tower"                     , {color: colors.black[4]})
				}

			// countdowns
				if (data.state && data.state.start && !data.state.end && data.state.beat <= 128) { // game launch
					drawText(canvas.width / 2, 3 * canvas.height / 4, 8 - Math.floor(data.state.beat / 16)            , {color: colors.black[4], size: 64, blur: 8})
				}
				else if (data.state && data.state.end && data.state.winning.team) { // game over
					drawText(canvas.width / 2,     canvas.height / 2, (data.state.winning.team.toUpperCase() + " WIN"), {color: data.state.winning.color, size: 64, blur: 8, shadow: data.state.winning.color})
				}
				else if (data.state && data.state.winning.team && data.state.winning.countdown < 256) { // win countdown
					drawText(canvas.width / 2, 3 * canvas.height / 4, Math.ceil(data.state.winning.countdown / 16)    , {color: data.state.winning.color, size: 64})
				}
		}

	/* drawMenu */
		function drawMenu() {
			// chosen / taken
				var chosenAvatar = data[data.team][id]
				var takenAvatars = []
				for (var d in data[data.team]) {
					if (data[data.team][d]) {
						takenAvatars.push(data[data.team][d].instrument)
					}
				}

			// draw options
				var optionKeys = Object.keys(data.options)
				for (var o = 0; o < optionKeys.length; o++) {
					var shadow = (o == data.selection) ? (data.team == "heroes" ? colors.blue[2] : colors.red[2]) : colors.black[1] // shadow as selection tool
					var color = (chosenAvatar && chosenAvatar.instrument == data.options[optionKeys[o]].instrument) ? (data.team == "heroes" ? colors.blue[1] : colors.red[1]) : takenAvatars.includes(data.options[optionKeys[o]].instrument) ? colors.black[4] : (o == data.selection) ? (data.team == "heroes" ? colors.blue[0] : colors.red[0]) : colors.white[4]
					var x = (canvas.width  / 2) + 400 - ((optionKeys.length - o) * 100) + 50
					var y = (canvas.height / 2)

					drawRectangle(x - 40, y    , 80, 80, {color: color, shadow: shadow, blur: 32, radii: {topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8}})
					drawAvatar(   x - 16, y + 8, 32, 64, data.options[optionKeys[o]])
				}

			// melody
				if (chosenAvatar) {
					drawText(canvas.width / 2, 13 * canvas.height / 16, "melody: " + chosenAvatar.melody, {color: chosenAvatar.colors[0], size: 32, shadow: colors.black[4], blur: 16, style: "bold"})
				}
		}

/*** controls ***/
	/* drawDPad */
		function drawDPad(x, y, size, pressed) {
			// offset center
				x = x - (3 * size / 2)
				y = y - (size)
				var opacity = (data.state && data.state.start) ? 0.25 : 0.5

			// words
				if (data.state.start) {
					var wordsUp    = ((data.heroes[id] && data.heroes[id].state.health) || (data.demons[id] && data.demons[id].state.health)) ? "jump" : "fly"
					var wordsDown  = "fall"
					var wordsLeft  = "move"
					var wordsRight = "move"
				}
				else if (data.heroes[id] || data.demons[id]) {
					var wordsUp    = "launch"
					var wordsDown  = "unselect"
					var wordsLeft  = ""
					var wordsRight = ""
				}
				else {
					var wordsUp    = "select"
					var wordsDown  = ""
					var wordsLeft  = "change"
					var wordsRight = "change"
				}

			// draw squares
				drawRectangle(x                  , y                 , size, size, {color: colors.white[4], shadow: colors.black[4], blur: 4, opacity: opacity, radii: {topLeft: (size / 5), topRight: 0, bottomRight: 0, bottomLeft: (size / 5)}})	// left
				drawRectangle(x + size           , y                 , size, size, {color: colors.white[4], shadow: colors.black[4], blur: 4, opacity: opacity, radii: {topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0}}) 					// down
				drawRectangle(x + size + size    , y                 , size, size, {color: colors.white[4], shadow: colors.black[4], blur: 4, opacity: opacity, radii: {topLeft: 0, topRight: (size / 5), bottomRight: (size / 5), bottomLeft: 0}})	// right
				drawRectangle(x + size           , y +      size     , size, size, {color: colors.white[4], shadow: colors.black[4], blur: 4, opacity: opacity, radii: {topLeft: (size / 5), topRight: (size / 5), bottomRight: 0, bottomLeft: 0}})	// up
				drawRectangle(x                  , y                 , size, size, {color: (pressed.includes("ArrowLeft" ) ? colors.black[4] : colors.black[3]), opacity: opacity * 2, radii: {topLeft: (size / 5), topRight: 0, bottomRight: 0, bottomLeft: (size / 5)}})	// left
				drawRectangle(x + size           , y                 , size, size, {color: (pressed.includes("ArrowDown" ) ? colors.black[4] : colors.black[3]), opacity: opacity * 2, radii: {topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0}}) 					// down
				drawRectangle(x + size + size    , y                 , size, size, {color: (pressed.includes("ArrowRight") ? colors.black[4] : colors.black[3]), opacity: opacity * 2, radii: {topLeft: 0, topRight: (size / 5), bottomRight: (size / 5), bottomLeft: 0}})	// right
				drawRectangle(x + size           , y +      size     , size, size, {color: (pressed.includes("ArrowUp"   ) ? colors.black[4] : colors.black[3]), opacity: opacity * 2, radii: {topLeft: (size / 5), topRight: (size / 5), bottomRight: 0, bottomLeft: 0}})	// up
				drawTriangle( x + (size / 5)     , y +     (size / 2), x + ( 4 * size / 5), y +     (size / 5), x + ( 4 * size / 5), y + (4 * size / 5), {color: colors.black[4], opacity: opacity / 2})  // left
				drawTriangle( x + ( 3 * size / 2), y +     (size / 5), x + ( 6 * size / 5), y + (4 * size / 5), x + ( 9 * size / 5), y + (4 * size / 5), {color: colors.black[4], opacity: opacity / 2})  // down
				drawTriangle( x + (14 * size / 5), y +     (size / 2), x + (11 * size / 5), y +     (size / 5), x + (11 * size / 5), y + (4 * size / 5), {color: colors.black[4], opacity: opacity / 2})  // right
				drawTriangle( x + ( 3 * size / 2), y + (9 * size / 5), x + ( 6 * size / 5), y + (6 * size / 5), x + ( 9 * size / 5), y + (6 * size / 5), {color: colors.black[4], opacity: opacity / 2})  // up

			// label
				drawText(     x +     (size / 2), y + (2 * size / 5), wordsLeft , {color: colors.black[1], opacity: opacity * 2, size: (size / 5)}) // left
				drawText(     x + (3 * size / 2), y + (2 * size / 5), wordsDown , {color: colors.black[1], opacity: opacity * 2, size: (size / 5)}) // down
				drawText(     x + (5 * size / 2), y + (2 * size / 5), wordsRight, {color: colors.black[1], opacity: opacity * 2, size: (size / 5)}) // right
				drawText(     x + (3 * size / 2), y + (7 * size / 5), wordsUp   , {color: colors.black[1], opacity: opacity * 2, size: (size / 5)}) // up
		}

	/* drawKeyboard */
		function drawKeyboard(x, y, width, height, pressed) {
			// offset center
				x = x - (width / 2)
				y = y - (height / 2)
				var opacity = (data.state && data.state.start) ? 0.25 : 0.5

			// outline
				drawRectangle(x, y, width, height, {color: colors.white[4], shadow: colors.black[4], blur: 8, opacity: opacity, radii: {topLeft: 10, topRight: 10, bottomRight: 10, bottomLeft: 10}})

			// white keys
				var noteKeys = Object.keys(keyNotes)
				var notesLength = noteKeys.length
				for (var n = 0; n < notesLength; n++) {
					var topLeft = (n == 0) ? 10 : 0
					var topRight = (n == notesLength - 1) ? 10 : 0
					var letters = keyNotes[noteKeys[n]]
					var color = (pressed.includes(letters[0]) || pressed.includes(letters[1]) || pressed.includes(letters[2]) || pressed.includes(letters[3])) ? colors.black[1] : colors.black[0]

					drawRectangle(x + (n * width / notesLength), y, (width / notesLength), height, {color: color, opacity: opacity, shadow: colors.black[4], blur: 2, radii: {topLeft: topLeft, topRight: topRight, bottomRight: 10, bottomLeft: 10}})

					for (var l = 0; l < letters.length; l++) {
						var letter = letters[l].replace("Key","").replace("Digit","")
						if (letter.length > 1) {
							letter = letter.replace("Comma",",").replace("Period",".").replace("Semicolon",";").replace("Slash","/")
						}

						drawText(x + (n * width / notesLength) + (width / notesLength / 2), y + height - (l * height / 5) - (3 * height / 10), letter, {color: colors.black[3], opacity: opacity, size: width / notesLength / 2})
					}
				}

			// black keys
				for (var n = 0; n < notesLength; n++) {
					if (n !== 3 && n !== 6 && n !== 9) {
						var xOffset = (n == 2) ? (width / notesLength) : 0
						drawRectangle(x + (n * width / notesLength) + (7 * width / notesLength / 8) + xOffset, y + (3 * height / 8), (width / notesLength / 4), (5 * height / 8), {color: colors.black[4], opacity: opacity * 2, radii: {topLeft: 0, topRight: 0, bottomRight: 10, bottomLeft: 10}})
					}
				}

			// instructions
				if (data.state && data.state.start) {
					drawText(x + (width / 2), y - (height / 4), "chords: arrows | melodies: auras", {color: colors.black[4], blur: 8, shadow: colors.white[4], opacity: opacity * 1.5, size: width / notesLength / 2})
				}
		}

	/* drawEscape */
		function drawEscape(x, y, size) {
			var height = size
			var width  = size * 2
			drawRectangle(x - (width / 2), y - (height / 2), width, height, {color: colors.white[4], shadow: colors.black[4], blur: 8, opacity: 0.25, radii: {topLeft: (size / 5), topRight: (size / 5), bottomRight: (size / 5), bottomLeft: (size / 5)}})
			drawRectangle(x - (width / 2), y - (height / 2), width, height, {color: colors.black[3],                                   opacity: 0.75, radii: {topLeft: (size / 5), topRight: (size / 5), bottomRight: (size / 5), bottomLeft: (size / 5)}})
			drawText(     x              , y - (height / 5), "hide",        {color: colors.black[1], opacity: 0.75, size: (size / 2)})
		}

	/* buildMobileControls */
		function buildMobileControls() {
			// controls
				var controls = document.createElement("div")
					controls.id = "controls"
				document.body.appendChild(controls)

			// keyboard
				var keyboard = document.createElement("div")
					keyboard.id = "keyboard"
				controls.appendChild(keyboard)

				for (var i = 1; i <= 6; i++) {
					if (i !== 4) {
						var key = document.createElement("button")
							key.className = "key"
							key.id = "Digit" + i
							key.innerText = i
							key.addEventListener("touchstart", submitTouch)
							key.addEventListener("touchend",   submitTouch)
						keyboard.appendChild(key)
					}
				}

			// dpad
				var dpad = document.createElement("div")
					dpad.id = "dpad"
				controls.appendChild(dpad)

				var directions = ["Up", "Left", "Down", "Right"]
				for (var d in directions) {
					var arrow = document.createElement("button")
						arrow.className = "arrow"
						arrow.id = "Arrow" + directions[d]
						arrow.innerText = directions[d].toLowerCase()
						arrow.addEventListener("touchstart", submitTouch)
						arrow.addEventListener("touchend",   submitTouch)
					dpad.appendChild(arrow)
				}
		}

/*** music ***/
	/* setInstruments */
		function setInstruments() {
			// reset
				for (var i in instruments) {
					delete instruments[i]
				}

			// avatar sounds
				var keys = Object.keys(data.heroes).concat(Object.keys(data.demons))
				for (var k in keys) {
					var avatar = data.heroes[keys[k]] || data.demons[keys[k]]
					if (avatar && avatar.instrument) {
						instruments[avatar.instrument] = buildInstrument(getInstrument(avatar.instrument))
					}
				}

			// soundtrack
				instruments.honeyharp = buildInstrument(getInstrument("honeyharp"))
				instruments.honeyharp.setParameters({volume: 0.5})
		}
	
	/* playMusic */
		function playMusic() {
			var avatar    = (data && data.heroes && data.heroes[id]) ? data.heroes[id] : (data && data.demons && data.demons[id]) ? data.demons[id] : null
			playSoundEffects(avatar)
			playAvatarSounds(avatar)
			playSoundtrack(  avatar)
		}

	/* playSoundEffects */
		function playSoundEffects(avatar) {
			if (avatar && avatar.state.collision) {
				instruments.honeyharp.press(frequencies.A[0])
			}
			if (avatar && avatar.state.shot) {
				instruments.honeyharp.press(frequencies.A[0])
			}
		}

	/* playSoundtrack */
		function playSoundtrack(avatar) {
			if (!data.state.start || data.state.end || avatar.state.health) {
				// negative beat ?
					if (data.state.beat < 0) {
						data.state.beat = data.state.beat + 512
						var launchingSoon = true
					}

				// get time
					if (data.state.beat % 2 == 0) {
						var section    = Math.floor(data.state.beat % 4096 / 512) // 8 sections
						var measure    = Math.floor(data.state.beat % 512  / 32) // 16 measures
						var quarter    = Math.floor(data.state.beat % 32   / 8) // 4 quarters
						var sixteenth  = Math.floor(data.state.beat % 8    / 2) // 4 sixteenths

					// special sections
						if (!data.state.start || launchingSoon || data.state.end) {
							var soundtrack = "menu"
							section = 0
						}
						else if (data.state.winning.team && data.state.winning.countdown <= 256) {
							if (data.state.winning.countdown < 5) {
								var soundtrack = "menu"
								section = 0
							}
							else {
								var soundtrack = data.state.winning.team
								section = 0
								measure = Math.floor((256 - data.state.winning.countdown + 1) / 32) // 8 measures
							}
						}
						else {
							var soundtrack = "game"
						}

					// play beat
						var notes = data.soundtracks[soundtrack][section][measure][quarter][sixteenth]
						for (var n in notes) {
							instruments.honeyharp.press(frequencies[notes[n][0]][notes[n][1]])
						}
					}
			}
		}

	/* playAvatarSounds */
		function playAvatarSounds(avatar) {
			if (avatar && data.state.start && avatar.state.health) {
				// heroes & demons
					var keys = Object.keys(data.heroes).concat(Object.keys(data.demons))
					for (var k = 0; k < keys.length; k++) {
						var opponent = data.heroes[keys[k]] || data.demons[keys[k]]

						var notes = opponent.state.keys[opponent.state.keys.length - 1]
						for (var n in notes) {
							instruments[opponent.instrument].press(frequencies[notes[n][2]][notes[n][3]])
						}
					}
			}
			else if (avatar) {
				var notes = avatar.state.keys[avatar.state.keys.length - 1]
				for (var n in notes) {
					instruments[avatar.instrument].press(frequencies[notes[n][2]][notes[n][3]])
				}
			}
		}
