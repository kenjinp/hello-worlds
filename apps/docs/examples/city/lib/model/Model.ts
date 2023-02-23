import { Vector3 } from "three";
import { Random } from "../math/Random";
import { Voronoi } from "../math/Voronoi";

export class CityModel {
  random: Random
  plazaNeeded: boolean
  citadelNeeded: boolean
  wallsNeeded: boolean
  streets: []
  roads: []
  voronoi: Voronoi
  constructor(private nPatches = 15, private offset = new Vector3(), public seed?: string) {
    this.random = new Random(seed)

		this.plazaNeeded		= this.random.bool();
		this.citadelNeeded	= this.random.bool();
		this.wallsNeeded		= this.random.bool();
    this.build()
    // let success = false;
		// do try {
		// 	this.build();
		// 	success = true;
		// } catch (error) {
		// 	console.error(error)
		// 	success = false
		// } while (!success);
  }

  build () {
		console.time('buildPatches')
		console.log("Building patches...")
		this.buildPatches();
		console.timeEnd('buildPatches')
		// optimizeJunctions();
		// buildWalls();
		// buildStreets();
		// createWards();
		// buildGeometry();
  }

  buildPatches () {
    const sa = this.random.float() * 2 * Math.PI;
		const points = new Array(this.nPatches * 8).fill(0).map((_, i) => {
      let a = sa + Math.sqrt( i ) * 5;
			let r = (i == 0 ? 0 : 10 + i * (2 + this.random.float()));
			const x = Math.cos( a ) * r + this.offset.x
			const y = Math.sin( a ) * r + this.offset.y
			return new Vector3( x, y, 0);
    }) 
		let voronoi = Voronoi.build( points );
    this.voronoi = voronoi
    console.log({voronoi})

		// Relaxing central wards
		console.time('relaxing central wards')
		// for (let i = 0; i < 3; i++) {
			const toRelax = [voronoi.points[0], voronoi.points[1], voronoi.points[2], voronoi.points[3]];
			toRelax.push( voronoi.points[this.nPatches] );
			voronoi = Voronoi.relax( voronoi, toRelax );
		// }
		console.timeEnd('relaxing central wards')

		// voronoi.points.sort( function( p1, p2 ) {
		// 	return sign(p1.length() - p2.length())
		// });
		// var regions = voronoi.partioning();
		// console.log({regions})

		// Relaxing central wards
		// for (let i = 0; i < 3; i++) {
		// 	let toRelax = [for (j in 0...3) voronoi.points[j]];
		// 	toRelax.push( voronoi.points[this.nPatches] );
		// 	voronoi = Voronoi.relax( voronoi, toRelax );
		// }

		// voronoi.points.sort( function( p1:Point, p2:Point )
		// 	return MathUtils.sign( p1.length - p2.length ) );
		// let regions = voronoi.partioning();

		// patches = [];
		// inner = [];

		// let count = 0;
		// for (r in regions) {
		// 	let patch = Patch.fromRegion( r );
		// 	patches.push( patch );

		// 	if (count == 0) {
		// 		center = patch.shape.min( function( p:Point ) return p.length );
		// 		if (plazaNeeded)
		// 			plaza = patch;
		// 	} else if (count == nPatches && citadelNeeded) {
		// 		citadel = patch;
		// 		citadel.withinCity = true;
		// 	}

		// 	if (count < nPatches) {
		// 		patch.withinCity = true;
		// 		patch.withinWalls = wallsNeeded;
		// 		inner.push( patch );
		// 	}

		// 	count++;
		// }
  }
}