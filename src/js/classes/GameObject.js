class GameObject
{
	/**
	 *
	 * @param object obj Game object
	 * @param array pos Object position [x, y, z]
	 * @param float speed Object speed
	 */
	constructor(obj, pos, speed)
	{
		this.obj = obj
		this.pos = pos
		this.speed = speed
	}

	recalc(progress)
	{
		this.pos[2] += progress * this.speed
	}

	redraw()
	{
		//this.obj.setAttribute('position', this.pos.join(' '))
		this.obj.object3D.position.set(...this.pos)
	}
}
