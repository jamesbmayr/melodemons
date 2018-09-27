/*** modules ***/
	var http     = require("http")
	var fs       = require("fs")
	module.exports = {}

/*** logs ***/
	/* logError */
		module.exports.logError = logError
		function logError(error) {
			console.log("\n*** ERROR @ " + new Date().toLocaleString() + " ***")
			console.log(" - " + error)
			console.dir(arguments)
		}

	/* logStatus */
		module.exports.logStatus = logStatus
		function logStatus(status) {
			console.log("\n--- STATUS @ " + new Date().toLocaleString() + " ---")
			console.log(" - " + status)
		}

	/* logMessage */
		module.exports.logMessage = logMessage
		function logMessage(message) {
			console.log(" - " + new Date().toLocaleString() + ": " + message)
		}

/*** maps ***/
	/* getEnvironment */
		module.exports.getEnvironment = getEnvironment
		function getEnvironment(index) {
			try {
				if (process.env.DOMAIN !== undefined) {
					var environment = {
						port:              process.env.PORT,
						domain:            process.env.DOMAIN,
					}
				}
				else {
					var environment = {
						port:              3000,
						domain:            "localhost",
					}
				}

				return environment[index]
			}
			catch (error) {
				logError(error)
				return false
			}
		}

	/* getAsset */
		module.exports.getAsset = getAsset
		function getAsset(index) {
			try {
				switch (index) {
					case "logo":
						return "logo.png"
					break
					
					case "google fonts":
						return '<link href="https://fonts.googleapis.com/css?family=Skranji" rel="stylesheet">'
					break

					case "meta":
						return '<meta charset="UTF-8"/>\
								<meta name="description" content="Melodemons is an asymmetrical multiplayer music-based tower defense platformer."/>\
								<meta name="keywords" content="game,word,guess,party,chaos,switch,swap,play"/>\
								<meta name="author" content="James Mayr"/>\
								<meta property="og:title" content="Melodemons: an asymmetrical multiplayer music-based tower defense platformer"/>\
								<meta property="og:url" content="https://melodemons.com"/>\
								<meta property="og:description" content="Melodemons is an asymmetrical multiplayer music-based tower defense platformer."/>\
								<meta property="og:image" content="https://melodemons.herokuapp..com/banner.png"/>\
								<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"/>'
					break

					case "game":
						return {
							id: null,
							created: (new Date().getTime()),
							loop: null,
							players: {},
							data: {
								state: {
									start: false,
									end:   false,
									beat:  0,
									count: 0
								},
								theme:   null,
								heroes:  {},
								demons:  [],
								towers:  [],
								map:     [],
								objects: []
							}
						}
					break

					case "player":
						return {
							id:         null,
							created:    (new Date().getTime()),
							name:       null,
							selection:  0,
							connected:  false,
							connection: null
						}
					break

					case "state":
						return {
							left:      false,
							right:     false,
							up:        false,
							down:      false,
							jumpReset: false,
							health:    255,
							x:         0,
							y:         0,
							vx:        0,
							vy:        0,
							colLeft:   0,
							colRight:  0,
							rowUp:     0,
							rowDown:   0,
							surface:   false,
							tower:     null,
							keys:      [],
							songs:     [],
							points:    0
						}
					break

					case "heroes":
						return [
							{
								name: "Grace",
								team: "heroes",
								instrument: "honeyharp",
								colors: ["green","yellow"],
								song: "health-up"
							},
							{
								name: "Arthur",
								team: "heroes",
								instrument: "chordstrum",
								colors: ["blue","purple"],
								song: "object-shield"
							},
							{
								name: "Emily",
								team: "heroes",
								instrument: "lazerz",
								colors: ["red","orange"],
								song: "double-attack-damage"
							},
							{
								name: "Clark",
								team: "heroes",
								instrument: "jangle",
								colors: ["blue","green"],
								song: "double-jump-height"
							},
							{
								name: "Abigail",
								team: "heroes",
								instrument: "swello",
								colors: ["purple","black"],
								song: "half-move-speed"
							},
							{
								name: "Geoffrey",
								team: "heroes",
								instrument: "buzzorgan",
								colors: ["magenta","yellow"],
								song: "half-attack-speed"
							},
							{
								name: "Charlotte",
								team: "heroes",
								instrument: "glassical",
								colors: ["orange","blue"],
								song: "silence-magic"
							},
							{
								name: "Dorian",
								team: "heroes",
								instrument: "shimmer",
								colors: ["red","green"],
								song: "health-down"
							}
						]
					break

					case "demons":
						return [
							{
								name: "Armistopheles",
								team: "demons",
								instrument: "square",
								colors: ["green","yellow"],
								song: "health-up"
							},
							{
								name: "Ebborthrosh",
								team: "demons",
								instrument: "sine",
								colors: ["blue","purple"],
								song: "object-shield"
							},
							{
								name: "Dumrog",
								team: "demons",
								instrument: "sawtooth",
								colors: ["red","orange"],
								song: "double-attack-damage"
							},
							{
								name: "Gifflegorn",
								team: "demons",
								instrument: "triangle",
								colors: ["blue","green"],
								song: "double-jump-height"
							},
							{
								name: "Chrynthos",
								team: "demons",
								instrument: "clarinaut",
								colors: ["purple","black"],
								song: "half-move-speed"
							},
							{
								name: "Archnus",
								team: "demons",
								instrument: "reedles",
								colors: ["magenta","yellow"],
								song: "half-attack-speed"
							},
							{
								name: "Golardios",
								team: "demons",
								instrument: "qube",
								colors: ["orange","blue"],
								song: "silence-magic"
							},
							{
								name: "Draphost",
								team: "demons",
								instrument: "accordienne",
								colors: ["red","green"],
								song: "health-down"
							}
						]
					break

					case "songs":
						var shapes = getAsset("shapes")

						return {
							"health-up": {
								name: "health-up",
								description: "heroes and demons within regenerate health",
								melody: "CDEGAGED",
								cells: shapes.circle,
								colors: ["green","yellow"]
							},
							"object-shield": {
								name: "object-shield",
								description: "attacks collide with shield walls",
								melody: "CGAGCGAG",
								cells: shapes.square,
								colors: ["blue","purple"]
							},
							"double-attack-damage": {
								name: "double-attack-damage",
								description: "attacks fired from within deal double damage",
								melody: "CDCAGACA",
								cells: shapes.octagon,
								colors: ["red","orange"]
							},
							"double-jump-height": {
								name: "jump-up",
								description: "heroes and demons within jump twice as high",
								melody: "CGEGCGEG",
								cells: shapes.diamond,
								colors: ["blue","green"]
							},
							"half-move-speed": {
								name: "half-move-speed",
								description: "heroes and demons within move half as fast",
								melody: "ACDEDCDE",
								cells: shapes.diamond,
								colors: ["purple","black"]
							},
							"half-attack-speed": {
								name: "half-attack-speed",
								description: "attacks fired from within move half as fast",
								melody: "ACAGACAG",
								cells: shapes.octagon,
								colors: ["magenta","yellow"]
							},
							"silence-magic": {
								name: "silence-magic",
								description: "other songs collide with shield walls",
								melody: "AEGEDEGE",
								cells: shapes.square,
								colors: ["orange","blue"]
							},
							"health-down": {
								name: "health-down",
								description: "heroes and demons within lose health",
								melody: "AEDCGEDC",
								cells: shapes.circle,
								colors: ["red","green"]
							}
						}
					break

					case "shapes":
						return {
							circle: [
								{x:  0, y:  0}, // center
								{x:  0, y:  1}, {x:  1, y:  0}, {x:  0, y: -1}, {x: -1, y:  0}, // n e s w
								{x: -1, y:  1}, {x:  1, y:  1}, {x:  1, y: -1}, {x: -1, y: -1}, // nw ne se sw
								{x:  0, y:  2}, {x:  2, y:  0}, {x:  0, y: -2}, {x: -2, y:  0}, // nn ee ss ww
								{x: -2, y:  1}, {x: -1, y:  2}, {x:  1, y:  2}, {x:  2, y:  1}, {x:  2, y: -1}, {x:  1, y: -2}, {x: -1, y: -2}, {x: -2, y: -1}, // nww nnw nne nee see sse ssw sww
							],
							octagon: [
								{x:  0, y:  0}, // center
								{x:  0, y:  1}, {x:  1, y:  0}, {x:  0, y: -1}, {x: -1, y:  0}, // n e s w
								{x: -1, y:  1}, {x:  1, y:  1}, {x:  1, y: -1}, {x: -1, y: -1}, // nw ne se sw
								{x:  0, y:  2}, {x:  2, y:  0}, {x:  0, y: -2}, {x: -2, y:  0}, // nn ee ss ww
								{x: -2, y:  1}, {x: -1, y:  2}, {x:  1, y:  2}, {x:  2, y:  1}, {x:  2, y: -1}, {x:  1, y: -2}, {x: -1, y: -2}, {x: -2, y: -1}, // nww nnw nne nee see sse ssw sww
								{x:  0, y:  3}, {x:  3, y:  0}, {x:  0, y: -3}, {x: -3, y:  0}, // nnn eee sss www
								{x: -2, y:  2}, {x:  2, y:  2}, {x:  2, y: -2}, {x: -2, y: -2}, // nnww nnee ssee ssww
								{x: -3, y:  1}, {x: -1, y:  3}, {x:  1, y:  3}, {x:  3, y:  1}, {x:  3, y: -1}, {x:  1, y: -3}, {x: -1, y: -3}, {x: -3, y: -1}, // nwww nnnw nnne neee seee ssse sssw swww
							],
							diamond: [
								{x:  0, y:  0}, // center
								{x:  0, y:  1}, {x:  1, y:  0}, {x:  0, y: -1}, {x: -1, y:  0}, // n e s w
								{x: -1, y:  1}, {x:  1, y:  1}, {x:  1, y: -1}, {x: -1, y: -1}, // nw ne se sw
								{x:  0, y:  2}, {x:  2, y:  0}, {x:  0, y: -2}, {x: -2, y:  0}, // nn ee ss ww
								{x: -2, y:  1}, {x: -1, y:  2}, {x:  1, y:  2}, {x:  2, y:  1}, {x:  2, y: -1}, {x:  1, y: -2}, {x: -1, y: -2}, {x: -2, y: -1}, // nww nnw nne nee see sse ssw sww
								{x:  0, y:  3}, {x:  3, y:  0}, {x:  0, y: -3}, {x: -3, y:  0}, // nnn eee sss www
								{x: -2, y:  2}, {x:  2, y:  2}, {x:  2, y: -2}, {x: -2, y: -2}, // nnww nnee ssee ssww
								{x: -3, y:  1}, {x: -1, y:  3}, {x:  1, y:  3}, {x:  3, y:  1}, {x:  3, y: -1}, {x:  1, y: -3}, {x: -1, y: -3}, {x: -3, y: -1}, // nwww nnnw nnne neee seee ssse sssw swww
								{x:  0, y:  4}, {x:  4, y:  0}, {x:  0, y: -4}, {x: -4, y:  0}, // nnnn eeee ssss wwww
							],
							square: [
								{x:  0, y:  0}, // center
								{x:  0, y:  1}, {x:  1, y:  0}, {x:  0, y: -1}, {x: -1, y:  0}, // n e s w
								{x: -1, y:  1}, {x:  1, y:  1}, {x:  1, y: -1}, {x: -1, y: -1}, // nw ne se sw
								{x:  0, y:  2}, {x:  2, y:  0}, {x:  0, y: -2}, {x: -2, y:  0}, // nn ee ss ww
								{x: -2, y:  1}, {x: -1, y:  2}, {x:  1, y:  2}, {x:  2, y:  1}, {x:  2, y: -1}, {x:  1, y: -2}, {x: -1, y: -2}, {x: -2, y: -1}, // nww nnw nne nee see sse ssw sww
								{x:  0, y:  3}, {x:  3, y:  0}, {x:  0, y: -3}, {x: -3, y:  0}, // nnn eee sss www
								{x: -2, y:  2}, {x:  2, y:  2}, {x:  2, y: -2}, {x: -2, y: -2}, // nnww nnee ssee ssww
								{x: -3, y:  1}, {x: -1, y:  3}, {x:  1, y:  3}, {x:  3, y:  1}, {x:  3, y: -1}, {x:  1, y: -3}, {x: -1, y: -3}, {x: -3, y: -1}, // nwww nnnw nnne neee seee ssse sssw swww
								{x: -3, y:  2}, {x: -2, y:  3}, {x:  2, y:  3}, {x:  3, y:  2}, {x:  3, y: -2}, {x:  2, y: -3}, {x: -2, y: -3}, {x: -3, y: -2}, // nnwww nnnww nnnee nneee sseee sssee sssww sswww
							]
						}
					break

					case "towers":
						return [
							{
								name: "healing",
								colors: ["green","yellow"],
								song: "health-up",
								platforms: [{x: 0, y: 11, note: "C"}, {x: 1, y: 11, note: "D"}, {x: 2, y: 11, note: "E"}, {x: 3, y: 8, note: "G"}, {x: 0, y: 7, note: "A"}, {x: 1, y: 7, note: "G"}, {x: 2, y: 7, note: "E"}, {x: 3, y: 4, note: "D"}]
							},
							{
								name: "protection",
								colors: ["blue","purple"],
								song: "object-shield",
								platforms: [{x: 0, y: 11, note: "C"}, {x: 1, y: 11, note: "G"}, {x: 2, y: 10, note: "A"}, {x: 3, y: 8, note: "G"}, {x: 0, y: 7, note: "C"}, {x: 1, y: 7, note: "G"}, {x: 2, y: 6, note: "A"}, {x: 3, y: 4, note: "G"}]
							},
							{
								name: "strength",
								colors: ["red","orange"],
								song: "double-attack-damage",
								platforms: [{x: 0, y: 11, note: "C"}, {x: 1, y: 11, note: "D"}, {x: 2, y: 9, note: "C"}, {x: 3, y: 8, note: "A"}, {x: 0, y: 7, note: "G"}, {x: 1, y: 7, note: "A"}, {x: 2, y: 5, note: "C"}, {x: 3, y: 4, note: "A"}]
							},
							{
								name: "flight",
								colors: ["blue","green"],
								song: "double-jump-height",
								platforms: [{x: 0, y: 11, note: "C"}, {x: 1, y: 10, note: "G"}, {x: 2, y: 10, note: "E"}, {x: 3, y: 8, note: "G"}, {x: 0, y: 7, note: "C"}, {x: 1, y: 6, note: "G"}, {x: 2, y: 6, note: "E"}, {x: 3, y: 4, note: "G"}]
							},
							{
								name: "immobility",
								colors: ["purple","black"],
								song: "half-move-speed",
								platforms: [{x: 0, y: 11, note: "A"}, {x: 1, y: 10, note: "C"}, {x: 2, y: 9, note: "D"}, {x: 3, y: 8, note: "E"}, {x: 0, y: 7, note: "D"}, {x: 1, y: 6, note: "C"}, {x: 2, y: 5, note: "D"}, {x: 3, y: 4, note: "E"}]
							},
							{
								name: "evasion",
								colors: ["magenta","yellow"],
								song: "half-attack-speed",
								platforms: [{x: 0, y: 11, note: "A"}, {x: 1, y: 10, note: "C"}, {x: 2, y: 8, note: "A"}, {x: 3, y: 8, note: "G"}, {x: 0, y: 7, note: "A"}, {x: 1, y: 6, note: "C"}, {x: 2, y: 4, note: "A"}, {x: 3, y: 4, note: "G"}]
							},
							{
								name: "silence",
								colors: ["orange","blue"],
								song: "silence-magic",
								platforms: [{x: 0, y: 11, note: "A"}, {x: 1, y: 9, note: "E"}, {x: 2, y: 9, note: "G"}, {x: 3, y: 8, note: "E"}, {x: 0, y: 7, note: "D"}, {x: 1, y: 5, note: "E"}, {x: 2, y: 5, note: "G"}, {x: 3, y: 4, note: "E"}]
							},
							{
								name: "pain",
								colors: ["red","green"],
								song: "health-down",
								platforms: [{x: 0, y: 11, note: "A"}, {x: 1, y: 9, note: "E"}, {x: 2, y: 8, note: "D"}, {x: 3, y: 8, note: "C"}, {x: 0, y: 7, note: "G"}, {x: 1, y: 5, note: "E"}, {x: 2, y: 4, note: "D"}, {x: 3, y: 4, note: "C"}]
							}
						]
					break									

					case "themes":
						return [
							{
								name: "coastal",
								terrain: "#91773f",
								terrainBackground: "#d8cbad",
								platform: "#513802",
								platformBackground: "#827761",
								pit: "#2b5572",
								pitBackground: "#617787",
								tower: "#dbd590",
								towerBackground: "#f2eebf",
								skyTop: "#d3ffff",
								skyBottom: "#a8e0e0"
								
							},
							{
								name: "mountain",
								terrain: "#232526",
								terrainBackground: "#afbabf",
								platform: "#4b5256",
								platformBackground: "#b8c1c6",
								pit: "#151819",
								pitBackground: "#919191",
								tower: "#afa389",
								towerBackground: "#cec8b9",
								skyTop: "#daeaf2",
								skyBottom: "#aebdc4"
							},
							{
								name: "forest",
								terrain: "#053007",
								terrainBackground: "#6a8c6c",
								platform: "#442103",
								platformBackground: "#937b66",
								pit: "#180c26",
								pitBackground: "#786e84",
								tower: "#4f4037",
								towerBackground: "#a5958b",
								skyTop: "#dbffe4",
								skyBottom: "#beeaca"
							},
							{
								name: "volcano",
								terrain: "#232222",
								terrainBackground: "#919191",
								platform: "#474545",
								platformBackground: "#a5a2a2",
								pit: "#7c0808",
								pitBackground: "#c17474",
								tower: "#473d5e",
								towerBackground: "#a397bf",
								skyTop: "#ffeaea",
								skyBottom: "#dbbebe"
							}
						]
					break

					default:
						return null
					break
				}
			}
			catch (error) {
				logError(error)
				return false
			}
		}

