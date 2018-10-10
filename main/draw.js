/*** globals ***/
	/* canvas */
		var canvas  = window.canvas  = document.getElementById("canvas")
		var context = window.context = canvas.getContext("2d")

/*** shapes ***/
	/* drawLine */
		window.drawLine = drawLine
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
		window.drawCircle = drawCircle
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
				context.arc(x, canvas.height - y, radius, (options.start || 0), (options.end || (2 * Math.PI)))
				context.fill()
		}

	/* drawTriangle */
		window.drawTriangle = drawTriangle
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
		window.drawRectangle = drawRectangle
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
		window.drawText = drawText
		function drawText(x, y, text, options) {
			// variables
				options = options || {}
				context.font = (options.style ? options.style + " " : "") + (options.size || 32) + "px " + (options.font || font)
				context.fillStyle   = options.gradient ? drawGradient(options) : (options.color || "transparent")
				context.textAlign   = options.alignment || "center"
				context.shadowBlur  = options.blur ? options.blur : 0
				context.shadowColor = options.shadow ? options.shadow : "transparent"
				context.globalAlpha = options.opacity || 1


			// draw
				context.fillText((text || ""), x, canvas.height - y)
		}

	/* drawGradient */
		window.drawGradient = drawGradient
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
				var gradientColors = Object.keys(options.gradient.colors)
				for (var c in gradientColors) {
					gradient.addColorStop(Number(gradientColors[c]), options.gradient.colors[gradientColors[c]])
				}

			return gradient
		}

