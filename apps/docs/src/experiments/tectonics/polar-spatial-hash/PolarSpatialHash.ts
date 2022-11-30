import { MathUtils } from "three";
import { LongLat } from "../voronoi/math";

export class PolarSpatialHashGrid<T> {
  readonly cells = new Map<string, {
    min: LongLat,
    max: LongLat,
    set: T[]
  }>();
  constructor(
    public readonly radius: number, // maybe this isn't needed?
    public readonly resolution: [divisionsLong: number, divisionsLat: number]
  ) {
    const [divisionsLong, divisionsLat] = resolution;
    const minLong = -180;
    const dLong = 180 * 2;
    const sizeLong = dLong / divisionsLong;
    const minLat = -90;
    const dLat = 90 * 2;
    const sizeLat = dLat / divisionsLat;

    if (divisionsLong < 1) {
      throw new Error("must provide a divisionsLong value <= 1");
    }
    if (divisionsLat < 1) {
      throw new Error("must provide a divisionsLat value <= 1");
    }

    for (let indexLong = 1; indexLong <= divisionsLong; indexLong++) {
      for (let indexLat = 1; indexLat <= divisionsLat; indexLat++) {
        const long0 = indexLong - 1;
        const lat0 = indexLat - 1;
        const mnLong = minLong + sizeLong * long0;
        const mxLong = mnLong + sizeLong;
        const mnLat = minLat + sizeLat * lat0;
        const mxLat = mnLat + sizeLat;
        this.cells.set(
          // [long0, lat0].join(","),
          // this.#key([mnLong, mnLat], [mxLong, mxLat]),
          this.#key([long0, lat0]),
          {
            min: [mnLong, mnLat],
            max: [mxLong, mxLat],
            set: []
          }
        );
      }
    }

    // console.log(this.cells);
    // LAT = 90 - 90
    // LONG = 180 - -180
  }

  addItem(longLat: LongLat, radius: number, data: T) {
    const wrapValue = (val: number, edgeValue: number, polar?: boolean) => {

      if (polar) {
        if (val < -edgeValue) {
          return edgeValue - (edgeValue + val);
        }
        if (val > edgeValue) {
          return edgeValue - (val - edgeValue)
        }
        return val;
      }

      if (val < -edgeValue) {
        return (edgeValue - Math.abs(val)) + edgeValue
      }
      if (val > edgeValue) {
        return Math.abs(edgeValue - val) + -edgeValue;
      }
      return val;
    }

    const val = MathUtils.randInt(1, 5);
    const minLongLat = [wrapValue(longLat[0] - val, 180), wrapValue(longLat[1] - val, 90)];
    const maxLongLat = [wrapValue(longLat[0] + val, 180), wrapValue(longLat[1] + val, 90)];

    const [divisionsLong, divisionsLat] = this.resolution;
    const minLong = -180;
    const dLong = 180 * 2;
    const sizeLong = dLong / divisionsLong;
    const minLat = -90;
    const dLat = 90 * 2;
    const sizeLat = dLat / divisionsLat;
    for (let indexLong = 1; indexLong <= divisionsLong; indexLong++) {
      for (let indexLat = 1; indexLat <= divisionsLat; indexLat++) {
        const long0 = indexLong - 1;
        const lat0 = indexLat - 1;
        const mnLong = minLong + sizeLong * long0;
        const mxLong = mnLong + sizeLong;
        const mnLat = minLat + sizeLat * lat0;
        const mxLat = mnLat + sizeLat;
        const key = this.#key([long0, lat0]);

        // what question am I trying to answer here?
        // Does my item occupy space inside this cell?




        // console.log({val, minLongLat, maxLongLat, mnLong, mnLat, mxLong, mxLat})

        let contained = false;

        if (mnLong < minLongLat[0] && mnLat < minLongLat[1] ) {
          contained = true
        }

        if (contained) {
          const cell = this.cells.get(key);
          cell?.set.push(data)
        }

        
        // Hello
        // does my min max long lat exist inside this thingy?
        // if so lets add to that cell and index

        // const x = sat(
        //   (position[0] - this._bounds[0][0]) / 
        //   (this._bounds[1][0] - this._bounds[0][0])
        // );
        // const y = sat((position[1] - this._bounds[0][1]) / (
        //   this._bounds[1][1] - this._bounds[0][1]));
  
        // const xIndex = Math.floor(x * (this._dimensions[0] - 1));
        // const yIndex = Math.floor(y * (this._dimensions[1] - 1));
  
        // return [xIndex, yIndex];

        

        
        // add to set 
        // this.cells.set(
        //   // [long0, lat0].join(","),
        //   // this.#key([mnLong, mnLat], [mxLong, mxLat]),
        //   this.#key([long0, lat0]),
        //   {
        //     min: [mnLong, mnLat],
        //     max: [mxLong, mxLat],
        //     set: new Set<T>() 
        //   }
          
        // );
      }
    }

    // add to each key where he fits
  }

  getCellIndex(longLat: LongLat) {
    //
  }

  // #key(minLongLat: LongLat, maxLongLat: LongLat) {
  //   return [minLongLat.join(","), maxLongLat.join(",")].join("/");
  // }

  #key(index: [x: number, y: number]) {
    const [x, y] = index;
    return [x, y].join(",");
  }

  removeItem() {
    //
  }

  nearbyItems(longLat: LongLat) {
    const [divisionsLong, divisionsLat] = this.resolution;
    const minLong = -180;
    const dLong = 180 * 2;
    const sizeLong = dLong / divisionsLong;
    const minLat = -90;
    const dLat = 90 * 2;
    const sizeLat = dLat / divisionsLat;
    // sat(long - divisionsLong / (divisionsLong))
    for (let indexLong = 1; indexLong <= divisionsLong; indexLong++) {
      for (let indexLat = 1; indexLat <= divisionsLat; indexLat++) {
        const long0 = indexLong - 1;
        const lat0 = indexLat - 1;
        const mnLong = minLong + sizeLong * long0;
        const mxLong = mnLong + sizeLong;
        const mnLat = minLat + sizeLat * lat0;
        const mxLat = mnLat + sizeLat;
        if ((mnLong <= longLat[0] && longLat[0] <= mxLong )
        && (mnLat <= longLat[1] && longLat[1] <= mxLat)
        ) {
          const key = this.#key([long0, lat0]);
          return this.cells.get(key)
        }
      }
    }
  }
}

// const grid = new PolarSpatialHashGrid();

// const client = grid.newClient()
// const nearby = grid.findNearby()
