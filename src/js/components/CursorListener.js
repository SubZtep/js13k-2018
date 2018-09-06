
AFRAME.registerComponent('cursor-listener', {
	init: function () {

		/* this.el.addEventListener('raycaster-intersected', e => {
			// console.log('e', ins.aimedObj)

			//if (ins.aimedObj == e.target) {
			//	ins.aimDirty = false
			//	return
			//}
			//ins.aimDirty = true

			//if (ins.aimedObj != null && ins.aimedObj != e.target) {
			// if (ins.aimedObj != null) {
			//	//console.log('juhuu')
			//	ins.aimedObj.setAttribute('metalness', 0.3)
			//}

			//if (ins.aimedObj != e.target) {
			//	e.target.setAttribute('metalness', 0.3)
			//}

			//if (ins.aimedObj == null) {
			//ins.aimedObj = e.target
			e.target.setAttribute('metalness', 0.8)
			//}
		}),

		this.el.addEventListener('raycaster-intersected-cleared', e => {
			e.target.setAttribute('metalness', 0.3)
		}), */

		this.el.addEventListener('click', e => {
			if (e.detail.intersection.object.el.id == 'startBtn') {
				ins.start()
			} else {
				e.target.object3D.visible = false
				ins.movePlayer(-2)
			}
		})
	}
})
