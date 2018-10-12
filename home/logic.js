/*** modules ***/
	var main = require("../main/logic")
	var game = require("../game/logic")
	module.exports = {}

/*** creates ***/
	/* createGame */
		module.exports.createGame = createGame
		function createGame(request, id, callback) {
			try {
				// create game
					request.game            = main.getSchema("game")
					request.game.id         = id
					request.game.data.theme = main.chooseRandom(main.getAsset("themes"))

				// create player
					request.game.players[request.session.id] = createPlayer(request)

				callback({success: true, message: "game created", location: "../../game/" + request.game.id})
			}
			catch (error) {
				main.logError(error)
				callback({success: false, message: "unable to create game"})
			}
		}
	
	/* createPlayer */
		module.exports.createPlayer = createPlayer
		function createPlayer(request) {
			try {
				// create player
					var player      = main.getSchema("player")
						player.id   = request.session.id

				// return value
					return player
			}
			catch (error) {main.logError(error)}
		}

/*** joins ***/
	/* joinGame */
		module.exports.joinGame = joinGame
		function joinGame(request, callback) {
			try {
				if (request.game.data.state.end) {
					callback({success: false, message: "game already ended"})
				}
				else if (!request.game.players[request.session.id] && (Object.keys(request.game.players).length >= 8)) {
					callback({success: false, message: "game is at capacity"})
				}
				else if (!request.game.players[request.session.id] && request.game.data.state.start) {
					callback({success: false, message: "game already started"})
				}
				else if (request.game.players[request.session.id]) {
					callback({success: true, message: "rejoining game", location: "../../game/" + request.game.id})
				}
				else {
					// create player
						request.game.players[request.session.id] = createPlayer(request)

					callback({success: true, message: "game joined", location: "../../game/" + request.game.id})
				}
			}
			catch (error) {
				main.logError(error)
				callback({success: false, message: "unable to join game"})
			}
		}
