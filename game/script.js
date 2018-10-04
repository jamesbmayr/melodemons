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

				// submit data
					if (type && socket) {
						socket.send(JSON.stringify({
							action: "submit" + type,
							key:    key,
							press:  press
						}))
					}

				// menu --> play notes
					if ((!data.state || !data.state.start) && (type == "Note")) {
						if (!data.press) {
							data.cooldown = false
						}
						else if (!data.cooldown) {
							if (data.admin) {
								data.cooldown = true
								instruments[data.demons[0].instrument].press(frequencies[key[0]][key[1]])
							}
							else if (data.heroes[id]) {
								data.cooldown = true
								instruments[data.heroes[id].instrument].press(frequencies[key[0]][key[1]])
							}
						}
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
				if (data.clicked && (!data.state || !data.state.start) && post.heroes[id]) {
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

			// instructions
				drawDPad()

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
							drawText(canvas.width / 2, 3 * canvas.height / 4, "launch game?", {color: colors.red[4], size: 32, shadow: colors.red[2], blur: 16})
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
							drawText(canvas.width / 2, 3 * canvas.height / 4, "melody: " + chosenHero.melody, {color: chosenHero.colors[0], size: 32, shadow: colors.blue[2], blur: 16})
						}
				}
		}

	/* drawDPad */
		function drawDPad() {
			drawRectangle((canvas.width / 2) - 75, (canvas.height / 8) - 75, 50, 50,     {color: colors.black[3], radii: {topLeft: 10, topRight: 10, bottomRight: 10, bottomLeft: 10}}) // left
			drawRectangle((canvas.width / 2) - 25, (canvas.height / 8) - 75, 50, 50,     {color: colors.black[3], radii: {topLeft: 10, topRight: 10, bottomRight: 10, bottomLeft: 10}}) // down
			drawRectangle((canvas.width / 2) + 25, (canvas.height / 8) - 75, 50, 50,     {color: colors.black[3], radii: {topLeft: 10, topRight: 10, bottomRight: 10, bottomLeft: 10}}) // right
			drawRectangle((canvas.width / 2) - 25, (canvas.height / 8) - 25, 50, 50,     {color: colors.black[3], radii: {topLeft: 10, topRight: 10, bottomRight: 10, bottomLeft: 10}}) // up
			drawText(     (canvas.width / 2) - 50, (canvas.height / 8) - 55, "change",   {color: colors.black[2], size: 10}) // left
			drawText(     (canvas.width / 2) -  0, (canvas.height / 8) - 55, "unselect", {color: colors.black[2], size: 10}) // down
			drawText(     (canvas.width / 2) + 50, (canvas.height / 8) - 55, "change",   {color: colors.black[2], size: 10}) // right
			drawText(     (canvas.width / 2) +  0, (canvas.height / 8) -  5, "select",   {color: colors.black[2], size: 10}) // up
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
				instruments.honeyharp.press(frequences.A[1])
			}
		}

	/* playSoundtrack */
		function playSoundtrack(avatar) {
			if (avatar.state.health) {
				var section    = Math.floor(data.state.beat % 2048 / 512) // 4 sections
				var measure    = Math.floor(data.state.beat % 512  / 32) // 16 measures
				var quarter    = Math.floor(data.state.beat % 32   / 8) // 4 quarters
				var sixteenth  = Math.floor(data.state.beat % 8    / 2) // 4 sixteenths

				var notes = data.soundtracks.game[section][measure][quarter][sixteenth]
				for (var n in notes) {
					instruments.honeyharp.press(frequencies[notes[n][0]][notes[n][1]])
				}
			}
		}

	/* playAvatarSounds */
		function playAvatarSounds(avatar) {
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
