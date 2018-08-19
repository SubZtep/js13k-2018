let ins = null // instance

class Game
{
	constructor()
	{
		// Singleton
		if (!ins) ins = this

		// A-Frame scene object
		ins.scene = document.querySelector('a-scene')

		// Last render timestamp since start
		ins.lastRender = 1

		// Object spawn position on Z axis
		ins.minZ = -20

		// Object destroy position on Z axis
		ins.maxZ = 5

		// Object pool for tube rings
		ins.rings = []

		// Object pool for obstacles
		ins.obstacles = []

		// Distance between two rings
		ins.ringDistance = 2

		// Distance between two obstacles
		ins.obstacleDistance = 5

		// Setup rings
		for (let i = ins.minZ; i < ins.maxZ; i += ins.ringDistance) {
			ins.rings.push(
				new GameObject(
					ins.createRing(),
					[0, 2, i],
					0.003
				)
			)
		}

		// Setup obstacles
		for (let i = ins.minZ; i < ins.maxZ; i += ins.obstacleDistance) {
			ins.obstacles.push(
				new GameObject(
					ins.createObstacle(),
					[(Math.random() * 4 - 2), (Math.random() * 4 + 1), i],
					0.001
				)
			)
		}

		// Create crosshair
		this.createCursor()

		window.requestAnimationFrame(ins.gameLoop)
	}

	update(progress)
	{
		this.movePool(progress, ins.rings, ins.ringDistance)
		this.movePool(progress, ins.obstacles, ins.obstacleDistance)
	}

	movePool(progress, pool, distance)
	{
		let firstValue = null,
			lastIndex = null,
			lastValue = null

		for (const [index, obj] of pool.entries()) {
			if (firstValue == null || obj.pos[2] < firstValue) {
				firstValue = obj.pos[2]
			}

			if (lastValue == null || obj.pos[2] > lastValue) {
				lastIndex = index
				lastValue = obj.pos[2]
			}

			obj.recalc(progress)
		}

		// Smooth recycle object
		if (firstValue >= ins.minZ + distance) {
			pool[lastIndex].pos[2] = ins.minZ

			// In case the obstacles become invisible
			if (!pool[lastIndex].obj.object3D.visible) {
				pool[lastIndex].obj.object3D.visible = true
			}
		}
	}

	draw()
	{
		// Draw rings
		for (let ring of ins.rings) {
			ring.redraw()
		}

		// Draw obstacles
		for (let obstacle of ins.obstacles) {
			obstacle.redraw()
		}
	}

	gameLoop(timestamp)
	{
		let progress = timestamp - ins.lastRender

		ins.update(progress)
		ins.draw()

		ins.lastRender = timestamp
		window.requestAnimationFrame(ins.gameLoop)
	}

	createRing()
	{
		return Game.newElement('a-ring', {
			material: 'color:yellow;opacity:0.5',
			'radius-inner': '2.9',
			'radius-outer': '3',
			shadow: 'cast:true;receive:true'
		}, ins.scene)
	}

	createObstacle()
	{
		return Game.newElement('a-box', {
			'cursor-listener': null,
			material: 'color:lightblue;opacity:0.9;',
			width: '0.8',
			height: '0.8',
			depth: '0.8'
		}, ins.scene)
	}

	createCursor()
	{
		let el1 = Game.newElement('a-entity', {
			position: '0 2.2 4'
		}, ins.scene)

		let el2 = Game.newElement('a-entity', {
			'camera': null,
			'look-controls': null,
			'wasd-controls': null
		}, el1)

		let el3 = Game.newElement('a-triangle', {
			material: 'color:#333;shader:flat',
			position: '0 -0.02 -1',
			scale: '0.04 0.05 0.04'
		}, el2)

		let el4 = Game.newElement('a-triangle', {
			material: 'color:#333;shader:flat',
			position: '0 0.02 -1',
			scale: '0.04 0.05 0.04',
			rotation: '0 0 180'
		}, el2)

		let el5 = Game.newElement('a-entity', {
			position: '0 0 -1',
			geometry: 'primitive:ring;radiusOuter:0.05;radiusInner:0.04',
			material: 'color:white;shader:flat',
			cursor: 'fuse:true;fuseTimeout:500',
			raycaster: 'objects:[cursor-listener]'
		}, el2)

		let el6 = Game.newElement('a-animation', {
			begin: 'click',
			easing: 'ease-in',
			attribute: 'scale',
			fill: 'forwards',
			from: '0.5 0.5 0.5',
			to: '1 1 1',
			dur: '100'
		}, el5)

		let el7 = Game.newElement('a-animation', {
			begin: 'fusing',
			easing: 'ease-in',
			attribute: 'scale',
			fill: 'backwards',
			from: '1 1 1',
			to: '0.5 0.5 0.5',
			dur: '500'
		}, el5)
	}

	static newElement(name, params = {}, appendEl = null)
	{
		let el = document.createElement(name)
		for (let [key, value] of Object.entries(params)) {
			el.setAttribute(key, value)
		}
		if (appendEl != null) {
			appendEl.appendChild(el)
		}
		return el
	}
}
