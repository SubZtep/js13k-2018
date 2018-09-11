let ins = null, // instance
	state = {
		scene: null,                        // A-Frame scene object
		sky: null,                          // A-Frame sky object
		menu: null,							// A-Frame menu object root
		player: null,                       // A-Frame player object (the camera)
		hud: null,                          // A-Frame HUD object
		lastRender: null,                   // Last render timestamp since start
		playerStartPosZ: -10,               // Player start position on Z axis
		playerPosZ: null,                   // Player currect position on Z axis
		crosshair: null,                    // Crosshair object
		aimTimeout: null,                   // Aim timeout
		aimLength: 500,                     // Aim length in ms
		aimedObj: null,                     // Current aimed obj
		ray: null,                          // A-Frame raycaster
		int: null,                          // Effect window setInterval id
		minZ: -55,                          // Object spawn position on Z axis
		                                    //-15 (-15 is just close to the player, not the whole tube)
		maxZ: 5,                            // Object destroy position on Z axis
		rings: [],                          // Object pool for tube rings
		obstacles: [],                      // Object pool for obstacles
		ringDistance: 1,                    // Distance between two rings
		                                    //0.6
		obstacleDistance: 3,                // Distance between two obstacles
		                                    //3 (0.1 is a lot of objects)
		effect: null,                       // Current effect
		effectSpeed: 0.01,                  // Effect speed
	},
	effects = { // All Effects
		wave: {
			min: 0.01,
			max: 0.6,
			val: 0
		},
		skyOpacity: {
			min: 0.1,
			max: 0.5,
			val: 0.1
		},
		ringOpacity: {
			min: 0.2,
			max: 0.8,
			val: 0.2
		},
		ringScale: {
			min: 2.8,
			max: 5,
			val: 5
		},
		ringSpeed: {
			min: 1,
			max: 1,//3,
			val: 1
		}
	}


class Game
{
	constructor()
	{
		// Singleton
		if (!ins) ins = this

		state.scene = document.querySelector('a-scene')
		state.sky = document.querySelector('a-sky')
		state.menu = document.querySelector('#menu')

		if (state.scene.hasLoaded) {
			ins.gameLoop()
		} else {
			state.scene.addEventListener('loaded', ins.gameLoop);
		}
	}

	// Setup environment and start game loop
	start()
	{
		// Hide menu
		state.menu.object3D.visible = false

		// Setup rings
		for (let i = state.minZ; i < state.maxZ; i += state.ringDistance) {
			state.rings.push(
				new GameObject(
					state.scene.components.pool__rings.requestEntity(),
					[0, 2, i],
					0.003
				)
			)
		}

		// Setup obstacles
		for (let i = state.minZ; i < state.maxZ; i += state.obstacleDistance) {
			let obj = state.scene.components.pool__obstacles.requestEntity()

			// Only drop obstacles before the player
			if (i+15 > state.playerPosZ) {
				obj.object3D.visible = false
			} else {
				obj.setAttribute('class', 'obs')
			}

			state.obstacles.push(
				new GameObject(
					obj,
					[(Math.random() * 4 - 2), (Math.random() * 4 + 1) - 3, i],
					0.001, //0.008,
					1
				)
			)
		}

		// Init player
		ins.movePlayer() //FIXME: removable

		// Start game
		state.lastRender = null
		state.effect = null
	}

	finish()
	{
		// Stop effect
		clearInterval(state.int)
		state.int = null

		// Remove objects
		ins.emptyPool(state.rings)
		ins.emptyPool(state.obstacles)

		// Clear HUD
		ins.displayHUD()

		// Set finish text
		document.querySelector('#msg').setAttribute(
			'value',
			ins.isWon() ? 'WINNER, juhuu!' : 'Noob'
		)

		// Move player to default position
		ins.movePlayer()

		// Start button shotable
		document.querySelector('#startBtn').classList.add('obs')

		// Show menu
		state.menu.object3D.visible = true
	}

	/******************************************************************
	 *
	 * GAME LOOP
	 *
	 */

	// Calculate objects next position
	update(progress)
	{
		ins.movePool(progress, state.rings, state.ringDistance)
		ins.movePool(progress, state.obstacles, state.obstacleDistance)

		// Select effect, if neccessary (different timeline)
		ins.startEffect()
	}

	// Render objects at their current position
	draw()
	{
		// Draw rings
		for (let ring of state.rings) {
			ring.redraw()
		}

		// Draw obstacles
		for (let obstacle of state.obstacles) {
			obstacle.redraw()
			obstacle.obj.components.obstacle.check()
		}

		// Move player (if necessary)
		let z = state.player.object3D.position.z
		if (z != state.playerPosZ) {
			z += z < state.playerPosZ ? 0.1 : -0.1
			state.player.object3D.position.z = Math.abs(state.playerPosZ + z) < 0.1
				? state.playerPosZ
				: parseFloat(parseFloat(z).toFixed(1))
		}

		ins.playEffect() // Select effect, if neccessary (different timeline)
		ins.displayHUD()
	}

	// Game loop rotor
	gameLoop(timestamp)
	{
		// In game
		if (state.rings.length > 0) {
			//TODO: Lost window focus mess up the timestamp
			if (state.lastRender == null) {
				state.lastRender = timestamp
			}

			ins.update(timestamp - state.lastRender)
			ins.draw()
			state.lastRender = timestamp

			if (ins.isWon() || ins.isLost()) {
				ins.finish()
			}
		}
		ins.aim()

		window.requestAnimationFrame(ins.gameLoop)
	}

	/******************************************************************
	 *
	 * GAMEPLAY
	 *
	 */

