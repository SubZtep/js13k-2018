AFRAME.registerComponent('obstacle', {
	check() {
		if (
			this.el.classList.contains('obs') &&
			this.el.getAttribute('position').z > state.playerPosZ
		) {
			Game.destroy(this)
			ins.movePlayer(2)
		}
	}
})
