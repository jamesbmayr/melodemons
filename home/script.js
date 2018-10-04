/*** tools ***/
	/* isNumLet */
		function isNumLet(string) {
			return (/^[a-z0-9A-Z_\s]+$/).test(string)
		}

	/* sendPost */
		function sendPost(post, callback) {
			var request = new XMLHttpRequest()
				request.open("POST", location.pathname, true)
				request.onload = function() {
					if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
						callback(JSON.parse(request.responseText) || {success: false, message: "unknown error"})
					}
					else {
						callback({success: false, readyState: request.readyState, message: request.status})
					}
				}
				request.send(JSON.stringify(post))
		}

	/* displayError */
		var error = document.getElementById("error")
		var errorFadein = null
		var errorFadeout = null

		function displayError(message) {
			error.textContent = message || "unknown error"
			error.className = ""
			error.style.opacity = 0
			
			if (typeof errorFadein  !== "undefined") { clearInterval(errorFadein)  }
			if (typeof errorFadeout !== "undefined") { clearInterval(errorFadeout) }

			errorFadein = setInterval(function() { // fade in
				error.className = ""
				var opacity = Number(error.style.opacity) * 100

				if (opacity < 100) {
					error.style.opacity = Math.ceil( opacity + ((100 - opacity) / 10) ) / 100
				}
				else {
					clearInterval(errorFadein)
					if (typeof errorFadeout !== "undefined") { clearInterval(errorFadeout) }
					
					errorFadeout = setInterval(function() { // fade out
						var opacity = Number(error.style.opacity) * 100

						if (opacity > 0.01) {
							error.style.opacity = Math.floor(opacity - ((101 - opacity) / 10) ) / 100
						}
						else {
							clearInterval(errorFadeout)
							if (typeof errorFadein !== "undefined") { clearInterval(errorFadein) }

							error.className = "hidden"
							error.style.opacity = 0
						}
					}, 100)
				}
			}, 100)
		}

/*** actions ***/
	/* createGame */
		document.getElementById("createGame").addEventListener("click", createGame)
		function createGame() {
			// get values
				var name = document.getElementById("createName").value || null

			if (!name || !name.length || name.length > 10) {
				displayError("Enter a name between 1 and 10 characters.")
			}
			else if (!isNumLet(name)) {
				displayError("Your name can be letters and numbers only.")
			}
			else {
				// data
					var post = {
						action: "createGame",
						name: name
					}

				// submit
					sendPost(post, function(data) {
						if (!data.success) {
							displayError(data.message || "Unable to create a game...")
						}
						else {
							window.location = data.location
						}
					})
			}
		}

	/* joinGame */
		document.getElementById("joinGame").addEventListener("click", joinGame)
		document.getElementById("gameCode").addEventListener("keyup", function (event) { if (event.which == 13) { joinGame() } })
		function joinGame() {
			// get values
				var gameCode = document.getElementById("gameCode").value.replace(" ","").trim().toLowerCase() || false
				var name = document.getElementById("createName").value || null

			if (gameCode.length !== 4) {
				displayError("The game code must be 4 characters.")
			}
			else if (!isNumLet(gameCode)) {
				displayError("The game code can be letters only.")
			}
			else if (!name || !name.length || name.length > 10) {
				displayError("Enter a name between 1 and 10 characters.")
			}
			else if (!isNumLet(name)) {
				displayError("Your name can be letters and numbers only.")
			}
			else {
				// data
					var post = {
						action: "joinGame",
						gameid: gameCode,
						name: name
					}

				// submit
					sendPost(post, function(data) {
						if (!data.success) {
							displayError(data.message || "Unable to join this game...")
						}
						else {
							window.location = data.location
						}
					})
			}
		}

/*** canvas ***/
	/* drawLoop */
		var tracker = {
			state: {x: 0, y: 0}
		}

		var drawLoop = setInterval(function() {
			if (tracker.state.x < sample.length * 32) {
				tracker.state.x += 2
			}
			else {
				tracker.state.x = 0
			}

			drawMap(sample, theme, {tracker: tracker}, true)
		}, 50)
