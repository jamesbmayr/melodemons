/*** onload ***/
	/* elements */
		var canvas      = document.getElementById("canvas")
		var context     = canvas.getContext("2d")
		var data        = window.data = {}
		var instruments = window.instruments = {}

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
	/* checkLoop */
		var socket = null
		createSocket()
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

			// // menu
			// 	if (post.admin     !== undefined) {
			// 		data.admin     = post.admin
			// 	}
			// 	if (post.selection !== undefined) {
			// 		data.selection = post.selection
			// 	}
			// 	if (post.options   !== undefined) {
			// 		data.options   = post.options 
			// 	}
			// 	if (post.text      !== undefined) {
			// 		data.text      = post.text
			// 	}

			// // gameplay
			// 	if (post.state  !== undefined) {
			// 		data.state  = post.state
			// 	}
			// 	if (post.theme  !== undefined) {
			// 		data.theme  = post.theme
			// 	}
			// 	if (post.heroes !== undefined) {
			// 		data.heroes = post.heroes
			// 	}
			// 	if (post.demons !== undefined) {
			// 		data.demons = post.demons
			// 	}
			// 	if (post.towers !== undefined) {
			// 		data.towers = post.towers
			// 	}
			// 	if (post.map    !== undefined) {
			// 		data.map    = post.map
			// 	}
			// 	if (post.arrows !== undefined) {
			// 		data.arrows = post.arrows
			// 	}
			// 	if (post.auras  !== undefined) {
			// 		data.auras   = post.auras
			// 	}

			// draw
				if ((!data.state || !data.state.start) && data.clicked) {
					drawMenu()
				}
				else if (data.state && data.state.start && data.map) {
					drawGame()
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

			// overlay & message
				if (post.intro  && !data.clicked) {
					document.getElementById("overlay").className = "intro"
					document.getElementById("overlay").innerHTML = post.intro
				}
				if (post.rejoin && !data.clicked) {
					document.getElementById("overlay").className = "rejoin"
					document.getElementById("overlay").innerHTML = post.rejoin
				}
				if (data.message) {
					drawMessage()
				}
		}

