AFRAME.registerComponent('camera-cursor', {
	init() {
		//state.player = this.el
		state.ray = document.querySelector('#ray')
		state.crosshair = document.querySelector('#crosshair')
		state.hud = document.querySelector('#hud')
	}
})
