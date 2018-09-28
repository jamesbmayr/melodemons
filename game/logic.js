/*** modules ***/
	var main = require("../main/logic")
	module.exports = {}

/*** players ***/
	/* addPlayer */
		module.exports.addPlayer = addPlayer
		function addPlayer(request, callback) {
			try {
				if (!request.game) {
					callback([request.session.id], {success: false, message: "unable to find game"})
				}
				else if (!request.game.players[request.session.id]) {
					callback([request.session.id], {success: false, message: "unable to find player in game"})
				}
				else {
					// save connection
						request.game.players[request.session.id].connected  = true
						request.game.players[request.session.id].connection = request.connection
					callback([request.session.id], {success: true, message: "connected", data: request.game.data})
				}
			}
			catch (error) {
				main.logError(error)
				callback([request.session.id], {success: false, message: "unable to add player"})
			}
		}

	/* removePlayer */
		module.exports.removePlayer = removePlayer
		function removePlayer(request, callback) {
			try {
				main.logStatus("[CLOSED]: " + request.path.join("/") + " @ " + (request.ip || "?"))
				if (request.game) {

					// remove player or connection?
						if (request.game.data.state.start) {
							request.game.players[request.session.id].connected = false
						}
						else {
							delete request.game.players[request.session.id]
						}

					// delete game ?
						var others = Object.keys(request.game.players).filter(function (p) {
							return request.game.players[p].connected
						}) || []

						if (!others.length) {
							callback([], {success: true, delete: true})
						}
					
					// still players
						else {
							callback(Object.keys(request.game.players), {success: true, data: request.game.data})
						}
				}
			}
			catch (error) {
				main.logError(error)
				callback([request.session.id], {success: false, message: "unable to remove player"})
			}
		}

/*** submits ***/
	/* submitArrow */
		module.exports.submitArrow = submitArrow
		function submitArrow (request, callback) {
			try {
				if (!request.game.data.state.start) {
					if (request.post.press) {
						changeSelection(request, callback)
					}
				}
				else {
					triggerMove(request, callback)
				}
			}
			catch (error) {
				main.logError(error)
				callback([request.session.id], {success: false, message: "unable to submit arrow"})
			}
		}

	/* submitNote */
		module.exports.submitNote = submitNote
		function submitNote (request, callback) {
			try {
				if (!request.game.data.state.start) {
					var instrument = request.game.data.heroes[request.session.id] ? request.game.data.heroes[request.session.id].instrument : request.game.players[request.session.id].admin ? request.game.data.demons[0].instrument : "triangle"
					callback(Object.keys(request.game.players), {success: true, press: request.post.press, note: request.post.key, instrument: instrument})
				}
				else {
					triggerNote(request, callback)
				}
			}
			catch (error) {
				main.logError(error)
				callback([request.session.id], {success: false, message: "unable to submit note"})
			}
		}

	/* submitNumber */
		module.exports.submitNumber = submitNumber
		function submitNumber (request, callback) {
			try {
				if (!request.game.data.state.start) {
					//
				}
				else {
					triggerNumber(request, callback)
				}
			}
			catch (error) {
				main.logError(error)
				callback([request.session.id], {success: false, message: "unable to submit number"})
			}
		}

/*** menu ***/
	/* changeSelection */
		module.exports.changeSelection = changeSelection
		function changeSelection(request, callback) {
			try {
				var player = request.game.players[request.session.id] || {}

				if (player.admin) {
					// get themes
						var themes = main.getAsset("themes")

					// set theme
						if (!request.game.data.theme) {
							if (request.post.key == "up") {
								player.selection = Math.max(0, player.selection - 1)
								callback([request.session.id], {success: true, selection: player.selection})
							}
							else if (request.post.key == "down") {
								player.selection = Math.min(themes.length - 1, player.selection + 1)
								callback([request.session.id], {success: true, selection: player.selection})
							}
							else if (request.post.key == "right") {
								request.game.data.theme = themes[player.selection]
								callback([request.session.id], {success: true, selection: player.selection})
							}
						}

					// start game ?
						else {
							if (request.post.key == "left") {
								request.game.data.theme = null
								callback([request.session.id], {success: true, selection: player.selection})
							}
							else if (request.post.key == "right") {
								launchGame(request, callback)
							}
						}
				}
				else {
					// get heroes
						var heroes = main.getAsset("heroes")

					// set hero
						if (!request.game.data.heroes[request.session.id]) {
							if (request.post.key == "up") {
								player.selection = Math.max(0, player.selection - 1)
							}
							else if (request.post.key == "down") {
								player.selection = Math.min(heroes.length - 1, player.selection + 1)
							}
							else if (request.post.key == "right") {
								var hero = createHero(request, heroes[player.selection])
								if (!hero) {
									callback([request.session.id], {success: false, message: "hero already taken"})
								}
								else {
									request.game.data.heroes[request.session.id] = heroes[player.selection]
								}
							}
						}

					// unset hero
						else {
							if (request.post.key == "left") {
								request.game.data.heroes[request.session.id] = null
								callback([request.session.id], {success: true, selection: player.selection})
							}
						}	
				}
			}
			catch (error) {
				main.logError(error)
				callback([request.session.id], {success: false, message: "unable to change selection"})
			}
		}

	/* launchGame */
		module.exports.launchGame = launchGame
		function launchGame(request, callback) {
			try {
				var players = Object.keys(request.game.players)

				// errors
					if (request.game.data.state.start) {
						callback([request.session.id], {success: false, message: "game already started"})
					}
					else if (players.length < 2) {
						callback([request.session.id], {success: false, message: "game requires 2 players"})
					}
					else if (players.length > 6) {
						callback([request.session.id], {success: false, message: "game cannot exceed 6 players"})
					}
					else if (players.filter(function(p) { return (!request.game.players[p].admin && !request.game.data.heroes[p]) }).length) {
						callback([request.session.id], {success: false, message: "some players have not selected a hero"})	
					}

				// begin
					else {
						// demons
							while (request.game.data.demons.length < players.length) {
								request.game.data.demons.push(createDemon(request))
							}

						// towers
							while (request.game.data.towers.length < players.length + 1) {
								request.game.data.towers.push(createTower(request))
							}

						// map
							while (request.game.data.map.length < (players.length + 1) * 64) {
								request.game.data.map.push(createColumn(request))
							}

						// heroes & demons - positions
							var keys = Object.keys(request.game.data.heroes).concat(Object.keys(request.game.data.demons))
							for (var k in keys) {
								var avatar = (keys[k] > -1) ? request.game.data.demons[keys[k]] : request.game.data.heroes[keys[k]]
								createStartPosition(request, avatar)
							}
		
						// start game
							request.game.data.state.start = new Date().getTime() + 3000
							callback(players, {success: true, message: "starting game..."})
					}
			}
			catch (error) {
				main.logError(error)
				callback([request.session.id], {success: false, message: "unable to start game"})
			}
		}