/*** checks ***/
	/* isNumLet */
		module.exports.isNumLet = isNumLet
		function isNumLet(string) {
			try {
				return (/^[a-z0-9A-Z_\s]+$/).test(string)
			}
			catch (error) {
				logError(error)
				return false
			}
		}

	/* isBot */
		module.exports.isBot = isBot
		function isBot(agent) {
			try {
				switch (true) {
					case (typeof agent == "undefined" || !agent):
						return "no-agent"
					break
					
					case (agent.indexOf("Googlebot") !== -1):
						return "Googlebot"
					break
				
					case (agent.indexOf("Google Domains") !== -1):
						return "Google Domains"
					break
				
					case (agent.indexOf("Google Favicon") !== -1):
						return "Google Favicon"
					break
				
					case (agent.indexOf("https://developers.google.com/+/web/snippet/") !== -1):
						return "Google+ Snippet"
					break
				
					case (agent.indexOf("IDBot") !== -1):
						return "IDBot"
					break
				
					case (agent.indexOf("Baiduspider") !== -1):
						return "Baiduspider"
					break
				
					case (agent.indexOf("facebook") !== -1):
						return "Facebook"
					break

					case (agent.indexOf("bingbot") !== -1):
						return "BingBot"
					break

					case (agent.indexOf("YandexBot") !== -1):
						return "YandexBot"
					break

					default:
						return null
					break
				}
			}
			catch (error) {
				logError(error)
				return false
			}
		}

