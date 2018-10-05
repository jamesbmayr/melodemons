/*** onload ***/
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
			"KeyZ": "C2",
			"KeyX": "D2",
			"KeyC": "E2",
			"KeyB": "G2",
			"KeyN": "A2",
			"Comma": "C3",
			"Period": "D3",
			"Slash": "E3",
			"KeyA": "C3",
			"KeyS": "D3",
			"KeyD": "E3",
			"KeyG": "G3",
			"KeyH": "A3",
			"KeyK": "C4",
			"KeyL": "D4",
			"Semicolon": "E4",
			"KeyQ": "C4",
			"KeyW": "D4",
			"KeyE": "E4",
			"KeyT": "G4",
			"KeyY": "A4",
			"KeyI": "C5",
			"KeyO": "D5",
			"KeyP": "E5",
			"BracketRight": "G5",
			"Backslash": "A5",
			"Digit1": 1,
			"Digit2": 2,
			"Digit3": 3,
			"Digit4": 4,
			"Digit5": 5,
			"Digit6": 6,
			"Digit7": 7,
			"Digit8": 8,
			"Digit9": 9,
			"Digit0": 0
		}

		var keyNotes = {
			"C3": ["KeyQ","KeyA","KeyZ"],
			"D3": ["KeyW","KeyS","KeyX"],
			"E3": ["KeyE","KeyD","KeyC"],
			"F3": [],
			"G3": ["KeyT","KeyG","KeyB"],
			"A3": ["KeyY","KeyH","KeyN"],
			"B3": [],
			"C4": ["KeyI","KeyK","Comma"],
			"D4": ["KeyO","KeyL","Period"],
			"E4": ["KeyP","Semicolon","Slash"]
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

	/* submitKey */
		document.addEventListener("keydown", submitKey)
		document.addEventListener("keyup",   submitKey)
		function submitKey(event) {
			if (data.clicked) {
				// variables
					var key   = keyboard[event.code] || null
					var type  = null
					var press = (event.type == "keydown") ? true : false

					if ([1,2,3,4,5,6,7,8,9,10,11,12].includes(key)) {
						type = "Number"
					}
					else if (["up","right","down","left"].includes(key)) {
						type = "Arrow"
					}
					else if (key) {
						type = "Note"
					}

				// prevent spamming notes
					if (type == "Note") {
						if (data.pressed.includes(event.code)) {
							if (press) {
								type = null
							}
							else {
								data.pressed = data.pressed.filter(function(k) {
									return (k !== event.code)
								}) || []
							}
						}
						else {
							if (press) {
								data.pressed.push(event.code)
							}
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
		document.addEventListener("click", submitClick)
		function submitClick(event) {
			if (!data.clicked) {
				// overlay
					data.clicked = true
					if (document.getElementById("overlay")) {
						document.getElementById("overlay").remove()
					}

				// audio
					data.pressed = []
					buildAudio()
					setInstruments()
			}
		}

	/* receivePost */
		function receivePost(post) {
			// redirects
				if (post.location) {
					window.location = post.location
				}

			// others
				else {
					for (var k in post) {
						data[k] = post[k]
					}
				}

			// message
				if (post.message) {
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
				if ((!data.state || !data.state.start) && data.clicked) {
					drawMenu()
				}
				else if (data.state && data.state.start && data.map) {
					drawMap(data.map, data.theme, data)
				}
				if (data.message) {
					drawMessage()
				}

			// music
				if (data.clicked && post.launch) {
					setInstruments()
				}
				if (data.clicked && post.beat) {
					playMusic()
				}
				if (data.clicked && (!data.state || !data.state.start) && (post.heroes[id] && !Object.keys(instruments).includes(post.heroes[id].instrument))) {
					setInstruments()
				}

			// overlay
				if (post.intro  && !data.clicked) {
					document.getElementById("overlay").className = "intro"
					document.getElementById("overlay").innerHTML = post.intro
				}
				if (post.rejoin && !data.clicked) {
					document.getElementById("overlay").className = "rejoin"
					document.getElementById("overlay").innerHTML = post.rejoin
				}
		}

/*** menu ***/
	/* drawMessage */
		function drawMessage() {
			drawText(canvas.width / 2, 7 * canvas.height / 8, data.message, {color: colors.black[4]})
		}

	/* drawMenu */
		function drawMenu() {
			// clear
				context.clearRect(0, 0, canvas.width, canvas.height)

			// background
				drawMap(data.sample, data.theme, data, true)
				drawDPad((canvas.width / 2) - 75, (canvas.height / 8) - 75, 50)

			// demons
				if (data.admin) {
					// chosen theme
						var chosenTheme = data.theme

					// draw options
						for (var o = 0; o < data.options.length; o++) {
							var shadow = (o == data.selection) ? colors.red[2] : colors.black[4] // shadow as selection tool
							var x = (canvas.width  / 2) + 400 - ((data.options.length - o) * 100) + 50 - 40
							var y = (canvas.height / 2) - 50
							var isChosen = (chosenTheme && chosenTheme.name == data.options[o].name) ? true : false

							drawRectangle(x, y, 80, 80, {color: colors.white[4], shadow: shadow, blur: 32, radii: {topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8}})
							drawTheme(    x, y, 80, 80, data.options[o], isChosen)
						}

					// melody
						if (chosenTheme) {
							drawText(canvas.width / 2, 13 * canvas.height / 16, "launch game?", {color: colors.red[4], size: 32, shadow: colors.red[2], blur: 16})
							drawKeyboard(canvas.width / 4, canvas.height / 4, canvas.width / 2, canvas.height / 2, data.pressed)
						}
				}

			// heroes
				else {
					// chosen / taken
						var chosenHero = data.heroes[id]
						var takenHeroes = []
						for (var h in data.heroes) {
							if (data.heroes[h]) {
								takenHeroes.push(data.heroes[h].name)
							}
						}

					// draw options
						var optionKeys = Object.keys(data.options)
						for (var o = 0; o < optionKeys.length; o++) {
							var shadow = (o == data.selection) ? colors.blue[2] : colors.black[4] // shadow as selection tool
							var color = (chosenHero && chosenHero.name == data.options[optionKeys[o]].name) ? colors.blue[2] : takenHeroes.includes(data.options[optionKeys[o]].name) ? colors.black[4] : colors.white[4]
							var x = (canvas.width  / 2) + 400 - ((optionKeys.length - o) * 100) + 50
							var y = (canvas.height / 2) - 50

							drawRectangle(x - 40, y    , 80, 80, {color: color, shadow: shadow, blur: 32, radii: {topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8}})
							drawAvatar(   x - 16, y + 8, 32, 64, data.options[optionKeys[o]])
						}

					// melody
						if (chosenHero) {
							drawText(canvas.width / 2, 13 * canvas.height / 16, "melody: " + chosenHero.melody, {color: chosenHero.colors[0], size: 32, shadow: colors.blue[2], blur: 16})
							drawKeyboard(canvas.width / 4, canvas.height / 4, canvas.width / 2, canvas.height / 2, data.pressed)
						}
				}
		}

	/* drawDPad */
		function drawDPad(x, y, size) {
			drawRectangle(x                 , y                 , size, size, {color: colors.black[3], radii: {topLeft: (size / 5), topRight: (size / 5), bottomRight: (size / 5), bottomLeft: (size / 5)}}) // left
			drawRectangle(x + size          , y                 , size, size, {color: colors.black[3], radii: {topLeft: (size / 5), topRight: (size / 5), bottomRight: (size / 5), bottomLeft: (size / 5)}}) // down
			drawRectangle(x + size + size   , y                 , size, size, {color: colors.black[3], radii: {topLeft: (size / 5), topRight: (size / 5), bottomRight: (size / 5), bottomLeft: (size / 5)}}) // right
			drawRectangle(x + size          , y +      size     , size, size, {color: colors.black[3], radii: {topLeft: (size / 5), topRight: (size / 5), bottomRight: (size / 5), bottomLeft: (size / 5)}}) // up
			drawText(     x +     (size / 2), y + (2 * size / 5), "change",   {color: colors.black[2], size: (size / 5)}) // left
			drawText(     x + (3 * size / 2), y + (2 * size / 5), "unselect", {color: colors.black[2], size: (size / 5)}) // down
			drawText(     x + (5 * size / 2), y + (2 * size / 5), "change",   {color: colors.black[2], size: (size / 5)}) // right
			drawText(     x + (3 * size / 2), y + (7 * size / 5), "select",   {color: colors.black[2], size: (size / 5)}) // up
		}

	/* drawKeyboard */
		function drawKeyboard(x, y, width, height, pressed) {
			// outline
				drawRectangle(x, y, width, height, {color: colors.white[4], shadow: colors.black[4], blur: 8, opacity: 0.75, radii: {topLeft: 10, topRight: 10, bottomRight: 10, bottomLeft: 10}})

			// white keys
				var noteKeys = Object.keys(keyNotes)
				var notesLength = noteKeys.length
				for (var n = 0; n < notesLength; n++) {
					var topLeft = (n == 0) ? 10 : 0
					var topRight = (n == notesLength - 1) ? 10 : 0
					var letters = keyNotes[noteKeys[n]]
					var color = (pressed.includes(letters[0]) || pressed.includes(letters[1]) || pressed.includes(letters[2])) ? colors.black[1] : colors.black[0]

					drawRectangle(x + (n * width / notesLength), y, (width / notesLength), height, {color: color, opacity: 0.75, shadow: colors.black[4], blur: 2, radii: {topLeft: topLeft, topRight: topRight, bottomRight: 10, bottomLeft: 10}})

					for (var l = 0; l < letters.length; l++) {
						var letter = letters[l].replace("Key","")
						if (letter.length > 1) {
							letter = letter.replace("Comma",",").replace("Period",".").replace("Semicolon",";").replace("Slash","/")
						}

						drawText(x + (n * width / notesLength) + (width / notesLength / 2), y + height - (l * height / 8) - (23 * height / 32), letter, {color: colors.black[2], opacity: 0.75, size: width / notesLength / 2})
					}
				}

			// black keys
				for (var n = 0; n < notesLength; n++) {
					if (n !== 3 && n !== 6 && n !== 9) {
						var xOffset = (n == 2) ? (width / notesLength) : 0
						drawRectangle(x + (n * width / notesLength) + (3 * width / notesLength / 4) + xOffset, y + (3 * height / 8), (width / notesLength / 2), (5 * height / 8), {color: colors.black[4], opacity: 0.75, radii: {topLeft: 0, topRight: 0, bottomRight: 10, bottomLeft: 10}})
					}
				}
		}

	/* drawTheme */
		function drawTheme(x, y, width, height, theme, isChosen) {
			// variables
				var terrainColor = (isChosen ? theme.terrainForeground : theme.terrainBackground)
				var towerColor   = (isChosen ? theme.towerForeground   : theme.towerBackground)
				var pitColor     = (isChosen ? theme.pitForeground     : theme.pitBackground)

			// sky
				drawRectangle(x, y, width, height, {gradient: {x1: x, y1: y, x2: x, y2: y + height, colors: {"0": theme.skyBottom, "1": theme.skyTop}}, radii: {topLeft: (width / 20), topRight: (width / 20), bottomRight: (width / 10), bottomLeft: (width / 10)}})

			// tower
				drawRectangle(x + (3 * width / 4), y, (width / 4), height, {color: towerColor,   radii: {topLeft: (width / 16), topRight: (width / 16), bottomRight: (width / 10), bottomLeft: 0}})

			// terrain
				drawRectangle(x     , y, (width / 4), (height / 2), {color: terrainColor, radii: {topLeft: (width / 16), topRight: (width / 16), bottomRight: 0, bottomLeft: (width / 20)}})
				drawRectangle(x + (width / 2), y, (width / 2), (height / 4), {color: terrainColor, radii: {topLeft: (width / 16), topRight: 0, bottomRight: (width / 20), bottomLeft: 0}})

			// pit
				drawRectangle(x + (width / 4), y, (width / 4), (height / 8), {color: pitColor})

			// name
				if (isChosen) {
					drawText(x + (width / 2), y + (5 * height / 4), theme.name, {opacity: 1, color: theme.terrainBackground, size: (width / 4), shadow: colors.red[2], blur: (width / 20)})   // name
				}
				else {
					drawText(x + (width / 2), y + (5 * height / 4), theme.name, {opacity: 1, color: theme.terrainBackground, size: (width / 4)})   // name
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
					var avatar = (keys[k] > -1) ? data.demons[keys[k]] : data.heroes[keys[k]]
					if (avatar && avatar.instrument) {
						instruments[avatar.instrument] = buildInstrument(getInstrument(avatar.instrument))
					}
				}

			// soundtrack
				instruments.honeyharp = buildInstrument(getInstrument("honeyharp"))
				instruments.honeyharp.setParameters({volume: 0.75})
		}
	
	/* playMusic */
		function playMusic() {
			var avatar = data.heroes[id] || data.demons.find(function(d) { return d.state.selected })
			playSoundEffects(avatar)
			playAvatarSounds(avatar)
			playSoundtrack(  avatar)			
		}

	/* playSoundEffects */
		function playSoundEffects(avatar) {
			if (avatar.state.collision) {
				instruments.honeyharp.press(frequencies.A[0])
			}
			if (avatar.state.shot) {
				instruments.honeyharp.press(frequences.A[0])
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
					var section    = Math.floor(data.state.beat % 2048 / 512) // 4 sections
					var measure    = Math.floor(data.state.beat % 512  / 32) // 16 measures
					var quarter    = Math.floor(data.state.beat % 32   / 8) // 4 quarters
					var sixteenth  = Math.floor(data.state.beat % 8    / 2) // 4 sixteenths

				// special sections
					if (!data.state || !data.state.start || launchingSoon || data.state.end) {
						var soundtrack = "menu"
							section = 0
					}
					else if (data.state.winning.team && data.state.winning.countdown < 256) {
						var soundtrack = data.state.winning.team
							section = 0
							measure = Math.floor((256 - data.state.winning.countdown) / 32) // 8 measures
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

	/* playAvatarSounds */
		function playAvatarSounds(avatar) {
			if (data.state.start && avatar.state.health) {
				// heroes & demons
					var keys = Object.keys(data.heroes).concat(Object.keys(data.demons))
					for (var k = 0; k < keys.length; k++) {
						var opponent = (keys[k] > -1) ? data.demons[keys[k]] : data.heroes[keys[k]]

						var notes = opponent.state.keys[opponent.state.keys.length - 2]
						for (var n in notes) {
							instruments[opponent.instrument].press(frequencies[notes[n][0]][notes[n][1]])
						}
					}
			}
			else {
				var notes = avatar.state.keys[avatar.state.keys.length - 2]
				for (var n in notes) {
					instruments[avatar.instrument].press(frequencies[notes[n][0]][notes[n][1]])
				}
			}
		}
