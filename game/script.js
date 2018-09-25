/*** onload ***/
	/* elements */
		var canvas   = document.getElementById("canvas")
		var context  = canvas.getContext("2d")
		var dataview = document.getElementById("dataview")
		window.data = data = {}
		var sounds   = {}

	/* colors */
		var heroColor    = "#2b76ef"
		var demonColor   = "#d11919"
		var neutralColor = "#999999"

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

/*** helpers ***/
	/* getCells */
		function getCells(x, y) {
			return {
				left:   Math.floor(x / 32),
				right:  Math.floor(x / 32) + 1,
				bottom: Math.floor(y / 32),
				middle: Math.floor(y / 32) + 1,
				top:    Math.floor(y / 32) + 2
			}
		}

/*** draws ***/
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

	/* drawLine */
		function drawLine(x1, y1, x2, y2, options) {
			// parameters
				options = options || {}
				context.beginPath()
				context.strokeStyle = options.gradient ? drawGradient(options) : (options.color || "#222222")
				context.lineWidth   = options.border || 1
				context.shadowBlur  = options.shadow ? 10 : 0
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
				context.fillStyle   = options.gradient ? drawGradient(options) : (options.color || neutralColor)
				context.lineWidth   = options.border || 1
				context.shadowBlur  = options.shadow ? 10 : 0
				context.shadowColor = options.shadow ? options.shadow : "transparent"
				context.globalAlpha = options.opacity || 1

			// draw
				context.arc(x, canvas.height - y, radius, 0, 2 * Math.PI, true)
				context.fill()
		}

	/* drawRectangle */
		function drawRectangle(x, y, width, height, options) {
			// parameters
				options = options || {}
				context.beginPath()
				context.fillStyle   = options.gradient ? drawGradient(options) : (options.color || neutralColor)
				context.lineWidth   = options.border || 1
				context.shadowBlur  = options.shadow ? 10 : 0
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
				context.fillStyle   = options.gradient ? drawGradient(options) : (options.color || neutralColor)
				context.textAlign   = options.alignment || "center"
				context.shadowBlur  = options.shadow ? 10 : 0
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

							// background
								if (columnNumber % 64 == 0) {
									drawRectangle(1280 - (canvasX / 1.6), 40, 20, 20 * 13, {color: data.theme.towerBackground, radii: {topLeft: 0, topRight: 10, bottomRight: 0, bottomLeft: 0}})
								}
								else if (columnNumber % 64 == 1) {
									drawRectangle(1280 - (canvasX / 1.6), 40, 20, 20 * 14, {color: data.theme.towerBackground, radii: {topLeft: 0, topRight: 20, bottomRight: 0, bottomLeft: 0}})
								}
								else if (columnNumber % 64 == 2) {
									drawRectangle(1280 - (canvasX / 1.6), 40, 20, 20 * 14, {color: data.theme.towerBackground, radii: {topLeft: 20, topRight: 0, bottomRight: 0, bottomLeft: 0}})
								}
								else if (columnNumber % 64 == 3) {
									drawRectangle(1280 - (canvasX / 1.6), 40, 20, 20 * 13, {color: data.theme.towerBackground, radii: {topLeft: 10, topRight: 0, bottomRight: 0, bottomLeft: 0}})
								}

							// name & flag
								var centerDelta = ((columnNumber % 64) - 1) * 20
								drawText(1280 - ((canvasX / 1.6) - centerDelta), (20 * 17) + 40, tower.name, {
									size:   10,
									color:  (tower.team == "heroes" ? heroColor : tower.team == "demons" ? demonColor : neutralColor),
									shadow: (tower.team == "heroes" ? heroColor : tower.team == "demons" ? demonColor : neutralColor),
								})

								drawLine(     1280 - ((canvasX / 1.6) - centerDelta)     , (20 * 14     ) + 40, 1280 - ((canvasX / 1.6) - centerDelta), (20 * 16) + 40, {color:  (tower.team == "heroes" ? heroColor : tower.team == "demons" ? demonColor : neutralColor)})
								drawRectangle(1280 - ((canvasX / 1.6) - centerDelta) - 38, (20 * 14 + 13) + 40,                                     38,             25, {color:  (tower.team == "heroes" ? heroColor : tower.team == "demons" ? demonColor : neutralColor), radii: {topLeft: 3, topRight: 0, bottomRight: 0, bottomLeft: 3}})
						}
						else {
							var tower = null
						}

					// interactive
						var column = data.map[columnNumber]
						for (var cell in column) {
							// pit
								if (!column[cell]) {
									drawLine(1280 - ((canvasX - 32) / 1.6), 40, 1280 - ((canvasX) / 1.6), 40, {color: data.theme.pitBackground, shadow: data.theme.pitBackground})
								}

							// terrain & platforms
								else {
									for (var y = 0; y < 20; y++) {
										if (y >= column[cell].bottom && y <= column[cell].top) {
											var tl,  tr,  br,  bl
												tl = tr = br = bl = 0
											var color = data.theme.terrainBackground

											if (cell > 0) { // platforms
												tl = tr = br = bl = 8
												color = data.theme.platformBackground
											}
											else if (y == column[cell].top) { // terrain
												if (!columnNumber) { // first column
													tr = (!data.map[data.map.length - 1][0] || data.map[data.map.length - 1][0].top < y) ? 8 : 0
													tl = (!data.map[columnNumber    + 1][0] || data.map[columnNumber    + 1][0].top < y) ? 8 : 0
												}
												else if (columnNumber == data.map.length - 1) { // last column
													tr = (!data.map[columnNumber - 1][0] || data.map[columnNumber - 1][0].top < y) ? 8 : 0
													tl = (!data.map[0               ][0] || data.map[0               ][0].top < y) ? 8 : 0
												}
												else {
													tr = (!data.map[columnNumber - 1][0] || data.map[columnNumber - 1][0].top < y) ? 8 : 0
													tl = (!data.map[columnNumber + 1][0] || data.map[columnNumber + 1][0].top < y) ? 8 : 0
												}
											}

											drawRectangle(1280 - (canvasX / 1.6), (y * 20) + 40, 20, 20, {color: color, shadow: color, radii: {topLeft: tl, topRight: tr, bottomRight: br, bottomLeft: bl}})
										}
									}
								}
						}

					// tower letters
						if (tower) {
							// high platform
								var platform = tower.platforms[columnNumber % 64]
								drawText(1280 - ((canvasX / 1.6) - 10), (platform.y * 20 + 2) + 40, platform.note, {
									size:   20,
									color:  (platform.team == "heroes" ? heroColor : platform.team == "demons" ? demonColor : neutralColor),
									shadow: (platform.team == "heroes" ? heroColor : platform.team == "demons" ? demonColor : neutralColor),
								})

							// low platform
								var platform = tower.platforms[columnNumber % 64 + 4]
								drawText(1280 - ((canvasX / 1.6) - 10), (platform.y * 20 + 2) + 40, platform.note, {
									size:   20,
									color:  (platform.team == "heroes" ? heroColor : platform.team == "demons" ? demonColor : neutralColor),
									shadow: (platform.team == "heroes" ? heroColor : platform.team == "demons" ? demonColor : neutralColor),
								})
						}
				}

			// heroes
				var heroKeys = Object.keys(data.heroes)
				for (var key in heroKeys) {
					drawAvatar(1280 - ((data.heroes[heroKeys[key]].state.x - startX + mapLength + 20) % mapLength - 20) / 1.6, (data.heroes[heroKeys[key]].state.y / 1.6) + 40, 20, 40, data.heroes[heroKeys[key]])
				}

			// demons
				for (var d in data.demons) {
					drawAvatar(1280 - ((data.demons[d].state.x             - startX + mapLength + 20) % mapLength - 20) / 1.6, (data.demons[d].state.y             / 1.6) + 40, 20, 40, data.demons[d])
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

							// background
								if (columnNumber % 64 == 0) {
									drawRectangle(canvasX, 0, 32, 32 * 13, {color: data.theme.tower, radii: {topLeft: 16, topRight: 0, bottomRight: 0, bottomLeft: 0}})
								}
								else if (columnNumber % 64 == 1) {
									drawRectangle(canvasX, 0, 32, 32 * 14, {color: data.theme.tower, radii: {topLeft: 32, topRight: 0, bottomRight: 0, bottomLeft: 0}})
								}
								else if (columnNumber % 64 == 2) {
									drawRectangle(canvasX, 0, 32, 32 * 14, {color: data.theme.tower, radii: {topLeft: 0, topRight: 32, bottomRight: 0, bottomLeft: 0}})
								}
								else if (columnNumber % 64 == 3) {
									drawRectangle(canvasX, 0, 32, 32 * 13, {color: data.theme.tower, radii: {topLeft: 0, topRight: 16, bottomRight: 0, bottomLeft: 0}})
								}

							// name & flag
								var centerDelta = (2 - (columnNumber % 64)) * 32
								drawText(canvasX + centerDelta, 32 * 17, tower.name, {
									size:   16,
									color:  (tower.team == "heroes" ? heroColor : tower.team == "demons" ? demonColor : neutralColor),
									shadow: (tower.team == "heroes" ? heroColor : tower.team == "demons" ? demonColor : neutralColor),
								})

								drawLine(     canvasX + centerDelta, 32 * 14     , canvasX + centerDelta     , 32 * 16, {color:  (tower.team == "heroes" ? heroColor : tower.team == "demons" ? demonColor : neutralColor)})
								drawRectangle(canvasX + centerDelta, 32 * 14 + 20,                         60,      40, {color:  (tower.team == "heroes" ? heroColor : tower.team == "demons" ? demonColor : neutralColor), radii: {topLeft: 0, topRight: 4, bottomRight: 4, bottomLeft: 0}})
						}
						else {
							var tower = null
						}

					// interactive
						var column = data.map[columnNumber]
						for (var cell in column) {
							// pit
								if (!column[cell]) {
									drawLine(canvasX, 0, canvasX + 32, 0, {color: data.theme.pit, shadow: data.theme.pit})
								}

							// terrain & platforms
								else {
									for (var y = 0; y < 20; y++) {
										if (y >= column[cell].bottom && y <= column[cell].top) {
											var tl,  tr,  br,  bl
												tl = tr = br = bl = 0
											var color = data.theme.terrain

											if (cell > 0) { // platforms
												tl = tr = br = bl = 8
												color = data.theme.platform
											}
											else if (y == column[cell].top) { // terrain
												if (!columnNumber) { // first column
													tl = (!data.map[data.map.length - 1][0] || data.map[data.map.length - 1][0].top < y) ? 8 : 0
													tr = (!data.map[columnNumber    + 1][0] || data.map[columnNumber    + 1][0].top < y) ? 8 : 0
												}
												else if (columnNumber == data.map.length - 1) { // last column
													tl = (!data.map[columnNumber - 1][0] || data.map[columnNumber - 1][0].top < y) ? 8 : 0
													tr = (!data.map[0               ][0] || data.map[0               ][0].top < y) ? 8 : 0
												}
												else {
													tl = (!data.map[columnNumber - 1][0] || data.map[columnNumber - 1][0].top < y) ? 8 : 0
													tr = (!data.map[columnNumber + 1][0] || data.map[columnNumber + 1][0].top < y) ? 8 : 0
												}
											}

											drawRectangle(canvasX, y * 32, 32, 32, {color: color, shadow: color, radii: {topLeft: tl, topRight: tr, bottomRight: br, bottomLeft: bl}})
										}
									}
								}
						}

					// tower letters
						if (tower) {
							// high platform
								var platform = tower.platforms[columnNumber % 64]
								drawText(canvasX + 16, (platform.y * 32 + 4), platform.note, {
									size:   32,
									color:  (platform.team == "heroes" ? heroColor : platform.team == "demons" ? demonColor : neutralColor),
									shadow: (platform.team == "heroes" ? heroColor : platform.team == "demons" ? demonColor : neutralColor),
								})

							// low platform
								var platform = tower.platforms[columnNumber % 64 + 4]
								drawText(canvasX + 16, (platform.y * 32 + 4), platform.note, {
									size:   32,
									color:  (platform.team == "heroes" ? heroColor : platform.team == "demons" ? demonColor : neutralColor),
									shadow: (platform.team == "heroes" ? heroColor : platform.team == "demons" ? demonColor : neutralColor),
								})
						}
				}

			// heroes
				var heroKeys = Object.keys(data.heroes)
				for (var key in heroKeys) {
					drawAvatar((data.heroes[heroKeys[key]].state.x - startX + mapLength + 32) % mapLength - 32, data.heroes[heroKeys[key]].state.y, 32, 64, data.heroes[heroKeys[key]])
				}

			// demons
				for (var d in data.demons) {
					drawAvatar((data.demons[d].state.x             - startX + mapLength + 32) % mapLength - 32, data.demons[d].state.y            , 32, 64, data.demons[d])
				}
		}

	/* drawAvatar */
		function drawAvatar(x, y, width, height, avatar) {
			// variables
				var healthColor = avatar.state.health ? ("rgb(128, " + avatar.state.health + ", 000)") : "rgb(255,255,255)"
				var opacity     = avatar.state.health ? 1 : 0.5
					opacity     = opacity * (width == 32 ? 1 : 0.5)
				var eyeColor    = avatar.team == "heroes" ? heroColor : demonColor
				var xOffset     = avatar.state.vx > 0 ? 2 : avatar.state.vx < 0 ? -2 : 0
				var yOffset     = avatar.state.vy > 0 ? 2 : avatar.state.vy < 0 ? -2 : 0

			// draw
				drawText(     x +      (width / 2)           , y + (2.5 * height / 2)                                           , avatar.name                             , {opacity: opacity, color: eyeColor, size: (width / 4)})                                                                                          // name
				drawLine(     x                              , y + (4.5 * height / 4)                                           ,  x + width      , y + (4.5 * height / 4), {opacity: opacity, color: healthColor,      shadow: healthColor})                                                                // health bar
				drawCircle(   x +      (width / 2)           , y +       (height / 2) + (width / 2)                             ,     (width /  2),                         {opacity: opacity, color: avatar.colors[1], shadow: "#222222"})                                                                  // head
				drawCircle(   x + ( 2 * width / 8)  + xOffset, y + (6.5 * height / 8)                                 + yOffset ,     (width /  8),                         {opacity: opacity, color: eyeColor})                                                                                             // left eye
				drawCircle(   x + ( 6 * width / 8)  + xOffset, y + (6.5 * height / 8)                                 + yOffset ,     (width /  8),                         {opacity: opacity, color: eyeColor})                                                                                             // right eye
				drawRectangle(x                              , y                                                                ,      width      ,           height /  2 , {opacity: opacity, color: avatar.colors[0], shadow: "#222222", radii: {topLeft: 8, topRight: 8, bottomRight: 4, bottomLeft: 4}}) // body
				drawRectangle(x -      (width / 16) + xOffset, y + (2.5 * height / 8) + (3 * height / 32) * Math.max(0, yOffset), (5 * width / 16),       (5 * width / 16), {opacity: opacity, color: avatar.colors[1], shadow: eyeColor,  radii: {topLeft: 5, topRight: 5, bottomRight: 2, bottomLeft: 2}}) // left hand
				drawRectangle(x + (13 * width / 16) + xOffset, y + (2.5 * height / 8) + (3 * height / 32) * Math.max(0, yOffset), (5 * width / 16),       (5 * width / 16), {opacity: opacity, color: avatar.colors[1], shadow: eyeColor,  radii: {topLeft: 5, topRight: 5, bottomRight: 2, bottomLeft: 2}}) // right hand
		}