/*** creates ***/
	/* createHero */
		module.exports.createHero = createHero
		function createHero(request, hero) {
			try {
				// get existing heroes
					var currentKeys = Object.keys(request.game.data.heroes)
					var currentHeroes = []
					for (var k in currentKeys) {
						if (request.game.data.heroes[currentKeys[k]]) {
							currentHeroes.push(request.game.data.heroes[currentKeys[k]].name)
						}
					}

					if (currentHeroes.includes(hero.name)) {
						hero = null
					}

				// set hero state
					else {
						hero.state = main.getAsset("state")
					}

				return hero
			}
			catch (error) {main.logError(error)}
		}

	/* createDemon */
		module.exports.createDemon = createDemon
		function createDemon(request) {
			try {
				// get existing demons
					var currentDemons = request.game.data.demons.map(function(d) {
						return d.name
					})
					var allDemons = main.getAsset("demons")
						allDemons = allDemons.filter(function(d) {
							return !currentDemons.includes(d.name)
						})

				// create demon
					var demon = main.chooseRandom(allDemons)
						demon.state = main.getAsset("state")

				// unselect subsequent demons
					if (currentDemons.length) {
						demon.state.selected = false
					}

				return demon
			}
			catch (error) {main.logError(error)}
		}

	/* createTower */
		module.exports.createTower = createTower
		function createTower(request) {
			try {
				// get existing towers
					var currentTowers = request.game.data.towers.map(function(t) {
						return t.name
					})
					var allTowers = main.getAsset("towers")
						allTowers = allTowers.filter(function(t) {
							return !currentTowers.includes(t.name)
						})

				// create tower
					var tower = main.chooseRandom(allTowers)

				// set team
					var players = Object.keys(request.game.players)
					if (currentTowers.length == 0) {
						tower.team = "heroes"
						tower.platforms.forEach(function(p) {
							p.team = "heroes"
						})
					}
					else if (currentTowers.length == Math.floor(players.length / 2) + 1) {
						tower.team = "demons"
						tower.platforms.forEach(function(p) {
							p.team = "demons"
						})
					}
					else {
						tower.team = null
						tower.platforms.forEach(function(p) {
							p.team = null
						})
					}

				return tower
			}
			catch (error) {main.logError(error)}
		}

	/* createColumn */
		module.exports.createColumn = createColumn
		function createColumn(request) {
			// variables
				var map    = request.game.data.map
				var random = Math.floor(Math.random() * 20)
				var column = null

			// previous columns
				var lastColumn = map.length ? main.duplicateObject(map[map.length - 1]) : null
				var lastFullColumn = null
				var lastX = map.length - 1
				while (!lastFullColumn && lastX > -1) {
					if (map[lastX][0]) {
						lastFullColumn = main.duplicateObject(map[lastX])
					}
					else {
						lastX--
					}
				}

			// starting terrain
				if (map.length % 64 < 4) { // tower
					column = [{bottom: 0, top: Math.floor(Math.random() * 3) + 1}]
				}

			// random terrain
				else if (random < 10) { // 50% chance of continuation
					if (map.length - 1 - lastX >= 3) { // pits can only be 4 wide
						column = [lastFullColumn[0]]
					}
					else {
						column = [lastColumn[0]]
					}
				}
				else if (random < 12) { // 10% chance of pit
					if (map.length - 1 - lastX >= 3) { // pits can only be 4 wide
						column = [lastFullColumn[0]]
					}
					else {
						column = [null]
					}
				}
				else if (random < 13) { // 5% chance of 3 down
					column = lastColumn[0] ? [lastColumn[0]] : [lastFullColumn[0]]
					column[0].top -= 3
				}
				else if (random < 14) { // 5% chance of 2 down
					column = lastColumn[0] ? [lastColumn[0]] : [lastFullColumn[0]]
					column[0].top -= 2
				}
				else if (random < 16) { // 10% chance of 1 down
					column = lastColumn[0] ? [lastColumn[0]] : [lastFullColumn[0]]
					column[0].top -= 1
				}
				else if (random < 18) { // 10% chance of 1 up
					column = lastColumn[0] ? [lastColumn[0]] : [lastFullColumn[0]]
					column[0].top += 1
				}
				else if (random < 19) { // 5% chance of 2 up
					column = lastColumn[0] ? [lastColumn[0]] : [lastFullColumn[0]]
					column[0].top += 2
				}
				else if (random < 20) { // 5% chance of 3 up
					column = lastColumn[0] ? [lastColumn[0]] : [lastFullColumn[0]]
					column[0].top += 3
				}

			// ensure boundaries
				if (column[0]) {
					column[0].top = Math.max(0, Math.min(9, column[0].top))
				}

			// tower
				if ([62,63,4,5].includes(map.length % 64)) { // columns around tower
					if (column[0]) { 
						column[0].top = Math.max(0, Math.min(4, column[0].top))
					}
				}
				else if ([0,1,2,3].includes(map.length % 64)) { // first 4 columns
					if (column[0]) { 
						column[0].top = Math.max(0, Math.min(3, column[0].top))
					}

					var tower = request.game.data.towers[Math.floor(map.length / 64)]
					var towerX = map.length % 64

					column[1] = {bottom: tower.platforms[towerX    ].y, top: tower.platforms[towerX    ].y, note: tower.platforms[towerX    ].note, team: tower.platforms[towerX    ].team}
					column[2] = {bottom: tower.platforms[towerX + 4].y, top: tower.platforms[towerX + 4].y, note: tower.platforms[towerX + 4].note, team: tower.platforms[towerX + 4].team}
				}

			// obstacle
				else if (map.length % 64 >= 27 && map.length % 64 < 41) { // middle 12 columns
					var obstacleX = (map.length % 64)
					if      ([27,40].includes(obstacleX)) { // space around spaces
						column[0] = {bottom: 0, top: Math.max(0, Math.min(6, column[0] ? column[0].top : 5))}
					}
					else if ([28,39].includes(obstacleX)) { // space around spaces
						column[0] = {bottom: 0, top: Math.max(0, Math.min(4, column[0] ? column[0].top : 4))}
					}
					else if ([29,38].includes(obstacleX)) { // space around edges
						column[0] = {bottom: 0, top: Math.max(0, Math.min(4, column[0] ? column[0].top : 4))}
					}
					else if ([30,37].includes(obstacleX)) { // space around edges
						column[0] = {bottom: 0, top: Math.max(0, Math.min(3, column[0] ? column[0].top : 3))}
					}
					else if ([31,36].includes(obstacleX)) { // space around edges
						column[0] = {bottom: 0, top: Math.max(0, Math.min(3, column[0] ? column[0].top : 3))}
					}
					else if ([32,35].includes(obstacleX)) { // obstacle
						column[0] = {bottom: 0, top: Math.max(2, Math.min(3, column[0] ? column[0].top : 3))}
						column[1] = {bottom: column[0].top + 5, top: column[0].top + 5}
					}
					else if ([33,34].includes(obstacleX)) { // obstacle
						column[0] = {bottom: 0, top: Math.max(2, Math.min(3, column[0] ? column[0].top : 3))}
						column[1] = {bottom: column[0].top + 5, top: column[0].top + 6}
					}
				}

			return column
		}

	/* createStartPosition */
		module.exports.createStartPosition = createStartPosition
		function createStartPosition(request, avatar) {
			try {
				// heroes
					if (avatar.team == "heroes") {
						var tower = request.game.data.towers[0]
						var keys  = Object.keys(request.game.data.heroes)

						do {
							var platform   = main.chooseRandom(tower.platforms)
							avatar.state.x =  platform.x      * 32
							avatar.state.y = (platform.y + 1) * 32 + 16
						}
						while (keys.find(function(k) {
							return ((request.game.data.heroes[k].name    != avatar.name)
								 && (request.game.data.heroes[k].state.x == avatar.state.x)
								 && (request.game.data.heroes[k].state.y == avatar.state.y))
						}))
					}

				// demons
					else {
						var towerNumber = Math.floor(Object.keys(request.game.players).length / 2) + 1
						var tower       = request.game.data.towers[towerNumber]

						do {
							var platform   = main.chooseRandom(tower.platforms)
							avatar.state.x = towerNumber * 64 * 32 + platform.x      * 32
							avatar.state.y =                        (platform.y + 1) * 32 + 16
						}
						while (request.game.data.demons.find(function(d) {
							return ((d.name    != avatar.name)
								 && (d.state.x == avatar.state.x)
								 && (d.state.y == avatar.state.y))
						}))
					}

				// set tower
					avatar.state.tower = {
						name: tower.name,
						platforms: [main.duplicateObject(platform)]
					}

				// set cells
					var cells = getCells(request.game.data.map.length, avatar.state.x, avatar.state.y, 32, 64)
						avatar.state.colLeft  = cells.colLeft
						avatar.state.colRight = cells.colRight
						avatar.state.rowUp    = cells.rowUp
						avatar.state.rowDown  = cells.rowDown
			}
			catch (error) {main.logError(error)}
		}

	/* createAura */
		module.exports.createAura = createAura
		function createAura(request) {

		}

	/* createArrow */
		module.exports.createArrow = createArrow
		function createArrow(request, avatar) {
			try {
				var mapLength = request.game.data.map.length * 32
				var arrow           = main.getAsset("arrow")
					arrow.x         = ((avatar.state.facing == "left" ? avatar.state.x : avatar.state.x + 32) + mapLength) % mapLength
					arrow.vx        =   avatar.state.facing == "left" ? -16 : 16
					arrow.y         = avatar.state.y + 32
					arrow.vy        = 0
					arrow.name      = avatar.name
					arrow.team      = avatar.team
					arrow.colors[0] = avatar.colors[0]
					arrow.colors[1] = avatar.colors[1]

				return arrow
			}
			catch (error) {main.logError(error)}
		}

