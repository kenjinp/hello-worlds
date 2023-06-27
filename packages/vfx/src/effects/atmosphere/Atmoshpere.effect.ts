import { Effect, EffectAttribute, WebGLExtension } from 'postprocessing';
import { Camera, Matrix4, Uniform, Vector3 } from 'three';
import fragment from './Atmosphere.glsl';
import passthrough from './Passthrough.glsl';

export interface AtmosphereEffectPlanet {
  radius: number;
  origin: Vector3;
  atmosphereRadius: number;
  atmosphereDensity?: number;
}

export interface AtmosphereEffectSun {
  origin: Vector3;
  color: Vector3;
  intensity: number;
}

export interface AtmosphereEffectProps {
  camera?: Camera;
  suns: AtmosphereEffectSun[];
  planets: AtmosphereEffectPlanet[];
  primarySteps?: number;
  lightSteps?: number;
}

export const km = 1_000;
export const EARTH_RADIUS = 6_357 * km;

// tempValues
const _cameraDirection = new Vector3();
const _position = new Vector3();
const _matrixWorld = new Matrix4();
const _projectionMatrixInverse = new Matrix4();

// Effect implementation
export class AtmosphereEffect extends Effect {
  camera?: Camera;
  suns: AtmosphereEffectSun[];
  planets: AtmosphereEffectPlanet[];
  constructor({ camera, suns, planets, primarySteps = 12, lightSteps = 8 }: AtmosphereEffectProps) {
    // Let's not compile a meaningful shader if there's nothing to show
    // Mainly because I'm not sure how to skip over defining a uniform that's an array of 0 length
    const frag = planets.length > 0 && suns.length > 0 ? fragment : passthrough;

    // camera gets added after construction in effect-composer
    if (camera) {
      _position.copy(camera.position);
      camera.getWorldDirection(_cameraDirection);
    }

    planets.forEach((p) => {
      if (!p.atmosphereDensity) {
        p.atmosphereDensity = 1.0;
      }
    });

    super(
      'AtmosphereEffect',
      frag
        .replace(/<planetsLength>/g, planets.length.toString())
        .replace(/<sunsLength>/g, suns.length.toString()),
      {
        uniforms: new Map<string, Uniform>([
          ['uCameraPosition', new Uniform(_position)],
          ['uCameraWorldDirection', new Uniform(_cameraDirection)],
          ['uPrimarySteps', new Uniform(primarySteps)],
          ['uLightSteps', new Uniform(lightSteps)],
          [
            'uPlanets',
            {
              value: planets
            } as Uniform
          ],
          [
            'uSuns',
            {
              value: suns
            } as Uniform
          ],
          ['uViewMatrixInverse', new Uniform(_matrixWorld)],
          ['uProjectionMatrixInverse', new Uniform(_projectionMatrixInverse)]
        ]),
        attributes: EffectAttribute.DEPTH,
        extensions: new Set([WebGLExtension.DERIVATIVES])
      }
    );

    this.planets = planets;
    this.suns = suns;
    if (camera) {
      this.camera = camera;
    }
  }

  update() {
    this.camera?.getWorldDirection(_cameraDirection);
    this.uniforms.get('uCameraWorldDirection')!.value = _cameraDirection;
    this.uniforms.get('uCameraPosition')!.value = this.camera?.position;
    this.uniforms.get('uViewMatrixInverse')!.value = this.camera?.matrixWorld;
    this.uniforms.get('uProjectionMatrixInverse')!.value = this.camera?.projectionMatrixInverse;
    this.uniforms.get('uPlanets')!.value = this.planets;
    this.uniforms.get('uSuns')!.value = this.suns;
  }
}
