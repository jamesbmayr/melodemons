/*** onload ***/
	/* elements */
		var canvas   = document.getElementById("canvas")
		var dataview = document.getElementById("dataview")
	
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
		}, 5000)

/*** submits ***/
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

/*** receives ***/
	/* receivePost */
		function receivePost(post) {
			if (post.location !== undefined) {
				window.location = post.location
			}
			else {
				dataview.innerHTML = JSON.stringify(post, 2, 2, 2)
			}
		}