/*** triggers ***/
	/* triggerMove */
		module.exports.triggerMove = triggerMove
		function triggerMove(request, callback) {
			try {
				var avatar = getAvatar(request)

				if (!avatar) {
					callback({success: false, message: "no avatar selected"})
				}
				else {
					avatar.state[request.post.key] = request.post.press
					
					if (request.post.key == "up" && !request.post.press) {
						avatar.state.jumpable = false
					}
					else if (request.post.press && ["left","right"].includes(request.post.key)) {
						avatar.state.facing = request.post.key
					}
				}
			}
			catch (error) {main.logError(error)}
		}

	/* triggerNote */
		module.exports.triggerNote = triggerNote
		function triggerNote(request, callback) {
			try {
				var avatar = getAvatar(request)

				if (!avatar) {
					callback({success: false, message: "no avatar selected"})
				}
				else if (request.post.press && !avatar.state.keys[avatar.state.keys.length - 1].includes(request.post.key)) {
					avatar.state.keys[avatar.state.keys.length - 1].push(request.post.key)
				}
			}
			catch (error) {main.logError(error)}
		}

	/* triggerNumber */
		module.exports.triggerNumber = triggerNumber
		function triggerNumber(request, callback) {
			try {
				var avatar = getAvatar(request)

				if (!avatar.team == "demons") {
					callback([request.session.id], {success: false, message: "not demons"})
				}
				else if (!request.game.data.demons[request.post.key - 1]) {
					callback([request.session.id], {success: false, message: "demon not found"})
				}
				else {
					for (var d in request.game.data.demons) {
						request.game.data.demons[d].state.selected = false
					}

					request.game.data.demons[request.post.key - 1].state.selected = true
				}
			}
			catch (error) {main.logError(error)}
		}