/*** drawing ***/
	/* drawMap */
		window.drawMap = drawMap
		function drawMap(  map, theme, data, isSample) {
			drawSky(            theme)
			drawBackground(map, theme, data, isSample)
			drawForeground(map, theme, data, isSample)
		}

	/* drawSky */
		window.drawSky = drawSky
		function drawSky(theme) {
			// clear
				context.clearRect(0, 0, canvas.width, canvas.height)
			
			// draw
				var skyBottom = theme ? theme.skyBottom : colors.white[3]
				var skyTop    = theme ? theme.skyTop    : colors.white[4]
				drawRectangle(    0, 0, canvas.width, canvas.height, {gradient: {x1: 0, y1: 0, x2: 0, y2: canvas.height, colors: {"0": skyBottom, "1": skyTop}}})
		}

	/* drawBackground */
		window.drawBackground = drawBackground
		function drawBackground(map, theme, data, isSample) {
			// variables
				var avatar    = (data && data.heroes && data.heroes[id]) ? data.heroes[id] : (data && data.demons && data.demons[id]) ? data.demons[id] : (data.tracker || {state: {x: 0, y: 0}})
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
							var tower = (data && data.towers) ? data.towers[Math.floor(columnNumber / 64)] : null
						 	drawTower(theme, tower, columnNumber, canvasX, false)
						}
						else {
							var tower = false
						}

					// interactive
						var column = map[columnNumber]
						for (var section in column) {
							// pit
								if (!column[section]) {
								 	drawPit(theme, canvasX, false)
								}

							// terrain & platforms
								else {
									drawSections(map, columnNumber, column, section, canvasX, theme, false)
								}
						}

					// tower letters
						if (tower) {
						 	drawTowerLetters(tower, columnNumber, canvasX, false)
						}
				}

			// arrows
				if (!isSample) {
					for (var a in data.arrows) {
						drawArrow(1280 - ((data.arrows[a].x - startX + mapLength + 20) % mapLength - 20) / 1.6, (data.arrows[a].y / 1.6) + 40, 0.625, data.arrows[a])
					}
				}

			// heroes & demons
				if (!isSample) {
					var keys = Object.keys(data.heroes).concat(Object.keys(data.demons))
					for (var k in keys) {
						var avatar = (data && data.heroes && data.heroes[keys[k]]) ? data.heroes[keys[k]] : (data && data.demons && data.demons[keys[k]]) ? data.demons[keys[k]] : null
						drawAvatar(1280 - ((avatar.state.x - startX + mapLength + 20) % mapLength - 20) / 1.6, (avatar.state.y / 1.6) + 40, 20, 40, avatar)
					}
				}

			// auras
				if (!isSample) {
					for (var a in data.auras) {
						drawAura(1280 - ((data.auras[a].x - 32 - startX + mapLength + 200) % mapLength - 200) / 1.6, (data.auras[a].y / 1.6) + 40, 0.625, data.auras[a])
					}
				}

			// pit
				drawRectangle(0, 0, canvas.width, 40, {color: (theme ? theme.pitBackground : colors.black[2])})
		}

	/* drawForeground */
		window.drawForeground = drawForeground
		function drawForeground(map, theme, data, isSample) {
			// variables
				var towers    = []
				var avatar    = (data && data.heroes && data.heroes[id]) ? data.heroes[id] : (data && data.demons && data.demons[id]) ? data.demons[id] : (data.tracker || {state: {x: 0, y: 0}})
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
							var tower = (data && data.towers) ? data.towers[Math.floor(columnNumber / 64)] : null
							drawTower(theme, tower, columnNumber, canvasX, true)
						}
						else {
							tower = false
						}

					// interactive
						var column = map[columnNumber]
						for (var section in column) {
							// pit
								if (!column[section]) {
									drawPit(theme, canvasX, true)
								}

							// terrain & platforms
								else {
									drawSections(map, columnNumber, column, section, canvasX, theme, true)
								}
						}

					// tower letters
						if (tower) {
							drawTowerLetters(tower, columnNumber, canvasX, true)
						}
				}

			// arrows
				if (!isSample) {
					for (var a in data.arrows) {
						drawArrow((data.arrows[a].x - startX + mapLength + 32) % mapLength - 32, data.arrows[a].y, 1, data.arrows[a])
					}
				}

			// heroes & demons
				if (!isSample) {
					var keys = Object.keys(data.heroes).concat(Object.keys(data.demons))
					for (var k in keys) {
						var avatar = (data && data.heroes && data.heroes[keys[k]]) ? data.heroes[keys[k]] : (data && data.demons && data.demons[keys[k]]) ? data.demons[keys[k]] : null
						drawAvatar((avatar.state.x - startX + mapLength + 32) % mapLength - 32, avatar.state.y, 32, 64, avatar)
					}
				}

			// auras
				if (!isSample) {
					for (var a in data.auras) {
						drawAura((data.auras[a].x - startX + mapLength + 256) % mapLength - 256, data.auras[a].y, 1, data.auras[a])
					}
				}

			// countdown ?
				if (!isSample) {
					if (!data.state.end && data.state.beat <= 128) { // game launch
						drawText(canvas.width / 2, 3 * canvas.height / 4, 8 - Math.floor(data.state.beat / 16)            ,  {color: colors.black[4], size: 64, blur: 8})
					}
					else if (data.state.winning.team && data.state.end) { // game over
						drawText(canvas.width / 2,     canvas.height / 2, (data.state.winning.team.toUpperCase() + " WIN"),  {color: data.state.winning.color, size: 64, blur: 8, shadow: data.state.winning.color})
					}
					else if (data.state.winning.team && data.state.winning.countdown < 256) { // win countdown
						drawText(canvas.width / 2, 3 * canvas.height / 4, Math.ceil(data.state.winning.countdown / 16)    , {color: data.state.winning.color, size: 64})
					}
				}
		}

	/* drawAvatar */
		window.drawAvatar = drawAvatar
		function drawAvatar(x, y, width, height, avatar) {
			// variables
				if (avatar.state) {
					var healthColor = avatar.state.health ? ("rgb(128, " + avatar.state.health + ", 000)") : "rgb(255,255,255)"
					var healthWidth = avatar.state.health ? Math.floor((avatar.state.health + 1) * width / 256) : width
					var opacity     = avatar.state.health ? 1 : 0.25
						opacity     = opacity * (width == 32 ? 1 : 0.25)
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
					drawText(x + (width / 2), y + (5  * height / 4), avatar.name.slice(0,4).toUpperCase() + avatar.name.slice(4), {opacity: opacity, color: avatar.colors[2],     size: (3 * width / 8)})	// name
					drawLine(x              , y + (9  * height / 8), x + healthWidth, y + (9 * height / 8)                      , {opacity: opacity, color: healthColor, blur: 4, shadow: colors.black[2]}) // health bar
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
		window.drawArrow = drawArrow
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
		window.drawAura = drawAura
		function drawAura(x, y, multiplier, aura) {
			// draw
				drawCircle(x, y, aura.radius * multiplier, {opacity: 0.25, color: aura.colors[1], shadow: aura.colors[0], blur: 4, border: 4})
		}

	/* drawPit */
		window.drawPit = drawPit
		function drawPit(theme, canvasX, foreground) {
			// variables
				var multiplier = foreground ? 1 : 0.625
				var yOffset    = foreground ? 0 : 40
				var xOffset    = foreground ? 32 : -32
				var pitColor   = foreground ? (theme ? theme.pitForeground : colors.black[2]) : (theme ? theme.pitBackground : colors.black[1])
				var x1         = foreground ? ((canvasX          ) * multiplier) : 1280 - ((canvasX          ) * multiplier)
				var x2         = foreground ? ((canvasX + xOffset) * multiplier) : 1280 - ((canvasX + xOffset) * multiplier)

			// draw
				drawRectangle(Math.round(x1), yOffset, 32 * multiplier, 16 * multiplier, {color: pitColor})
		}

	/* drawSections */
		window.drawSections = drawSections
		function drawSections(map, columnNumber, column, section, canvasX, theme, foreground) {
			// variables
				var terrainColor  = foreground ? (theme ? theme.terrainForeground  : colors.black[4]) : (theme ? theme.terrainBackground  : colors.black[3])
				var platformColor = foreground ? (theme ? theme.platformForeground : colors.black[4]) : (theme ? theme.platformBackground : colors.black[3])
				var multiplier    = foreground ? 1 : 0.625
				var xPlacement    = foreground ? (canvasX * multiplier) : 1280 - (canvasX * multiplier)
				var yOffset       = foreground ? 0 : 40
				var height        = 32 * multiplier

			for (var y = 0; y < 16; y++) {
				if (y >= column[section].bottom && y <= column[section].top) {
					if (section > 0) { // platforms
						drawRectangle(Math.round(xPlacement), ((y + 1) * height) - (8 * multiplier) + yOffset, height, 8 * multiplier,
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

						drawRectangle(Math.round(xPlacement), (y * height) + yOffset, height, height,
							{color: terrainColor, radii: {topLeft: tl, topRight: tr, bottomRight: 0, bottomLeft: 0}}
						)
					}
					else { // terrain
						drawRectangle(Math.round(xPlacement), (y * height) + yOffset, height, height, {color: terrainColor})
					}
				}
			}
		}

	/* drawTower */
		window.drawTower = drawTower
		function drawTower(theme, tower, columnNumber, canvasX, foreground) {
			// variables
				var multiplier  = foreground ? 1 : 0.625
				var yOffset     = foreground ? 0 : 40
				var xOffset     = foreground ? 0 : -1 * (60 * multiplier)
				var xPlacement  = foreground ? (canvasX * multiplier) : 1280 - (canvasX * multiplier)
				var towerColor  = foreground ? (theme ? theme.towerForeground : colors.black[2]) : (theme ? theme.towerBackground : colors.black[1])
				var centerDelta = foreground ? (2 - (columnNumber % 64)) * (32 * multiplier) : ((columnNumber % 64) - 1) * (32 * multiplier) * -1
				var flagColor   = tower ? tower.colors[2] : colors.black[0]

			// background
				if (columnNumber % 64 == 0) {
					drawRectangle(Math.round(xPlacement), yOffset, (32 * multiplier), (32 * multiplier) * 13,
						{color: towerColor, radii: {topLeft: foreground ? (8 * multiplier) : 0, topRight: foreground ? 0 : (8 * multiplier), bottomRight: 0, bottomLeft: 0}}
					)
				}
				else if (columnNumber % 64 == 1) {
					drawRectangle(Math.round(xPlacement), yOffset, (32 * multiplier), (32 * multiplier) * 14,
						{color: towerColor, radii: {topLeft: foreground ? (8 * multiplier) : 0, topRight: foreground ? 0 : (8 * multiplier), bottomRight: 0, bottomLeft: 0}}
					)
				}
				else if (columnNumber % 64 == 2) {
					drawRectangle(Math.round(xPlacement), yOffset, (32 * multiplier), (32 * multiplier) * 14,
						{color: towerColor, radii: {topLeft: foreground ? 0 : (8 * multiplier), topRight: foreground ? (8 * multiplier) : 0, bottomRight: 0, bottomLeft: 0}}
					)
				}
				else if (columnNumber % 64 == 3) {
					drawRectangle(Math.round(xPlacement), yOffset, (32 * multiplier), (32 * multiplier) * 13,
						{color: towerColor, radii: {topLeft: foreground ? 0 : (8 * multiplier), topRight: foreground ? (8 * multiplier) : 0, bottomRight: 0, bottomLeft: 0}}
					)
				}

			// name & flag
				xPlacement = foreground ? (canvasX * multiplier) + centerDelta : 1280 - ((canvasX * multiplier) + centerDelta)

				drawLine(     xPlacement          , (32 * multiplier * 14)                     + yOffset,        xPlacement, (32 * multiplier * 16) + yOffset, {color:  flagColor, shadow: flagColor, blur: 1})
				drawRectangle(xPlacement + xOffset, (32 * multiplier * 14) + (20 * multiplier) + yOffset, (60 * multiplier), (40 * multiplier)               , {color:  flagColor, shadow: flagColor, blur: 2, radii: {topLeft: 4, topRight: 4, bottomRight: 4, bottomLeft: 4}})
				if (tower) {
					drawText(     xPlacement + xOffset + (30 * multiplier), (32 * multiplier * 14) + (35 * multiplier) + yOffset,                      tower.name, {color:  colors.white[4], size:   10 * multiplier})
				}
		}

	/* drawTowerLetters */
		window.drawTowerLetters = drawTowerLetters
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
					color:  platform.color,
					style: "bold"
				})

			// low platform
				var platform = tower.platforms[columnNumber % 64 + 4]
				drawText(xPlacement, (platform.y * 32 * multiplier) + (4 * multiplier) + yOffset, platform.note, {
					size:   32 * multiplier,
					color:  platform.color,
					style: "bold"
				})
		}
