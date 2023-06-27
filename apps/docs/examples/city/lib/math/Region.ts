import { Vector3 } from "three";
import { sign } from "./helpers";
import { Triangle } from "./Triangle";

const _tempVec3 = new Vector3();
export class Region {
	public seed: Vector3;
	public vertices: Triangle[] = [];

  constructor(seed: Vector3) {
    this.seed = seed;
  }

  public sortVertices(): Region {
    this.vertices.sort(this.compareAngles.bind(this));
    return this;
  }

	public center(): Vector3 {
		let c = new Vector3();
		for (let v of this.vertices) {
      c.add(v.c)
    }
		c.multiplyScalar( 1 / this.vertices.length );
		return c;
	}

	public borders(r:Region): boolean {
		let len1 = this.vertices.length;
		let len2 = r.vertices.length;
		for (let i =0; i < len1; i++) {
			let j = r.vertices.indexOf( this.vertices[i] );
			if (j != -1)
				return this.vertices[(i + 1) % len1] == r.vertices[(j + len2 - 1) % len2];
		}
		return false;
	}

	private compareAngles( v1:Triangle, v2:Triangle ): number {
		let x1 = v1.c.x - this.seed.x;
		let y1 = v1.c.y - this.seed.y;
		let x2 = v2.c.x - this.seed.x;
		let y2 = v2.c.y - this.seed.y;

		if (x1 >= 0 && x2 < 0) return 1;
		if (x2 >= 0 && x1 < 0) return -1;
		if (x1 == 0 && x2 == 0)
			return y2 > y1 ? 1 : -1;

		return sign( x2 * y1 - x1 * y2 );
	}
}