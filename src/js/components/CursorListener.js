
AFRAME.registerComponent('cursor-listener', {
	init: function () {
		this.el.addEventListener('click', function (evt) {
			//this.setAttribute('visible', 'false')
			this.object3D.visible = false
			//console.log('I was clicked at: ', evt.detail.intersection.point)
		})
	}
})
