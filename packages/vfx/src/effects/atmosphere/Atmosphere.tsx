import { wrapEffect } from '@react-three/postprocessing';
import { AtmosphereEffect } from './Atmoshpere.effect';

export const Atmosphere = wrapEffect(AtmosphereEffect);