/*** tools ***/		
	/* renderHTML */
		module.exports.renderHTML = renderHTML
		function renderHTML(request, path, callback) {
			try {
				var html = {}
				fs.readFile(path, "utf8", function (error, file) {
					if (error) {
						logError(error)
						callback("")
					}
					else {
						html.original = file
						html.array = html.original.split(/<script\snode>|<\/script>node>/gi)

						for (html.count = 1; html.count < html.array.length; html.count += 2) {
							try {
								html.temp = eval(html.array[html.count])
							}
							catch (error) {
								html.temp = ""
								logError("<sn>" + Math.ceil(html.count / 2) + "</sn>\n" + error)
							}
							html.array[html.count] = html.temp
						}

						callback(html.array.join(""))
					}
				})
			}
			catch (error) {
				logError(error)
				callback("")
			}
		}

	/* generateRandom */
		module.exports.generateRandom = generateRandom
		function generateRandom(set, length) {
			try {
				set = set || "0123456789abcdefghijklmnopqrstuvwxyz"
				length = length || 32
				
				var output = ""
				for (var i = 0; i < length; i++) {
					output += (set[Math.floor(Math.random() * set.length)])
				}

				if ((/[a-zA-Z]/).test(set)) {
					while (!(/[a-zA-Z]/).test(output[0])) {
						output = (set[Math.floor(Math.random() * set.length)]) + output.substring(1)
					}
				}

				return output
			}
			catch (error) {
				logError(error)
				return null
			}
		}

	/* chooseRandom */
		module.exports.chooseRandom = chooseRandom
		function chooseRandom(options) {
			try {
				if (!Array.isArray(options)) {
					return false
				}
				else {
					return options[Math.floor(Math.random() * options.length)]
				}
			}
			catch (error) {
				logError(error)
				return false
			}
		}

	/* sortRandom */
		module.exports.sortRandom = sortRandom
		function sortRandom(array) {
			try {
				// duplicate array
					var output = duplicateObject(array)

				// fisher-yates shuffle
					var x = output.length
					while (x > 0) {
						var y = Math.floor(Math.random() * x)
						x = x - 1
						var temp = output[x]
						output[x] = output[y]
						output[y] = temp
					}

				return output
			}
			catch (error) {
				logError(error)
				return null
			}
		}

	/* sanitizeString */
		module.exports.sanitizeString = sanitizeString
		function sanitizeString(string) {
			try {
				return string.replace(/[^a-zA-Z0-9_\s\!\@\#\$\%\^\&\*\(\)\+\=\-\[\]\\\{\}\|\;\'\:\"\,\.\/\<\>\?]/gi, "")
			}
			catch (error) {
				logError(error)
				return ""
			}
		}

	/* duplicateObject */
		module.exports.duplicateObject = duplicateObject
		function duplicateObject(object) {
			try {
				return JSON.parse(JSON.stringify(object))
			}
			catch (error) {
				logError(error)
				return null
			}
		}

/*** database ***/
	/* determineSession */
		module.exports.determineSession = determineSession
		function determineSession(request, callback) {
			try {
				if (isBot(request.headers["user-agent"])) {
					request.session = null
				}
				else if (!request.cookie.session || request.cookie.session == null || request.cookie.session == 0) {
					request.session = {
						id: generateRandom(),
						updated: new Date().getTime(),
						info: {
							"ip":         request.ip,
				 			"user-agent": request.headers["user-agent"],
				 			"language":   request.headers["accept-language"],
						}
					}
				}
				else {
					request.session = {
						id: request.cookie.session,
						updated: new Date().getTime(),
						info: {
							"ip":         request.ip,
				 			"user-agent": request.headers["user-agent"],
				 			"language":   request.headers["accept-language"],
						}
					}
				}

				callback()
			}
			catch (error) {
				logError(error)
				callback(false)
			}
		}

	/* cleanDatabase */
		module.exports.cleanDatabase = cleanDatabase
		function cleanDatabase(db) {
			try {
				var games = Object.keys(db)
				var time = new Date().getTime() - (1000 * 60 * 60 * 6)

				for (var g in games) {
					if (games[g].updated < time) {
						delete db[games[g]]
					}
				}
			}
			catch (error) {
				logError(error)
			}
		}