/*** gets ***/
	/* getAngle */
		module.exports.getAngle = getAngle
		function getAngle(x, y) {
			try {
				return Math.atan(y / x)
			}
			catch (error) {main.logError(error)}
		}

	/* getScalar */
		module.exports.getScalar = getScalar
		function getScalar(x, y) {
			try {
				return Math.pow(Math.pow(x, 2) + Math.pow(y, 2), 0.5)
			}
			catch (error) {main.logError(error)}
		}

	/* getCells */
		module.exports.getCells = getCells
		function getCells(columnCount, x, y, width, height) {
			try {
				return {
					colLeft:  (Math.floor( x           / 32) + columnCount) % columnCount,
					colRight: (Math.floor((x + width)  / 32) + columnCount) % columnCount,
					rowDown:   Math.floor( y           / 32),
					rowUp:     Math.floor((y + height - 1) / 32)
				}
			}
			catch (error) {main.logError(error)}
		}

	/* getAvatar */
		module.exports.getAvatar = getAvatar
		function getAvatar(request) {
			try {
				// demons
					if (request.game.players[request.session.id].admin) {
						return request.game.data.demons.find(function(d) {
							return d.state.selected
						}) || request.game.data.demons[0]
					}

				// heroes
					else {
						return request.game.data.heroes[request.session.id] || null
					}
			}
			catch (error) {main.logError(error)}
		}

	/* getTower */
		module.exports.getTower = getTower
		function getTower(request, avatar) {
			try {
				// blank data
					var touchedTower = {
						name: null,
						platforms: []
					}
					
				// left side
					if (avatar.state.colLeft  % 64 < 4) {
						var tower = request.game.data.towers[Math.floor(avatar.state.colLeft  / 64)]
						if      (tower.platforms[avatar.state.colLeft  % 64    ].y == avatar.state.rowDown - 1) {
							touchedTower.name = tower.name
							touchedTower.platforms.push(main.duplicateObject(tower.platforms[avatar.state.colLeft  % 64    ]))
						}
						else if (tower.platforms[avatar.state.colLeft  % 64 + 4].y == avatar.state.rowDown - 1) {
							touchedTower.name = tower.name
							touchedTower.platforms.push(main.duplicateObject(tower.platforms[avatar.state.colLeft  % 64 + 4]))
						}
					}

				// right side
					if (avatar.state.colRight % 64 < 4) {
						var tower = request.game.data.towers[Math.floor(avatar.state.colRight / 64)]
						if      (tower.platforms[avatar.state.colRight % 64    ].y == avatar.state.rowDown - 1) {
							touchedTower.name = tower.name
							touchedTower.platforms.push(main.duplicateObject(tower.platforms[avatar.state.colRight % 64    ]))
						}
						else if (tower.platforms[avatar.state.colRight % 64 + 4].y == avatar.state.rowDown - 1) {
							touchedTower.name = tower.name
							touchedTower.platforms.push(main.duplicateObject(tower.platforms[avatar.state.colRight % 64 + 4]))
						}
					}

				// data ?
					if (touchedTower.name) {
						return touchedTower
					}
					else {
						return null
					}
			}
			catch (error) {main.logError(error)}
		}

