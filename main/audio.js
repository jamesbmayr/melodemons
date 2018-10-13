/*** audio ***/
	/* frequencies */
		window.frequencies = frequencies = {
			C: [16.35,32.70, 65.41,130.81,261.63,523.25,1046.50,2093.00,4186.01, 8372.02],
			D: [18.35,36.71, 73.42,146.83,293.67,587.33,1174.66,2349.32,4698.63, 9397.26],
			E: [20.60,41.20, 82.41,164.81,329.63,659.25,1318.51,2637.02,5274.04,10548.08],
			G: [24.50,49.00, 98.00,196.00,392.00,783.99,1567.98,3135.96,6271.93,12543.86],
			A: [27.50,55.00,110.00,220.00,440.00,880.00,1760.00,3520.00,7040.00,14080.00]
		}

	/* variables */
		window.audio  = audio  = null
		window.master = master = null

	/* buildAudio */
		window.buildAudio = buildAudio
		function buildAudio() {
			// audio context
				audio = new (window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.oAudioContext || window.msAudioContext)()

			// master volume
				master = audio.createGain()
				master.connect(audio.destination)
				master.gain.setValueAtTime(1, audio.currentTime)
		}

/*** instrument ***/
	/* buildInstrument */
		window.buildInstrument = buildInstrument
		function buildInstrument(parameters) {
			// parameters & nodes
				var i = {
					parameters: {
						polysynth: {},
						imag:         new Float32Array([0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]),
						real:         new Float32Array(34),
						wave:         null,
						envelope: {
							attack:   0,
							decay:    0,
							sustain:  1,
							release:  0,
						},
						bitcrusher:   {
							bits: 0,
							norm: 0
						},
						filters:      {},
						echo: {
							delay:    0,
							feedback: 0
						}
					},
					tones:       {},
					velocities:  {},
					envelopes:   {},
					bitcrushers: {},
					filterIn:  audio.createGain(),
					filterOut: audio.createGain(),
					filters:   {},
					effects:   {
						delay:    audio.createDelay(),
						feedback: audio.createGain()
					},
					volume:    audio.createGain(),
					power:     audio.createGain()
				}

			// default values
				i.effects.feedback.gain.setValueAtTime(0, audio.currentTime)
				i.filterIn.gain.setValueAtTime(1, audio.currentTime)
				i.filterOut.gain.setValueAtTime(1, audio.currentTime)
				i.volume.gain.setValueAtTime(0.5, audio.currentTime)	
				i.power.gain.setValueAtTime(1, audio.currentTime)

			// connections
				i.parameters.wave = audio.createPeriodicWave(i.parameters.real, i.parameters.imag)
				
				i.filterIn.connect(i.filterOut)
				i.filterOut.connect(i.effects.delay)
				i.filterOut.connect(i.volume)

				i.effects.delay.connect(i.effects.feedback)
				i.effects.feedback.connect(i.effects.delay)
				i.effects.feedback.connect(i.volume)

				i.volume.connect(i.power)
				i.power.connect(master)

			/* setParameters */
				i.setParameters = function(parameters) {
					try {
						var now = audio.currentTime
						var keys = Object.keys(parameters)
						for (var k = 0; k < keys.length; k++) {
							switch (keys[k]) {
								// meta
									case "name":
										i.parameters.name = parameters.name
									break

									case "power":
										parameters.power = Math.floor(parameters.power || 0)
										i.power.gain.setValueAtTime(parameters.power, now)
									break

									case "volume":
										parameters.volume = Math.max(0, Math.min(1, parameters.volume))
										i.volume.gain.setValueAtTime(parameters.volume, now)
									break

								// polysynth
									case "polysynth":
										for (var x in parameters.polysynth) {
											var tone = Math.max(-12, Math.min(12, x))
											if (parameters.polysynth[tone] && !i.parameters.polysynth[tone]) {
												i.parameters.polysynth[tone] = true
											}
											else if (!parameters.polysynth[tone] && i.parameters.polysynth[tone]) {
												delete i.parameters.polysynth[tone]
											}
										}
									break

								// oscillator
									case "imag":
										i.parameters.imag = new Float32Array(34)
										i.parameters.real = new Float32Array(34)
										for (var x = 1; x < i.parameters.imag.length; x++) {
											i.parameters.imag[x] = parameters.imag[x] || 0
										}
										i.parameters.wave = audio.createPeriodicWave(i.parameters.real, i.parameters.imag)
									break

									case "harmonic":
										var harmonic = Object.keys(parameters.harmonic)[0]
										i.parameters.imag[harmonic] = Math.max(0, Math.min(1, parameters.harmonic[harmonic]))
										i.parameters.wave   = audio.createPeriodicWave(i.parameters.real, i.parameters.imag)
									break

								// envelope
									case "envelope":
										i.parameters.envelope.attack  = Math.max(0, Math.min(1, parameters.envelope.attack ))
										i.parameters.envelope.decay   = Math.max(0, Math.min(1, parameters.envelope.decay  ))
										i.parameters.envelope.sustain = Math.max(0, Math.min(1, parameters.envelope.sustain))
										i.parameters.envelope.release = Math.max(0, Math.min(1, parameters.envelope.release))
									break

								// filter
									case "filters":
										for (var f in parameters.filters) {
											var gain = Math.max(-50,  Math.min(50, parameters.filters[f].gain))

											// delete filter
												if (Math.abs(gain) < 2) {
													if (i.filters[f]) {
														i.filters[f].gain.cancelScheduledValues(now)
														i.filters[f].disconnect()
														delete i.filters[f]
														delete i.parameters.filters[f]
													}
												}

											// new / adjust filter
												else {
													var low  = Math.max(1, Math.min(20000, parameters.filters[f].low ))
													var mid  = Math.max(1, Math.min(20000, parameters.filters[f].mid ))
													var high = Math.max(1, Math.min(20000, parameters.filters[f].high))
													var type = ((mid < 65) ? "lowshelf" : (mid > 4000) ? "highshelf" : "peaking")
													
													i.parameters.filters[f] = {
														low: low,
														mid: mid,
														high: high,
														type: type,
														frequency: ((type == "lowshelf") ? high : (type == "highshelf") ? low : mid),
														q:    mid / (high - low),
														gain: gain
													}

													if (!i.filters[f]) {
														i.filters[f] = audio.createBiquadFilter()	
													}
													i.filters[f].type = type
													i.filters[f].frequency.setValueAtTime(i.parameters.filters[f].frequency,  now)
													i.filters[f].Q.setValueAtTime(Math.min(10000, i.parameters.filters[f].q), now)
													i.filters[f].gain.setValueAtTime(     i.parameters.filters[f].gain,       now)
												}
										}

										// manage connections
											i.filterIn.disconnect()

											var fkeys = Object.keys(i.filters) || []
											if (fkeys.length) {
												for (var f = 0; f < fkeys.length; f++) {
													i.filters[fkeys[f]].disconnect()
												}

												for (var f = 0; f < fkeys.length; f++) {
													if (!f) {
														i.filterIn.connect(i.filters[fkeys[f]])
													}
													if (f + 1 == fkeys.length) {
														i.filters[fkeys[f]].connect(i.filterOut)
													}
													else {
														i.filters[fkeys[f]].connect(i.filters[fkeys[f + 1]])
													}
												}
											}
											else {
												i.filterIn.connect(i.filterOut)
											}
									break

								// bitcrusher
									case "bitcrusher":
										i.parameters.bitcrusher.bits = Math.max(0, Math.min(64, parameters.bitcrusher.bits))
										i.parameters.bitcrusher.norm = Math.max(0, Math.min(1,  parameters.bitcrusher.norm))
									break

								// echo
									case "echo":
										i.parameters.echo.delay    = Math.max(0, Math.min(1, parameters.echo.delay    ))
										i.parameters.echo.feedback = Math.max(0, Math.min(1, parameters.echo.feedback ))

										i.effects.delay.delayTime.setValueAtTime(i.parameters.echo.delay, now)
										i.effects.feedback.gain.setValueAtTime(i.parameters.echo.feedback, now)

										if (!i.parameters.echo.delay || !i.parameters.echo.feedback) {
											i.effects.feedback.gain.cancelScheduledValues(now)
										}
									break
							}
						}

					} catch (error) {}
				}

			/* press */
				i.press = function(pitch, when, velocity) {
					try {
						// info
							var pitch = Math.max(8.18, Math.min(16744.04, pitch))
							var now   = audio.currentTime + (Number(when) || 0)

						// velocity
							if (velocity) {
								velocity = Math.max(0, Math.min(2, (velocity || 1)))
							}
							else {
								velocity = 1
							}

							if (i.velocities[pitch]) {
								i.velocities[pitch].gain.cancelScheduledValues(now)
								i.velocities[pitch].disconnect()
								delete i.velocities[pitch]
							}
							
							i.velocities[pitch] = audio.createGain()
							i.velocities[pitch].gain.setValueAtTime(0, audio.currentTime)
							i.velocities[pitch].gain.setValueAtTime(velocity, now)

						// oscillator
							var polysynths = Object.keys(i.parameters.polysynth)
							for (var p = 0; p < polysynths.length; p++) {
								var distance = polysynths[p]
								var multiplier = Math.pow(1.05946309436, distance)

								if (i.tones[pitch + "_" + distance]) {
									i.tones[pitch + "_" + distance].stop(now)
									i.tones[pitch + "_" + distance].disconnect()
									delete i.tones[pitch + "_" + distance]
								}

								i.tones[pitch + "_" + distance] = audio.createOscillator()
								i.tones[pitch + "_" + distance].connect(i.velocities[pitch])
								i.tones[pitch + "_" + distance].frequency.setValueAtTime(pitch * multiplier, now)
								i.tones[pitch + "_" + distance].setPeriodicWave(i.parameters.wave)
								i.tones[pitch + "_" + distance].start(now)
							}

						// envelopes
							if (i.envelopes[pitch]) {
								i.envelopes[pitch].gain.cancelScheduledValues(now)
								i.envelopes[pitch].disconnect()
								delete i.envelopes[pitch]
							}

							i.envelopes[pitch] = audio.createGain()
							i.velocities[pitch].connect(i.envelopes[pitch])
							i.envelopes[pitch].gain.setValueAtTime(0, audio.currentTime)
							i.envelopes[pitch].gain.linearRampToValueAtTime(1, now + (i.parameters.envelope.attack || 0))
							i.envelopes[pitch].gain.exponentialRampToValueAtTime((i.parameters.envelope.sustain || 0) + 0.001, now + (i.parameters.envelope.attack || 0) + (i.parameters.envelope.decay || 0))
							i.envelopes[pitch].gain.linearRampToValueAtTime(0, now + (i.parameters.envelope.attack || 0) + (i.parameters.envelope.decay || 0) + 0.001)

						// bitcrusher
							if (!i.parameters.bitcrusher.bits) {
								i.envelopes[pitch].connect(i.filterIn)
							}
							else {
								if (i.bitcrushers[pitch]) {
									i.bitcrushers[pitch].disconnect()
									delete i.bitcrushers[pitch]
								}

								var wait = 0
								var hold = 0
								var step = Math.pow(0.5, i.parameters.bitcrusher.bits)

								i.bitcrushers[pitch] = audio.createScriptProcessor(1024, 1, 1)
								i.bitcrushers[pitch].connect(i.filterIn)
								i.bitcrushers[pitch].onaudioprocess = function(event) {
									var input  =  event.inputBuffer.getChannelData(0)
									var output = event.outputBuffer.getChannelData(0)

									for (var x = 0; x < 1024; x++) {
										wait += i.parameters.bitcrusher.norm
										if (wait >= 1) {
											wait -= 1
											hold  = step * Math.floor((input[x] / step) + 0.5)
										}
										output[x] = hold
									}
								}

								i.envelopes[pitch].connect(i.bitcrushers[pitch])
							}
					} catch (error) {console.log(error)}
				}
			
			// start
				i.setParameters(parameters || {})
				return i
		}

	/* getInstrument */
		window.getInstrument = getInstrument
		function getInstrument(name) {
			switch (name) {
				case "honeyharp":
					return {
						"name": "honeyharp",
						"polysynth":{
							"0":true
						},
						"imag":[0,1,0,0.2178429514169693,0,0.14940421283245087,0,0.1158275306224823,0.3807923495769501,0.08310726284980774,0.0001470343122491613,0.05094950646162033,0,0.012528758496046066,0,0.030789503827691078,0,0.036400504410266876,0.0427282489836216,0.0037623702082782984,0.007912619970738888,0.0005064468132331967,0,0.003089423757046461,0,0.014406030997633934,0.019122179597616196,0.03117973357439041,0.00888627115637064,0.03448168560862541,0.0077970088459551334,0.029125453904271126,0.022520482540130615,0.0078049697913229465],
						"envelope":{
							"attack":0.008811254291446448,
							"decay":1,
							"sustain":0,
							"release":1
						},
						"filters":{
							"1":{
								"low":822.8462713537634,
								"mid":8221.107072310962,
								"high":20000,
								"gain":-25
							},
							"2":{
								"low":2390.278220900194,
								"mid":10548.081821211836,
								"high":20000,
								"gain":-25
							}
						},
						"echo":{
							"delay":0.00835524908457173,
							"feedback":0.7594509205795837
						}
					}
				break
				case "sine":
					return {
						"name": "sine",
						"polysynth": {
							"12": true,
						},
						"imag": [0, 1],
						"envelope": {
							"attack": 0.01,
							"decay": 1,
							"sustain": 0,
							"release": 0.5
						},
						"echo": {
							"delay": 0.1,
							"feedback": 0.7
						},
					}
				break
				case "square":
					return {
						"name": "square",
						"polysynth": {
							"0": true,
						},
						"imag": [0, (1/1), 0, (1/3), 0, (1/5), 0, (1/7), 0, (1/9), 0, (1/11), 0, (1/13), 0, (1/15), 0, (1/17), 0, (1/19), 0, (1/21), 0, (1/23), 0, (1/25), 0, (1/27), 0, (1/29), 0, (1/31), 0, (1/33)],
						"envelope": {
							"attack": 0.01,
							"decay": 1,
							"sustain": 0,
							"release": 0.2
						}
					}
				break
				case "triangle":
					return {
						"name": "triangle",
						"polysynth": {
							"0": true,
						},
						"imag": [0, (1/1), 0, (1/9), 0, (1/25), 0, (1/49), 0, (1/81), 0, (1/121), 0, (1/169), 0, (1/225), 0, (1/289), 0, (1/361), 0, (1/441), 0, (1/529), 0, (1/625), 0, (1/729), 0, (1/841), 0, (1/961), 0, (1/1089)],
						"envelope": {
							"attack": 0.01,
							"decay": 1,
							"sustain": 0,
							"release": 0.2
						}
					}
				break
				case "sawtooth":
					return {
						"name": "sawtooth",
						"polysynth": {
							"0": true,
							"-12": true,
						},
						"imag": [0, (1/1), (1/4), (1/9), (1/16), (1/25), (1/36), (1/49), (1/64), (1/81), (1/100), (1/121), (1/144), (1/169), (1/196), (1/225), (1/256), (1/289), (1/324), (1/361), (1/400), (1/441), (1/484), (1/529), (1/576), (1/625), (1/676), (1/729), (1/784), (1/841), (1/900), (1/961), (1/1024), (1/1089)],
						"envelope": {
							"attack": 0.01,
							"decay": 1,
							"sustain": 0,
							"release": 1
						},
						"volume": 0.75
					}
				break
				case "shimmer":
					return {
						"name": "shimmer",
						"polysynth": {
							"12": true
						},
						"imag": [0, (1/1), 0, (1/3), 0, (1/5), 0, (1/7), 0, (1/9), 0, (1/11), 0, (1/13), 0, (1/15), 0, (1/17), 0, (1/19), 0, (1/21), 0, (1/23), 0, (1/25), 0, (1/27), 0, (1/29), 0, (1/31), 0, (1/33)],
						"envelope": {
							"attack": 0.01,
							"decay": 0.2,
							"sustain": 0,
							"release": 0.5
						},
						"bitcrusher": {
							"bits": 16,
							"norm": 0.25
						},
						"echo": {
							"delay": 0.08,
							"feedback": 0.7
						},
						"volume": 0.25
					}
				break
				case "jangle":
					return {
						"name":"jangle",
						"polysynth": {
							"0":true,
							"12":true,
						},
						"imag":[0,1,0,0,0,0,0,0,0.46878501772880554,0,0,0,0,0,0,0,0.341684490442276,0,0,0,0,0,0,0,0.09400142729282379,0,0,0,0,0,0,0,0.21132497489452362,0.022081943228840828],
						"envelope":{
							"attack":0.0024277414605824318,
							"decay":0.2568350031240243,
							"sustain":0,
							"release":0.870276277426606
						},
						"filters":{
							"0":{
								"low":9.92437152514077,
								"mid":32.91541662897909,
								"high":109.16808677654838,
								"gain":-20.072992700729927
							},
							"1":{
								"low":1643.5737813862252,
								"mid":2711.746487860111,
								"high":4474.133803849979,
								"gain":15.835058285216256
							}
						},
						"echo":{
							"delay":0.07412233349465767,
							"feedback":0.6897265497330863
						},
						"volume": 0.25
					}
				break
				case "chordstrum":
					return {
						"name":"chordstrum",
						"polysynth":{
							"12":true
						},
						"imag":[0,1,0.17831625044345856,0.46575266122817993,0.2041115015745163,0.4126817286014557,0.10914841294288635,0.060591064393520355,0.08364199101924896,0.02575693279504776,0.01693502813577652,0.05870021879673004,0.0666189193725586,0.05404908210039139,0.06647317111492157,0.03880130127072334,0.053111664950847626,0.051343005150556564,0,0.0007156424107961357,0.014325405471026897,0.015581578016281128,0.010473430156707764,0,0,0,0,0,0.0028332876972854137,0,0,0,0,0.002175448928028345],
						"envelope":{
							"attack":0.005265295838668044,
							"decay":0.4,
							"sustain":0,
							"release":0.1
						},
						"echo":{
							"delay":0.0010553957105702905,
							"feedback":0.8857754774228093
						},
						"volume": 0.5
					}
				break
				case "lazerz":
					return {
						"name": "lazerz",
						"polysynth":{
							"0":true
						},
						"imag":[0,1,0.43981871008872986,0.19477427005767822,0.16363249719142914,0.04059608280658722,0.05547327548265457,0.08984045684337616,0.02408204786479473,0.05339190736413002,0.0810762494802475,0.049579720944166183,0.004129277542233467,0.06980492174625397,0.011852550320327282,0.011417913250625134,0.05199107900261879,0.0462377704679966,0.011805979534983635,0.041976239532232285,0.04228879511356354,0.03486672788858414,0.03639288619160652,0.005501041188836098,0.018338866531848907,0.004767595790326595,0.02615637518465519,0.016462303698062897,0.018449874594807625,0.03333821892738342,0.03183285519480705,0.022049419581890106,0.020332850515842438,0.0260325875133276],
						"envelope":{
							"attack":0.00103,
							"decay":0.6066113351908449,
							"sustain":0,
							"release":0.2983127072001239
						},
						"filters":{
							"0":{
								"low":42.73771657635709,
								"mid":74.15621598227193,
								"high":128.6719274995506,
								"gain":19.39672225311667
							},
							"1":{
								"low":2236.228485250351,
								"mid":3672.0056804902356,
								"high":6029.627923303666,
								"gain":-14.155259381494123
							}
						},
						"bitcrusher":{
							"bits":1,
							"norm":0.9476107287222466
						},
						"echo":{
							"delay":0.21428571428571427,
							"feedback":0.2748267474475922
						},
						"volume": 0.5
					}
				break
				case "buzzorgan":
					return {
						"name":"buzzorgan",
						"polysynth":{
							"0":true,
						},
						"imag":[0,1,0.21180202066898346,0.26972323656082153,1,0.10392707586288452,0.09607698768377304,0.004078438971191645,1,0.09426583349704742,0.07034718245267868,0.017152125015854836,0.051849864423274994,0.046453963965177536,0.03873147815465927,0.02706083096563816,0.4557490646839142,0.055654577910900116,0.007712990511208773,0.043686047196388245,0.03128065913915634,0.012106683105230331,0.01296298485249281,0.02216235175728798,0.03157423809170723,0.015807228162884712,0.007788603659719229,0.023812558501958847,0.021190673112869263,0.03439936414361,0.01860993728041649,0.02965649776160717,0.02742370031774044,0.015811465680599213],
						"envelope":{
							"attack":0.0023591836734693875,
							"decay":0.9772734693877552,
							"sustain":0,
							"release":1
						},
						"filters":{
							"0":{
								"low":14.773411839663321,
								"mid":42.797509852848876,
								"high":123.98130299780767,
								"gain":-49.04364458355069
							},
							"1":{
								"low":3411.36074387185,
								"mid":9153.162477904323,
								"high":20000,
								"gain":-50
							}
						},
						"echo":{
							"delay":0.005828060865818536,
							"feedback":0.5233031920688528
						}
					}
				break
				case "swello":
					return {
						"name":"swello",
						"polysynth":{
							"0":true
						},
						"imag":[0,1,0.3432779610157013,0.2315126657485962,0.058497168123722076,0.1899126172065735,0.0448404885828495,0.12938399612903595,0.07931369543075562,0.054060198366642,0.0988508090376854,0.0522669218480587,0.056811220943927765,0.051076728850603104,0.032383546233177185,0.004351383075118065,0.04818083345890045,0.038509003818035126,0.014789948239922523,0.006924794986844063,0.034774232655763626,0.009429270401597023,0.003623893717303872,0.0258589219301939,0.0015618279576301575,0.022793792188167572,0.01324266754090786,0.007655204273760319,0.0041127512231469154,0.022874318063259125,0.016309715807437897,0.008302805945277214,0.008340908214449883,0.01348100509494543],
						"envelope":{
							"attack":0.01536874552533578,
							"decay":0.76818523697573773,
							"sustain":0,
							"release":2
						},
						"echo":{
							"delay":0.009965899510513269,
							"feedback":0.5489922649526092
						}
					}
				break		
				case "reedles":
					return {
						"name": "reedles",
						"polysynth":{
							"0":true
						},
						"imag":[0,1,0.13321591913700104,0.23890696465969086,0.1848037987947464,0.06213591620326042,0.15851031243801117,0.013016369193792343,0.05386565998196602,0.11070278286933899,0.046062078326940536,0.05860947445034981,0.07818899303674698,0.017279257997870445,0.02893548458814621,0.019652292132377625,0.006511820014566183,0.026842080056667328,0.029128052294254303,0.04828658327460289,0.026606278494000435,0.043067075312137604,0.02284008078277111,0.03200739622116089,0.038210369646549225,0.03194240480661392,0.007605026010423899,0.011232322081923485,0.02774462290108204,0.0024622941855341196,0.016160927712917328,0.026034902781248093,0.0009380421251989901,0.005903569981455803],
						"envelope":{
							"attack":0.016862935925353835,
							"decay":0.28700753813155746,
							"sustain":0,
							"release":0.76572433174364076
						},
						"filters":{
							"0":{
								"low":17.00523847135155,
								"mid":34.791076828746036,
								"high":71.1791856928607,
								"gain":39.42792557816032
							},
							"1":{
								"low":4556.987960311114,
								"mid":9167.496497936349,
								"high":18442.662735044294,
								"gain":-22.335246044166226
							}
						},
						"echo":{
							"delay":0.00187234042553192,
							"feedback":0.76714675029034326
						},
						"volume": 0.5
					}
				break
				case "accordienne":
					return {
						"name":"accordienne",
						"polysynth":{
							"0":true
						},
						"imag":[0,1,0.44293421506881714,0.32471582293510437,0.011000609025359154,0.17021837830543518,0.13372759521007538,0.11268258094787598,0.005569384433329105,0.1067923977971077,0.09378086030483246,0.08295878767967224,0.0006959254387766123,0.05424145981669426,0.0423087477684021,0.05841623246669769,0.023867418989539146,0.04862881824374199,0.046523261815309525,0.016646606847643852,0.04738473519682884,0.012283651158213615,0.021767525002360344,0.04069533571600914,0.01118484791368246,0.029461022466421127,0.024899769574403763,0.006698890123516321,0.01303438562899828,0.030736785382032394,0.002923727734014392,0.01851494237780571,0.020675845444202423,0.009414720349013805],
						"envelope":{
							"attack":0.014006067500076161,
							"decay":0.9215120822558321,
							"sustain":0,
							"release":0.329129186086711334
						},
						"bitcrusher":{
							"bits":8,
							"norm":0.6084048851693262
						},
						"echo":{
							"delay":0.08987914456024498,
							"feedback":0.6014353203695686
						}
					}
				break
				case "glassical":
					return {
						"name":"glassical",
						"polysynth":{
							"0":true,
							"-12":true
						},
						"imag":[0,1,1,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0.024414559826254845],
						"envelope":{
							"attack":0.0007199265381083561,
							"decay":0.8632627074186466,
							"sustain":0,
							"release":1
						},
						"bitcrusher":{
							"bits":8,
							"norm":0.987639993997258
						},
						"filters":{
							"0":{
								"low":2646.268164573106,
								"mid":10548.081821211836,
								"high":20000,
								"gain":-23.210589388822314
							}
						},
						"echo":{
							"delay":0.08495044767097758,
							"feedback":0.8535788212223554
						},
						"volume": 0.25
					}
				break
				case "clarinaut":
					return {
						"name":"clarinaut",
						"polysynth":{
							"0":true
						},
						"imag":[0,1,0.04185762256383896,0.8109787106513977,0.10051940381526947,0.6024035215377808,0.08422446250915527,0.42967715859413147,0.06467054039239883,0.23087890446186066,0.03859863430261612,0.11029636114835739,0.03859863430261612,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
						"envelope":{
							"attack":0.01228819184417878,
							"decay":0.14524497734494107,
							"sustain":0,
							"release":0.88699322990920816
						},
						"filters":{
							"0":{
								"low":18.312373638581303,
								"mid":37.21396757355336,
								"high":75.625334535975,
								"gain":-50
							},
						},
						"echo":{
							"delay":0.03212744274441215,
							"feedback":0.5480771325852489
						}
					}
				break
				case "qube":
					return {
						"name":"qube",
						"polysynth":{
							"0":true,
							"12":true
						},
						"imag":[0,1,0,0.1111111119389534,0,0.03999999910593033,0,0.020408162847161293,0,0.012345679104328156,0,0.00826446246355772,0,0.005917159840464592,0,0.004444444552063942,0,0.0034602077212184668,0,0.002770083025097847,0,0.0022675737272948027,0,0.0018903592135757208,0,0.0015999999595806003,0,0.0013717421097680926,0,0.0011890606256201863,0,0.0010405827779322863,0,0.0009182736393995583],
						"envelope":{
							"attack":0.01061524334251607,
							"decay":0.21725436179981635,
							"sustain":0,
							"release":0.52923783287419647
						},
						"echo":{
							"delay":0.00032741056024983945,
							"feedback":0.3829393180084976
						}
					}
				break
				case "sharpsichord":
					return {
						"name":"sharpsichord",
						"polysynth":{
							"0":true
						},
						"imag":[0,1,0.18338973820209503,0.06164489686489105,0.16505765914916992,0.05308644846081734,0.0630641058087349,0.03404829651117325,0.05037868767976761,0.09803289920091629,0.04073476791381836,0.06083011254668236,0.027402449399232864,0.008078854531049728,0.0028261858969926834,0.04333797097206116,0.04956173896789551,0.033073946833610535,0.028376849368214607,0.022788777947425842,0.011428376659750938,0.02052171155810356,0.005210720002651215,0.0385330505669117,0.03903305158019066,0.011357864364981651,0.025470439344644547,0.0014464398846030235,0.018127329647541046,0.01408306136727333,0.013367714360356331,0.0005558114498853683,0.015808377414941788,0.018298164010047913],
						"envelope":{
							"attack":0.0010819334770028426,
							"decay":0.3011093120255117,
							"sustain":0,
							"release":0.8948628416772253
						},
						"bitcrusher":{
							"bits":64,
							"norm":0.8875034167880647
						},
						"filters":{
							"0":{
								"low":3223.3996504974443,
								"mid":8543.374424708145,
								"high":20000,
								"gain":10.024587985114302
							},
							"1":{
								"low":11.98732795784056,
								"mid":32.70319566257483,
								"high":89.21913292988074,
								"gain":-22.936602870813402
							}
						},
						"echo":{
							"delay":0.13033631290023645,
							"feedback":0.3335722262314059
						}
					}
				break
			}
		}
