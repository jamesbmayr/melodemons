/*** modules ***/
	var main       = require("../main/logic")
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
					request.game.players[request.session.id].connected  = true
					request.game.players[request.session.id].connection = request.connection
					request.game.data.keys = Object.keys(request.game.players)

					if (!request.game.data.state.start) {
						// intro text
							var text = main.getAsset("text")
							var intro = text.main + "<br><br><br>" +
								text.towers + "<br>" + text.auras + "<br>" + text.arrows + "<br><br><br>" +
								text.goal + "<br><br><br>"

						callback([request.session.id], {success: true,
							id:          request.game.id,
							intro:       intro,
							theme:       request.game.theme,
							soundtracks: main.getAsset("soundtracks"),
							sample:      main.getAsset("sample"),
							selection:   request.game.players[request.session.id].selection,
							keys:        request.game.data.keys,
							state:       request.game.data.state,							
							heroes:      request.game.data.heroes,
							demons:      request.game.data.demons,
						})
					}
					else {
						callback([request.session.id], {success: true,
							id:          request.game.id,
							rejoin:      (request.game.data.state.end ? null : main.getAsset("text").rejoin),
							theme:       request.game.theme,
							map:         request.game.map,
							soundtracks: main.getAsset("soundtracks"),
							keys:        request.game.data.keys,
							state:       request.game.data.state,
							heroes:      request.game.data.heroes,
							demons:      request.game.data.demons,
							towers:      request.game.data.towers,
							arrows:      request.game.data.arrows
						})
					}
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
						if (request.game.data.state.end) {
							delete request.game.players[request.session.id]
							request.game.data.keys = Object.keys(request.game.players)
						}
						else if (request.game.data.state.start && request.game.players[request.session.id]) {
							request.game.players[request.session.id].connected = false
							var avatar = getAvatar(request)
								avatar.state.up    = false
								avatar.state.right = false
								avatar.state.down  = false
								avatar.state.left  = false
						}
						else if (request.game.players[request.session.id]) {
							if (request.game.players[request.session.id].team == "heroes") {
								delete request.game.data.heroes[request.session.id]
							}
							else if (request.game.players[request.session.id].team == "demons") {
								delete request.game.data.demons[request.session.id]
							}
							else {
								request.game.players[request.session.id].connected = false
							}

							delete request.game.players[request.session.id]
							request.game.data.keys = Object.keys(request.game.players)
						}

					// delete game ?
						var others = request.game.data.keys.filter(function (p) {
							return request.game.players[p].connected
						}) || []

						if (!others.length) {
							callback(others, {success: true, delete: true, location: "../../../../"})
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
		function submitArrow(request, callback) {
			try {
				if (!request.game.data.state.start) {
					if (request.post.press) {
						changeSelection(request, callback)
					}
				}
				else if (!request.game.data.state.end && request.game.data.state.beat > 128) {
					triggerMove(request)
				}
			}
			catch (error) {
				main.logError(error)
				callback([request.session.id], {success: false, message: "unable to submit arrow"})
			}
		}

	/* submitNote */
		module.exports.submitNote = submitNote
		function submitNote(request, callback) {
			try {
				if (!request.game.data.state.start) {
					triggerNote(request)
				}
				else if (!request.game.data.state.end && request.game.data.state.beat > 128) {
					triggerNote(request)
				}
			}
			catch (error) {
				main.logError(error)
				callback([request.session.id], {success: false, message: "unable to submit note"})
			}
		}

	/* submitTeam */
		module.exports.submitTeam = submitTeam
		function submitTeam(request, callback) {
			try {
				if (request.game.data.heroes[request.session.id] || request.game.data.demons[request.session.id]) {
					callback([request.session.id], {success: false, message: "already joined a team"})
				}
				else if (!request.post.team || !["heroes","demons"].includes(request.post.team)) {
					callback([request.session.id], {success: false, message: "not a team"})
				}
				else {
					request.game.players[request.session.id].team = request.post.team
					callback([request.session.id], {team: request.post.team, options: main.getAsset(request.post.team)})
				}
			}
			catch (error) {
				main.logError(error)
				callback([request.session.id], {success: false, message: "unable to submit note"})
			}
		}

/*** menu ***/
	/* changeSelection */
		module.exports.changeSelection = changeSelection
		function changeSelection(request, callback) {
			try {
				var player = request.game.players[request.session.id] || {}
				if (player.team == "heroes" || player.team == "demons") {
					// get all
						var options = main.getAsset(player.team)

					// not yet selected
						if (!request.game.data[player.team][request.session.id]) {
							if (request.post.key == "left") {
								player.selection = player.selection - 1
								if (player.selection < 0) { player.selection = options.length - 1 } // wrap around
								callback([request.session.id], {success: true, selection: player.selection})
							}
							else if (request.post.key == "right") {
								player.selection = player.selection + 1
									if (player.selection > options.length - 1) { player.selection = 0 } // wrap around
									callback([request.session.id], {success: true, selection: player.selection})
							}
							else if (request.post.key == "up") {
								var avatar = createAvatar( request, options[player.selection])
								
								if (!avatar) {
									callback([request.session.id], {success: false, message: (player.team == "heroes" ? "hero" : "demon") + " already taken"})
								}
								else {
									request.game.data[player.team][request.session.id] = options[player.selection]
									callback([request.session.id], {success: true, selection: player.selection})
								}
							}
						}

					// already selected
						else {
							if (request.post.key == "down") {
								delete request.game.data[player.team][request.session.id]
								callback([request.session.id], {success: true, selection: player.selection})
							}
							else if (request.post.key == "up") {
								launchGame(request, callback)
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
					else if (players.length > 8) {
						callback([request.session.id], {success: false, message: "game cannot exceed 8 players"})
					}
					else if (Object.keys(request.game.data.heroes).length < 1 || Object.keys(request.game.data.demons).length < 1) {
						callback([request.session.id], {success: false, message: "game requires both heroes and demons"})
					}
					else if (players.filter(function(p) { return (!request.game.data.demons[p] && !request.game.data.heroes[p]) }).length) {
						callback([request.session.id], {success: false, message: "some players have not chosen a hero or demon"})	
					}

				// begin
					else {
						// variables
							var colors = main.getAsset("colors")
							var towers = main.getAsset("towers")

						// towers
							var towerCount = 4
							var mapLength = towerCount * 32
							while (request.game.data.towers.length < towerCount) {
								var team = (request.game.data.towers.length == 0) ? "heroes" : (request.game.data.towers.length == Math.ceil(towerCount / 2)) ? "demons" : null
								request.game.data.towers.push(createTower(request, team, colors, towers))
							}

						// map
							while (request.game.map.length < mapLength) {
								request.game.map.push(createColumn(request))
							}

						// heroes & demons - positions
							var keys = request.game.data.keys
							for (var k in keys) {
								var avatar = request.game.data.demons[keys[k]] || request.game.data.heroes[keys[k]]
								createStartPosition(request, avatar)
							}

						// beat
							request.game.data.state.beat = request.game.data.state.beat % 32 * -1
		
						// start game
							request.game.data.state.start = new Date().getTime()
							callback(players, {success: true,
								launch: true,
								theme:  request.game.theme,
								map:    request.game.map,
								state:  request.game.data.state,
								heroes: request.game.data.heroes,
								demons: request.game.data.demons,
								towers: request.game.data.towers,
								arrows: request.game.data.arrows,
							})
					}
			}
			catch (error) {
				main.logError(error)
				callback([request.session.id], {success: false, message: "unable to start game"})
			}
		}

/*** creates ***/
	/* createAvatar */
		module.exports.createAvatar = createAvatar
		function createAvatar(request, avatar) {
			try {
				// get existing heroes
					var currentKeys = Object.keys(request.game.data[avatar.team])
					var currentAvatars = []
					for (var k in currentKeys) {
						if (request.game.data[avatar.team][currentKeys[k]]) {
							currentAvatars.push(request.game.data[avatar.team][currentKeys[k]].instrument)
						}
					}

				// already chosen ?
					if (currentAvatars.includes(avatar.instrument)) {
						avatar = null
					}

				// set hero state
					else {
						var songs = main.getAsset("songs")
						avatar.melody  = songs[avatar.song].melody
						avatar.state   = main.getSchema("state")
					}

				return avatar
			}
			catch (error) {main.logError(error)}
		}

	/* createTower */
		module.exports.createTower = createTower
		function createTower(request, team, colors, towers) {
			try {
				// get existing towers
					var currentTowers = request.game.data.towers.map(function(t) {
						return t.song
					}) || []
					var allTowers = towers
						allTowers = allTowers.filter(function(t) {
							return !currentTowers.includes(t.song)
						})

				// create tower
					var tower  = main.chooseRandom(allTowers)

				// set team
					if (team == "heroes") {
						tower.team = "heroes"
						tower.colors[2] = colors.blue[2]
						tower.platforms.forEach(function(p) {
							p.team  = "heroes"
							p.color = colors.blue[2]
						})
					}
					else if (team == "demons") {
						tower.team = "demons"
						tower.colors[2] = colors.red[2]
						tower.platforms.forEach(function(p) {
							p.team = "demons"
							p.color = colors.red[2]
						})
					}
					else {
						tower.team = null
						tower.colors[2] = colors.black[2]
						tower.platforms.forEach(function(p) {
							p.team = null
							p.color = colors.black[2]
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
				var map    = request.game.map
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
				if (map.length % 32 < 4) { // tower
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
					column[0].top = Math.max(1, Math.min(9, column[0].top))
				}

			// tower
				if ([30,31,4,5].includes(map.length % 32)) { // columns around tower
					if (column[0]) { 
						column[0].top = Math.max(1, Math.min(4, column[0].top))
					}
				}
				else if ([0,1,2,3].includes(map.length % 32)) { // first 4 columns
					if (column[0]) { 
						column[0].top = Math.max(1, Math.min(3, column[0].top))
					}

					var tower = request.game.data.towers[Math.floor(map.length / 32)]
					var towerX = map.length % 32

					column[1] = {bottom: tower.platforms[towerX    ].y, top: tower.platforms[towerX    ].y, note: tower.platforms[towerX    ].note, team: tower.platforms[towerX    ].team}
					column[2] = {bottom: tower.platforms[towerX + 4].y, top: tower.platforms[towerX + 4].y, note: tower.platforms[towerX + 4].note, team: tower.platforms[towerX + 4].team}
				}

			// obstacle
				else if (map.length % 32 > 13 && map.length % 32 < 22) { // middle 8 columns
					var obstacleX = (map.length % 32)
					if      ([14,21].includes(obstacleX)) { // space around edges
						var level = (column[0] ? column[0].top : lastFullColumn[0].top) + 3
						column[1] = {bottom: level, top: level}
					}
					else if ([15,20].includes(obstacleX)) { // space around edges
						var level = (column[0] ? column[0].top : lastFullColumn[0].top) + 3 + Math.floor(Math.random() * 2)
						column[1] = {bottom: level, top: level}
					}
					else if ([16,19].includes(obstacleX)) { // obstacle
						var level = (column[0] ? column[0].top : lastFullColumn[0].top) + 4 + Math.floor(Math.random() * 2)
						column[1] = {bottom: level, top: level}
					}
					else if ([17,18].includes(obstacleX)) { // obstacle
						var level = (column[0] ? column[0].top : lastFullColumn[0].top) + 5
						column[1] = {bottom: level, top: level}
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
							return ((request.game.data.heroes[k].instrument !== avatar.instrument)
								 && (request.game.data.heroes[k].state.x     == avatar.state.x)
								 && (request.game.data.heroes[k].state.y     == avatar.state.y))
						}))
					}

				// demons
					else {
						var tower = request.game.data.towers[Math.ceil(request.game.data.towers.length / 2)]
						var keys  = Object.keys(request.game.data.demons)

						do {
							var platform   = main.chooseRandom(tower.platforms)
							avatar.state.x = (platform.x + (32 * Math.ceil(request.game.data.towers.length / 2))) * 32
							avatar.state.y = (platform.y + 1)                                                     * 32 + 16
						}
						while (keys.find(function(k) {
							return ((request.game.data.demons[k].instrument !== avatar.instrument)
								 && (request.game.data.demons[k].state.x     == avatar.state.x)
								 && (request.game.data.demons[k].state.y     == avatar.state.y))
						}))
					}

				// set tower
					avatar.state.tower = {
						song: tower.song,
						platforms: [main.duplicateObject(platform)]
					}

				// set songs
					avatar.state.songs.push(tower.song)

				// set cells
					var cells = getCells(request.game.map.length, avatar.state.x, avatar.state.y, 32, 64)
						avatar.state.colLeft  = cells.colLeft
						avatar.state.colRight = cells.colRight
						avatar.state.rowUp    = cells.rowUp
						avatar.state.rowDown  = cells.rowDown
			}
			catch (error) {main.logError(error)}
		}

	/* createArrow */
		module.exports.createArrow = createArrow
		function createArrow(request, avatar, mapLength) {
			try {
				var arrow            = main.getSchema("arrow")
					arrow.radius     = (avatar.state.auras.strength.radius || avatar.state.auras.strength.tower) ? (arrow.radius * 1.5) : arrow.radius
					arrow.vx         =   avatar.state.facing == "left" ? -16 : 16
					arrow.x          = ((avatar.state.facing == "left" ? avatar.state.x + arrow.vx : avatar.state.x + 32 + arrow.vx) + mapLength) % mapLength
					arrow.y          = avatar.state.y + 32
					arrow.vy         = 0
					arrow.instrument = avatar.instrument
					arrow.team       = avatar.team
					arrow.colors[0]  = avatar.colors[0]
					arrow.colors[1]  = avatar.colors[1]

				return arrow
			}
			catch (error) {main.logError(error)}
		}

/*** triggers ***/
	/* triggerMove */
		module.exports.triggerMove = triggerMove
		function triggerMove(request) {
			try {
				var avatar = getAvatar(request)

				if (avatar) {
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
		function triggerNote(request) {
			try {
				var avatar = getAvatar(request)

				if (request.post.press && avatar && !avatar.state.keys[avatar.state.keys.length - 1].includes(request.post.key)) {
					avatar.state.keys[avatar.state.keys.length - 1].push(request.post.key)
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
					colLeft:  (Math.floor( x               / 32) + columnCount) % columnCount,
					colRight: (Math.floor((x + width)      / 32) + columnCount) % columnCount,
					rowDown:   Math.floor( y               / 32),
					rowUp:     Math.floor((y + height - 1) / 32)
				}
			}
			catch (error) {main.logError(error)}
		}

	/* getAvatar */
		module.exports.getAvatar = getAvatar
		function getAvatar(request) {
			try {
				return (request.game.data.demons[request.session.id] || request.game.data.heroes[request.session.id] || null)
			}
			catch (error) {main.logError(error)}
		}

	/* getTower */
		module.exports.getTower = getTower
		function getTower(request, avatar) {
			try {
				// blank data
					var touchedTower = {
						song: null,
						platforms: []
					}
					
				// left side
					if (avatar.state.colLeft  % 32 < 4) {
						var tower = request.game.data.towers[Math.floor(avatar.state.colLeft  / 32)]
						if      (tower.platforms[avatar.state.colLeft  % 32    ].y == avatar.state.rowDown - 1) {
							touchedTower.song = tower.song
							touchedTower.platforms.push(main.duplicateObject(tower.platforms[avatar.state.colLeft  % 32    ]))
						}
						else if (tower.platforms[avatar.state.colLeft  % 32 + 4].y == avatar.state.rowDown - 1) {
							touchedTower.song = tower.song
							touchedTower.platforms.push(main.duplicateObject(tower.platforms[avatar.state.colLeft  % 32 + 4]))
						}
					}

				// right side
					if (avatar.state.colRight % 32 < 4) {
						var tower = request.game.data.towers[Math.floor(avatar.state.colRight / 32)]
						if      (tower.platforms[avatar.state.colRight % 32    ].y == avatar.state.rowDown - 1) {
							touchedTower.song = tower.song
							touchedTower.platforms.push(main.duplicateObject(tower.platforms[avatar.state.colRight % 32    ]))
						}
						else if (tower.platforms[avatar.state.colRight % 32 + 4].y == avatar.state.rowDown - 1) {
							touchedTower.song = tower.song
							touchedTower.platforms.push(main.duplicateObject(tower.platforms[avatar.state.colRight % 32 + 4]))
						}
					}

				// data ?
					if (touchedTower.song) {
						return touchedTower
					}
			}
			catch (error) {main.logError(error)}
		}

	/* getMatch */
		module.exports.getMatch = getMatch
		function getMatch(melody, beats) {
			try {
				if (beats[0].length > 2 || beats[1].length > 2 || beats[2].length > 2 || beats[3].length > 2) { // to prevent pressing all keys
					return false
				}

				if (beats[0].includes(melody[0])
				 && beats[1].includes(melody[1])
				 && beats[2].includes(melody[2])
				 && beats[3].includes(melody[3])) {
					return true
				}
				if (beats[0].includes(melody[1])
				 && beats[1].includes(melody[2])
				 && beats[2].includes(melody[3])
				 && beats[3].includes(melody[0])) {
					return true
				}
				if (beats[0].includes(melody[2])
				 && beats[1].includes(melody[3])
				 && beats[2].includes(melody[0])
				 && beats[3].includes(melody[1])) {
					return true
				}
				if (beats[0].includes(melody[3])
				 && beats[1].includes(melody[0])
				 && beats[2].includes(melody[1])
				 && beats[3].includes(melody[2])) {
					return true
				}
								
				return false
			}
			catch (error) {main.logError(error)}
		}

	/* getBeatAgo */
		module.exports.getBeatAgo = getBeatAgo
		function getBeatAgo(avatar, ago, length) {
			try {
				// variables
					var beat = []
					var start = Math.min(64, 64 - (((ago || 0)         ) * 8))
					var end   = Math.max(1,  64 - (((ago || 0) + length) * 8))

				// get beat, +/- half beat
					for (var k = start; k > end; k--) {
						for (var n in avatar.state.keys[k - 1]) {
							beat.push(avatar.state.keys[k - 1][n].slice(0,1))
						}
					}

				// remove duplicates
					for (var b = 0; b < beat.length; b++) {
						if (beat.indexOf(beat[b]) !== b) {
							beat.splice(b,1)
							b--
						}
					}

				return beat
			}
			catch (error) {main.logError(error)}
		}

/* updates */
	/* updateBeat */
		module.exports.updateBeat = updateBeat
		function updateBeat(request, callback) {
			try {
				// beat
					request.game.data.state.beat++

				// data
					callback(request.game.data.keys, request.game.data)
			}
			catch (error) {main.logError(error)}
		}

	/* updateState */
		module.exports.updateState = updateState
		function updateState(request, callback) {
			try {
				// menu / launch / game over
					if (!request.game.data.state.start || (request.game.data.state.beat < 128) || request.game.data.state.end) {
						// sounds
							var keys   = request.game.data.keys
							for (var k in keys) {
								var avatar = request.game.data.demons[keys[k]] || request.game.data.heroes[keys[k]] || null
								updateEffects(   request,    avatar)
							}
					}

				// gameplay
					else {
						// data
							var map       = request.game.map
							var mapLength = map.length * 32
							var towers    = request.game.data.towers
							var arrows    = request.game.data.arrows
							var keys      = request.game.data.keys

						// reset avatars
							for (var k in keys) {
								var avatar = request.game.data.demons[keys[k]] || request.game.data.heroes[keys[k]]
								updateEffects(   request,    avatar)
							}

						// arrows & towers
							for (var a in arrows) {
								updateArrow(     request, arrows[a], keys, map, mapLength, a)
							}
						
							for (var t in towers) {
								updateTower(     request, towers[t], keys)
							}

						// heroes & demons
							for (var k in keys) {
								var avatar = request.game.data.demons[keys[k]] || request.game.data.heroes[keys[k]]
								updateVelocity(  request,    avatar, keys,      mapLength)
								updateCollisions(request,    avatar, keys, map, mapLength)
							}

							for (var k in keys) {
								var avatar = request.game.data.demons[keys[k]] || request.game.data.heroes[keys[k]]
								updatePosition(  request,    avatar, keys, map, mapLength)
								updateHealth(    request,    avatar, keys)
								updateMusic(     request,    avatar, keys,      mapLength)
							}

						// game
							updateMessage(       request)
							updateWinning(       request,    towers, keys)
					}
			}
			catch (error) {main.logError(error)}
		}

	/* updateEffects */
		module.exports.updateEffects = updateEffects
		function updateEffects(request, avatar) {
			try {
				if (avatar) {
					// aura effects
						for (var a in avatar.state.auras) {
							avatar.state.auras[a].radius = Math.max(0, avatar.state.auras[a].radius - 1)
							avatar.state.auras[a].tower = false
						}

					// tower effects
						if (avatar.state.tower) {
							avatar.state.auras[avatar.state.tower.song].tower = true
						}

					// sound effects
						avatar.state.collision = false
						avatar.state.shot      = false

					// cooldown
						avatar.state.cooldown = Math.max(0, avatar.state.cooldown - 1)

					// cycle beats
						avatar.state.keys.shift()
						while (avatar.state.keys.length < 64) {
							avatar.state.keys.push([])
						}
				}
			}
			catch (error) {main.logError(error)}
		}

	/* updateArrow */
		module.exports.updateArrow = updateArrow
		function updateArrow(request, arrow, keys, map, mapLength, a) {
			try {
				// dissipate ?
					if (arrow.radius <= 0) {
						request.game.data.arrows.splice(a, 1)
						a--
					}

				// continue
					else {
						// update size & position
							arrow.radius = (arrow.radius * 4 - 1) / 4
							arrow.x = (arrow.x + arrow.vx + mapLength) % mapLength
							var future = getCells(request.game.map.length, arrow.x, arrow.y, arrow.radius * 2, arrow.radius * 2)

						// collision left
							if      ((map[future.colLeft ][0] && future.rowUp   >= map[future.colLeft ][0].bottom && future.rowUp   <= map[future.colLeft ][0].top)
							      || (map[future.colLeft ][0] && future.rowDown >= map[future.colLeft ][0].bottom && future.rowDown <= map[future.colLeft ][0].top)) {
								request.game.data.arrows.splice(a, 1)
								a--
							}

						// collision right
							else if ((map[future.colRight][0] && future.rowUp   >= map[future.colRight][0].bottom && future.rowUp   <= map[future.colRight][0].top)
							      || (map[future.colRight][0] && future.rowDown >= map[future.colRight][0].bottom && future.rowDown <= map[future.colRight][0].top)) {
								request.game.data.arrows.splice(a, 1)
								a--
							}
					}
			}
			catch (error) {main.logError(error)}
		}

	/* updateTower */
		module.exports.updateTower = updateTower
		function updateTower(request, tower, keys) {
			try {
				var heroControl  = true
				var demonControl = true
				var previousTeam = tower.team

				for (var p in tower.platforms) {
					if (tower.platforms[p].team !== "heroes") {
						heroControl = false
					}
					if (tower.platforms[p].team !== "demons") {
						demonControl = false
					}
				}

				tower.team = heroControl ? "heroes" : demonControl ? "demons" : null
				if (tower.team !== previousTeam) { // change?
					// change colors
						var colors = main.getAsset("colors")
						tower.colors[2] = (tower.team == "heroes") ? colors.blue[2] : (tower.team == "demons") ? colors.red[2] : colors.black[2]
					
					// post message
						request.game.data.state.message.text = tower.team ? (tower.team + " take the tower of " + tower.song) : ("the tower of " + tower.song + " is lost")
						request.game.data.state.message.countdown = 64
					
					// change songs
						for (var k in keys) {
							var avatar = request.game.data.demons[keys[k]] || request.game.data.heroes[keys[k]]

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
			}
			catch (error) {main.logError(error)}
		}

	/* updateVelocity */
		module.exports.updateVelocity = updateVelocity
		function updateVelocity(request, avatar, keys, mapLength) {
			try {
				// adjust vx
					var minVX     =  avatar.state.health && (avatar.state.auras.slow.radius      || avatar.state.auras.slow.tower)      ? -4 : -10
					var maxVX     =  avatar.state.health && (avatar.state.auras.slow.radius      || avatar.state.auras.slow.tower)      ?  4 :  10
					var    AX     =  avatar.state.health && (avatar.state.auras.sliding.radius   || avatar.state.auras.sliding.tower)   ?  4 : 2
					var confusion =  avatar.state.health && (avatar.state.auras.confusion.radius || avatar.state.auras.confusion.tower) || false
					var flight    = !avatar.state.health || (avatar.state.auras.flight.radius    || avatar.state.auras.flight.tower)    || false

					if (avatar.state.left && avatar.state.right) {
						avatar.state.vx = Math.max(minVX, Math.min(maxVX, Math.round(avatar.state.vx)))
					}
					else if ((avatar.state.left  && !confusion) || (avatar.state.right && confusion)) {
						avatar.state.vx = Math.max(minVX, Math.min(maxVX, Math.round(avatar.state.vx - AX)))
					}
					else if ((avatar.state.right && !confusion) || (avatar.state.left  && confusion)) {
						avatar.state.vx = Math.max(minVX, Math.min(maxVX, Math.round(avatar.state.vx + AX)))
					}
					else if (AX == 2) {
						avatar.state.vx = Math.max(minVX, Math.min(maxVX, Math.round(Math.sign(avatar.state.vx) * (Math.abs(avatar.state.vx) - AX))))
					}

					if (-1 <= avatar.state.vx && avatar.state.vx <= 1) {
						avatar.state.vx = 0
					}

				// adjust vy
					if (avatar.state.up && (avatar.state.jumpable || flight) && avatar.state.y < 544) {
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

	/* updateCollisions */
		module.exports.updateCollisions = updateCollisions
		function updateCollisions(request, avatar, keys, map, mapLength) {
			try {
				// player - player
					if (avatar.state.health) {
						for (var k in keys) {
							var opponent = request.game.data.demons[keys[k]] || request.game.data.heroes[keys[k]]

							// wrap-around issue
								var avLeft = (  avatar.state.colLeft == map.length - 1 && opponent.state.colLeft == 0) ? (-1 * map.length) : 0
								var opLeft = (opponent.state.colLeft == map.length - 1 &&   avatar.state.colLeft == 0) ? (-1 * map.length) : 0
							
							if ((opponent.instrument !== avatar.instrument) && (opponent.state.health)
							 && ((avatar.state.rowUp                >= opponent.state.rowDown          && avatar.state.rowUp                 <= opponent.state.rowUp)
							  || (avatar.state.rowDown              >= opponent.state.rowDown          && avatar.state.rowDown               <= opponent.state.rowUp + 1)) // standing on someone's head
							 && ((avatar.state.colLeft + avLeft     >= opponent.state.colLeft + opLeft && avatar.state.colLeft + avLeft      <= opponent.state.colLeft + opLeft + 1)
							  || (avatar.state.colLeft + avLeft + 1 >= opponent.state.colLeft + opLeft && avatar.state.colLeft + avLeft + 1  <= opponent.state.colLeft + opLeft + 1))) { // same cells
								
								// same x, moving y
									if ((opponent.state.x + (opLeft * 32) <= avatar.state.x + (avLeft * 32)      && avatar.state.x + (avLeft * 32)      <= opponent.state.x + (opLeft * 32) + 32)
									 || (opponent.state.x + (opLeft * 32) <  avatar.state.x + (avLeft * 32) + 32 && avatar.state.x + (avLeft * 32) + 32 <  opponent.state.x + (opLeft * 32) + 32)) {
										// collision down
											if ((opponent.state.y + 32 < avatar.state.y && avatar.state.y <= opponent.state.y + 64) && avatar.state.vy < 0) {
												avatar.state.vy = Math.max(0,   Math.min(16,  avatar.state.vy + 4))
												avatar.state.y  = Math.max(-32, Math.min(576, avatar.state.y))

												if (opponent.state.surface) {
													avatar.state.y = opponent.state.y + 64
													avatar.state.vy = 0
													avatar.state.surface  = true
													avatar.state.jumpable = true

													if      (avatar.state.x + (avLeft * 32) > opponent.state.x + (opLeft * 32) + 8) {
														avatar.state.vx = Math.max(-16, Math.min(16, avatar.state.vx + 2))
													}
													else if (avatar.state.x + (avLeft * 32) < opponent.state.x + (opLeft * 32) - 8) {
														avatar.state.vx = Math.max(-16, Math.min(16, avatar.state.vx - 2))
													}
												}
												else {
													opponent.state.vy = Math.max(-24, Math.min(0, opponent.state.vy))
												}
											}

										// collision up
											else if ((opponent.state.y < avatar.state.y + 64 && avatar.state.y + 64 <= opponent.state.y + 64) && avatar.state.vy > 0) {
												  avatar.state.vy = Math.max(-24, Math.min(0,    avatar.state.vy))
												  avatar.state.jumpable = false
												  avatar.state.collision = true
												opponent.state.collision = true
												opponent.state.vy = Math.max(-24, Math.min(16, opponent.state.vy + 8))
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
												  avatar.state.collision = true
												opponent.state.collision = true
												opponent.state.vx = Math.max(-16, Math.min(16, opponent.state.vx - 8))
											}

										// collision right
											else if ((opponent.state.x + (opLeft * 32) < avatar.state.x + (avLeft * 32) + 32 && avatar.state.x + (avLeft * 32) + 32 < opponent.state.x + (opLeft * 32) + 32) && avatar.state.vx > 0) {
												  avatar.state.vx = Math.max(-16, Math.min(16,  avatar.state.vx - 4))
												  avatar.state.x  = ((avatar.state.x - 4) + mapLength) % mapLength
												  avatar.state.collision = true
												opponent.state.collision = true
												opponent.state.vx = Math.max(-16, Math.min(16, opponent.state.vx + 8))
											}
									}

								// update cells
									var cells = getCells(map.length, avatar.state.x, avatar.state.y, 32, 64)
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

	/* updatePosition */
		module.exports.updatePosition = updatePosition
		function updatePosition(request, avatar, keys, map, mapLength) {
			try {
				// adjust x & y
					avatar.state.x = (avatar.state.x + avatar.state.vx + mapLength) % mapLength
					avatar.state.y = Math.min(576, Math.max(-32, avatar.state.y + avatar.state.vy))
					var future         = getCells(map.length, avatar.state.x, avatar.state.y, 32, 64)
					var collisionDown  = false

				// terrain collision - changing rows
					if (avatar.state.rowDown !== future.rowDown || avatar.state.rowUp !== future.rowUp) {
						// collision down - terrain
							if ((avatar.state.vy <= 0)   &&
							   ((map[future.colLeft ][0] && future.rowDown <= map[future.colLeft ][0].top)
							 || (map[future.colRight][0] && future.rowDown <= map[future.colRight][0].top))) {
								future.rowDown    = future.rowDown + 1
								future.rowUp      = future.rowUp   + 1
								collisionDown = true
							}

						// collision down - platform
							else if ((avatar.state.vy <= 0) && !avatar.state.down &&
							   ((map[future.colLeft ][1] && future.rowDown <= map[future.colLeft ][1].top && future.rowUp >= map[future.colLeft ][1].top)
							 || (map[future.colRight][1] && future.rowDown <= map[future.colRight][1].top && future.rowUp >= map[future.colRight][1].top)
							 || (map[future.colLeft ][2] && future.rowDown <= map[future.colLeft ][2].top && future.rowUp >= map[future.colLeft ][2].top)
							 || (map[future.colRight][2] && future.rowDown <= map[future.colRight][2].top && future.rowUp >= map[future.colRight][2].top))) {
								future.rowDown    = future.rowDown + 1
								future.rowUp      = future.rowUp   + 1
								collisionDown = true
							}
					}

				// terrain collision - changing columns
					if (avatar.state.colLeft !== future.colLeft || avatar.state.colRight !== future.colRight) {
						// collision left
							if      ((map[future.colLeft ][0] && future.rowUp   >= map[future.colLeft ][0].bottom && future.rowUp   <= map[future.colLeft ][0].top)
							      || (map[future.colLeft ][0] && future.rowDown >= map[future.colLeft ][0].bottom && future.rowDown <= map[future.colLeft ][0].top)) {
								future.colLeft  = (future.colLeft  + 1       + map.length) % map.length
								future.colRight = (future.colRight + 1       + map.length) % map.length
								avatar.state.x  = ((future.colLeft * 32 + 8) + mapLength ) % mapLength
								avatar.state.vx = Math.max(0, avatar.state.vx)
								avatar.state.collision = true
							}

						// collision right
							else if ((map[future.colRight][0] && future.rowUp   >= map[future.colRight][0].bottom && future.rowUp   <= map[future.colRight][0].top)
							      || (map[future.colRight][0] && future.rowDown >= map[future.colRight][0].bottom && future.rowDown <= map[future.colRight][0].top)) {
								future.colLeft  =  (future.colLeft  - 1       + map.length) % map.length
								future.colRight =  (future.colRight - 1       + map.length) % map.length
								avatar.state.x  = ((future.colRight * 32 - 8) + mapLength ) % mapLength
								avatar.state.vx = Math.min(0, avatar.state.vx)
								avatar.state.collision = true
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

						// obstacles & tower platforms
							else if (map[future.colLeft ][1] && avatar.state.y <= (map[future.colLeft ][1].top + 1) * 32 && (avatar.state.y - avatar.state.vy >= (map[future.colLeft ][1].top + 1) * 32)) {
								avatar.state.vy = 0
								avatar.state.y  = Math.min(576, Math.max(-32, (map[future.colLeft ][1].top + 1) * 32))
								avatar.state.jumpable = true
								avatar.state.surface  = true
								future.rowDown = Math.floor( avatar.state.y / 32)
								future.rowUp   = Math.floor((avatar.state.y + 63) / 32)
							}
							else if (map[future.colRight][1] && avatar.state.y <= (map[future.colRight][1].top + 1) * 32 && (avatar.state.y - avatar.state.vy >= (map[future.colRight][1].top + 1) * 32)) {
								avatar.state.vy = 0
								avatar.state.y  = Math.min(576, Math.max(-32, (map[future.colRight][1].top + 1) * 32))
								avatar.state.jumpable = true
								avatar.state.surface  = true
								future.rowDown = Math.floor( avatar.state.y / 32)
								future.rowUp   = Math.floor((avatar.state.y + 63) / 32)
							}
							else if (map[future.colLeft ][2] && avatar.state.y <= (map[future.colLeft ][2].top + 1) * 32 && (avatar.state.y - avatar.state.vy >= (map[future.colLeft ][2].top + 1) * 32)) {
								avatar.state.vy = 0
								avatar.state.y  = Math.min(576, Math.max(-32, (map[future.colLeft ][2].top + 1) * 32))
								avatar.state.jumpable = true
								avatar.state.surface  = true
								future.rowDown = Math.floor( avatar.state.y / 32)
								future.rowUp   = Math.floor((avatar.state.y + 63) / 32)
							}
							else if (map[future.colRight][2] && avatar.state.y <= (map[future.colRight][2].top + 1) * 32 && (avatar.state.y - avatar.state.vy >= (map[future.colRight][2].top + 1) * 32)) {
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
								avatar.state.surface = false
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

	/* updateHealth */
		module.exports.updateHealth = updateHealth
		function updateHealth(request, avatar, keys) {
			try {
				// screen bottom
					if (avatar.state.y <= 0 && avatar.state.health) {
						avatar.state.health = 0
						avatar.state.shot = true
					}

				// towers
					if (avatar.state.tower) {
						// get tower
							var tower = request.game.data.towers.find(function(t) {
								return (t.song == avatar.state.tower.song)
							})

						// friendly tower
							if (tower && tower.team == avatar.team) {
								if (avatar.state.health) {
									avatar.state.health = Math.min(255, avatar.state.health + 4)
								}
								else {
									avatar.state.health = 255
								}
							}
					}

				// arrows
					if (avatar.state.health) {
						for (var a = 0; a < request.game.data.arrows.length; a++) {
							var arrow = request.game.data.arrows[a]
							
							if ((arrow.team !== avatar.team)
							 && (avatar.state.y < arrow.y + arrow.radius && arrow.y - arrow.radius < avatar.state.y + 64)
							 && (avatar.state.x < arrow.x + arrow.radius && arrow.x - arrow.radius < avatar.state.x + 32)) {
							 	if (avatar.state.auras.defense.radius || avatar.state.auras.defense.tower) {
									avatar.state.health = Math.max(0, Math.min(255, Math.round(avatar.state.health - (arrow.radius))))
								}
								else {
									avatar.state.health = Math.max(0, Math.min(255, Math.round(avatar.state.health - (2 * arrow.radius))))
									avatar.state.vx     = Math.max(-10, Math.min(10, Math.round(avatar.state.vx + (Math.floor(arrow.radius / 2) * Math.sign(arrow.vx)))))
								}
								
								avatar.state.shot   = true
								request.game.data.arrows.splice(a, 1)
								a--
							}
						}
					}

			}
			catch (error) {main.logError(error)}
		}

	/* updateMusic */
		module.exports.updateMusic = updateMusic
		function updateMusic(request, avatar, keys, mapLength) {
			try {
				if (avatar.state.health && !avatar.state.cooldown) {
					// cooldown
						var cooldown = (avatar.state.auras.rapidfire.radius || avatar.state.auras.rapidfire.tower) ? 6 : 12

					// beats
						var beats = [
							getBeatAgo(avatar, 2.75, 0.5),
							getBeatAgo(avatar, 1.75, 0.5),
							getBeatAgo(avatar, 0.75, 0.5),
							getBeatAgo(avatar, 0   , 0.5),
						]

					// towers
						if (avatar.state.tower && avatar.state.tower.platforms[0] && (avatar.state.tower.platforms[0].team !== avatar.team) && beats[3].includes(avatar.state.tower.platforms[0].note)) {
							var tower = request.game.data.towers.find(function (t) {
								return t.song == avatar.state.tower.song
							})

							var platform = tower.platforms.find(function (p) {
								return (p.x == avatar.state.tower.platforms[0].x && p.y == avatar.state.tower.platforms[0].y)
							})

							platform.team  = avatar.team
							platform.color = avatar.colors[2]
							avatar.state.cooldown = cooldown / 4
						}
						else if (avatar.state.tower && avatar.state.tower.platforms[1] && (avatar.state.tower.platforms[1].team !== avatar.team) && beats[3].includes(avatar.state.tower.platforms[1].note)) {
							var tower = request.game.data.towers.find(function (t) {
								return t.song == avatar.state.tower.song
							})
							
							var platform = tower.platforms.find(function (p) {
								return (p.x == avatar.state.tower.platforms[1].x && p.y == avatar.state.tower.platforms[1].y)
							})
								
							platform.team  = avatar.team
							platform.color = avatar.colors[2]
							avatar.state.cooldown = cooldown / 4
						}

					// arrows
						else if (beats[3].length == 3) {
							request.game.data.arrows.push(createArrow(request, avatar, mapLength))
							avatar.state.cooldown = cooldown
						}

					// auras
						else {
							var songs = main.getAsset("songs")
							var songKeys  = Object.keys(songs)
							for (var k in songKeys) {
								if ((avatar.song == songKeys[k] || avatar.state.songs.includes(songKeys[k])) && getMatch(songs[songKeys[k]].melody, beats)) {
									var song = songs[songKeys[k]]
									var team = (song.affects == "allies") ? avatar.team : (avatar.team == "heroes" ? "demons" : "heroes")
									
									for (var a in request.game.data[team]) {
										request.game.data[team][a].state.auras[songKeys[k]].radius = request.game.data[team][a].state.auras[songKeys[k]].radius || 128
									}

									request.game.data.state.message.text = avatar.team + " cast " + songKeys[k]
									request.game.data.state.message.countdown = 64

									avatar.state.cooldown = cooldown / 2
									break
								}
							}
						}
				}
			}
			catch (error) {main.logError(error)}
		}

	/* updateMessage */
		module.exports.updateMessage = updateMessage
		function updateMessage(request) {
			try {
				if (request.game.data.state.message.countdown) {
					request.game.data.state.message.countdown = Math.max(0, request.game.data.state.message.countdown - 1)
				}
				else {
					request.game.data.state.message.text = null
				}
			}
			catch (error) {main.logError(error)}
		}

	/* updateWinning */
		module.exports.updateWinning = updateWinning
		function updateWinning(request, towers, keys) {
			try {
				// get tower count
					var counts = {
						towers: {
							total: towers.length,
							heroes: 0,
							demons: 0,
							null:   0
						},
						live: {
							heroes: 0,
							demons: 0
						}
					}

					for (var t in towers) {
						counts.towers[towers[t].team]++
					}

				// get live player count
					for (var h in request.game.data.heroes) {
						if (request.game.data.heroes[h].state.health) {
							counts.live.heroes++
						}
					}

					for (var d in request.game.data.demons) {
						if (request.game.data.demons[d].state.health) {
							counts.live.demons++
						}
					}

				// no one's winning yet
					var previouslyWinning = request.game.data.state.winning.team
					if (!previouslyWinning) {
						if (counts.towers.heroes == counts.towers.total) {
							request.game.data.state.winning.team = "heroes"
						}
						else if (counts.towers.demons == counts.towers.total) {
							request.game.data.state.winning.team = "demons"
						}
						else if (!counts.towers.heroes && !counts.live.heroes) {
							request.game.data.state.winning.team = "demons"
						}
						else if (!counts.towers.demons && !counts.live.demons) {
							request.game.data.state.winning.team = "heroes"
						}
					}

				// someone's winning
					else if (previouslyWinning == "heroes" && (counts.towers.heroes !== counts.towers.total) && (counts.live.demons || counts.towers.demons)) {
						request.game.data.state.winning.team = null
					}
					else if (previouslyWinning == "demons" && (counts.towers.demons !== counts.towers.total) && (counts.live.heroes || counts.towers.heroes)) {
						request.game.data.state.winning.team = null
					}

				// change ?
					if (request.game.data.state.winning.team !== previouslyWinning) {
						var colors = main.getAsset("colors")
						request.game.data.state.winning.color = (request.game.data.state.winning.team == "heroes") ? colors.blue[2] : (request.game.data.state.winning.team == "demons") ? colors.red[2] : null
						request.game.data.state.winning.countdown = (8 * 32) + 128 - (request.game.data.state.beat % 128)
					}

				// countdown
					else if (request.game.data.state.winning.team) {
						request.game.data.state.winning.countdown--

						if (request.game.data.state.winning.countdown <= 0) {
							request.game.data.state.end = new Date().getTime()
							request.game.data.state.beat = 0
						}
					}
			}
			catch (error) {main.logError(error)}
		}