/*** shapes ***/
	/* drawLine */
		function drawLine(x1, y1, x2, y2, options) {
			// parameters
				options = options || {}
				context.beginPath()
				context.strokeStyle = options.gradient ? drawGradient(options) : (options.color || "transparent")
				context.lineWidth   = options.border || 1
				context.shadowBlur  = options.blur ? options.blur : 0
				context.shadowColor = options.shadow ? options.shadow : "transparent"
				context.globalAlpha = options.opacity || 1
				
			// draw
				context.moveTo(x1, canvas.height - y1)
				context.lineTo(x2, canvas.height - y2)
				context.stroke()
		}

	/* drawCircle */
		function drawCircle(x, y, radius, options) {
			// parameters
				options = options || {}
				context.beginPath()
				context.fillStyle   = options.gradient ? drawGradient(options) : (options.color || "transparent")
				context.lineWidth   = options.border || 1
				context.shadowBlur  = options.blur ? options.blur : 0
				context.shadowColor = options.shadow ? options.shadow : "transparent"
				context.globalAlpha = options.opacity || 1

			// draw
				context.arc(x, canvas.height - y, radius, 0, 2 * Math.PI, true)
				context.fill()
		}

	/* drawTriangle */
		function drawTriangle(x1, y1, x2, y2, x3, y3, options) {
			// parameters
				options = options || {}
				context.beginPath()
				context.fillStyle   = options.gradient ? drawGradient(options) : (options.color || "transparent")
				context.lineWidth   = options.border || 1
				context.shadowBlur  = options.blur ? options.blur : 0
				context.shadowColor = options.shadow ? options.shadow : "transparent"
				context.globalAlpha = options.opacity || 1

			// draw
				context.moveTo(x1, canvas.height - y1)
				context.lineTo(x2, canvas.height - y2)
				context.lineTo(x3, canvas.height - y3)
				context.lineTo(x1, canvas.height - y1)
				context.closePath()
				context.fill()
		}

	/* drawRectangle */
		function drawRectangle(x, y, width, height, options) {
			// parameters
				options = options || {}
				context.beginPath()
				context.fillStyle   = options.gradient ? drawGradient(options) : (options.color || "transparent")
				context.lineWidth   = options.border || 1
				context.shadowBlur  = options.blur ? options.blur : 0
				context.shadowColor = options.shadow ? options.shadow : "transparent"
				context.globalAlpha = options.opacity || 1

			// draw
				if (options.radii) {
					context.moveTo(x + options.radii.topLeft, canvas.height - y - height)
					context.lineTo(x + width - options.radii.topRight, canvas.height - y - height)
					context.quadraticCurveTo(x + width, canvas.height - y - height, x + width, canvas.height - y - height + options.radii.topRight)
					context.lineTo(x + width, canvas.height - y - options.radii.bottomRight)
					context.quadraticCurveTo(x + width, canvas.height - y, x + width - options.radii.bottomRight, canvas.height - y)
					context.lineTo(x + options.radii.bottomLeft, canvas.height - y)
					context.quadraticCurveTo(x, canvas.height - y, x, canvas.height - y - options.radii.bottomLeft)
					context.lineTo(x, canvas.height - y - height + options.radii.topLeft)
					context.quadraticCurveTo(x, canvas.height - y - height, x + options.radii.topLeft, canvas.height - y - height)
					context.closePath()
					context.fill()
				}
				else {
					context.fillRect(x, canvas.height - y, width, -1 * height)
				}
		}

	/* drawText */
		function drawText(x, y, text, options) {
			// variables
				options = options || {}
				context.font = (options.size || 32) + "px " + (options.font || "'Skranji', fantasy")
				context.fillStyle   = options.gradient ? drawGradient(options) : (options.color || "transparent")
				context.textAlign   = options.alignment || "center"
				context.shadowBlur  = options.blur ? options.blur : 0
				context.shadowColor = options.shadow ? options.shadow : "transparent"
				context.globalAlpha = options.opacity || 1

			// draw
				context.fillText((text || ""), x, canvas.height - y)
		}

	/* drawGradient */
		function drawGradient(options) {
			// radial
				if (options.gradient.r1 || options.gradient.r2) {
					var gradient = context.createRadialGradient(options.gradient.x1, options.gradient.y1, options.gradient.r1, options.gradient.x2, options.gradient.y2, options.gradient.r2)
				}

			// linear
				else {
					var gradient = context.createLinearGradient(options.gradient.x1, canvas.height - options.gradient.y1, options.gradient.x2, canvas.height - options.gradient.y2)
				}

			// colors
				var colors = Object.keys(options.gradient.colors)
				for (var c in colors) {
					gradient.addColorStop(Number(colors[c]), options.gradient.colors[colors[c]])
				}

			return gradient
		}

