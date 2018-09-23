/*** modules ***/
	var main = require("../main/logic")
	module.exports = {}

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
						if (!request.game.data.state.theme) {
							if (request.post.key == "up") {
								player.selection = Math.max(0, player.selection - 1)
								callback([request.session.id], {success: true, selection: player.selection})
							}
							else if (request.post.key == "down") {
								player.selection = Math.min(themes.length - 1, player.selection + 1)
								callback([request.session.id], {success: true, selection: player.selection})
							}
							else if (request.post.key == "right") {
								request.game.data.state.theme = themes[player.selection]
								player.selection = null
								callback([request.session.id], {success: true, selection: player.selection})
							}
						}

					// start game ?
						else {
							if (request.post.key == "left") {
								player.selection = themes.indexOf(request.game.data.state.theme)
								request.game.data.state.theme = null
								callback([request.session.id], {success: true, selection: player.selection})
							}
							else if (request.post.key == "right") {
								startGame(request, callback)
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

	/* startGame */
		module.exports.startGame = startGame
		function startGame(request, callback) {
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
						demon.state.songs.push(demon.song)

				return demon
			}
			catch (error) {main.logError(error)}
		}

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
						hero.state.songs.push(hero.song)
					}

				return hero
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
				var lastColumn = main.duplicateArray(map[map.length - 1])
				var lastFullColumn = null
				var lastX = map.length - 1
				while (!lastFullColumn && lastX > -1) {
					if (map[lastX][0]) {
						lastFullColumn = main.duplicateArray(map[lastX])
					}
					else {
						lastX--
					}
				}

			// starting terrain
				if (map.length < 4) { // hero tower
					column = [{bottom: 0, top: 2}]
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
				if (map.length % 64 < 4) { // first 4 columns
					var tower = request.game.data.towers[Math.floor(map.length / 64)]
					var towerX = map.length % 64
					column[1] = {bottom: tower.platforms[towerX    ].y, top: tower.platforms[towerX    ].y, note: tower.platforms[towerX    ].note, team: tower.platforms[towerX    ].team}
					column[2] = {bottom: tower.platforms[towerX + 4].y, top: tower.platforms[towerX + 4].y, note: tower.platforms[towerX + 4].note, team: tower.platforms[towerX + 4].team}
				}

			// obstacle
				else if (map.length % 64 >= 30 && map.length % 64 < 38) { // middle 8 columns
					var obstacleX = (map.length % 64)
					if ([0,7].includes(obstacleX)) { // space around edges
						column[0] = {bottom: 0, top: Math.max(0, Math.min(7, column[0] ? column[0].top : 3))}
					}
					else if ([1,6].includes(obstacleX)) { // space around edges
						column[0] = {bottom: 0, top: Math.max(0, Math.min(5, column[0] ? column[0].top : 3))}
					}
					else if ([2,5].includes(obstacleX)) { // obstacle
						column[0] = {bottom: 0, top: Math.max(0, Math.min(3, column[0] ? column[0].top : 3))}
						column[1] = {bottom: column[0].top + 3, top: column[0].top + 3}
					}
					else if ([3,4].includes(obstacleX)) { // obstacle
						column[0] = {bottom: 0, top: Math.max(0, Math.min(3, column[0] ? column[0].top : 3))}
						column[1] = {bottom: column[0].top + 3, top: column[0].top + 4}
					}
				}

			return column
		}

	/* createAura */
		module.exports.createAura = createAura
		function createAura(request) {

		}

	/* createAttack */
		module.exports.createAttack = createAttack
		function createAttack(request) {

		}

/*** gameplay ***/
	/* triggerMove */
		module.exports.triggerMove = triggerMove
		function triggerMove() {
			try {
				return null
			}
			catch (error) {main.logError(error)}
		}

	/* triggerNote */
		module.exports.triggerNote = triggerNote
		function triggerNote() {
			try {
				return null
			}
			catch (error) {main.logError(error)}
		}

	/* triggerNumber */
		module.exports.triggerNumber = triggerNumber
		function triggerNumber() {
			try {
				return null
			}
			catch (error) {main.logError(error)}
		}

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
							callback(opponents, {success: true, data: game.data})
						}
				}
			}
			catch (error) {
				main.logError(error)
				callback([request.session.id], {success: false, message: "unable to remove player"})
			}
		}