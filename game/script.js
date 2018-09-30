/*** onload ***/
	/* elements */
		var canvas     = document.getElementById("canvas")
		var context    = canvas.getContext("2d")
		window.data    = data = {}
		var menu       = {}
		var sounds     = {}
		var eraseTimer = null

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
			// variables
				var key   = null
				var type  = null
				var press = (event.type == "keydown") ? true : false

			// get key & type
				switch (event.code) {
					// arrows
						case "ArrowUp":
							key = "up"
						break
						case "ArrowRight":
							key = "right"
						break
						case "ArrowDown":
							key = "down"
						break
						case "ArrowLeft":
							key = "left"
						break

					// music
						// row 1
							case "KeyQ":
								key = "C4"
							break
							case "KeyW":
								key = "D4"
							break
							case "KeyE":
								key = "E4"
							break
							case "KeyR":
							//	key = "F4"
							break
							case "KeyT":
								key = "G4"
							break
							case "KeyY":
								key = "A5"
							break
							case "KeyU":
							//	key = "B5"
							break
							case "KeyI":
								key = "C5"
							break
							case "KeyO":
								key = "D5"
							break
							case "KeyP":
								key = "E5"
							break
							case "BracketLeft":
							//	key = "F5"
							break
							case "BracketRight":
								key = "G5"
							break
							case "Backslash":
								key = "A6"
							break

						// row 2
							case "KeyA":
								key = "C3"
							break
							case "KeyS":
								key = "D3"
							break
							case "KeyD":
								key = "E3"
							break
							case "KeyF":
							//	key = "F3"
							break
							case "KeyG":
								key = "G3"
							break
							case "KeyH":
								key = "A4"
							break
							case "KeyJ":
							//	key = "B4"
							break
							case "KeyK":
								key = "C4"
							break
							case "KeyL":
								key = "D4"
							break
							case "Semicolon":
								key = "E4"
							break
							case "Quote":
							//	key = "F4"
							break
						
						// row 3
							case "KeyZ":
								key = "C2"
							break
							case "KeyX":
								key = "D2"
							break
							case "KeyC":
								key = "E2"
							break
							case "KeyV":
							//	key = "F2"
							break
							case "KeyB":
								key = "G2"
							break
							case "KeyN":
								key = "A3"
							break
							case "KeyM":
							//	key = "B3"
							break
							case "Comma":
								key = "C3"
							break
							case "Period":
								key = "D3"
							break
							case "Slash":
								key = "E3"
							break
					
					// numbers
						case "Digit1":
							key = 1
						break
						case "Digit2":
							key = 2
						break
						case "Digit3":
							key = 3
						break
						case "Digit4":
							key = 4
						break
						case "Digit5":
							key = 5
						break
						case "Digit6":
							key = 6
						break
						case "Digit7":
							key = 7
						break
						case "Digit8":
							key = 8
						break
						case "Digit9":
							key = 9
						break
						case "Digit0":
							key = 10
						break
						case "Minus":
							key = 11
						break
						case "Equal":
							key = 12
						break
				}

				if ([1,2,3,4,5,6,7,8,9,10,11,12].includes(key)) {
					type = "Number"
				}
				else if (["up","right","down","left"].includes(key)) {
					type = "Arrow"
				}
				else {
					type = "Note"
				}

			// submit data
				if (key !== null && socket) {
					socket.send(JSON.stringify({
						action: "submit" + type,
						key:    key,
						press:  press
					}))
				}
		}

	/* submitClick */
		document.addEventListener("click", submitClick)
		function submitClick(event) {
			// game start / end
				if (data.clicked) {
					return false
				}

			// menu
				else {
					data.clicked = true
					socket.send(JSON.stringify({
						action: "submitArrow",
						key:    "up",
						press:  true
					}))

					// window.audio = window.buildAudio()
				}
		}

	/* receivePost */
		function receivePost(post) {
			// redirects
				if (post.location) {
					window.location = post.location
				}

			// message
				if (post.message) {
					data.message = post.message

					if (eraseTimer) {
						clearInterval(eraseTimer) 
					}

					eraseTimer = setTimeout(function() {
						data.message = null
						clearInterval(eraseTimer)
						eraseTimer = null
					}, 3000)
				}

			// menu
				if (post.overlay) {
					menu.overlay = post.overlay
				}
				if (post.options) {
					menu.options = post.options 
				}
				if (post.text) {
					menu.text    = post.text
				}

			// gameplay
				if (post.state) {
					data.state = post.state
				}
				if (post.theme) {
					data.theme = post.theme
				}
				if (post.heroes) {
					data.heroes = post.heroes
				}
				if (post.demons) {
					data.demons = post.demons
				}
				if (post.towers) {
					data.towers = post.towers
				}
				if (post.map) {
					data.map = post.map
				}
				if (post.arrows) {
					data.arrows = post.arrows
				}
				if (post.auras) {
					data.auras = post.auras
				}

			// draw
				if (!data.state.start) {
					drawMenu()
				}
				else if (data.state.start && data.map) {
					drawGame()
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
			return false
		}

/*** gameplay ***/
	/* drawGame */
		function drawGame() {
			drawSky()
			drawBackground()
			drawForeground()
		}

	/* drawEmpty */
		function drawSky() {
			context.clearRect(0, 0, canvas.width, canvas.height)
			drawRectangle(    0, 0, canvas.width, canvas.height, {gradient: {x1: 0, y1: 0, x2: 0, y2: canvas.height, colors: {"0": data.theme.skyBottom, "1": data.theme.skyTop}}})
		}

	/* drawBackground */
		function drawBackground() {
			// variables
				var avatar    = data.heroes[window.id] || data.demons.find(function(d) { return d.state.selected }) || {x: 0, y: 0}
				var mapLength = data.map.length * 32
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
							var tower = data.towers[Math.floor(columnNumber / 64)]
						 	drawTower(data, tower, columnNumber, canvasX, false)
						}
						else {
							var tower = false
						}

					// interactive
						var column = data.map[columnNumber]
						for (var section in column) {
							// pit
								if (!column[section]) {
								 	drawPit(data, canvasX, false)
								}

							// terrain & platforms
								else {
									drawSections(data, columnNumber, column, section, canvasX, false)
								}
						}

					// tower letters
						if (tower) {
						 	drawTowerLetters(data, tower, columnNumber, canvasX, false)
						}
				}

			// arrows
				for (var a in data.arrows) {
					drawArrow(1280 - ((data.arrows[a].x - startX + mapLength + 20) % mapLength - 20) / 1.6, (data.arrows[a].y / 1.6) + 40, 0.625, data.arrows[a])
				}

			// heroes & demons
				var keys = Object.keys(data.heroes).concat(Object.keys(data.demons))
				for (var k in keys) {
					var avatar = (keys[k] > -1) ? data.demons[keys[k]] : data.heroes[keys[k]]
					drawAvatar(1280 - ((avatar.state.x - startX + mapLength + 20) % mapLength - 20) / 1.6, (avatar.state.y / 1.6) + 40, 20, 40, avatar)
				}

			// auras
				for (var a in data.auras) {
					drawAura(1280 - ((data.auras[a].x - 32 - startX + mapLength + 20) % mapLength - 20) / 1.6, (data.auras[a].y / 1.6) + 40, 0.625, data.auras[a])
				}

			// pit
				drawRectangle(0, 0, canvas.width, 40, {color: data.theme.pitBackground})
		}

	/* drawForeground */
		function drawForeground() {
			// variables
				var towers    = []
				var avatar    = data.heroes[window.id] || data.demons.find(function(d) { return d.state.selected }) || {x: 0, y: 0}
				var mapLength = data.map.length * 32
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
							var tower = data.towers[Math.floor(columnNumber / 64)]
							drawTower(data, tower, columnNumber, canvasX, true)
						}
						else {
							tower = false
						}

					// interactive
						var column = data.map[columnNumber]
						for (var section in column) {
							// pit
								if (!column[section]) {
									drawPit(data, canvasX, true)
								}

							// terrain & platforms
								else {
									drawSections(data, columnNumber, column, section, canvasX, true)
								}
						}

					// tower letters
						if (tower) {
							drawTowerLetters(data, tower, columnNumber, canvasX, true)
						}
				}

			// arrows
				for (var a in data.arrows) {
					drawArrow((data.arrows[a].x - startX + mapLength + 32) % mapLength - 32, data.arrows[a].y, 1, data.arrows[a])
				}

			// heroes & demons
				var keys = Object.keys(data.heroes).concat(Object.keys(data.demons))
				for (var k in keys) {
					var avatar = (keys[k] > -1) ? data.demons[keys[k]] : data.heroes[keys[k]]
					drawAvatar((avatar.state.x - startX + mapLength + 32) % mapLength - 32, avatar.state.y, 32, 64, avatar)
				}

			// auras
				for (var a in data.auras) {
					drawAura((data.auras[a].x - startX + mapLength + 32) % mapLength - 32, data.auras[a].y, 1, data.auras[a])
				}

			// win countdown ?
				if (data.state.winning.team) {
					drawText(canvas.width / 2, 7 * canvas.height / 8, (data.state.winning.countdown || data.state.winning.team + " win"), {color: data.state.winning.color, size: 64})
				}
		}

	/* drawAvatar */
		function drawAvatar(x, y, width, height, avatar) {
			// variables
				var healthColor = avatar.state.health ? ("rgb(128, " + avatar.state.health + ", 000)") : "rgb(255,255,255)"
				var healthWidth = avatar.state.health ? Math.floor((avatar.state.health + 1) * width / 256) : width
				var opacity     = avatar.state.health ? 1 : 0.5
					opacity     = opacity * (width == 32 ? 1 : 0.5)
				var xOffset     = avatar.state.right  ? 2 : avatar.state.left   ? -2 : 0
				var yOffset     = avatar.state.vy > 0 ? 2 : avatar.state.vy < 0 ? -2 : 0

			// name & healthbar
				drawText(x + (width / 2), y + (5 * height / 4), avatar.name                          , {opacity: opacity, color: avatar.colors[2],     size: (width / 4)})   // name
				drawLine(x              , y + (9 * height / 8), x + healthWidth, y + (9 * height / 8), {opacity: opacity, color: healthColor, blur: 2, shadow: healthColor}) // health bar

			// body
				if (avatar.team == "heroes") {
					drawCircle(   x +      (width / 4)           , y +     (height / 16)                                           ,      width / 8 ,                   {opacity: opacity, color: avatar.colors[1], shadow: avatar.colors[2], blur: 2})                                                                    // left foot
					drawCircle(   x +  (3 * width / 4)           , y +     (height / 16)                                           ,      width / 8 ,                   {opacity: opacity, color: avatar.colors[1], shadow: avatar.colors[2], blur: 2})                                                                    // right foot
					drawRectangle(x +      (width / 32)          , y +     (height / 16)                                           , 15 * width / 16, 15 * height / 32, {opacity: opacity, color: avatar.colors[0], shadow: avatar.colors[2], blur: 8, radii: {topLeft: 10, topRight: 10, bottomRight: 7, bottomLeft: 7}}) // body
					drawRectangle(x -      (width / 16) + xOffset, y + (5 * height / 16) + (3 * height / 32) * Math.max(0, yOffset),  5 * width / 16,  5 * height / 32, {opacity: opacity, color: avatar.colors[1], shadow: avatar.colors[2], blur: 2, radii: {topLeft:  5, topRight:  5, bottomRight: 2, bottomLeft: 2}}) // left hand
					drawRectangle(x + (13 * width / 16) + xOffset, y + (5 * height / 16) + (3 * height / 32) * Math.max(0, yOffset),  5 * width / 16,  5 * height / 32, {opacity: opacity, color: avatar.colors[1], shadow: avatar.colors[2], blur: 2, radii: {topLeft:  5, topRight:  5, bottomRight: 2, bottomLeft: 2}}) // right hand
				}
				else if (avatar.team == "demons") {
					drawTriangle(x +      (width / 4)           , y +     (height / 4)                                       , x +      (width / 8)           , y                                                      , x + (3 * width / 8), y                                                      , {opacity: opacity, color: avatar.colors[2], shadow: avatar.colors[2], blur: 2}) // left foot
					drawTriangle(x +  (3 * width / 4)           , y +     (height / 4)                                       , x + (7  * width / 8)           , y                                                      , x + (5 * width / 8), y                                                      , {opacity: opacity, color: avatar.colors[2], shadow: avatar.colors[2], blur: 2}) // right foot
					drawTriangle(x -      (width / 16) + xOffset, y +     (height / 2) + (height / 16) * Math.max(0, yOffset), x + (3  * width / 16) + xOffset, y + (height / 2) + (height / 16) * Math.max(0, yOffset), x +     (width / 4), y + (height / 4) + (height / 16) * Math.max(0, yOffset), {opacity: opacity, color: avatar.colors[2], shadow: avatar.colors[2], blur: 2}) // left hand
					drawTriangle(x + (13 * width / 16) + xOffset, y +     (height / 2) + (height / 16) * Math.max(0, yOffset), x + (17 * width / 16) + xOffset, y + (height / 2) + (height / 16) * Math.max(0, yOffset), x + (3 * width / 4), y + (height / 4) + (height / 16) * Math.max(0, yOffset), {opacity: opacity, color: avatar.colors[2], shadow: avatar.colors[2], blur: 2}) // right hand
					drawTriangle(x +      (width / 2)           , y + (7 * height / 8)                                       , x                              , y + (height / 8)                                       , x +      width     , y + (height / 8)                                       , {opacity: opacity, color: avatar.colors[0], shadow: avatar.colors[2], blur: 8}) // body
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
		function drawPit(data, canvasX, foreground) {
			// variables
				var multiplier = foreground ? 1 : 0.625
				var yOffset    = foreground ? 0 : 40
				var xOffset    = foreground ? 32 : -32
				var pitColor   = foreground ? data.theme.pitForeground : data.theme.pitBackground
				var x1         = foreground ? ((canvasX          ) * multiplier) : 1280 - ((canvasX          ) * multiplier)
				var x2         = foreground ? ((canvasX + xOffset) * multiplier) : 1280 - ((canvasX + xOffset) * multiplier)

			// draw
				drawRectangle(x1, yOffset, 32 * multiplier, 16 * multiplier, {color: pitColor})
		}

	/* drawSections */
		function drawSections(data, columnNumber, column, section, canvasX, foreground) {
			// variables
				var terrainColor  = foreground ? data.theme.terrainForeground  : data.theme.terrainBackground
				var platformColor = foreground ? data.theme.platformForeground : data.theme.platformBackground
				var multiplier    = foreground ? 1 : 0.625
				var xPlacement    = foreground ? (canvasX * multiplier) : 1280 - (canvasX * multiplier)
				var yOffset       = foreground ? 0 : 40
				var height        = 32 * multiplier

			for (var y = 0; y < 16; y++) {
				if (y >= column[section].bottom && y <= column[section].top) {
					if (section > 0) { // tower platforms
						drawRectangle(xPlacement, ((y + 1) * height) - (8 * multiplier) + yOffset, height, 8 * multiplier,
							{color: platformColor, radii: {topLeft: 5, topRight: 5, bottomRight: 5, bottomLeft: 5}}
						)
					}
					// else if (section > 0) { // obstacles
					// 	drawRectangle(xPlacement, ((y    ) * height)     + yOffset, height, height,
					// 		{color: platformColor, radii: {topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8}}
					// 	)
					// }
					else if (y == column[section].top) { // terrain top
						if (!columnNumber) { // first column
							tl = (!data.map[data.map.length - 1][0] || data.map[data.map.length - 1][0].top < y) ? 8 : 0
							tr = (!data.map[columnNumber    + 1][0] || data.map[columnNumber    + 1][0].top < y) ? 8 : 0
						}
						else if (columnNumber == data.map.length - 1) { // last column
							tl = (!data.map[columnNumber    - 1][0] || data.map[columnNumber    - 1][0].top < y) ? 8 : 0
							tr = (!data.map[0                  ][0] || data.map[0                  ][0].top < y) ? 8 : 0
						}
						else {
							tl = (!data.map[columnNumber    - 1][0] || data.map[columnNumber    - 1][0].top < y) ? 8 : 0
							tr = (!data.map[columnNumber    + 1][0] || data.map[columnNumber    + 1][0].top < y) ? 8 : 0
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
		function drawTower(data, tower, columnNumber, canvasX, foreground) {
			// variables
				var multiplier  = foreground ? 1 : 0.625
				var yOffset     = foreground ? 0 : 40
				var xOffset     = foreground ? 0 : -1 * (60 * multiplier)
				var xPlacement  = foreground ? (canvasX * multiplier) : 1280 - (canvasX * multiplier)
				var towerColor  = foreground ? data.theme.towerForeground : data.theme.towerBackground
				var centerDelta = foreground ? (2 - (columnNumber % 64)) * (32 * multiplier) : ((columnNumber % 64) - 1) * (32 * multiplier) * -1

			// background
				if (columnNumber % 64 == 0) {
					drawRectangle(xPlacement, yOffset, (32 * multiplier), (32 * multiplier) * 13,
						{color: towerColor, radii: {topLeft: foreground ? (32 * multiplier) : 0, topRight: foreground ? 0 : (32 * multiplier), bottomRight: 0, bottomLeft: 0}}
					)
				}
				else if (columnNumber % 64 == 1) {
					drawRectangle(xPlacement, yOffset, (32 * multiplier), (32 * multiplier) * 14,
						{color: towerColor, radii: {topLeft: foreground ? (32 * multiplier) : 0, topRight: foreground ? 0 : (32 * multiplier), bottomRight: 0, bottomLeft: 0}}
					)
				}
				else if (columnNumber % 64 == 2) {
					drawRectangle(xPlacement, yOffset, (32 * multiplier), (32 * multiplier) * 14,
						{color: towerColor, radii: {topLeft: foreground ? 0 : (32 * multiplier), topRight: foreground ? (32 * multiplier) : 0, bottomRight: 0, bottomLeft: 0}}
					)
				}
				else if (columnNumber % 64 == 3) {
					drawRectangle(xPlacement, yOffset, (32 * multiplier), (32 * multiplier) * 13,
						{color: towerColor, radii: {topLeft: foreground ? 0 : (32 * multiplier), topRight: foreground ? (32 * multiplier) : 0, bottomRight: 0, bottomLeft: 0}}
					)
				}

			// name & flag
				xPlacement = foreground ? (canvasX * multiplier) + centerDelta : 1280 - ((canvasX * multiplier) + centerDelta)

				drawLine(     xPlacement          , (32 * multiplier * 14)                     + yOffset,        xPlacement, (32 * multiplier * 16) + yOffset, {color:  tower.colors[2], shadow: tower.colors[2], blur: 1})
				drawRectangle(xPlacement + xOffset, (32 * multiplier * 14) + (20 * multiplier) + yOffset, (60 * multiplier), (40 * multiplier)               , {color:  tower.colors[2], shadow: tower.colors[2], blur: 2, radii: {topLeft: 4, topRight: 4, bottomRight: 4, bottomLeft: 4}})
				drawText(     xPlacement + xOffset + (30 * multiplier), (32 * multiplier * 14) + (35 * multiplier) + yOffset,                      tower.name, {color:  "white", size:   12 * multiplier})
		}

	/* drawTowerLetters */
		function drawTowerLetters(data, tower, columnNumber, canvasX, foreground) {
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
