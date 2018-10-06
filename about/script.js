/*** tools ***/
	/* sanitizeString */
		function sanitizeString(string) {
			return (string.length ? string.replace(/[^a-zA-Z0-9_\s\!\@\#\$\%\^\&\*\(\)\+\=\-\[\]\\\{\}\|\;\'\:\"\,\.\/\<\>\?]/gi, "") : "")
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
	/* submitFeedback */
		document.getElementById("feedback-submit").addEventListener("click", submitFeedback)
		document.getElementById("feedback-email").addEventListener("keyup", function(event) { if (event.which == 13) { submitFeedback() } })
		function submitFeedback() {
			var text  = document.getElementById("feedback-text").value  || false
			var email = document.getElementById("feedback-email").value || false

			if (!text || !text.length) {
				displayError("No text was entered.")
			}
			else if (!email || !isEmail(email)) {
				displayError("Please enter a valid email.")
			}
			else {
				displayError("Thanks! Feedback sent!")

				try {
					var time = new Date()
					var text = sanitizeString(text).replace(/\&/gi, "%26")

					var request = new XMLHttpRequest()
						request.open("GET", "https://script.google.com/macros/s/AKfycbzF3NfxiIEEoofvMLq0nNk5VQVBC7ucMl9HivJLs1-hvOkwOVQ/exec?time=" + time + "&email=" + email + "&text=" + text, true)
						request.onload = function() {
							displayError("Thanks! Feedback sent!")
						}
					request.send("")
				} catch (error) {}

				document.getElementById("feedback-text").value  = ""
				document.getElementById("feedback-email").value = ""
			}
		}

/*** canvas ***/
	/* drawLoop */
		var tracker = {
			state: {x: 0, y: 0}
		}

		var drawLoop = setInterval(function() {
			if (tracker.state.x > 0) {
				tracker.state.x -= 2
			}
			else {
				tracker.state.x = sample.length * 32
			}

			drawMap(sample, theme, {tracker: tracker}, true)
		}, 50)