/*** menu ***/
	/* drawMessage */
		function drawMessage() {
			drawText(canvas.width / 2, 7 * canvas.height / 8, data.message, {color: "#222222"})
		}

	/* drawMenu */
		function drawMenu() {
			// clear
				context.clearRect(0, 0, canvas.width, canvas.height)

			// background
				drawSampleMap()

			// instructions
				drawDPad()

			// demons
				if (data.admin) {
					// chosen theme
						var chosenTheme = data.theme

					// draw options
						for (var o = 0; o < data.options.length; o++) {
							var shadow = (o == data.selection) ? "#d80e0e" : "#222222" // shadow as selection tool
							var x = (canvas.width  / 2) + 400 - ((data.options.length - o) * 100) + 50 - 40
							var y = (canvas.height / 2) - 50
							var isChosen = (chosenTheme && chosenTheme.name == data.options[o].name) ? true : false

							drawRectangle(x, y, 80, 80, {color: "#dddddd", shadow: shadow, blur: 32, radii: {topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8}})
							drawTheme(    x, y, 80, 80, data.options[o], isChosen)
						}

					// melody
						if (chosenTheme) {
							drawText(canvas.width / 2, 3 * canvas.height / 4, "launch game?", {color: "#dddddd", size: 32, shadow: "#d80e0e", blur: 16})
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
							var shadow = (o == data.selection) ? "#2b76ef" : "#222222" // shadow as selection tool
							var color = (chosenHero && chosenHero.name == data.options[optionKeys[o]].name) ? "#2b76ef" : takenHeroes.includes(data.options[optionKeys[o]].name) ? "#222222" : "#dddddd"
							var x = (canvas.width  / 2) + 400 - ((optionKeys.length - o) * 100) + 50
							var y = (canvas.height / 2) - 50

							drawRectangle(x - 40, y    , 80, 80, {color: color, shadow: shadow, blur: 32, radii: {topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8}})
							drawAvatar(   x - 16, y + 8, 32, 64, data.options[optionKeys[o]])
						}

					// melody
						if (chosenHero) {
							drawText(canvas.width / 2, 3 * canvas.height / 4, "melody: " + chosenHero.melody, {color: chosenHero.colors[0], size: 32, shadow: "#2b76ef", blur: 16})
						}
				}
		}

	/* drawDPad */
		function drawDPad() {
			drawRectangle((canvas.width / 2) - 60, (canvas.height / 8) - 60, 40, 40,     {color: "#333333", radii: {topLeft: 10, topRight: 10, bottomRight: 10, bottomLeft: 10}}) // left
			drawRectangle((canvas.width / 2) - 20, (canvas.height / 8) - 60, 40, 40,     {color: "#333333", radii: {topLeft: 10, topRight: 10, bottomRight: 10, bottomLeft: 10}}) // down
			drawRectangle((canvas.width / 2) + 20, (canvas.height / 8) - 60, 40, 40,     {color: "#333333", radii: {topLeft: 10, topRight: 10, bottomRight: 10, bottomLeft: 10}}) // right
			drawRectangle((canvas.width / 2) - 20, (canvas.height / 8) - 20, 40, 40,     {color: "#333333", radii: {topLeft: 10, topRight: 10, bottomRight: 10, bottomLeft: 10}}) // up
			drawText(     (canvas.width / 2) - 40, (canvas.height / 8) - 45, "change",   {color: "#777777", size: 10}) // left
			drawText(     (canvas.width / 2) -  0, (canvas.height / 8) - 45, "unselect", {color: "#777777", size: 10}) // down
			drawText(     (canvas.width / 2) + 40, (canvas.height / 8) - 45, "change",   {color: "#777777", size: 10}) // right
			drawText(     (canvas.width / 2) +  0, (canvas.height / 8) -  5, "select",   {color: "#777777", size: 10}) // up
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
					drawText(x + (width / 2), y + (5 * height / 4), theme.name, {opacity: 1, color: theme.terrainBackground, size: (width / 4), shadow: "#d80e0e", blur: (width / 20)})   // name
				}
				else {
					drawText(x + (width / 2), y + (5 * height / 4), theme.name, {opacity: 1, color: theme.terrainBackground, size: (width / 4)})   // name
				}
		}

	/* drawSampleMap */
		function drawSampleMap() {
			drawSky(data.theme, true)
			drawBackground(data.sample, true)
			drawForeground(data.sample, true)
		}

