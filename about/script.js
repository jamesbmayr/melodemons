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
						request.open("GET", "https://script.google.com/macros/s/XYZ/exec?time=" + time + "&email=" + email + "&text=" + text, true)
						request.onload = function() {
							displayError("Thanks! Feedback sent!")
						}
					request.send("")
				} catch (error) {}

				document.getElementById("feedback-text").value  = ""
				document.getElementById("feedback-email").value = ""
			}
		}
		