/*** modules ***/
	var http       = require("http")
	var fs         = require("fs")
	var colors     = getAsset("colors")
	var songs      = getAsset("songs")
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

					case "heroes":
						return [
							{
								name: "Grace",
								team: "heroes",
								instrument: "honeyharp",
								colors: [songs.healing.colors[0], songs.healing.colors[1], colors.blue[2]],
								song: "healing"
							},
							{
								name: "Arthur",
								team: "heroes",
								instrument: "chordstrum",
								colors: [songs.protection.colors[0], songs.protection.colors[1], colors.blue[2]],
								song: "protection"
							},
							{
								name: "Emily",
								team: "heroes",
								instrument: "lazerz",
								colors: [songs.strength.colors[0], songs.strength.colors[1], colors.blue[2]],
								song: "strength"
							},
							{
								name: "Clark",
								team: "heroes",
								instrument: "jangle",
								colors: [songs.flight.colors[0], songs.flight.colors[1], colors.blue[2]],
								song: "flight"
							},
							{
								name: "Abigail",
								team: "heroes",
								instrument: "swello",
								colors: [songs.paralysis.colors[0], songs.paralysis.colors[1], colors.blue[2]],
								song: "paralysis"
							},
							{
								name: "Geoffrey",
								team: "heroes",
								instrument: "buzzorgan",
								colors: [songs.confusion.colors[0], songs.confusion.colors[1], colors.blue[2]],
								song: "confusion"
							},
							{
								name: "Charlotte",
								team: "heroes",
								instrument: "glassical",
								colors: [songs.negation.colors[0], songs.negation.colors[1], colors.blue[2]],
								song: "negation"
							},
							{
								name: "Dorian",
								team: "heroes",
								instrument: "shimmer",
								colors: [songs.pain.colors[0], songs.pain.colors[1], colors.blue[2]],
								song: "pain"
							}
						]
					break

					case "demons":
						return [
							{
								name: "Armistopheles",
								team: "demons",
								instrument: "square",
								colors: [songs.healing.colors[0], songs.healing.colors[1], colors.red[2]],
								song: "healing"
							},
							{
								name: "Ebborthrosh",
								team: "demons",
								instrument: "sine",
								colors: [songs.protection.colors[0], songs.protection.colors[1], colors.red[2]],
								song: "protection"
							},
							{
								name: "Dumrog",
								team: "demons",
								instrument: "sawtooth",
								colors: [songs.strength.colors[0], songs.strength.colors[1], colors.red[2]],
								song: "strength"
							},
							{
								name: "Gifflegorn",
								team: "demons",
								instrument: "triangle",
								colors: [songs.flight.colors[0], songs.flight.colors[1], colors.red[2]],
								song: "flight"
							},
							{
								name: "Chrynthos",
								team: "demons",
								instrument: "clarinaut",
								colors: [songs.paralysis.colors[0], songs.paralysis.colors[1], colors.red[2]],
								song: "paralysis"
							},
							{
								name: "Archnus",
								team: "demons",
								instrument: "reedles",
								colors: [songs.confusion.colors[0], songs.confusion.colors[1], colors.red[2]],
								song: "confusion"
							},
							{
								name: "Golardios",
								team: "demons",
								instrument: "qube",
								colors: [songs.negation.colors[0], songs.negation.colors[1], colors.red[2]],
								song: "negation"
							},
							{
								name: "Draphost",
								team: "demons",
								instrument: "accordienne",
								colors: [songs.pain.colors[0], songs.pain.colors[1], colors.red[2]],
								song: "pain"
							}
						]
					break

					case "songs":
						return {
							"healing": {
								name: "healing",
								description: "other heroes and demons within the aura regenerate health",
								melody: "CDEG",
								radius: 4,
								colors: [colors.green[3], colors.green[1]]
							},
							"protection": {
								name: "protection",
								description: "attacks from outside the aura dissipate on collision",
								melody: "CGAG",
								radius: 5,
								colors: [colors.yellow[3], colors.yellow[1]]
							},
							"strength": {
								name: "strength",
								description: "attacks fired from within the aura are twice as powerful",
								melody: "GEDE",
								radius: 6,
								colors: [colors.orange[3], colors.orange[1]]
							},
							"flight": {
								name: "jump-up",
								description: "other heroes and demons within the aura can fly without landing",
								melody: "CGEG",
								radius: 7,
								colors: [colors.cerulean[3], colors.cerulean[1]]
							},
							"paralysis": {
								name: "paralysis",
								description: "other heroes and demons within the aura are nearly unable to move",
								melody: "AEGD",
								radius: 7,
								colors: [colors.browngray[3], colors.browngray[1]]
							},
							"confusion": {
								name: "confusion",
								description: "left and right controls are reversed within the aura",
								melody: "EGAD",
								radius: 6,
								colors: [colors.purple[3], colors.purple[1]]
							},
							"negation": {
								name: "negation",
								description: "other auras are nullified within this aura",
								melody: "ECDG",
								radius: 5,
								colors: [colors.cyan[3], colors.cyan[1]]
							},
							"pain": {
								name: "pain",
								description: "other heroes and demons within the aura lose health",
								melody: "ACAE",
								radius: 4,
								colors: [colors.magenta[3], colors.magenta[1]]
							}
						}
					break

					case "towers":
						return [
							{
								name: "healing",
								colors: [songs.healing.colors[0], songs.healing.colors[1], colors.black[2]],
								platforms: [{x: 0, y: 11, color: colors.black[2], note: songs.healing.melody[0]}, {x: 1, y: 11, color: colors.black[2], note: songs.healing.melody[1]}, {x: 2, y: 11, color: colors.black[2], note: songs.healing.melody[2]}, {x: 3, y: 8, color: colors.black[2], note: songs.healing.melody[3]}, {x: 0, y: 7, color: colors.black[2], note: songs.healing.melody[0]}, {x: 1, y: 7, color: colors.black[2], note: songs.healing.melody[1]}, {x: 2, y: 7, color: colors.black[2], note: songs.healing.melody[2]}, {x: 3, y: 4, color: colors.black[2], note: songs.healing.melody[3]}]
							},
							{
								name: "protection",
								colors: [songs.protection.colors[0], songs.protection.colors[1], colors.black[2]],
								platforms: [{x: 0, y: 11, color: colors.black[2], note: songs.protection.melody[0]}, {x: 1, y: 11, color: colors.black[2], note: songs.protection.melody[1]}, {x: 2, y: 10, color: colors.black[2], note: songs.protection.melody[2]}, {x: 3, y: 8, color: colors.black[2], note: songs.protection.melody[3]}, {x: 0, y: 7, color: colors.black[2], note: songs.protection.melody[0]}, {x: 1, y: 7, color: colors.black[2], note: songs.protection.melody[1]}, {x: 2, y: 6, color: colors.black[2], note: songs.protection.melody[2]}, {x: 3, y: 4, color: colors.black[2], note: songs.protection.melody[3]}]
							},
							{
								name: "strength",
								colors: [songs.strength.colors[0], songs.strength.colors[1], colors.black[2]],
								platforms: [{x: 0, y: 11, color: colors.black[2], note: songs.strength.melody[0]}, {x: 1, y: 11, color: colors.black[2], note: songs.strength.melody[1]}, {x: 2, y: 9, color: colors.black[2], note: songs.strength.melody[2]}, {x: 3, y: 8, color: colors.black[2], note: songs.strength.melody[3]}, {x: 0, y: 7, color: colors.black[2], note: songs.strength.melody[0]}, {x: 1, y: 7, color: colors.black[2], note: songs.strength.melody[1]}, {x: 2, y: 5, color: colors.black[2], note: songs.strength.melody[2]}, {x: 3, y: 4, color: colors.black[2], note: songs.strength.melody[3]}]
							},
							{
								name: "flight",
								colors: [songs.flight.colors[0], songs.flight.colors[1], colors.black[2]],
								platforms: [{x: 0, y: 11, color: colors.black[2], note: songs.flight.melody[0]}, {x: 1, y: 10, color: colors.black[2], note: songs.flight.melody[1]}, {x: 2, y: 10, color: colors.black[2], note: songs.flight.melody[2]}, {x: 3, y: 8, color: colors.black[2], note: songs.flight.melody[3]}, {x: 0, y: 7, color: colors.black[2], note: songs.flight.melody[0]}, {x: 1, y: 6, color: colors.black[2], note: songs.flight.melody[1]}, {x: 2, y: 6, color: colors.black[2], note: songs.flight.melody[2]}, {x: 3, y: 4, color: colors.black[2], note: songs.flight.melody[3]}]
							},
							{
								name: "paralysis",
								colors: [songs.paralysis.colors[0], songs.paralysis.colors[1], colors.black[2]],
								platforms: [{x: 0, y: 11, color: colors.black[2], note: songs.paralysis.melody[0]}, {x: 1, y: 10, color: colors.black[2], note: songs.paralysis.melody[1]}, {x: 2, y: 9, color: colors.black[2], note: songs.paralysis.melody[2]}, {x: 3, y: 8, color: colors.black[2], note: songs.paralysis.melody[3]}, {x: 0, y: 7, color: colors.black[2], note: songs.paralysis.melody[0]}, {x: 1, y: 6, color: colors.black[2], note: songs.paralysis.melody[1]}, {x: 2, y: 5, color: colors.black[2], note: songs.paralysis.melody[2]}, {x: 3, y: 4, color: colors.black[2], note: songs.paralysis.melody[3]}]
							},
							{
								name: "confusion",
								colors: [songs.confusion.colors[0], songs.confusion.colors[1], colors.black[2]],
								platforms: [{x: 0, y: 11, color: colors.black[2], note: songs.confusion.melody[0]}, {x: 1, y: 10, color: colors.black[2], note: songs.confusion.melody[1]}, {x: 2, y: 8, color: colors.black[2], note: songs.confusion.melody[2]}, {x: 3, y: 8, color: colors.black[2], note: songs.confusion.melody[3]}, {x: 0, y: 7, color: colors.black[2], note: songs.confusion.melody[0]}, {x: 1, y: 6, color: colors.black[2], note: songs.confusion.melody[1]}, {x: 2, y: 4, color: colors.black[2], note: songs.confusion.melody[2]}, {x: 3, y: 4, color: colors.black[2], note: songs.confusion.melody[3]}]
							},
							{
								name: "negation",
								colors: [songs.negation.colors[0], songs.negation.colors[1], colors.black[2]],
								platforms: [{x: 0, y: 11, color: colors.black[2], note: songs.negation.melody[0]}, {x: 1, y: 9, color: colors.black[2], note: songs.negation.melody[1]}, {x: 2, y: 9, color: colors.black[2], note: songs.negation.melody[2]}, {x: 3, y: 8, color: colors.black[2], note: songs.negation.melody[3]}, {x: 0, y: 7, color: colors.black[2], note: songs.negation.melody[0]}, {x: 1, y: 5, color: colors.black[2], note: songs.negation.melody[1]}, {x: 2, y: 5, color: colors.black[2], note: songs.negation.melody[2]}, {x: 3, y: 4, color: colors.black[2], note: songs.negation.melody[3]}]
							},
							{
								name: "pain",
								colors: [songs.pain.colors[0], songs.pain.colors[1], colors.black[2]],
								platforms: [{x: 0, y: 11, color: colors.black[2], note: songs.pain.melody[0]}, {x: 1, y: 9, color: colors.black[2], note: songs.pain.melody[1]}, {x: 2, y: 8, color: colors.black[2], note: songs.pain.melody[2]}, {x: 3, y: 8, color: colors.black[2], note: songs.pain.melody[3]}, {x: 0, y: 7, color: colors.black[2], note: songs.pain.melody[0]}, {x: 1, y: 5, color: colors.black[2], note: songs.pain.melody[1]}, {x: 2, y: 4, color: colors.black[2], note: songs.pain.melody[2]}, {x: 3, y: 4, color: colors.black[2], note: songs.pain.melody[3]}]
							}
						]
					break									

					case "themes":
						return [
							{
								name: "beach",
								terrainForeground:  colors.beige[4],
								terrainBackground:  colors.beige[2],
								platformForeground: colors.brown[3],
								platformBackground: colors.brown[1],
								pitForeground:      colors.cerulean[3],
								pitBackground:      colors.cerulean[2],
								towerForeground:    colors.yellow[1],
								towerBackground:    colors.yellow[0],
								skyTop:             colors.cyan[0],
								skyBottom:          colors.cyan[1]	
							},
							{
								name: "mountain",
								terrainForeground:  colors.black[4],
								terrainBackground:  colors.black[2],
								platformForeground: colors.black[3],
								platformBackground: colors.black[1],
								pitForeground:      colors.bluegray[3],
								pitBackground:      colors.bluegray[2],
								towerForeground:    colors.beige[1],
								towerBackground:    colors.beige[0],
								skyTop:             colors.cerulean[0],
								skyBottom:          colors.cerulean[1]
							},
							{
								name: "forest",
								terrainForeground:  colors.green[4],
								terrainBackground:  colors.green[2],
								platformForeground: colors.orange[3],
								platformBackground: colors.orange[1],
								pitForeground:      colors.purple[3],
								pitBackground:      colors.purple[2],
								towerForeground:    colors.brown[1],
								towerBackground:    colors.brown[0],
								skyTop:             colors.greengray[0],
								skyBottom:          colors.greengray[1]
							},
							{
								name: "volcano",
								terrainForeground:  colors.browngray[4],
								terrainBackground:  colors.browngray[2],
								platformForeground: colors.browngray[3],
								platformBackground: colors.browngray[1],
								pitForeground:      colors.red[3],
								pitBackground:      colors.red[2],
								towerForeground:    colors.black[1],
								towerBackground:    colors.black[0],
								skyTop:             colors.red[0],
								skyBottom:          colors.red[1]
							},
							{
								name: "snowscape",
								terrainForeground:  colors.white[4],
								terrainBackground:  colors.white[2],
								platformForeground: colors.bluegray[3],
								platformBackground: colors.bluegray[1],
								pitForeground:      colors.cyan[3],
								pitBackground:      colors.cyan[2],
								towerForeground:    colors.bluegray[1],
								towerBackground:    colors.bluegray[0],
								skyTop:             colors.cyan[0],
								skyBottom:          colors.cyan[1]	
							},
							{
								name: "lagoon",
								terrainForeground:  colors.blue[4],
								terrainBackground:  colors.blue[2],
								platformForeground: colors.blue[3],
								platformBackground: colors.blue[1],
								pitForeground:      colors.bluegray[3],
								pitBackground:      colors.bluegray[2],
								towerForeground:    colors.purple[1],
								towerBackground:    colors.purple[0],
								skyTop:             colors.blue[0],
								skyBottom:          colors.blue[1]
							},
							{
								name: "swamp",
								terrainForeground:  colors.greengray[4],
								terrainBackground:  colors.greengray[2],
								platformForeground: colors.greengray[3],
								platformBackground: colors.greengray[1],
								pitForeground:      colors.browngray[3],
								pitBackground:      colors.browngray[2],
								towerForeground:    colors.brown[1],
								towerBackground:    colors.brown[0],
								skyTop:             colors.cerulean[0],
								skyBottom:          colors.cerulean[1]
							},
							{
								name: "wasteland",
								terrainForeground:  colors.orange[4],
								terrainBackground:  colors.orange[2],
								platformForeground: colors.orange[3],
								platformBackground: colors.orange[1],
								pitForeground:      colors.yellow[3],
								pitBackground:      colors.yellow[2],
								towerForeground:    colors.black[1],
								towerBackground:    colors.black[0],
								skyTop:             colors.beige[0],
								skyBottom:          colors.beige[1]
							}
						]
					break					

					case "colors":
						return {
							magenta:    ["#ffcce6","#ff66b3","#e60073","#99004d","#33001a"],
							red:        ["#fab7b7","#f66f6f","#d80e0e","#7c0808","#300303"],
							brown:      ["#e09b06","#ae7804","#7c5603","#513802","#191101"],
							browngray:  ["#d5cac3","#b6a196","#a18778","#786154","#4f4037"],
							orange:     ["#fde4ce","#f9ae6c","#f68523","#ab5407","#442103"],
							beige:      ["#f7f4ed","#e0d3b8","#c1a871","#91773f","#6a572f"],
							yellow:     ["#f6f4d5","#e5dd80","#d8cb41","#beb227","#7f771a"],
							green:      ["#a9d3ab","#539e57","#1a661e","#074f0b","#053007"],
							greengray:  ["#d3ded4","#99b29b","#6a8c6c","#4d664e","#374938"],
							cyan:       ["#e6ffff","#b3ffff","#33ffff","#00cccc","#008080"],
							cerulean:   ["#dae7f1","#90b8d5","#4689b9","#2b5572","#1c374a"],
							bluegray:   ["#dee9ed","#adc8d2","#7ba7b7","#487484","#2d4852"],
							blue:       ["#d0e0fb","#d0e0fb","#2b76ef","#0b3d8e","#04142f"],
							purple:     ["#dac0f7","#b08bda","#7b3dc2","#4a2574","#180c26"],
							black:      ["#e4e6e7","#a2a7a9","#6e7477","#3d4142","#232526"],
							white:      ["#c0dee5","#cee2e8","#dcf1f7","#e3f5f9","#f9fdff"]
						}
					break

					default:
						return null
					break
				}
			}
			catch (error) {logError(error)}
		}

	/* getSchema */
		module.exports.getSchema = getSchema
		function getSchema(index) {
			try {
				switch (index) {
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
								theme:  null,
								heroes: {},
								demons: [],
								towers: [],
								map:    [],
								arrows: [],
								auras:  []
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
							left:     false,
							right:    false,
							up:       false,
							down:     false,
							x:        0,
							y:        0,
							vx:       0,
							vy:       0,
							colLeft:  0,
							colRight: 0,
							rowUp:    0,
							rowDown:  0,
							facing:   ["left","right"][Math.floor(Math.random() * 2)],
							selected: true,
							jumpable: false,
							surface:  false,
							tower:    null,
							health:   255,
							keyable:  true,
							keys:     [[],[],[],[],[],[],[],[]],
							songs:    [],
							points:   0
						}
					break

					case "arrow":
						return {
							name:   null,
							team:   null,
							x:      0,
							y:      0,
							vx:     0,
							vy:     0,
							radius: 16,
							colors: []
						}
					break

					case "aura":
						return {
							name:   null,
							team:   null,
							song:   null,
							melody: "",
							x:      0,
							y:      0,
							radius: 0,
							colors: []
						}
					break

					default:
						return null
					break
				}
			}
			catch (error) {logError(error)}
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

/*** randoms ***/
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