	// Start aim if ray intersect target, stop if not
	aim()
	{
		let intersects = state.ray.components.raycaster.intersections
		if (intersects.length > 0) {
			if (state.aimedObj != intersects[0].object) {
				ins.endAim()
				ins.startAim(intersects[0].object)
			}
		} else {
			ins.endAim()
		}
	}

	// Keep aiming until shoot
	startAim(obj)
	{
		state.aimedObj = obj
		state.aimedObj.material.metalness = 0.8
		state.aimTimeout = setTimeout(ins.shoot, state.aimLength)
		state.crosshair.emit('aim')
	}

	// Stop aiming current object
	endAim()
	{
		clearTimeout(state.aimTimeout)
		if (state.aimedObj) {
			state.crosshair.emit('endAim')
			state.crosshair.setAttribute('theta-Length', 360)
			state.aimedObj.material.metalness = 0.3
		}
		state.aimedObj = null
	}

	// Destroy aimed object and reward player
	//TODO: pub object back to aframe pool
	shoot()
	{
		if (state.aimedObj) {
			if (state.aimedObj.el.id == 'startBtn') {
				// Start game if in menu
				state.aimedObj.el.classList.remove('obs')
				ins.start()
			} else {
				// In game
				Game.destroy(state.aimedObj)
				ins.movePlayer(-2)
			}
			state.aimedObj = null
		}
	}

	// Tells if player won atm
	isWon()
	{
		//return state.playerPosZ <= -50
		return state.playerPosZ <= state.minZ + 5
	}

	// Tells if player lost atm
	isLost()
	{
		return state.playerPosZ >= state.maxZ
	}

	/******************************************************************
	 *
	 * EFFECT
	 *
	 */

	// Update HUD values
	displayHUD()
	{
		state.hud.setAttribute(
			'value',
			state.rings.length > 0
				? `minZ: ${state.minZ}, maxZ: ${state.maxZ}, playerPosZ: ${state.playerPosZ}, `+
				  `realpos: ${parseFloat(state.player.object3D.position.x).toFixed(2)},`+
				  `${parseFloat(state.player.object3D.position.y).toFixed(2)},`+
				  `${parseFloat(state.player.object3D.position.z).toFixed(2)}, effect: ${state.effect}`
				: ''
		)
	}

	// Start next effect loop
	startEffect()
	{
		if (state.int == null) {
			// Select effect
			let keys = Object.keys(effects),
				key = keys[Math.floor(Math.random() * keys.length)]
			state.effect = effects[key]
			console.log('Current effect', key)

			// Set effect speed
			state.effectSpeed = 0.005 //Number.isInteger(ins.effect.min) ? 1 : 0.1

			// Choose effect direction
			if (
				(state.effect.val <= state.effect.min && state.effectSpeed < 0) ||
				(state.effect.val >= state.effect.max && state.effectSpeed > 0)
			) {
				state.effectSpeed *= -1
			}

			// Run effect
			state.int = window.setInterval(() => {
				state.effect.val += state.effectSpeed
				if (
					(state.effectSpeed > 0 && state.effect.val >= state.effect.max) ||
					(state.effectSpeed < 0 && state.effect.val <= state.effect.min)
				) {
					clearInterval(state.int)
					state.int = null
				}
			}, 10)
		}
	}

	// Play various effects
	playEffect()
	{
		if (state.effect != null) {
			// Sky effect
			state.sky.setAttribute('opacity', effects.skyOpacity.val)

			// Ring effects
			for (const [index, obj] of state.rings.entries()) {
				if (obj.type == 0) {
					let rad = (state.rings.length / 10) * index,
						offset = Math.sin((rad * Math.PI)/5) * effects.wave.val
					obj.pos[1] = offset

					obj.obj.setAttribute('opacity', effects.ringOpacity.val)
					obj.obj.setAttribute('scale', `5 0.5 ${effects.ringScale.val}`)
				}
			}
		}
	}

	/******************************************************************
	 *
	 * MISC
	 *
	 */

	emptyPool(pool)
	{
		while (pool.length > 0) {
			let item = pool.pop()
			if (typeof item.parentNode == 'undefined') {
				item = item.obj
			}
			item.parentNode.removeChild(item)
		}
	}

	// remove obstacle from scene
	static destroy(obj)
	{
		if (typeof obj.material != 'undefined') {
			obj.material.metalness = 0.3
		} else {
			obj.el.setAttribute('material', 'metalness', 0.3)
		}
		obj.el.classList.remove('obs')
		obj.el.object3D.visible = false
	}

	//WIP move pool and other things
	movePool(progress, pool, distance)
	{
		if (pool.length == 0) return // removable

		let firstValue = null,
			lastIndex = null,
			lastValue = null

		for (let [index, obj] of pool.entries()) {
			if (firstValue == null || obj.pos[2] < firstValue) {
				firstValue = obj.pos[2]
			}

			if (lastValue == null || obj.pos[2] > lastValue) {
				lastIndex = index
				lastValue = obj.pos[2]
			}

			obj.recalc(progress, obj.type == 0 ? effects.ringSpeed.val : 1)
		}

		// Smooth recycle object
		if (firstValue >= state.minZ + distance) {
			pool[lastIndex].pos[2] = state.minZ
			pool[lastIndex].redraw() // otherwise player get punished

			// Be sure it's visible (eg. obstacles become invisible behind the player)
			if (!pool[lastIndex].obj.object3D.visible) {
				pool[lastIndex].obj.object3D.visible = true
				pool[lastIndex].obj.classList.add('obs')
			}
		}
	}

	// Move player back/forward or set to the default position
	movePlayer(dist = null)
	{
		if (dist == null) {
			// Move player to default position
			state.playerPosZ = state.playerStartPosZ
			state.player.object3D.position.z = state.playerPosZ
		} else {
			state.playerPosZ += dist
		}
	}
}
