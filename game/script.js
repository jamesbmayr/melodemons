/*** onload ***/
	/* elements */
		var canvas   = document.getElementById("canvas")
		var context  = canvas.getContext("2d")
		var dataview = document.getElementById("dataview")
		window.data = data = {}
		var sounds   = {}

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
							key  = "up"
							type = "Arrow"
						break
						case "ArrowRight":
							key  = "right"
							type = "Arrow"
						break
						case "ArrowDown":
							key  = "down"
							type = "Arrow"
						break
						case "ArrowLeft":
							key  = "left"
							type = "Arrow"
						break

					// music
						case "KeyQ":
						case "KeyA":
						case "KeyZ":
							key  = "A2"
							type = "Note"
						break
						case "KeyW":
						case "KeyS":
						case "KeyX":
							key  = "C3"
							type = "Note"
						break
						case "KeyE":
						case "KeyD":
						case "KeyC":
							key  = "D3"
							type = "Note"
						break
						case "KeyR":
						case "KeyF":
						case "KeyV":
							key  = "E3"
							type = "Note"
						break
						case "KeyT":
						case "KeyG":
						case "KeyB":
							key  = "G3"
							type = "Note"
						break
						case "KeyY":
						case "KeyH":
						case "KeyN":
							key  = "A3"
							type = "Note"
						break
						case "KeyU":
						case "KeyJ":
						case "KeyM":
							key  = "C4"
							type = "Note"
						break
						case "KeyI":
						case "KeyK":
						case "Key,":
							key  = "D4"
							type = "Note"
						break
						case "KeyO":
						case "KeyL":
						case "Period":
							key  = "E4"
							type = "Note"
						break
						case "KeyP":
						case "Semicolon":
						case "Slash":
							key  = "G4"
							type = "Note"
						break
						case "BracketLeft":
						case "Quote":
						case "ShiftRight":
							key  = "A4"
							type = "Note"
						break
					
					// numbers
						case "Digit1":
							key  = 1
							type = "Number"
						break
						case "Digit2":
							key  = 2
							type = "Number"
						break
						case "Digit3":
							key  = 3
							type = "Number"
						break
						case "Digit4":
							key  = 4
							type = "Number"
						break
						case "Digit5":
							key  = 5
							type = "Number"
						break
						case "Digit6":
							key  = 6
							type = "Number"
						break
						case "Digit7":
							key  = 7
							type = "Number"
						break
						case "Digit8":
							key  = 8
							type = "Number"
						break
						case "Digit9":
							key  = 9
							type = "Number"
						break
						case "Digit0":
							key  = 10
							type = "Number"
						break
						case "Minus":
							key  = 11
							type = "Number"
						break
						case "Equal":
							key = 12
							type = "Number"
						break
				}

			// submit data
				if (key !== null && socket) {
					socket.send(JSON.stringify({
						action: "submit" + type,
						key:   key,
						press: press
					}))
				}
		}

	/* receivePost */
		function receivePost(post) {
			// redirects
				if (post.location !== undefined) {
					window.location = post.location
				}

			// menu
				else if (!data.state || !data.state.start) {
					data = post
					dataview.innerHTML = JSON.stringify(post, 2, 2, 2)
				}

			// gameplay
				else {
					data = post
					dataview.innerHTML = JSON.stringify(post, 2, 2, 2)

					drawGame()
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

/*** draw loop ***/
	/* drawGame */
		function drawGame() {
			drawEmpty()
			drawBackground()
			drawForeground()
		}

	/* drawEmpty */
		function drawEmpty() {
			context.clearRect(0, 0, canvas.width, canvas.height)
			drawRectangle(    0, 0, canvas.width, canvas.height, {gradient: {x1: 0, y1: 0, x2: 0, y2: canvas.height, colors: {"0": data.theme.skyBottom, "1": data.theme.skyTop}}})
			drawRectangle(    0, 0, canvas.width, 40           , {color: data.theme.pitBackground})
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

			// heroes & demons
				var keys = Object.keys(data.heroes).concat(Object.keys(data.demons))
				for (var k in keys) {
					var avatar = (keys[k] > -1) ? data.demons[keys[k]] : data.heroes[keys[k]]
					drawAvatar(1280 - ((avatar.state.x - startX + mapLength + 20) % mapLength - 20) / 1.6, (avatar.state.y / 1.6) + 40, 20, 40, avatar)
				}

			// arrows
				for (var a in data.arrows) {
					drawArrow(1280 - ((data.arrows[a].x - startX + mapLength + 20) % mapLength - 20) / 1.6, (data.arrows[a].y / 1.6) + 40, 0.6, data.arrows[a])
				}
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

			// heroes & demons
				var keys = Object.keys(data.heroes).concat(Object.keys(data.demons))
				for (var k in keys) {
					var avatar = (keys[k] > -1) ? data.demons[keys[k]] : data.heroes[keys[k]]
					drawAvatar((avatar.state.x - startX + mapLength + 32) % mapLength - 32, avatar.state.y, 32, 64, avatar)
				}

			// arrows
				for (var a in data.arrows) {
					drawArrow((data.arrows[a].x - startX + mapLength + 32) % mapLength - 32, data.arrows[a].y, 1, data.arrows[a])
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

			// draw
				drawText(     x +      (width / 2)           , y + (2.5 * height / 2)                                           , avatar.name                             , {opacity: opacity, color: avatar.colors[2], size: (width / 4)})                                                                                  // name
				drawLine(     x                              , y + (4.5 * height / 4)                                           ,  x + healthWidth, y + (4.5 * height / 4), {opacity: opacity, color: healthColor,      shadow: healthColor, blur: 2})                                                                       // health bar
				drawCircle(   x +      (width / 2)           , y +       (height / 2) + (width / 2)                             ,     (width /  2),                         {opacity: opacity, color: avatar.colors[1], shadow: avatar.colors[2], blur: 8})                                                                  // head
				drawCircle(   x + ( 2 * width / 8)  + xOffset, y + (6.5 * height / 8)                                 + yOffset ,     (width /  8),                         {opacity: opacity, color: avatar.colors[2]})                                                                                                     // left eye
				drawCircle(   x + ( 6 * width / 8)  + xOffset, y + (6.5 * height / 8)                                 + yOffset ,     (width /  8),                         {opacity: opacity, color: avatar.colors[2]})                                                                                                     // right eye
				drawRectangle(x                              , y                                                                ,      width      ,           height /  2 , {opacity: opacity, color: avatar.colors[0], shadow: avatar.colors[2], blur: 8, radii: {topLeft: 8, topRight: 8, bottomRight: 4, bottomLeft: 4}}) // body
				drawRectangle(x -      (width / 16) + xOffset, y + (2.5 * height / 8) + (3 * height / 32) * Math.max(0, yOffset), (5 * width / 16),       (5 * width / 16), {opacity: opacity, color: avatar.colors[1], shadow: avatar.colors[2], blur: 2, radii: {topLeft: 5, topRight: 5, bottomRight: 2, bottomLeft: 2}}) // left hand
				drawRectangle(x + (13 * width / 16) + xOffset, y + (2.5 * height / 8) + (3 * height / 32) * Math.max(0, yOffset), (5 * width / 16),       (5 * width / 16), {opacity: opacity, color: avatar.colors[1], shadow: avatar.colors[2], blur: 2, radii: {topLeft: 5, topRight: 5, bottomRight: 2, bottomLeft: 2}}) // right hand
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
					if (section > 0 && column[section].note) { // tower platforms
						drawRectangle(xPlacement, ((y + 1) * height) - 8 + yOffset, height, 8 * multiplier,
							{color: platformColor, radii: {topLeft: 5, topRight: 5, bottomRight: 5, bottomLeft: 5}}
						)
					}
					else if (section > 0) { // obstacles
						drawRectangle(xPlacement, ((y    ) * height)     + yOffset, height, height,
							{color: platformColor, radii: {topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8}}
						)
					}
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
						{color: towerColor, radii: {topLeft: foreground ? (16 * multiplier) : 0, topRight: foreground ? 0 : (16 * multiplier), bottomRight: 0, bottomLeft: 0}}
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
						{color: towerColor, radii: {topLeft: foreground ? 0 : (16 * multiplier), topRight: foreground ? (16 * multiplier) : 0, bottomRight: 0, bottomLeft: 0}}
					)
				}

			// name & flag
				xPlacement = foreground ? (canvasX * multiplier) + centerDelta : 1280 - ((canvasX * multiplier) + centerDelta)
				
				drawText(xPlacement, (32 * multiplier * 17) + yOffset, tower.name, {
					size:   16 * multiplier,
					color:  tower.colors[2]
				})

				drawLine(     xPlacement          , (32 * multiplier * 14)                     + yOffset,        xPlacement, (32 * multiplier * 16) + yOffset, {color:  tower.colors[2], shadow: tower.colors[2], blur: 1})
				drawRectangle(xPlacement + xOffset, (32 * multiplier * 14) + (20 * multiplier) + yOffset, (60 * multiplier), (40 * multiplier)               , {color:  tower.colors[2], shadow: tower.colors[2], blur: 2, radii: {topLeft: 4, topRight: 4, bottomRight: 4, bottomLeft: 4}})
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
					color:  platform.color,
					shadow: platform.color,
					blur: 1
				})

			// low platform
				var platform = tower.platforms[columnNumber % 64 + 4]
				drawText(xPlacement, (platform.y * 32 * multiplier) + (4 * multiplier) + yOffset, platform.note, {
					size:   32 * multiplier,
					color:  platform.color,
					shadow: platform.color,
					blur: 4
				})
		}