/* updates */
	/* updateState */
		module.exports.updateState = updateState
		function updateState(request, callback) {
			try {
				// menu
					if (!request.game.data.state.start) {
						callback(Object.keys(request.game.players), request.game.data)
					}

				// gameplay
					else {
						// beat
							request.game.data.state.beat++

						// map
							var map     = request.game.data.map
							var towers  = request.game.data.towers
							var arrows  = request.game.data.arrows
							var auras   = request.game.data.auras

						// heroes & demons
							var keys = Object.keys(request.game.data.heroes).concat(Object.keys(request.game.data.demons))
							for (var k in keys) {
								var avatar = (keys[k] > -1) ? request.game.data.demons[keys[k]] : request.game.data.heroes[keys[k]]
								updateVelocity(  request, avatar)
								updateCollisions(request, avatar)
							}

							for (var k in keys) {
								var avatar = (keys[k] > -1) ? request.game.data.demons[keys[k]] : request.game.data.heroes[keys[k]]
								updatePosition(  request, avatar)
								updateHealth(    request, avatar)
								updateTower(     request, avatar)
								updateArrows(    request, avatar)

								if (request.game.data.state.beat % 8 == 0) {
									updateKeys(  request, avatar)
								}
							}

						callback(Object.keys(request.game.players), request.game.data)
					}
			}
			catch (error) {main.logError(error)}
		}

	/* updateVelocity */
		module.exports.updateVelocity = updateVelocity
		function updateVelocity(request, avatar) {
			try {
				// adjust vx
					if (avatar.state.left && avatar.state.right && avatar.state.selected) {
						avatar.state.vx = Math.max(-10, Math.min(10, avatar.state.vx))
					}
					else if (avatar.state.left && avatar.state.selected) {
						avatar.state.vx = Math.max(-10, Math.min(10, avatar.state.vx - 1))
					}
					else if (avatar.state.right && avatar.state.selected) {
						avatar.state.vx = Math.max(-10, Math.min(10, avatar.state.vx + 1))
					}
					else {
						avatar.state.vx = Math.max(-10, Math.min(10, Math.sign(avatar.state.vx) * (Math.abs(avatar.state.vx) - 1)))
					}

				// adjust vy
					if (avatar.state.up && avatar.state.selected && (avatar.state.jumpable || !avatar.state.health) && avatar.state.y < 544) {
						avatar.state.vy = Math.max(-24, Math.min(24, avatar.state.vy + 8))

						if (avatar.state.vy > 16) {
							avatar.state.jumpable = false
						}
					}
					else {
						avatar.state.vy = Math.max(-24, Math.min(24, avatar.state.vy - 4))
						avatar.state.jumpable = false
					}
			}
			catch (error) {main.logError(error)}
		}

	/* updatePosition */
		module.exports.updatePosition = updatePosition
		function updatePosition(request, avatar) {
			try {
				// adjust x & y
					var map            = request.game.data.map
					var mapLength      = map.length * 32
						avatar.state.x = (avatar.state.x + avatar.state.vx + mapLength) % mapLength
						avatar.state.y = Math.min(576, Math.max(-32, avatar.state.y + avatar.state.vy))
					var future         = getCells(map.length, avatar.state.x, avatar.state.y, 32, 64)

				// terrain collision - changing rows
					if (avatar.state.rowDown != future.rowDown || avatar.state.rowUp != future.rowUp) {
						// collision down
							if ((avatar.state.vy <= 0)   && !(avatar.state.down && avatar.state.selected && avatar.state.tower) &&
							   ((map[future.colLeft ][0] && future.rowDown <= map[future.colLeft ][0].top)
							 || (map[future.colRight][0] && future.rowDown <= map[future.colRight][0].top)
							 || (map[future.colLeft ][1] && future.rowDown <= map[future.colLeft ][1].top && future.rowUp >= map[future.colLeft ][1].top)
							 || (map[future.colRight][1] && future.rowDown <= map[future.colRight][1].top && future.rowUp >= map[future.colRight][1].top)
							 || (map[future.colLeft ][2] && future.rowDown <= map[future.colLeft ][2].top && future.rowUp >= map[future.colLeft ][2].top)
							 || (map[future.colRight][2] && future.rowDown <= map[future.colRight][2].top && future.rowUp >= map[future.colRight][2].top))) {
								future.rowDown    = future.rowDown + 1
								future.rowUp      = future.rowUp   + 1
								var collisionDown = true
							}
							else {
								avatar.state.surface = false
							}

						// collision up
							if ((avatar.state.vy > 0) &&
							   ((map[future.colLeft ][1] && !map[future.colLeft ][1].note && future.rowUp >= map[future.colLeft ][1].bottom && future.rowDown <= map[future.colLeft ][1].bottom)
							 || (map[future.colRight][1] && !map[future.colRight][1].note && future.rowUp >= map[future.colRight][1].bottom && future.rowDown <= map[future.colRight][1].bottom)
							 || (map[future.colLeft ][2] && !map[future.colLeft ][2].note && future.rowUp >= map[future.colLeft ][2].bottom && future.rowDown <= map[future.colLeft ][2].bottom)
							 || (map[future.colRight][2] && !map[future.colRight][2].note && future.rowUp >= map[future.colRight][2].bottom && future.rowDown <= map[future.colRight][2].bottom))) {
								future.rowDown  = future.rowDown - 1
								future.rowUp    = future.rowUp   - 1
								avatar.state.y  = Math.min(576, Math.max(-32, avatar.state.y - 2))
								avatar.state.vy = Math.max(-24, Math.min(0, avatar.state.vy))
							}
					}

				// terrain collision - changing columns
					if (avatar.state.colLeft != future.colLeft || avatar.state.colRight != future.colRight) {
						// collision left
							if      ((map[future.colLeft ][0] &&                                                         future.rowUp   >= map[future.colLeft ][0].bottom && future.rowUp   <= map[future.colLeft ][0].top)
							      || (map[future.colLeft ][0] &&                                                         future.rowDown >= map[future.colLeft ][0].bottom && future.rowDown <= map[future.colLeft ][0].top)
							      || (map[future.colLeft ][1] && !map[future.colLeft ][1].note && avatar.state.health && future.rowUp   >= map[future.colLeft ][1].bottom && future.rowUp   <= map[future.colLeft ][1].top)
							      || (map[future.colLeft ][1] && !map[future.colLeft ][1].note && avatar.state.health && future.rowDown >= map[future.colLeft ][1].bottom && future.rowDown <= map[future.colLeft ][1].top)
							      || (map[future.colLeft ][2] && !map[future.colLeft ][2].note && avatar.state.health && future.rowUp   >= map[future.colLeft ][2].bottom && future.rowUp   <= map[future.colLeft ][2].top)
							      || (map[future.colLeft ][2] && !map[future.colLeft ][2].note && avatar.state.health && future.rowDown >= map[future.colLeft ][2].bottom && future.rowDown <= map[future.colLeft ][2].top)) {
								future.colLeft  = (future.colLeft  + 1       + map.length) % map.length
								future.colRight = (future.colRight + 1       + map.length) % map.length
								avatar.state.x  = ((future.colLeft * 32 + 8) + mapLength ) % mapLength
								avatar.state.vx = Math.max(0, avatar.state.vx)
							}

						// collision right
							else if ((map[future.colRight][0] &&                                                         future.rowUp   >= map[future.colRight][0].bottom && future.rowUp   <= map[future.colRight][0].top)
							      || (map[future.colRight][0] &&                                                         future.rowDown >= map[future.colRight][0].bottom && future.rowDown <= map[future.colRight][0].top)
							      || (map[future.colRight][1] && !map[future.colRight][1].note && avatar.state.health && future.rowUp   >= map[future.colRight][1].bottom && future.rowUp   <= map[future.colRight][1].top)
							      || (map[future.colRight][1] && !map[future.colRight][1].note && avatar.state.health && future.rowDown >= map[future.colRight][1].bottom && future.rowDown <= map[future.colRight][1].top)
							      || (map[future.colRight][2] && !map[future.colRight][2].note && avatar.state.health && future.rowUp   >= map[future.colRight][2].bottom && future.rowUp   <= map[future.colRight][2].top)
							      || (map[future.colRight][2] && !map[future.colRight][2].note && avatar.state.health && future.rowDown >= map[future.colRight][2].bottom && future.rowDown <= map[future.colRight][2].top)) {
								future.colLeft  =  (future.colLeft  - 1       + map.length) % map.length
								future.colRight =  (future.colRight - 1       + map.length) % map.length
								avatar.state.x  = ((future.colRight * 32 - 8) + mapLength ) % mapLength
								avatar.state.vx = Math.min(0, avatar.state.vx)
							}
					}

				// check collisionDown again (to avoid hitting the "surface" inside a wall)
					if (collisionDown) {
						// terrain
							if      ((map[future.colLeft ][0] && future.rowDown - 1 <= map[future.colLeft ][0].top)
							      || (map[future.colRight][0] && future.rowDown - 1 <= map[future.colRight][0].top)) {
								avatar.state.vy = 0
								avatar.state.y  = Math.min(576, Math.max(-32, future.rowDown * 32))
								avatar.state.jumpable = true
								avatar.state.surface  = true
							}

						// obstacles
							else if ((map[future.colLeft ][1] && !map[future.colLeft ][1].note && future.rowDown - 1 <= map[future.colLeft ][1].top && future.rowDown - 1 >= map[future.colLeft ][1].bottom)
							      || (map[future.colRight][1] && !map[future.colRight][1].note && future.rowDown - 1 <= map[future.colRight][1].top && future.rowDown - 1 >= map[future.colRight][1].bottom)) {
								avatar.state.vy = 0
								avatar.state.y  = Math.min(576, Math.max(-32, future.rowDown * 32))
								avatar.state.jumpable = true
								avatar.state.surface  = true
							}

						// tower platforms
							else if (map[future.colLeft ][1] && map[future.colLeft ][1].note && avatar.state.y <= (map[future.colLeft ][1].top + 1) * 32 && (avatar.state.y - avatar.state.vy >= (map[future.colLeft ][1].top + 1) * 32)) {
								avatar.state.vy = 0
								avatar.state.y  = Math.min(576, Math.max(-32, (map[future.colLeft ][1].top + 1) * 32))
								avatar.state.jumpable = true
								avatar.state.surface  = true
								future.rowDown = Math.floor( avatar.state.y / 32)
								future.rowUp   = Math.floor((avatar.state.y + 63) / 32)
							}
							else if (map[future.colRight][1] && map[future.colRight][1].note && avatar.state.y <= (map[future.colRight][1].top + 1) * 32 && (avatar.state.y - avatar.state.vy >= (map[future.colRight][1].top + 1) * 32)) {
								avatar.state.vy = 0
								avatar.state.y  = Math.min(576, Math.max(-32, (map[future.colRight][1].top + 1) * 32))
								avatar.state.jumpable = true
								avatar.state.surface  = true
								future.rowDown = Math.floor( avatar.state.y / 32)
								future.rowUp   = Math.floor((avatar.state.y + 63) / 32)
							}
							else if (map[future.colLeft ][2] && map[future.colLeft ][1].note && avatar.state.y <= (map[future.colLeft ][2].top + 1) * 32 && (avatar.state.y - avatar.state.vy >= (map[future.colLeft ][2].top + 1) * 32)) {
								avatar.state.vy = 0
								avatar.state.y  = Math.min(576, Math.max(-32, (map[future.colLeft ][2].top + 1) * 32))
								avatar.state.jumpable = true
								avatar.state.surface  = true
								future.rowDown = Math.floor( avatar.state.y / 32)
								future.rowUp   = Math.floor((avatar.state.y + 63) / 32)
							}
							else if (map[future.colRight][2] && map[future.colRight][1].note && avatar.state.y <= (map[future.colRight][2].top + 1) * 32 && (avatar.state.y - avatar.state.vy >= (map[future.colRight][2].top + 1) * 32)) {
								avatar.state.vy = 0
								avatar.state.y  = Math.min(576, Math.max(-32, (map[future.colRight][2].top + 1) * 32))
								avatar.state.jumpable = true
								avatar.state.surface  = true
								future.rowDown = Math.floor( avatar.state.y / 32)
								future.rowUp   = Math.floor((avatar.state.y + 63) / 32)
							}

						// falling
							else {
								future.rowDown = future.rowDown - 1
								future.rowUp   = future.rowUp   - 1
							}
					}

				// update columns, rows, tower
					avatar.state.colLeft  = future.colLeft
					avatar.state.colRight = future.colRight
					avatar.state.rowUp    = future.rowUp
					avatar.state.rowDown  = future.rowDown
					avatar.state.tower    = getTower(request, avatar) || null
			}
			catch (error) {main.logError(error)}
		}

	/* updateCollisions */
		module.exports.updateCollisions = updateCollisions
		function updateCollisions(request, avatar) {
			try {
				// player - player
					if (avatar.state.health) {
						var keys = Object.keys(request.game.data.heroes).concat(Object.keys(request.game.data.demons))
						var mapLength = request.game.data.map.length * 32

						for (var k in keys) {
							var opponent = (keys[k] > -1) ? request.game.data.demons[keys[k]] : request.game.data.heroes[keys[k]]

							// wrap-around issue
								var avLeft = (  avatar.state.colLeft == request.game.data.map.length - 1) ? (-1 * request.game.data.map.length) : 0
								var opLeft = (opponent.state.colLeft == request.game.data.map.length - 1) ? (-1 * request.game.data.map.length) : 0
							
							if ((opponent.name !== avatar.name) && (opponent.state.health)
							 && ((avatar.state.rowUp             >= opponent.state.rowDown          && avatar.state.rowUp             <= opponent.state.rowUp)
							  || (avatar.state.rowDown           >= opponent.state.rowDown          && avatar.state.rowDown           <= opponent.state.rowUp + 1)) // standing on someone's head
							 && ((avatar.state.colLeft + avLeft  >= opponent.state.colLeft + opLeft && avatar.state.colLeft + avLeft  <= opponent.state.colRight)
							  || (avatar.state.colRight          >= opponent.state.colLeft + opLeft && avatar.state.colRight          <= opponent.state.colRight))) { // same cells
								
								// same x, moving y
									if ((opponent.state.x + (opLeft * 32) <= avatar.state.x + (avLeft * 32)      && avatar.state.x + (avLeft * 32)      <= opponent.state.x + (opLeft * 32) + 32)
									 || (opponent.state.x + (opLeft * 32) <  avatar.state.x + (avLeft * 32) + 32 && avatar.state.x + (avLeft * 32) + 32 <  opponent.state.x + (opLeft * 32) + 32)) {
										// collision down
											if ((opponent.state.y + 32 < avatar.state.y && avatar.state.y <= opponent.state.y + 64) && avatar.state.vy < 0) {
												avatar.state.vy = Math.max(0,   Math.min(16,  avatar.state.vy + 4))
												avatar.state.y  = Math.max(-32, Math.min(576, avatar.state.y))

												if (!opponent.state.surface || opponent.state.tower) {
													opponent.state.vy = Math.max(-24, Math.min(0, opponent.state.vy))
												}
												else if (opponent.state.surface) {
													avatar.state.y = opponent.state.y + 64
													avatar.state.vy = 0
													avatar.state.surface  = true
													avatar.state.jumpable = true

													if      (avatar.state.x + (avLeft * 32) > opponent.state.x + (opLeft * 32) + 8) {
														avatar.state.x = (avatar.state.x + 2 + mapLength) % mapLength
													}
													else if (avatar.state.x + (avLeft * 32) < opponent.state.x + (opLeft * 32) - 8) {
														avatar.state.x = (avatar.state.x - 2 + mapLength) % mapLength
													}
												}
											}

										// collision up
											else if ((opponent.state.y < avatar.state.y + 64 && avatar.state.y + 64 <= opponent.state.y + 64) && avatar.state.vy > 0) {
												  avatar.state.vy = Math.max(-24, Math.min(0,     avatar.state.vy))
												  avatar.state.jumpable = true
												opponent.state.vy = Math.max(-24, Math.min(16,  opponent.state.vy + 8))
												opponent.state.surface  = true
												opponent.state.jumpable = true
											}
									}

								// same y, moving x
									if ((opponent.state.y <= avatar.state.y && avatar.state.y <= opponent.state.y + 64) || (opponent.state.y < avatar.state.y + 64 & avatar.state.y + 64 < opponent.state.y + 64)) {
										// collision left
											if ((opponent.state.x + (opLeft * 32) < avatar.state.x && avatar.state.x < opponent.state.x + (opLeft * 32) + 32) && avatar.state.vx < 0) {
												  avatar.state.vx = Math.max(-16, Math.min(16,   avatar.state.vx + 4))
												  avatar.state.x  = ((avatar.state.x + 4) + mapLength) % mapLength
												opponent.state.vx = Math.max(-16, Math.min(16, opponent.state.vx - 4))
											}

										// collision right
											else if ((opponent.state.x + (opLeft * 32) < avatar.state.x + (avLeft * 32) + 32 && avatar.state.x + (avLeft * 32) + 32 < opponent.state.x + (opLeft * 32) + 32) && avatar.state.vx > 0) {
												  avatar.state.vx = Math.max(-16, Math.min(16,  avatar.state.vx - 4))
												  avatar.state.x  = ((avatar.state.x - 4) + mapLength) % mapLength
												opponent.state.vx = Math.max(-16, Math.min(16, opponent.state.vx + 4))
											}
									}

								// update cells
									var cells = getCells(request.game.data.map.length, avatar.state.x, avatar.state.y, 32, 64)
									avatar.state.rowUp    = cells.rowUp
									avatar.state.rowDown  = cells.rowDown
									avatar.state.colLeft  = cells.colLeft
									avatar.state.colRight = cells.colRight
							}
						}
					}
			}
			catch (error) {main.logError(error)}
		}

	/* updateHealth */
		module.exports.updateHealth = updateHealth
		function updateHealth(request, avatar) {
			try {
				// screen bottom
					if (avatar.state.y <= 0) {
						avatar.state.health = 0
					}

				// enemy tower platforms
					else if      (avatar.state.tower &&  avatar.state.health) {
						if      (avatar.state.tower.platforms[0] && avatar.state.tower.platforms[0].team && avatar.state.tower.platforms[0].team !== avatar.team) {
							avatar.state.health = Math.max(0, Math.min(255, avatar.state.health - 2))
						}
						else if (avatar.state.tower.platforms[1] && avatar.state.tower.platforms[1].team && avatar.state.tower.platforms[1].team !== avatar.team) {
							avatar.state.health = Math.max(0, Math.min(255, avatar.state.health - 2))
						}
					}

				// friendly tower platforms
					else if (avatar.state.keyable && avatar.state.tower && !avatar.state.health) {
						var notes = []
						for (var k in avatar.state.keys[avatar.state.keys.length - 1]) {
							notes.push(avatar.state.keys[avatar.state.keys.length - 1][k].slice(0,1))
						}

						if      (notes.length && avatar.state.tower.platforms[0] && avatar.state.tower.platforms[0].team == avatar.team && notes.includes(avatar.state.tower.platforms[0].note)) {
							avatar.state.health = 255
							avatar.state.keyable = false
						}
						else if (notes.length && avatar.state.tower.platforms[1] && avatar.state.tower.platforms[1].team == avatar.team && notes.includes(avatar.state.tower.platforms[1].note)) {
							avatar.state.health = 255
							avatar.state.keyable = false
						}
					}

				// arrows
					if (avatar.state.health) {
						for (var a = 0; a < request.game.data.arrows.length; a++) {
							var arrow = request.game.data.arrows[a]
							
							if ((arrow.name !== avatar.name) && (arrow.team !== avatar.team)
							 && (avatar.state.y < arrow.y + arrow.radius && arrow.y - arrow.radius < avatar.state.y + 64)
							 && (avatar.state.x < arrow.x + arrow.radius && arrow.x - arrow.radius < avatar.state.x + 32)) {
								avatar.state.health = Math.max(0, Math.min(255, avatar.state.health - arrow.radius))
								request.game.data.arrows.splice(a,1)
								a--
							}
						}
					}

				// health-down spell

				// health-up   spell

			}
			catch (error) {main.logError(error)}
		}

	/* updateTower */
		module.exports.updateTower = updateTower
		function updateTower(request, avatar) {
			try {
				if (avatar.state.health && avatar.state.keyable) {
					// get notes
						var changePlatform = false
						var notes = []
						for (var k in avatar.state.keys[avatar.state.keys.length - 1]) {
							notes.push(avatar.state.keys[avatar.state.keys.length - 1][k].slice(0,1))
						}

					// platform control
						if (avatar.state.tower && notes.length) {
							var tower = request.game.data.towers.find(function (t) {
								return t.name == avatar.state.tower.name
							})

							if      (avatar.state.tower.platforms[0] && avatar.state.tower.platforms[0].team != avatar.team && notes.includes(avatar.state.tower.platforms[0].note)) {
								var platform = tower.platforms.find(function (p) {
									return (p.x == avatar.state.tower.platforms[0].x && p.y == avatar.state.tower.platforms[0].y)
								})
								platform.team = avatar.team
								changePlatform = true
								avatar.state.keyable = false
							}
							else if (avatar.state.tower.platforms[1] && avatar.state.tower.platforms[1].team != avatar.team && notes.includes(avatar.state.tower.platforms[1].note)) {
								var platform = tower.platforms.find(function (p) {
									return (p.x == avatar.state.tower.platforms[1].x && p.y == avatar.state.tower.platforms[1].y)
								})
								platform.team = avatar.team
								changePlatform = true
								avatar.state.keyable = false
							}
						}

					// tower control
						if (changePlatform && tower) {
							var heroControl  = true
							var demonControl = true
							var previousTeam = tower.team

							for (var p in tower.platforms) {
								if (tower.platforms[p].team != "heroes") {
									heroControl = false
								}
								if (tower.platforms[p].team != "demons") {
									demonControl = false
								}
							}

							tower.team = heroControl ? "heroes" : demonControl ? "demons" : null
							if (tower.team !== previousTeam) { // change?
								updateSongs(request, tower)
							}
						}
				}
			}
			catch (error) {main.logError(error)}
		}

	/* updateSongs */
		module.exports.updateSongs = updateSongs
		function updateSongs(request, tower) {
			try {
				var keys = Object.keys(request.game.data.heroes).concat(Object.keys(request.game.data.demons))
				for (var k in keys) {
					var avatar = (keys[k] > -1) ? request.game.data.demons[keys[k]] : request.game.data.heroes[keys[k]]

					if (avatar.team == tower.team) {
						avatar.state.songs.push(tower.song)
					}
					else {
						avatar.state.songs = avatar.state.songs.filter(function(s) {
							return s !== tower.song
						})
					}
				}
			}
			catch (error) {main.logError(error)}
		}

	/* updateArrows */
		module.exports.updateArrows = updateArrows
		function updateArrows(request, avatar) {
			try {
				// create new arrows
					if (avatar.state.health && avatar.state.keyable) {
						var notes = []
						for (var k in avatar.state.keys[avatar.state.keys.length - 1]) {
							notes.push(avatar.state.keys[avatar.state.keys.length - 1][k].slice(0,1))
						}
						notes.sort()

						if (notes.length == 2 && ((notes[0] == "A" && notes[1] == "C") || (notes[0] == "C" && notes[1] == "E") || (notes[0] == "E" && notes[1] == "G"))) {
							request.game.data.arrows.push(createArrow(request, avatar))
							avatar.state.keyable = false
						}
					}

				// move arrows
					var map       = request.game.data.map
					var mapLength = map.length * 32
					for (var a = 0; a < request.game.data.arrows.length; a++) {
						if (request.game.data.arrows[a].name == avatar.name) {
							var arrow    = request.game.data.arrows[a]
							arrow.radius = (arrow.radius * 4 - 1) / 4

							// dissipate ?
								if (arrow.radius <= 0) {
									request.game.data.arrows.splice(a,1)
									a--
								}

							// update position
								else {
									arrow.x = (arrow.x + arrow.vx + mapLength) % mapLength
									var future = getCells(request.game.data.map.length, arrow.x, arrow.y, arrow.radius * 2, arrow.radius * 2)

									// collision left
										if      ((map[future.colLeft ][0] &&                                  future.rowUp   >= map[future.colLeft ][0].bottom && future.rowUp   <= map[future.colLeft ][0].top)
										      || (map[future.colLeft ][0] &&                                  future.rowDown >= map[future.colLeft ][0].bottom && future.rowDown <= map[future.colLeft ][0].top)
										      || (map[future.colLeft ][1] && !map[future.colLeft ][1].note && future.rowUp   >= map[future.colLeft ][1].bottom && future.rowUp   <= map[future.colLeft ][1].top)
										      || (map[future.colLeft ][1] && !map[future.colLeft ][1].note && future.rowDown >= map[future.colLeft ][1].bottom && future.rowDown <= map[future.colLeft ][1].top)) {
											request.game.data.arrows.splice(a,1)
											a--
										}

									// collision right
										else if ((map[future.colRight][0] &&                                  future.rowUp   >= map[future.colRight][0].bottom && future.rowUp   <= map[future.colRight][0].top)
										      || (map[future.colRight][0] &&                                  future.rowDown >= map[future.colRight][0].bottom && future.rowDown <= map[future.colRight][0].top)
										      || (map[future.colRight][1] && !map[future.colRight][1].note && future.rowUp   >= map[future.colRight][1].bottom && future.rowUp   <= map[future.colRight][1].top)
										      || (map[future.colRight][1] && !map[future.colRight][1].note && future.rowDown >= map[future.colRight][1].bottom && future.rowDown <= map[future.colRight][1].top)) {
											request.game.data.arrows.splice(a,1)
											a--
										}
								}
						}
					}
			}
			catch (error) {main.logError(error)}
		}

	/* updateKeys */
		module.exports.updateKeys = updateKeys
		function updateKeys(request, avatar) {
			try {
				// repeat 8 beats ago for unselected demons (to loop 8 beats)
					if (!avatar.state.selected) {
						avatar.state.keys.push(main.duplicateObject(avatar.state.keys[0]))
					}
				
				// cycle beats
					avatar.state.keys.shift()
					while (avatar.state.keys.length < 8) {
						avatar.state.keys.push([])
					}

				// can play keys again
					avatar.state.keyable = true
			}
			catch (error) {main.logError(error)}
		}
