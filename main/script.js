/*** tools ***/
	/* isNumLet */
		function isNumLet(string) {
			return (/^[a-z0-9A-Z_\s]+$/).test(string)
		}

	/* sanitizeString */
		function sanitizeString(string) {
			if (string.length) {
				return string.replace(/[^a-zA-Z0-9_\s\!\@\#\$\%\^\&\*\(\)\+\=\-\[\]\\\{\}\|\;\'\:\"\,\.\/\<\>\?]/gi, "")
			}
			else {
				return ""
			}
		}

	/* chooseRandom */
		function chooseRandom(options) {
			if (!Array.isArray(options)) {
				return false
			}
			else {
				return options[Math.floor(Math.random() * options.length)]
			}
		}

/*** displays ***/
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

/*** connections ***/
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
		
	/* socket */
		function createSocket() {
			socket = new WebSocket(location.href.replace("http","ws"))

			// open
				socket.onopen = function() {
					socket.send(null)
				}

			// error
				socket.onerror = function(error) {
				}

			// close
				socket.onclose = function() {
					socket = null
				}

			// message
				socket.onmessage = function(message) {
					try {
						var post = JSON.parse(message.data)
						if (post && (typeof post == "object")) {
							receivePost(post)
						}
					}
					catch (error) {}
				}
		}
