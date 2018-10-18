/*** modules ***/
	var http       = require("http")
	var fs         = require("fs")
	var debug      = getEnvironment("debug")
	module.exports = {}

/*** logs ***/
	/* logError */
		module.exports.logError = logError
		function logError(error) {
			if (debug) {
				console.log("\n*** ERROR @ " + new Date().toLocaleString() + " ***")
				console.log(" - " + error)
				console.dir(arguments)
			}
		}

	/* logStatus */
		module.exports.logStatus = logStatus
		function logStatus(status) {
			if (debug) {
				console.log("\n--- STATUS @ " + new Date().toLocaleString() + " ---")
				console.log(" - " + status)

			}
		}

	/* logMessage */
		module.exports.logMessage = logMessage
		function logMessage(message) {
			if (debug) {
				console.log(" - " + new Date().toLocaleString() + ": " + message)
			}
		}

	/* logTime */
		module.exports.logTime = logTime
		function logTime(flag, callback) {
			if (debug) {
				var before = process.hrtime()
				callback()
				
				var after = process.hrtime(before)[1] / 1e6
				if (after > 5) {
					logMessage(flag + " " + after)
				}
			}
			else {
				callback()
			}
		}

/*** maps ***/
	/* getEnvironment */
		module.exports.getEnvironment = getEnvironment
		function getEnvironment(index) {
			try {
				if (process.env.DOMAIN !== undefined) {
					var environment = {
						port:   process.env.PORT,
						domain: process.env.DOMAIN,
						debug:  (process.env.DEBUG || false)
					}
				}
				else {
					var environment = {
						port:   3000,
						domain: "localhost",
						debug:  true
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
						return '<link href="https://fonts.googleapis.com/css?family=Orbitron" rel="stylesheet">'
					break
					case "meta":
						return '<meta charset="UTF-8"/>\
								<meta name="description" content="Melodemons is a real-time multiplayer music-based post-capturing platformer."/>\
								<meta name="keywords" content="game,word,guess,party,chaos,switch,swap,play"/>\
								<meta name="author" content="James Mayr"/>\
								<meta property="og:title" content="Melodemons: a real-time multiplayer music-based post-capturing platformer"/>\
								<meta property="og:url" content="https://melodemons.com"/>\
								<meta property="og:description" content="Melodemons is a real-time multiplayer music-based post-capturing platformer."/>\
								<meta property="og:image" content="https://melodemons.herokuapp..com/banner.png"/>\
								<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"/>'
					break
					case "css variables":
						var colors = getAsset("colors")
						var cssColors = ""
						for (var hue in colors) {
							for (var shade in colors[hue]) {
								cssColors += "		--" + hue + "-" + shade + ": " + colors[hue][shade] + ";\n"
							}
						}
						
						return ('/*** variables ***/\n' +
								'	:root {\n' +
								'		--font: Orbitron, sans-serif;\n' +
								'		--borderRadius: 10px;\n' +
										cssColors +
								'	}')
					break
					case "js variables":
						var colors = getAsset("colors")
						var jsColors = ""
						for (var hue in colors) {
							for (var shade in colors[hue]) {
								jsColors += "	--" + hue + "-" + shade + ": " + colors[hue][shade] + ";\n"
							}
						}
						
						return ('/*** variables ***/\n' +
								'	var font   = window.font   = "Orbitron"\n' +
								'	var borderRadius = window.borderRadius = 10\n' +
								'	var colors = window.colors = ' + JSON.stringify(getAsset("colors"), null, "\t"))
					break

					case "text":
						return {
							main:   "Control a sacred tower to learn its magic song.",
							towers: "TOWERS - play a platform's note to capture it",
							auras:  "AURAS - play your avatar or tower melodies",
							arrows: "ARROWS - play three-note chords to attack",							
							goal:   "Claim the 4 towers to sound the song of victory.",
							rejoin: "[ click to rejoin ]"
						}
					break

					case "heroes":
						var songs  = getAsset("songs")
						var colors = getAsset("colors")

						return [
							{
								team: "heroes",
								instrument: "clarinaut",
								colors: [songs.protection.colors[0], songs.protection.colors[1], colors.blue[2]],
								song: "protection"
							},
							{
								team: "heroes",
								instrument: "jangle",
								colors: [songs.flight.colors[0], songs.flight.colors[1], colors.blue[2]],
								song: "flight"
							},
							{
								team: "heroes",
								instrument: "glassical",
								colors: [songs.rapidfire.colors[0], songs.rapidfire.colors[1], colors.blue[2]],
								song: "rapidfire"
							},
							{
								team: "heroes",
								instrument: "shimmer",
								colors: [songs.strength.colors[0], songs.strength.colors[1], colors.blue[2]],
								song: "strength"
							},
							{
								team: "heroes",
								instrument: "buzzorgan",
								colors: [songs.slow.colors[0], songs.slow.colors[1], colors.blue[2]],
								song: "slow"
							},
							{
								team: "heroes",
								instrument: "sine",
								colors: [songs.confusion.colors[0], songs.confusion.colors[1], colors.blue[2]],
								song: "confusion"
							},
							{
								team: "heroes",
								instrument: "triangle",
								colors: [songs.sliding.colors[0], songs.sliding.colors[1], colors.blue[2]],
								song: "sliding"
							},							
							{
								team: "heroes",
								instrument: "qube",
								colors: [songs.darkness.colors[0], songs.darkness.colors[1], colors.blue[2]],
								song: "darkness"
							}
						]
					break

					case "demons":
						var songs  = getAsset("songs")
						var colors = getAsset("colors")

						return [
							{
								team: "demons",
								instrument: "lazerz",
								colors: [songs.protection.colors[0], songs.protection.colors[1], colors.red[2]],
								song: "protection"
							},
							{
								team: "demons",
								instrument: "sharpsichord",
								colors: [songs.flight.colors[0], songs.flight.colors[1], colors.red[2]],
								song: "flight"
							},
							{
								team: "demons",
								instrument: "square",
								colors: [songs.rapidfire.colors[0], songs.rapidfire.colors[1], colors.red[2]],
								song: "rapidfire"
							},
							{
								team: "demons",
								instrument: "sawtooth",
								colors: [songs.strength.colors[0], songs.strength.colors[1], colors.red[2]],
								song: "strength"
							},
							{
								team: "demons",
								instrument: "swello",
								colors: [songs.slow.colors[0], songs.slow.colors[1], colors.red[2]],
								song: "slow"
							},
							{
								team: "demons",
								instrument: "reedles",
								colors: [songs.confusion.colors[0], songs.confusion.colors[1], colors.red[2]],
								song: "confusion"
							},
							{
								team: "demons",
								instrument: "chordstrum",
								colors: [songs.sliding.colors[0], songs.sliding.colors[1], colors.red[2]],
								song: "sliding"
							},
							{
								team: "demons",
								instrument: "accordienne",
								colors: [songs.darkness.colors[0], songs.darkness.colors[1], colors.red[2]],
								song: "darkness"
							}
						]
					break

					case "songs":
						var colors = getAsset("colors")

						return {
							"protection": {
								name: "protection",
								affects: "allies",
								description: "your team is immune to magic arrows",
								melody: "5623",
								colors: [colors.green[3], colors.green[1]]
							},
							"flight": {
								name: "flight",
								affects: "allies",
								description: "your team can fly without landing",
								melody: "6162",
								colors: [colors.cerulean[3], colors.cerulean[1]]
							},
							"rapidfire": {
								name: "rapidfire",
								affects: "allies",
								description: "your team can shoot arrows at a faster rate",
								melody: "2361",
								colors: [colors.magenta[3], colors.magenta[1]]
							},
							"strength": {
								name: "strength",
								affects: "allies",
								description: "your team's arrows are twice as powerful",
								melody: "6323",
								colors: [colors.orange[3], colors.orange[1]]
							},
							"slow": {
								name: "slow",
								affects: "opponents",
								description: "opponents move at a reduced rate",
								melody: "6265",
								colors: [colors.yellow[3], colors.yellow[1]]
							},
							"confusion": {
								name: "confusion",
								affects: "opponents",
								description: "opponents' left and right controls are reversed",
								melody: "1623",
								colors: [colors.purple[3], colors.purple[1]]
							},
							"sliding": {
								name: "sliding",
								affects: "opponents",
								description: "opponents have no friction when moving",
								melody: "3256",
								colors: [colors.cyan[3], colors.cyan[1]]
							},
							"darkness": {
								name: "darkness",
								affects: "opponents",
								description: "opponents can barely see the world",
								melody: "1653",
								colors: [colors.browngray[3], colors.browngray[1]]
							}
						}
					break

					case "towers":
						var songs  = getAsset("songs")
						var colors = getAsset("colors")

						return [
							{
								song: "rapidfire",
								colors: [songs.rapidfire.colors[0], songs.rapidfire.colors[1], colors.black[2]],
								platforms: [{x: 0, y: 11, color: colors.black[2], note: songs.rapidfire.melody[0]}, {x: 1, y: 11, color: colors.black[2], note: songs.rapidfire.melody[1]}, {x: 2, y: 11, color: colors.black[2], note: songs.rapidfire.melody[2]}, {x: 3, y: 8, color: colors.black[2], note: songs.rapidfire.melody[3]}, {x: 0, y: 7, color: colors.black[2], note: songs.rapidfire.melody[0]}, {x: 1, y: 7, color: colors.black[2], note: songs.rapidfire.melody[1]}, {x: 2, y: 7, color: colors.black[2], note: songs.rapidfire.melody[2]}, {x: 3, y: 4, color: colors.black[2], note: songs.rapidfire.melody[3]}]
							},
							{
								song: "protection",
								colors: [songs.protection.colors[0], songs.protection.colors[1], colors.black[2]],
								platforms: [{x: 0, y: 11, color: colors.black[2], note: songs.protection.melody[0]}, {x: 1, y: 11, color: colors.black[2], note: songs.protection.melody[1]}, {x: 2, y: 10, color: colors.black[2], note: songs.protection.melody[2]}, {x: 3, y: 8, color: colors.black[2], note: songs.protection.melody[3]}, {x: 0, y: 7, color: colors.black[2], note: songs.protection.melody[0]}, {x: 1, y: 7, color: colors.black[2], note: songs.protection.melody[1]}, {x: 2, y: 6, color: colors.black[2], note: songs.protection.melody[2]}, {x: 3, y: 4, color: colors.black[2], note: songs.protection.melody[3]}]
							},
							{
								song: "strength",
								colors: [songs.strength.colors[0], songs.strength.colors[1], colors.black[2]],
								platforms: [{x: 0, y: 11, color: colors.black[2], note: songs.strength.melody[0]}, {x: 1, y: 11, color: colors.black[2], note: songs.strength.melody[1]}, {x: 2, y: 9, color: colors.black[2], note: songs.strength.melody[2]}, {x: 3, y: 8, color: colors.black[2], note: songs.strength.melody[3]}, {x: 0, y: 7, color: colors.black[2], note: songs.strength.melody[0]}, {x: 1, y: 7, color: colors.black[2], note: songs.strength.melody[1]}, {x: 2, y: 5, color: colors.black[2], note: songs.strength.melody[2]}, {x: 3, y: 4, color: colors.black[2], note: songs.strength.melody[3]}]
							},
							{
								song: "flight",
								colors: [songs.flight.colors[0], songs.flight.colors[1], colors.black[2]],
								platforms: [{x: 0, y: 11, color: colors.black[2], note: songs.flight.melody[0]}, {x: 1, y: 10, color: colors.black[2], note: songs.flight.melody[1]}, {x: 2, y: 10, color: colors.black[2], note: songs.flight.melody[2]}, {x: 3, y: 8, color: colors.black[2], note: songs.flight.melody[3]}, {x: 0, y: 7, color: colors.black[2], note: songs.flight.melody[0]}, {x: 1, y: 6, color: colors.black[2], note: songs.flight.melody[1]}, {x: 2, y: 6, color: colors.black[2], note: songs.flight.melody[2]}, {x: 3, y: 4, color: colors.black[2], note: songs.flight.melody[3]}]
							},
							{
								song: "slow",
								colors: [songs.slow.colors[0], songs.slow.colors[1], colors.black[2]],
								platforms: [{x: 0, y: 11, color: colors.black[2], note: songs.slow.melody[0]}, {x: 1, y: 10, color: colors.black[2], note: songs.slow.melody[1]}, {x: 2, y: 9, color: colors.black[2], note: songs.slow.melody[2]}, {x: 3, y: 8, color: colors.black[2], note: songs.slow.melody[3]}, {x: 0, y: 7, color: colors.black[2], note: songs.slow.melody[0]}, {x: 1, y: 6, color: colors.black[2], note: songs.slow.melody[1]}, {x: 2, y: 5, color: colors.black[2], note: songs.slow.melody[2]}, {x: 3, y: 4, color: colors.black[2], note: songs.slow.melody[3]}]
							},
							{
								song: "confusion",
								colors: [songs.confusion.colors[0], songs.confusion.colors[1], colors.black[2]],
								platforms: [{x: 0, y: 11, color: colors.black[2], note: songs.confusion.melody[0]}, {x: 1, y: 10, color: colors.black[2], note: songs.confusion.melody[1]}, {x: 2, y: 8, color: colors.black[2], note: songs.confusion.melody[2]}, {x: 3, y: 8, color: colors.black[2], note: songs.confusion.melody[3]}, {x: 0, y: 7, color: colors.black[2], note: songs.confusion.melody[0]}, {x: 1, y: 6, color: colors.black[2], note: songs.confusion.melody[1]}, {x: 2, y: 4, color: colors.black[2], note: songs.confusion.melody[2]}, {x: 3, y: 4, color: colors.black[2], note: songs.confusion.melody[3]}]
							},
							{
								song: "sliding",
								colors: [songs.sliding.colors[0], songs.sliding.colors[1], colors.black[2]],
								platforms: [{x: 0, y: 11, color: colors.black[2], note: songs.sliding.melody[0]}, {x: 1, y: 9, color: colors.black[2], note: songs.sliding.melody[1]}, {x: 2, y: 9, color: colors.black[2], note: songs.sliding.melody[2]}, {x: 3, y: 8, color: colors.black[2], note: songs.sliding.melody[3]}, {x: 0, y: 7, color: colors.black[2], note: songs.sliding.melody[0]}, {x: 1, y: 5, color: colors.black[2], note: songs.sliding.melody[1]}, {x: 2, y: 5, color: colors.black[2], note: songs.sliding.melody[2]}, {x: 3, y: 4, color: colors.black[2], note: songs.sliding.melody[3]}]
							},
							{
								song: "darkness",
								colors: [songs.darkness.colors[0], songs.darkness.colors[1], colors.black[2]],
								platforms: [{x: 0, y: 11, color: colors.black[2], note: songs.darkness.melody[0]}, {x: 1, y: 9, color: colors.black[2], note: songs.darkness.melody[1]}, {x: 2, y: 8, color: colors.black[2], note: songs.darkness.melody[2]}, {x: 3, y: 8, color: colors.black[2], note: songs.darkness.melody[3]}, {x: 0, y: 7, color: colors.black[2], note: songs.darkness.melody[0]}, {x: 1, y: 5, color: colors.black[2], note: songs.darkness.melody[1]}, {x: 2, y: 4, color: colors.black[2], note: songs.darkness.melody[2]}, {x: 3, y: 4, color: colors.black[2], note: songs.darkness.melody[3]}]
							}
						]
					break									

					case "themes":
						var colors = getAsset("colors")

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
								terrainForeground:  colors.bluegray[4],
								terrainBackground:  colors.bluegray[2],
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
								name: "arctic",
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
								name: "marshes",
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
								name: "abyss",
								terrainForeground:  colors.blue[4],
								terrainBackground:  colors.blue[2],
								platformForeground: colors.blue[3],
								platformBackground: colors.blue[1],
								pitForeground:      colors.bluegray[3],
								pitBackground:      colors.bluegray[2],
								towerForeground:    colors.greengray[1],
								towerBackground:    colors.greengray[0],
								skyTop:             colors.blue[0],
								skyBottom:          colors.blue[1]
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
							blue:       ["#d0e0fb","#7a9bd3","#2b76ef","#0b3d8e","#04142f"],
							purple:     ["#dac0f7","#b08bda","#7b3dc2","#4a2574","#180c26"],
							black:      ["#e4e6e7","#a2a7a9","#6e7477","#3d4142","#232526"],
							white:      ["#c0dee5","#cee2e8","#dcf1f7","#e3f5f9","#f9fdff"]
						}
					break

					case "soundtracks":
						return {
								menu: [
									[ // section 0
						/*  0-  3*/		[ [["A1","A2"],[],["A1","A2"],[]] , [[],[],[],[]] , [[],[],[],[]] , [[],[],[],[]] ],								[ [["A1"],[],["A1"],[]] , [[],[],[],[]] , [[],[],[],[]] , [[],[],[],[]] ],														[ [["A1","A2"],[],["A1","A2"],[]] , [[],[],[],[]] , [[],[],[],[]] , [[],[],[],[]] ],								[ [["A1"],[],["A1"],[]] , [[],[],[],[]] , [[],[],[],[]] , [[],[],[],[]] ], 
						/*  4-  7*/		[ [["C2","C3"],[],["C2","C3"],[]] , [[],[],[],[]] , [["C2","C3"],[],["C2","C3"],[]] , [[],[],[],[]] ],				[ [["D2","D3"],[],["D2","D3"],[]] , [[],[],[],[]] , [["E2","E3"],[],["E2","E3"],[]] , [["G2","G3"],[],["G2","G3"],[]] ],		[ [["A1","A3"],[],["A1","A3"],[]] , [["A2"],[],["A2"],[]] , [[],[],[],[]] , [["A1"],[],["A1"],[]] ],				[ [["A1","A3"],[],["A1","A3"],[]] , [["A2"],[],["A2"],[]] , [["E2","E3"],[],["E2","E3"],[]] , [["G2","G3"],[],["G2","G3"],[]] ],		
						/*  8- 11*/		[ [["A1","A3"],[],["A1","A3"],[]] , [["C4"],[],["C4"],[]] , [["D4"],[],["D4"],[]] , [["C4"],[],["C4"],[]] ],		[ [["A1"],[],["A1","A3"],[]] , [["C4"],[],["C4"],[]] , [["D4"],[],["D4"],[]] , [["C4"],[],["E4"],[]] ],							[ [["A1"],[],["A1","A3"],[]] , [["C4"],[],["C4"],[]] , [["D4"],[],["D4"],[]] , [["C4"],[],["C4"],[]] ],				[ [["A1"],[],["A1","A3"],[]] , [["C4"],[],["C4"],[]] , [["D4"],[],["D4"],[]] , [["E4"],[],["G4"],[]] ],		
						/* 12- 15*/		[ [["C2","E4"],[],["C2"],[]] , [["E4"],[],["G4"],[]] , [["C2","E4"],[],["C2"],[]] , [["E4"],[],["G4"],[]] ],		[ [["D2","A4"],[],["D2","C5"],[]] , [["A4"],[],["G4"],[]] , [["E2"],[],["E2","G4"],[]] , [["G2","E4"],[],["G2","D4"],[]] ],		[ [["A1","C4"],[],["A1","A3"],[]] , [["D4"],[],["C4"],[]] , [["A3"],[],["D4"],[]] , [["C4"],[],["G3"],[]] ],		[ [["A1","A3"],[],["A1","A3"],[]] , [[],[],[],[]] , [["E2","G4"],[],["E2","C5"],[]] , [["G2","D5"],[],["G2","E5"],[]] ]
									]
								],
								game: [
									[ // section 0 (A)
						/*  0-  3*/		[ [["A1","A3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","A4"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],				[ [["A1","C3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","A4"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],				[ [["A1","D3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","A4"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],				[ [["A1","C3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","G2"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],
						/*  4-  7*/		[ [["A1","A3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","A4"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],				[ [["A1","C3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","A4"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],				[ [["A1","D3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","A4"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],				[ [["A1","E3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","G3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],
						/*  8- 11*/		[ [["A1","A3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","A4"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],				[ [["A1","C3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","A4"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],				[ [["A1","D3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","A4"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],				[ [["A1","C3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","G2"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],
						/* 12- 15*/		[ [["A1","A3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","A4"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],				[ [["A1","C3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","A4"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],				[ [["A1","D3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","A4"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],				[ [["A1","E3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","G3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ]
									],
									[ // section 1 (B)
						/* 16- 19*/		[ [["C2","E3"],[],["C3"],[]] , [["C2"],[],["C3"],[]] , [["D2","D3"],[],["E3"],[]] , [["D2","G3"],[],["E3"],[]] ],			[ [["A1","A3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","E3"],[],["A2","G3"],[]] ],			[ [["C2","E3"],[],["C3"],[]] , [["C2"],[],["C3"],[]] , [["D2","D3"],[],["E3"],[]] , [["D2","G3"],[],["E3"],[]] ],			[ [["A1","A3"],[],["A2"],[]] , [["A1","G3"],[],["A2"],[]] , [["A1","E3"],[],["A2"],[]] , [["A1","D3"],[],["A2"],[]] ],		
						/* 20- 23*/		[ [["E2","E3"],[],["E3"],[]] , [["E2"],[],["G3"],[]] , [["D2","D3"],[],["A3"],[]] , [["D2","G3"],[],["E3"],[]] ],			[ [["C2","C3"],[],["C3"],[]] , [["C2","C3"],[],["C3"],[]] , [["G1","D3"],[],["A3"],[]] , [["G1","G3"],[],["E3"],[]] ],		[ [["C2","E3"],[],["E3"],[]] , [["C2"],[],["G3"],[]] , [["D2","D3"],[],["A3"],[]] , [["D2","G3"],[],["E3"],[]] ],			[ [["A1","A3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["E2","C3"],[],["D3"],[]] ],
						/* 24- 27*/		[ [["C2","E3"],[],["C3"],[]] , [["C2"],[],["C3"],[]] , [["D2","D3"],[],["E3"],[]] , [["D2","G3"],[],["E3"],[]] ],			[ [["A1","A3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","E3"],[],["A2","G3"],[]] ],			[ [["C2","E3"],[],["C3"],[]] , [["C2"],[],["C3"],[]] , [["D2","D3"],[],["E3"],[]] , [["D2","G3"],[],["E3"],[]] ],			[ [["A1","A3"],[],["A2"],[]] , [["A1","G3"],[],["A2"],[]] , [["A1","E3"],[],["A2"],[]] , [["A1","D3"],[],["A2"],[]] ],
						/* 28- 31*/		[ [["E2","E3"],[],["E3"],[]] , [["E2"],[],["G3"],[]] , [["D2","D3"],[],["A3"],[]] , [["D2","G3"],[],["E3"],[]] ],			[ [["C2","C3"],[],["C3"],[]] , [["C2","C3"],[],["C3"],[]] , [["G1","D3"],[],["A3"],[]] , [["G1","G3"],[],["E3"],[]] ],		[ [["C2","E3"],[],["E3"],[]] , [["C2"],[],["G3"],[]] , [["D2","D3"],[],["A3"],[]] , [["D2","G3"],[],["E3"],[]] ],			[ [["A1","A3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["E2","C3"],[],["D3"],[]] ]
									],
									[ // section 2 (A)
						/* 32- 35*/		[ [["A1","A3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","A4"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],				[ [["A1","C3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","A4"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],				[ [["A1","D3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","A4"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],				[ [["A1","C3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","G2"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],
						/* 36- 39*/		[ [["A1","A3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","A4"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],				[ [["A1","C3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","A4"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],				[ [["A1","D3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","A4"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],				[ [["A1","E3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","G3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],
						/* 40- 43*/		[ [["A1","A3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","A4"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],				[ [["A1","C3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","A4"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],				[ [["A1","D3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","A4"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],				[ [["A1","C3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","G2"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],
						/* 44- 47*/		[ [["A1","A3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","A4"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],				[ [["A1","C3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","A4"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],				[ [["A1","D3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","A4"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],				[ [["A1","E3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","G3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ]
									],
									[ // section 3 (C)
						/* 48- 51*/		[ [["A1","A2"],[],["A2","A3"],[]] , [["A1"],[],[],[]] , [["A1"],[],["C3"],[]] , [["A1","D3"],[],["E3"],[]] ],				[ [["A1","A2"],[],["A2","A3"],[]] , [["A1"],[],["A2"],[]] , [["A1","A2"],[],[],[]] , [["A1","G2"],[],["G2"],[]] ],			[ [["A1","A2"],[],["A2","A3"],[]] , [["A1"],[],[],[]] , [["A1","A2"],[],["C3"],[]] , [["A1","D3"],[],["E3"],[]] ],			[ [["A1","A2"],[],["A2","A3"],[]] , [["A1"],[],["A2"],[]] , [["A1","A2"],[],["E3"],[]] , [["A1","D3"],[],["C3"],[]] ],
						/* 52- 55*/		[ [["D2","D3"],[],[],[]] , [["D2","D3"],[],[],[]] , [["D2","D3"],[],["E3"],[]] , [["D2","A2"],[],["C3"],[]] ],				[ [["D2","D3"],[],[],[]] , [["D2","D3"],[],["C3"],[]] , [["D2","D3"],[],["E3"],[]] , [["D2","D3"],[],["C3"],[]] ],			[ [["A1","A2"],[],["A2","A3"],[]] , [["A1"],[],["A2"],[]] , [["A1","A2"],[],["G2"],[]] , [["A1","A2"],[],["C3"],[]] ],		[ [["A1","A2"],[],["A2","A3"],[]] , [["A1"],[],["G2"],[]] , [["E2","A2"],[],["E2","C3"],[]] , [["E2","D3"],[],["E2","E3"],[]] ],
						/* 56- 59*/		[ [["A1","A2"],[],["A2","A3"],[]] , [["A1"],[],[],[]] , [["A1"],[],["C3"],[]] , [["A1","D3"],[],["E3"],[]] ],				[ [["A1","A2"],[],["A2","A3"],[]] , [["A1"],[],["A2"],[]] , [["A1","A2"],[],[],[]] , [["A1","G2"],[],["G2"],[]] ],			[ [["A1","A2"],[],["A2","A3"],[]] , [["A1"],[],[],[]] , [["A1","A2"],[],["C3"],[]] , [["A1","D3"],[],["E3"],[]] ],			[ [["A1","A2"],[],["A2","A3"],[]] , [["A1"],[],["A2"],[]] , [["A1","A2"],[],["E3"],[]] , [["A1","D3"],[],["C3"],[]] ],
						/* 60- 63*/		[ [["D2","D3"],[],[],[]] , [["D2","D3"],[],[],[]] , [["D2","D3"],[],["E3"],[]] , [["D2","A2"],[],["C3"],[]] ],				[ [["D2","D3"],[],[],[]] , [["D2","D3"],[],["C3"],[]] , [["D2","D3"],[],["E3"],[]] , [["D2","D3"],[],["C3"],[]] ],			[ [["A1","A2"],[],["A2","A3"],[]] , [["A1"],[],["A2"],[]] , [["A1","A2"],[],["G2"],[]] , [["A1","A2"],[],["C3"],[]] ],		[ [["A1","A2"],[],["A2","A3"],[]] , [["A1"],[],["G2"],[]] , [["E2","A2"],[],["E2","C3"],[]] , [["E2","D3"],[],["E2","E3"],[]] ]
									],
									[ // section 4 (B)
						/* 64- 67*/		[ [["C2","E3"],[],["C3"],[]] , [["C2"],[],["C3"],[]] , [["D2","D3"],[],["E3"],[]] , [["D2","G3"],[],["E3"],[]] ],			[ [["A1","A3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","E3"],[],["A2","G3"],[]] ],			[ [["C2","E3"],[],["C3"],[]] , [["C2"],[],["C3"],[]] , [["D2","D3"],[],["E3"],[]] , [["D2","G3"],[],["E3"],[]] ],			[ [["A1","A3"],[],["A2"],[]] , [["A1","G3"],[],["A2"],[]] , [["A1","E3"],[],["A2"],[]] , [["A1","D3"],[],["A2"],[]] ],		
						/* 68- 71*/		[ [["E2","E3"],[],["E3"],[]] , [["E2"],[],["G3"],[]] , [["D2","D3"],[],["A3"],[]] , [["D2","G3"],[],["E3"],[]] ],			[ [["C2","C3"],[],["C3"],[]] , [["C2","C3"],[],["C3"],[]] , [["G1","D3"],[],["A3"],[]] , [["G1","G3"],[],["E3"],[]] ],		[ [["C2","E3"],[],["E3"],[]] , [["C2"],[],["G3"],[]] , [["D2","D3"],[],["A3"],[]] , [["D2","G3"],[],["E3"],[]] ],			[ [["A1","A3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["E2","C3"],[],["D3"],[]] ],
						/* 72- 75*/		[ [["C2","E3"],[],["C3"],[]] , [["C2"],[],["C3"],[]] , [["D2","D3"],[],["E3"],[]] , [["D2","G3"],[],["E3"],[]] ],			[ [["A1","A3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","E3"],[],["A2","G3"],[]] ],			[ [["C2","E3"],[],["C3"],[]] , [["C2"],[],["C3"],[]] , [["D2","D3"],[],["E3"],[]] , [["D2","G3"],[],["E3"],[]] ],			[ [["A1","A3"],[],["A2"],[]] , [["A1","G3"],[],["A2"],[]] , [["A1","E3"],[],["A2"],[]] , [["A1","D3"],[],["A2"],[]] ],
						/* 76- 79*/		[ [["E2","E3"],[],["E3"],[]] , [["E2"],[],["G3"],[]] , [["D2","D3"],[],["A3"],[]] , [["D2","G3"],[],["E3"],[]] ],			[ [["C2","C3"],[],["C3"],[]] , [["C2","C3"],[],["C3"],[]] , [["G1","D3"],[],["A3"],[]] , [["G1","G3"],[],["E3"],[]] ],		[ [["C2","E3"],[],["E3"],[]] , [["C2"],[],["G3"],[]] , [["D2","D3"],[],["A3"],[]] , [["D2","G3"],[],["E3"],[]] ],			[ [["A1","A3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["E2","C3"],[],["D3"],[]] ]
									],
									[ // section 5 (A)
						/* 80- 83*/		[ [["A1","A3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","A4"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],				[ [["A1","C3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","A4"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],				[ [["A1","D3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","A4"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],				[ [["A1","C3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","G2"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],
						/* 84- 87*/		[ [["A1","A3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","A4"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],				[ [["A1","C3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","A4"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],				[ [["A1","D3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","A4"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],				[ [["A1","E3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","G3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],
						/* 88- 91*/		[ [["A1","A3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","A4"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],				[ [["A1","C3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","A4"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],				[ [["A1","D3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","A4"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],				[ [["A1","C3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","G2"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],
						/* 92- 95*/		[ [["A1","A3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","A4"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],				[ [["A1","C3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","A4"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],				[ [["A1","D3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","A4"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],				[ [["A1","E3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","G3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ]
									],
									[ // section 6 (C)
						/* 96- 99*/		[ [["A1","A2"],[],["A2","A3"],[]] , [["A1"],[],[],[]] , [["A1"],[],["C3"],[]] , [["A1","D3"],[],["E3"],[]] ],				[ [["A1","A2"],[],["A2","A3"],[]] , [["A1"],[],["A2"],[]] , [["A1","A2"],[],[],[]] , [["A1","G2"],[],["G2"],[]] ],			[ [["A1","A2"],[],["A2","A3"],[]] , [["A1"],[],[],[]] , [["A1","A2"],[],["C3"],[]] , [["A1","D3"],[],["E3"],[]] ],			[ [["A1","A2"],[],["A2","A3"],[]] , [["A1"],[],["A2"],[]] , [["A1","A2"],[],["E3"],[]] , [["A1","D3"],[],["C3"],[]] ],
						/*100-103*/		[ [["D2","D3"],[],[],[]] , [["D2","D3"],[],[],[]] , [["D2","D3"],[],["E3"],[]] , [["D2","A2"],[],["C3"],[]] ],				[ [["D2","D3"],[],[],[]] , [["D2","D3"],[],["C3"],[]] , [["D2","D3"],[],["E3"],[]] , [["D2","D3"],[],["C3"],[]] ],			[ [["A1","A2"],[],["A2","A3"],[]] , [["A1"],[],["A2"],[]] , [["A1","A2"],[],["G2"],[]] , [["A1","A2"],[],["C3"],[]] ],		[ [["A1","A2"],[],["A2","A3"],[]] , [["A1"],[],["G2"],[]] , [["E2","A2"],[],["E2","C3"],[]] , [["E2","D3"],[],["E2","E3"],[]] ],
						/*104-107*/		[ [["A1","A2"],[],["A2","A3"],[]] , [["A1"],[],[],[]] , [["A1"],[],["C3"],[]] , [["A1","D3"],[],["E3"],[]] ],				[ [["A1","A2"],[],["A2","A3"],[]] , [["A1"],[],["A2"],[]] , [["A1","A2"],[],[],[]] , [["A1","G2"],[],["G2"],[]] ],			[ [["A1","A2"],[],["A2","A3"],[]] , [["A1"],[],[],[]] , [["A1","A2"],[],["C3"],[]] , [["A1","D3"],[],["E3"],[]] ],			[ [["A1","A2"],[],["A2","A3"],[]] , [["A1"],[],["A2"],[]] , [["A1","A2"],[],["E3"],[]] , [["A1","D3"],[],["C3"],[]] ],
						/*108-111*/		[ [["D2","D3"],[],[],[]] , [["D2","D3"],[],[],[]] , [["D2","D3"],[],["E3"],[]] , [["D2","A2"],[],["C3"],[]] ],				[ [["D2","D3"],[],[],[]] , [["D2","D3"],[],["C3"],[]] , [["D2","D3"],[],["E3"],[]] , [["D2","D3"],[],["C3"],[]] ],			[ [["A1","A2"],[],["A2","A3"],[]] , [["A1"],[],["A2"],[]] , [["A1","A2"],[],["G2"],[]] , [["A1","A2"],[],["C3"],[]] ],		[ [["A1","A2"],[],["A2","A3"],[]] , [["A1"],[],["G2"],[]] , [["E2","A2"],[],["E2","C3"],[]] , [["E2","D3"],[],["E2","E3"],[]] ]
									],
									[ // section 7 (D)
						/*112-115*/		[ [["A1","A2"],[],["C3"],[]] , [["A1","D3"],[],["E3"],[]] , [["A1","A2"],[],["C3"],[]] , [["A1","D3"],[],["E3"],[]] ],		[ [["D2","A2"],[],["C3"],[]] , [["D2","D3"],[],["E3"],[]] , [["D2","G3"],[],["E3"],[]] , [["D2","D3"],[],["C3"],[]] ],		[ [["A1","A2"],[],["C3"],[]] , [["A1","D3"],[],["E3"],[]] , [["A1","A2"],[],["C3"],[]] , [["A1","D3"],[],["E3"],[]] ],		[ [["D2","A2"],[],["C3"],[]] , [["D2","D3"],[],["E3"],[]] , [["D2","G3"],[],["E3"],[]] , [["D2","G3"],[],["A3"],[]] ],
						/*116-119*/		[ [["G1","G3"],[],["E3"],[]] , [["G1","D3"],[],["C3"],[]] , [["G1","D3"],[],[],[]] , [["G1","C3"],[],["D3"],[]] ],			[ [["C2","G3"],[],["E3"],[]] , [["C2","D3"],[],["C3"],[]] , [["C2","D3"],[],[],[]] , [["C2","E3"],[],[],[]] ],				[ [["A1","D3"],[],["E3"],[]] , [["A1","D3"],[],["C3"],[]] , [["A1","A2"],[],["G2"],[]] , [["A1","A2"],[],["C3"],[]] ],		[ [["E2","D3"],[],["E3"],[]] , [["E2","D3"],[],["C3"],[]] , [["E2","A2"],[],[],[]] , [["E2","G2"],[],["E2","C3"],[]] ],
						/*120-123*/		[ [["A1","A2"],[],["C3"],[]] , [["A1","D3"],[],["E3"],[]] , [["A1","A2"],[],["C3"],[]] , [["A1","D3"],[],["E3"],[]] ],		[ [["D2","A2"],[],["C3"],[]] , [["D2","D3"],[],["E3"],[]] , [["D2","G3"],[],["E3"],[]] , [["D2","D3"],[],["C3"],[]] ],		[ [["A1","A2"],[],["C3"],[]] , [["A1","D3"],[],["E3"],[]] , [["A1","A2"],[],["C3"],[]] , [["A1","D3"],[],["E3"],[]] ],		[ [["D2","A2"],[],["C3"],[]] , [["D2","D3"],[],["E3"],[]] , [["D2","G3"],[],["E3"],[]] , [["D2","G3"],[],["A3"],[]] ],
						/*124-127*/		[ [["G1","G3"],[],["E3"],[]] , [["G1","D3"],[],["C3"],[]] , [["G1","D3"],[],[],[]] , [["G1","C3"],[],["D3"],[]] ],			[ [["C2","G3"],[],["E3"],[]] , [["C2","D3"],[],["C3"],[]] , [["C2","D3"],[],[],[]] , [["C2","E3"],[],[],[]] ],				[ [["A1","D3"],[],["E3"],[]] , [["A1","D3"],[],["C3"],[]] , [["A1","A2"],[],["G2"],[]] , [["A1","A2"],[],["C3"],[]] ],		[ [["E2","D3"],[],["E3"],[]] , [["E2","D3"],[],["C3"],[]] , [["E2","A2"],[],[],[]] , [["E2","G2"],[],["E2","C3"],[]] ]
									]
								],
								heroes: [
									[ // section 0
						/*  0-  3*/		[ [["A1","A3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","C4"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],		[ [["C2","G3"],[],["C3"],[]] , [["C2"],[],["C3"],[]] , [["C2","C4"],[],["C3"],[]] , [["C2"],[],["C3"],[]] ],		[ [["G1","D4"],[],["G2"],[]] , [["G1"],[],["G2"],[]] , [["G1","C4"],[],["G2"],[]] , [["G1"],[],["G2"],[]] ],		[ [["A2","E4"],[],["A3"],[]] , [["A2"],[],["A3"],[]] , [["A2","C4"],[],["A3"],[]] , [["A2"],[],["A3"],[]] ],
						/*  4-  7*/		[ [["A1","A3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","C4"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],		[ [["C2","G3"],[],["C3"],[]] , [["C2"],[],["C3"],[]] , [["C2","E4"],[],["C3"],[]] , [["C2"],[],["C3"],[]] ],		[ [["G1","D4"],[],["G2"],[]] , [["G1"],[],["G2"],[]] , [["G1","E4"],[],["G2"],[]] , [["G1"],[],["G2"],[]] ],		[ [["C2","C4"],[],["C3"],[]] , [["C2"],[],["C3"],[]] , [["C2"],[],["C3"],[]] , [["C2"],[],[],[]] ]
									]
								],
								demons: [
									[ // section 0
						/*  0-  3*/		[ [["A1","A3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","C4"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],		[ [["A1","E4"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","C4"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],		[ [["D2","D4"],[],["D3"],[]] , [["D2"],[],["D3"],[]] , [["D2","G4"],[],["D3"],[]] , [["D2"],[],["D3"],[]] ],		[ [["E2","E4"],[],["E3"],[]] , [["E2"],[],["E3"],[]] , [["E2"],[],["E3"],[]] , [["E2"],[],["E3"],[]] ],
						/*  4-  7*/		[ [["G1","D4"],[],["G2"],[]] , [["G1"],[],["G2"],[]] , [["G1","E4"],[],["G2"],[]] , [["G1"],[],["G2"],[]] ],		[ [["A1","C4"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1","A3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] ],		[ [["E2","C4"],[],["E3"],[]] , [["E2"],[],["E3"],[]] , [["E2","E4"],[],["E3"],[]] , [["E2"],[],["E3"],[]] ],		[ [["A1","A3"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1"],[],["A2"],[]] , [["A1"],[],[],[]] ]
									]
								]
						}
					break

					case "sample":
						return [
							[{bottom:0,top:3},{bottom:11,top:11,note:'G',team:'heroes'},{bottom:7,top:7,note:'G',team:'heroes'}],[{bottom:0,top:3},{bottom:11,top:11,note:'A',team:'heroes'},{bottom:7,top:7,note:'A',team:'heroes'}],[{bottom:0,top:1},{bottom:10,top:10,note:'D',team:'heroes'},{bottom:6,top:6,note:'D',team:'heroes'}],[{bottom:0,top:2},{bottom:8,top:8,note:'E',team:'heroes'},{bottom:4,top:4,note:'E',team:'heroes'}],[null],[null],[{bottom:0,top:1}],[null],[{bottom:0,top:3}],[{bottom:0,top:3}],[{bottom:0,top:3}],[{bottom:0,top:3}],[{bottom:0,top:4}],[{bottom:0,top:3}],[{bottom:0,top:3},{bottom:6,top:6}],[{bottom:0,top:3},{bottom:7,top:7}],[{bottom:0,top:4},{bottom:8,top:8}],[{bottom:0,top:4},{bottom:9,top:9}],[{bottom:0,top:4},{bottom:9,top:9}],[{bottom:0,top:1},{bottom:5,top:5}],[{bottom:0,top:1},{bottom:4,top:4}],[null,{bottom:6,top:6}],[{bottom:0,top:1}],[null],[null],[null],[{bottom:0,top:1}],[{bottom:0,top:1}],[{bottom:0,top:1}],[{bottom:0,top:4}],[{bottom:0,top:4}],[{bottom:0,top:4}],
							[{bottom:0,top:2},{bottom:11,top:11,note:'E',team:null},{bottom:7,top:7,note:'E',team:null}],[{bottom:0,top:1},{bottom:9,top:9,note:'D',team:null},{bottom:5,top:5,note:'D',team:null}],[{bottom:0,top:2},{bottom:9,top:9,note:'G',team:null},{bottom:5,top:5,note:'G',team:null}],[{bottom:0,top:2},{bottom:8,top:8,note:'A',team:null},{bottom:4,top:4,note:'A',team:null}],[{bottom:0,top:2}],[{bottom:0,top:1}],[null],[null],[null],[{bottom:0,top:1}],[{bottom:0,top:1}],[null],[{bottom:0,top:1}],[{bottom:0,top:1}],[{bottom:0,top:1},{bottom:4,top:4}],[{bottom:0,top:1},{bottom:5,top:5}],[{bottom:0,top:1},{bottom:6,top:6}],[{bottom:0,top:1},{bottom:6,top:6}],[{bottom:0,top:1},{bottom:6,top:6}],[{bottom:0,top:1},{bottom:5,top:5}],[null,{bottom:5,top:5}],[{bottom:0,top:1},{bottom:4,top:4}],[{bottom:0,top:1}],[{bottom:0,top:4}],[{bottom:0,top:3}],[{bottom:0,top:6}],[{bottom:0,top:6}],[{bottom:0,top:7}],[{bottom:0,top:7}],[{bottom:0,top:7}],[{bottom:0,top:4}],[{bottom:0,top:4}],
							[{bottom:0,top:2},{bottom:11,top:11,note:'C',team:'demons'},{bottom:7,top:7,note:'C',team:'demons'}],[{bottom:0,top:1},{bottom:10,top:10,note:'A',team:'demons'},{bottom:6,top:6,note:'A',team:'demons'}],[{bottom:0,top:2},{bottom:8,top:8,note:'D',team:'demons'},{bottom:4,top:4,note:'D',team:'demons'}],[{bottom:0,top:2},{bottom:8,top:8,note:'E',team:'demons'},{bottom:4,top:4,note:'E',team:'demons'}],[{bottom:0,top:2}],[{bottom:0,top:2}],[{bottom:0,top:2}],[{bottom:0,top:2}],[{bottom:0,top:2}],[{bottom:0,top:2}],[{bottom:0,top:1}],[null],[null],[null],[{bottom:0,top:1},{bottom:4,top:4}],[{bottom:0,top:2},{bottom:4,top:4}],[{bottom:0,top:3},{bottom:8,top:8}],[{bottom:0,top:1},{bottom:6,top:6}],[null,{bottom:6,top:6}],[null,{bottom:6,top:6}],[{bottom:0,top:1},{bottom:5,top:5}],[{bottom:0,top:1},{bottom:4,top:4}],[null],[null],[null],[{bottom:0,top:1}],[{bottom:0,top:2}],[{bottom:0,top:1}],[{bottom:0,top:1}],[{bottom:0,top:1}],[{bottom:0,top:1}],[{bottom:0,top:1}],
							[{bottom:0,top:2},{bottom:11,top:11,note:'D',team:null},{bottom:7,top:7,note:'D',team:null}],[{bottom:0,top:1},{bottom:11,top:11,note:'E',team:null},{bottom:7,top:7,note:'E',team:null}],[{bottom:0,top:1},{bottom:11,top:11,note:'A',team:null},{bottom:7,top:7,note:'A',team:null}],[{bottom:0,top:3},{bottom:8,top:8,note:'C',team:null},{bottom:4,top:4,note:'C',team:null}],[{bottom:0,top:3}],[{bottom:0,top:4}],[{bottom:0,top:4}],[{bottom:0,top:4}],[{bottom:0,top:4}],[{bottom:0,top:4}],[{bottom:0,top:4}],[{bottom:0,top:3}],[{bottom:0,top:3}],[{bottom:0,top:3}],[{bottom:0,top:3},{bottom:6,top:6}],[null,{bottom:6,top:6}],[null,{bottom:7,top:7}],[{bottom:0,top:6},{bottom:11,top:11}],[{bottom:0,top:6},{bottom:11,top:11}],[{bottom:0,top:5},{bottom:9,top:9}],[null,{bottom:8,top:8}],[{bottom:0,top:6},{bottom:9,top:9}],[{bottom:0,top:7}],[{bottom:0,top:8}],[{bottom:0,top:9}],[null],[null],[null],[{bottom:0,top:8}],[{bottom:0,top:8}],[{bottom:0,top:4}],[{bottom:0,top:4}]
						]
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
							id:        null,
							created:   (new Date().getTime()),
							stateLoop: null,
							beatLoop:  null,
							players:   {},
							map:       [],
							theme:     null,
							data: {
								beat: true,
								keys: [],
								state: {
									start:   false,
									end:     false,
									beat:    0,
									winning: {
										team:      null,
										color:     null,
										countdown: 512
									},
									message: {
										text:      null,
										countdown: 0
									}
								},
								heroes: {},
								demons: {},
								towers: [],
								arrows: []
							}
						}
					break

					case "player":
						return {
							id:         null,
							created:    (new Date().getTime()),
							selection:  0,
							team:       null,
							connected:  false,
							connection: null
						}
					break

					case "state":
						var songs = getAsset("songs")
						var auras = {}
						for (var s in songs) {
							auras[s] = {
								name:   s,
								colors: [songs[s].colors[0],songs[s].colors[1]],
								radius: 0,
								tower:  false
							}
						}

						return {
							left:      false,
							right:     false,
							up:        false,
							down:      false,
							x:         0,
							y:         0,
							vx:        0,
							vy:        0,
							colLeft:   0,
							colRight:  0,
							rowUp:     0,
							rowDown:   0,
							facing:    ["left","right"][Math.floor(Math.random() * 2)],
							jumpable:  false,
							surface:   false,
							tower:     null,
							health:    255,
							cooldown:  0,
							keys:      [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
							songs:     [],
							auras:     auras,
							collision: false,
							shot:      false
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