/*** gameplay ***/
	/* drawGame */
		function drawGame() {
			drawSky(data.theme)
			drawBackground(data.map)
			drawForeground(data.map)
		}

	/* drawSky */
		function drawSky(theme) {
			// clear
				context.clearRect(0, 0, canvas.width, canvas.height)
			
			// draw
				var skyBottom = theme ? theme.skyBottom : "#aaaaaa"
				var skyTop    = theme ? theme.skyTop    : "#dddddd"
				drawRectangle(    0, 0, canvas.width, canvas.height, {gradient: {x1: 0, y1: 0, x2: 0, y2: canvas.height, colors: {"0": skyBottom, "1": skyTop}}})
		}

	/* drawBackground */
		function drawBackground(map, sample) {
			// variables
				var avatar    = data.heroes[id] || data.demons.find(function(d) { return d.state.selected }) || {x: 0, y: 0}
				var mapLength = map.length * 32
				var oppositeX = (avatar.state.x + (mapLength / 2)) % mapLength
				var offsetX   = (oppositeX % 32)

				var startX    = oppositeX - 1024
				var endX      = oppositeX + 1024
				var mapStartX = (startX + mapLength) % mapLength
				var mapEndX   = (endX   + mapLength) % mapLength

			// columns
				for (var x = startX; x <= endX + 32; x += 32) {
					var mapX = (x + mapLength) % mapLength
					var canvasX = ((mapX - offsetX - startX) + mapLength) % mapLength
					var columnNumber = Math.floor(mapX / 32)

					// tower ?
						if (columnNumber % 64 < 4) {
							var tower = data.towers ? data.towers[Math.floor(columnNumber / 64)] : null
						 	drawTower(data.theme, tower, columnNumber, canvasX, false)
						}
						else {
							var tower = false
						}

					// interactive
						var column = map[columnNumber]
						for (var section in column) {
							// pit
								if (!column[section]) {
								 	drawPit(data.theme, canvasX, false)
								}

							// terrain & platforms
								else {
									drawSections(map, columnNumber, column, section, canvasX, data.theme, false)
								}
						}

					// tower letters
						if (tower) {
						 	drawTowerLetters(tower, columnNumber, canvasX, false)
						}
				}

			// menu/home/about
				if (sample) {
					drawRectangle(0, 0, canvas.width, 40, {color: (data.theme ? data.theme.pitBackground : "#444444")})
					return
				}

			// arrows
				for (var a in data.arrows) {
					drawArrow(1280 - ((data.arrows[a].x - startX + mapLength + 20) % mapLength - 20) / 1.6, (data.arrows[a].y / 1.6) + 40, 0.625, data.arrows[a])
				}

			// heroes & demons
				var keys = Object.keys(data.heroes).concat(Object.keys(data.demons))
				for (var k in keys) {
					var avatar = (keys[k] > -1) ? data.demons[keys[k]] : data.heroes[keys[k]]
					drawAvatar(1280 - ((avatar.state.x - startX + mapLength + 20) % mapLength - 20) / 1.6, (avatar.state.y / 1.6) + 40, 20, 40, avatar, data.admin)
				}

			// auras
				for (var a in data.auras) {
					drawAura(1280 - ((data.auras[a].x - 32 - startX + mapLength + 200) % mapLength - 200) / 1.6, (data.auras[a].y / 1.6) + 40, 0.625, data.auras[a])
				}

			// pit
				drawRectangle(0, 0, canvas.width, 40, {color: data.theme.pitBackground})
		}

	/* drawForeground */
		function drawForeground(map, sample) {
			// variables
				var towers    = []
				var avatar    = data.heroes[id] || data.demons.find(function(d) { return d.state.selected }) || {x: 0, y: 0}
				var mapLength = map.length * 32
				var offsetX   = avatar.state.x  % 32
				
				var startX    = avatar.state.x - 640
				var endX      = avatar.state.x + 640
				var mapStartX = (startX + mapLength) % mapLength
				var mapEndX   = (endX   + mapLength) % mapLength

			// columns
				for (var x = startX; x <= endX; x += 32) {
					var mapX = (x + mapLength) % mapLength
					var canvasX = ((mapX - offsetX - startX + 32) + mapLength) % mapLength - 32
					var columnNumber = Math.floor(mapX / 32)

					// tower ?
						if (columnNumber % 64 < 4) {
							var tower = data.towers ? data.towers[Math.floor(columnNumber / 64)] : null
							drawTower(data.theme, tower, columnNumber, canvasX, true)
						}
						else {
							tower = false
						}

					// interactive
						var column = map[columnNumber]
						for (var section in column) {
							// pit
								if (!column[section]) {
									drawPit(data.theme, canvasX, true)
								}

							// terrain & platforms
								else {
									drawSections(map, columnNumber, column, section, canvasX, data.theme, true)
								}
						}

					// tower letters
						if (tower) {
							drawTowerLetters(tower, columnNumber, canvasX, true)
						}
				}

			// menu/home/about
				if (sample) {
					return
				}

			// arrows
				for (var a in data.arrows) {
					drawArrow((data.arrows[a].x - startX + mapLength + 32) % mapLength - 32, data.arrows[a].y, 1, data.arrows[a])
				}

			// heroes & demons
				var keys = Object.keys(data.heroes).concat(Object.keys(data.demons))
				for (var k in keys) {
					var avatar = (keys[k] > -1) ? data.demons[keys[k]] : data.heroes[keys[k]]
					drawAvatar((avatar.state.x - startX + mapLength + 32) % mapLength - 32, avatar.state.y, 32, 64, avatar, data.admin)
				}

			// auras
				for (var a in data.auras) {
					drawAura((data.auras[a].x - startX + mapLength + 256) % mapLength - 256, data.auras[a].y, 1, data.auras[a])
				}

			// win countdown ?
				if (data.state.winning.team && !data.state.winning.countdown) {
					drawText(canvas.width / 2,     canvas.height / 2, (data.state.winning.team + " win"),  {color: data.state.winning.color, size: 64, blur: 4, shadow: data.state.winning.color})
				}
				else if (data.state.winning.team && data.state.winning.countdown < 256) {
					drawText(canvas.width / 2, 3 * canvas.height / 4, Math.ceil(data.state.winning.countdown / 16), {color: data.state.winning.color, size: 64})
				}
		}

	/* drawAvatar */
		function drawAvatar(x, y, width, height, avatar, admin) {
			// variables
				if (avatar.state) {
					var healthColor = avatar.state.health ? ("rgb(128, " + avatar.state.health + ", 000)") : "rgb(255,255,255)"
					var healthWidth = avatar.state.health ? Math.floor((avatar.state.health + 1) * width / 256) : width
					var opacity     = avatar.state.health ? 1 : 0.5
						opacity     = opacity * (width == 32 ? 1 : 0.5)
					var xOffset     = avatar.state.right  ? 2 : avatar.state.left   ? -2 : 0
					var yOffset     = avatar.state.vy > 0 ? 2 : avatar.state.vy < 0 ? -2 : 0
				}
				else {
					var xOffset = 0
					var yOffset = 0
					var opacity = 1
				}

			// name & healthbar
				if (avatar.state) {
					drawText(x + (width / 2), y + (5 * height / 4), avatar.name                          , {opacity: opacity, color: avatar.colors[2],     size: (width / 4)})   // name
					drawLine(x              , y + (9 * height / 8), x + healthWidth, y + (9 * height / 8), {opacity: opacity, color: healthColor, blur: 2, shadow: healthColor}) // health bar
				}
				else {
					drawText(x + (width / 2), y + (5 * height / 4), avatar.name                          , {opacity: opacity, color: avatar.colors[2],     size: (width / 2)})   // name
					drawText(x + (width / 2), y - (2 * height / 4), avatar.song                          , {opacity: opacity, color: avatar.colors[2],     size: (width / 2)})   // song
				}

			// body
				if (avatar.team == "heroes") {
					drawCircle(   x +      (width / 4)           , y +     (height / 16)                                           ,      width / 8 ,                   {opacity: opacity, color: avatar.colors[1], shadow: avatar.colors[2], blur: 2})                                                                    // left foot
					drawCircle(   x +  (3 * width / 4)           , y +     (height / 16)                                           ,      width / 8 ,                   {opacity: opacity, color: avatar.colors[1], shadow: avatar.colors[2], blur: 2})                                                                    // right foot
					drawRectangle(x +      (width / 32)          , y +     (height / 16)                                           , 15 * width / 16, 15 * height / 32, {opacity: opacity, color: avatar.colors[0], shadow: avatar.colors[2], blur: 8, radii: {topLeft: 10, topRight: 10, bottomRight: 7, bottomLeft: 7}}) // body
					drawRectangle(x -      (width / 16) + xOffset, y + (5 * height / 16) + (3 * height / 32) * Math.max(0, yOffset),  5 * width / 16,  5 * height / 32, {opacity: opacity, color: avatar.colors[1], shadow: avatar.colors[2], blur: 2, radii: {topLeft:  5, topRight:  5, bottomRight: 2, bottomLeft: 2}}) // left hand
					drawRectangle(x + (13 * width / 16) + xOffset, y + (5 * height / 16) + (3 * height / 32) * Math.max(0, yOffset),  5 * width / 16,  5 * height / 32, {opacity: opacity, color: avatar.colors[1], shadow: avatar.colors[2], blur: 2, radii: {topLeft:  5, topRight:  5, bottomRight: 2, bottomLeft: 2}}) // right hand
				}
				else if (avatar.team == "demons") {
					drawTriangle(x +  (3 * width / 8)           , y + (3 * height / 16)                                      , x +  (5 * width / 8)           , y +            (3 * height / 16)                       , x +     (width / 2) - (10 * xOffset), y + (3 * height / 8)                  , {opacity: opacity, color: avatar.colors[2], shadow: avatar.colors[2], blur: 2}) // tail
					drawTriangle(x +      (width / 4)           , y +     (height / 4)                                       , x +      (width / 8)           , y                                                      , x + (3 * width / 8), y                                                      , {opacity: opacity, color: avatar.colors[2], shadow: avatar.colors[2], blur: 2}) // left foot
					drawTriangle(x +  (3 * width / 4)           , y +     (height / 4)                                       , x +  (7 * width / 8)           , y                                                      , x + (5 * width / 8), y                                                      , {opacity: opacity, color: avatar.colors[2], shadow: avatar.colors[2], blur: 2}) // right foot
					drawTriangle(x -      (width / 16) + xOffset, y +     (height / 2) + (height / 16) * Math.max(0, yOffset), x +  (3 * width / 16) + xOffset, y + (height / 2) + (height / 16) * Math.max(0, yOffset), x +     (width / 4), y + (height / 4) + (height / 16) * Math.max(0, yOffset), {opacity: opacity, color: avatar.colors[2], shadow: avatar.colors[2], blur: 2}) // left hand
					drawTriangle(x + (13 * width / 16) + xOffset, y +     (height / 2) + (height / 16) * Math.max(0, yOffset), x + (17 * width / 16) + xOffset, y + (height / 2) + (height / 16) * Math.max(0, yOffset), x + (3 * width / 4), y + (height / 4) + (height / 16) * Math.max(0, yOffset), {opacity: opacity, color: avatar.colors[2], shadow: avatar.colors[2], blur: 2}) // right hand
					drawTriangle(x +      (width / 2)           , y + (7 * height / 8)                                       , x                              , y + (height / 8)                                       , x +      width     , y + (height / 8)                                       , {opacity: opacity, color: avatar.colors[0], shadow: avatar.colors[2], blur: 8}) // body

					if (admin) {
						drawText(x + (width / 2), y + (height / 4), avatar.number, {opacity: opacity, color: avatar.colors[1], size: (width / 2)}) // demon number
					}
				}

			// head
				if (avatar.team == "heroes") {
					drawCircle(x + (width / 2), y + (3 * height / 4), (width / 2), {opacity: opacity, color: avatar.colors[1], shadow: avatar.colors[2], blur: 8}) // head
				}
				else if (avatar.team == "demons") {
					drawTriangle(x              , y + (17 * height / 16), x                  , y + (7 * height / 8), x + (width / 2), y + (7 * height / 8), {opacity: opacity, color: avatar.colors[0], shadow: avatar.colors[2], blur: 8}) // left horn
					drawTriangle(x +  width     , y + (17 * height / 16), x + width          , y + (7 * height / 8), x + (width / 2), y + (7 * height / 8), {opacity: opacity, color: avatar.colors[0], shadow: avatar.colors[2], blur: 8}) // right horn
					drawTriangle(x + (width / 2), y + (17 * height / 16), x + (3 * width / 4), y + (7 * height / 8), x + (width / 4), y + (7 * height / 8), {opacity: opacity, color: avatar.colors[0], shadow: avatar.colors[2], blur: 8}) // center horn
					drawTriangle(x + (width / 2), y +      (height / 2 ), x                  , y + (7 * height / 8), x +  width     , y + (7 * height / 8), {opacity: opacity, color: avatar.colors[0], shadow: avatar.colors[2], blur: 8}) // face
				}

			// eyes
				drawCircle(x +     (width / 4) + xOffset, y + (13 * height / 16) + yOffset, width / 8, {opacity: opacity, color: avatar.colors[2]}) // left eye
				drawCircle(x + (3 * width / 4) + xOffset, y + (13 * height / 16) + yOffset, width / 8, {opacity: opacity, color: avatar.colors[2]}) // right eye
		}

	/* drawArrow */
		function drawArrow(x, y, multiplier, arrow) {
			// variables
				var radius = arrow.radius * multiplier * Math.sign(arrow.vx)
				if (multiplier < 1) {
					radius = radius * -1
				}

			// draw
				drawTriangle(x, y + radius, x, y - radius, x - (3 * radius), y, {opacity: 0.5, color: arrow.colors[0], shadow: arrow.colors[1], blur: 4, border: 4})
				drawCircle(  x, y,                            Math.abs(radius), {opacity:   1, color: arrow.colors[0], shadow: arrow.colors[1], blur: 4, border: 4})
		}

	/* drawAura */
		function drawAura(x, y, multiplier, aura) {
			// draw
				drawCircle(x, y, aura.radius * multiplier, {opacity: 0.25, color: aura.colors[1], shadow: aura.colors[0], blur: 4, border: 4})
		}

	/* drawPit */
		function drawPit(theme, canvasX, foreground) {
			// variables
				var multiplier = foreground ? 1 : 0.625
				var yOffset    = foreground ? 0 : 40
				var xOffset    = foreground ? 32 : -32
				var pitColor   = foreground ? (theme ? theme.pitForeground : "#222222") : (theme ? theme.pitBackground : "#444444")
				var x1         = foreground ? ((canvasX          ) * multiplier) : 1280 - ((canvasX          ) * multiplier)
				var x2         = foreground ? ((canvasX + xOffset) * multiplier) : 1280 - ((canvasX + xOffset) * multiplier)

			// draw
				drawRectangle(x1, yOffset, 32 * multiplier, 16 * multiplier, {color: pitColor})
		}

	/* drawSections */
		function drawSections(map, columnNumber, column, section, canvasX, theme, foreground) {
			// variables
				var terrainColor  = foreground ? (theme ? theme.terrainForeground  : "#111111") : (theme ? theme.terrainBackground  : "#333333")
				var platformColor = foreground ? (theme ? theme.platformForeground : "#111111") : (theme ? theme.platformBackground : "#333333")
				var multiplier    = foreground ? 1 : 0.625
				var xPlacement    = foreground ? (canvasX * multiplier) : 1280 - (canvasX * multiplier)
				var yOffset       = foreground ? 0 : 40
				var height        = 32 * multiplier

			for (var y = 0; y < 16; y++) {
				if (y >= column[section].bottom && y <= column[section].top) {
					if (section > 0) { // platforms
						drawRectangle(xPlacement, ((y + 1) * height) - (8 * multiplier) + yOffset, height, 8 * multiplier,
							{color: platformColor, radii: {topLeft: 5, topRight: 5, bottomRight: 5, bottomLeft: 5}}
						)
					}
					else if (y == column[section].top) { // terrain top
						if (!columnNumber) { // first column
							tl = (!map[map.length   - 1][0] || map[map.length   - 1][0].top < y) ? 8 : 0
							tr = (!map[columnNumber + 1][0] || map[columnNumber + 1][0].top < y) ? 8 : 0
						}
						else if (columnNumber == map.length - 1) { // last column
							tl = (!map[columnNumber - 1][0] || map[columnNumber - 1][0].top < y) ? 8 : 0
							tr = (!map[0               ][0] || map[0               ][0].top < y) ? 8 : 0
						}
						else {
							tl = (!map[columnNumber - 1][0] || map[columnNumber - 1][0].top < y) ? 8 : 0
							tr = (!map[columnNumber + 1][0] || map[columnNumber + 1][0].top < y) ? 8 : 0
						}

						if (!foreground) {
							var temp = tl
							tl = tr
							tr = temp
						}

						drawRectangle(xPlacement, (y * height) + yOffset, height, height,
							{color: terrainColor, radii: {topLeft: tl, topRight: tr, bottomRight: 0, bottomLeft: 0}}
						)
					}
					else { // terrain
						drawRectangle(xPlacement, (y * height) + yOffset, height, height, {color: terrainColor})
					}
				}
			}
		}

	/* drawTower */
		function drawTower(theme, tower, columnNumber, canvasX, foreground) {
			// variables
				var multiplier  = foreground ? 1 : 0.625
				var yOffset     = foreground ? 0 : 40
				var xOffset     = foreground ? 0 : -1 * (60 * multiplier)
				var xPlacement  = foreground ? (canvasX * multiplier) : 1280 - (canvasX * multiplier)
				var towerColor  = foreground ? (theme ? theme.towerForeground : "#555555") : (theme ? theme.towerBackground : "#777777")
				var centerDelta = foreground ? (2 - (columnNumber % 64)) * (32 * multiplier) : ((columnNumber % 64) - 1) * (32 * multiplier) * -1
				var flagColor   = tower ? tower.colors[2] : "#888888"

			// background
				if (columnNumber % 64 == 0) {
					drawRectangle(xPlacement, yOffset, (32 * multiplier), (32 * multiplier) * 13,
						{color: towerColor, radii: {topLeft: foreground ? (8 * multiplier) : 0, topRight: foreground ? 0 : (8 * multiplier), bottomRight: 0, bottomLeft: 0}}
					)
				}
				else if (columnNumber % 64 == 1) {
					drawRectangle(xPlacement, yOffset, (32 * multiplier), (32 * multiplier) * 14,
						{color: towerColor, radii: {topLeft: foreground ? (8 * multiplier) : 0, topRight: foreground ? 0 : (8 * multiplier), bottomRight: 0, bottomLeft: 0}}
					)
				}
				else if (columnNumber % 64 == 2) {
					drawRectangle(xPlacement, yOffset, (32 * multiplier), (32 * multiplier) * 14,
						{color: towerColor, radii: {topLeft: foreground ? 0 : (8 * multiplier), topRight: foreground ? (8 * multiplier) : 0, bottomRight: 0, bottomLeft: 0}}
					)
				}
				else if (columnNumber % 64 == 3) {
					drawRectangle(xPlacement, yOffset, (32 * multiplier), (32 * multiplier) * 13,
						{color: towerColor, radii: {topLeft: foreground ? 0 : (8 * multiplier), topRight: foreground ? (8 * multiplier) : 0, bottomRight: 0, bottomLeft: 0}}
					)
				}

			// name & flag
				xPlacement = foreground ? (canvasX * multiplier) + centerDelta : 1280 - ((canvasX * multiplier) + centerDelta)

				drawLine(     xPlacement          , (32 * multiplier * 14)                     + yOffset,        xPlacement, (32 * multiplier * 16) + yOffset, {color:  flagColor, shadow: flagColor, blur: 1})
				drawRectangle(xPlacement + xOffset, (32 * multiplier * 14) + (20 * multiplier) + yOffset, (60 * multiplier), (40 * multiplier)               , {color:  flagColor, shadow: flagColor, blur: 2, radii: {topLeft: 4, topRight: 4, bottomRight: 4, bottomLeft: 4}})
				if (tower) {
					drawText(     xPlacement + xOffset + (30 * multiplier), (32 * multiplier * 14) + (35 * multiplier) + yOffset,                      tower.name, {color:  "#ffffff", size:   12 * multiplier})
				}
		}

	/* drawTowerLetters */
		function drawTowerLetters(tower, columnNumber, canvasX, foreground) {
			// variables
				var multiplier = foreground ? 1  : 0.625
				var yOffset    = foreground ? 0  : 40
				var xOffset    = foreground ? 16 : -10
				var xPlacement = foreground ? ((canvasX * multiplier) + xOffset) : 1280 - ((canvasX * multiplier) + xOffset)
				
			// high platform
				var platform = tower.platforms[columnNumber % 64]
				drawText(xPlacement, (platform.y * 32 * multiplier) + (4 * multiplier) + yOffset, platform.note, {
					size:   32 * multiplier,
					color:  platform.color
				})

			// low platform
				var platform = tower.platforms[columnNumber % 64 + 4]
				drawText(xPlacement, (platform.y * 32 * multiplier) + (4 * multiplier) + yOffset, platform.note, {
					size:   32 * multiplier,
					color:  platform.color
				})
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
