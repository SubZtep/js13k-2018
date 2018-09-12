AFRAME.registerComponent('rotation-listener', {
	init() {
		this.sky = document.querySelector('#sky')
	},
	tick() {
		this.sky.object3D.rotation.y += 0.0005 * this.el.getAttribute('rotation').y
	},
})
