class GameObject
{
	/**
	 *
	 * @param object obj Game object
	 * @param array pos Object position [x, y, z]
	 * @param float speed Object speed
	 * @param int type (0: ring, 1: obstacle)
	 */
	constructor(obj, pos, speed, type = 0)
	{
		this.obj = obj
		this.pos = pos
		this.speed = speed
		this.type = type
	}

	recalc(progress, speedMulti = 1)
	{
		this.pos[2] += progress * this.speed * speedMulti
	}

	redraw()
	{
		this.obj.object3D.position.set(...this.pos)
	}
}
