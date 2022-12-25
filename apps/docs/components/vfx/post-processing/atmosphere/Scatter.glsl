#define RAY_BETA vec3(5.5e-6, 13.0e-6, 22.4e-6) /* rayleigh, affects the color of the sky */
#define MIE_BETA vec3(21e-6) /* mie, affects the color of the blob around the sun */
#define AMBIENT_BETA vec3(0.0) /* ambient, affects the scattering color when there is no lighting from the sun */
#define ABSORPTION_BETA vec3(2.04e-5, 4.97e-5, 1.95e-6) /* what color gets absorbed by the atmosphere (Due to things like ozone) */
#define G 0.76 /* mie scattering direction, or how big the blob around the sun is */
// and the heights (how far to go up before the scattering has no effect)
#define HEIGHT_RAY 8e3 /* rayleigh height */
#define HEIGHT_MIE 1.2e3 /* and mie */
#define HEIGHT_ABSORPTION 30e3 /* at what height the absorption is at it's maximum */
#define ABSORPTION_FALLOFF 4e3 /* how much the absorption decreases the further away it gets from the maximum height */
// and the steps (more looks better, but is slower)
// the primary step has the most effect on looks
// and these on desktop
// #define PRIMARY_STEPS 12 /* primary steps, affects quality the most */
// #define LIGHT_STEPS 10 /* light steps, how much steps in the light direction are taken */

/*
Next we'll define the main scattering function.
This traces a ray from start to end and takes a certain amount of samples along this ray, in order to calculate the color.
For every sample, we'll also trace a ray in the direction of the light, 
because the color that reaches the sample also changes due to scattering
*/
vec3 hello_calculate_scattering(
    vec3 start, 				// the start of the ray (the camera position)
    vec3 dir, 					// the direction of the ray (the camera vector)
    float scene_depth, 			// the maximum distance the ray can travel (because something is in the way, like an object)
    vec3 scene_color,			// the color of the scene
    vec3 light_dir, 			// the direction of the light
    float light_intensity_float,		// how bright the light is, affects the brightness of the atmosphere
    vec3 light_color,
    vec3 planet_position, 		// the position of the planet
    float planet_radius, 		// the radius of the planet
    float atmo_radius 			// the radius of the atmosphere
    int PRIMARY_STEPS,
    int LIGHT_STEPS
) {
    vec3 light_intensity = vec3(light_intensity_float);
    vec3 beta_ray = RAY_BETA; 				// the amount rayleigh scattering scatters the colors (for earth: causes the blue atmosphere)
    vec3 beta_mie = MIE_BETA; 				// the amount mie scattering scatters colors
    vec3 beta_absorption = ABSORPTION_BETA;   	// how much air is absorbed
    vec3 beta_ambient = ABSORPTION_BETA;			// the amount of scattering that always occurs, cna help make the back side of the atmosphere a bit brighter
    float g = G;					// the direction mie scatters the light in (like a cone). closer to -1 means more towards a single direction
    float height_ray = HEIGHT_RAY; 			// how high do you have to go before there is no rayleigh scattering?
    float height_mie = HEIGHT_MIE; 			// the same, but for mie
    float height_absorption = HEIGHT_ABSORPTION;	// the height at which the most absorption happens
    float absorption_falloff = ABSORPTION_FALLOFF;	// how fast the absorption falls off from the absorption height
    int steps_i = PRIMARY_STEPS; 				// the amount of steps along the 'primary' ray, more looks better but slower
    int steps_l = LIGHT_STEPS;				// the amount of steps along the light ray, more looks better but slower

    vec2 sphereI = intersectSphere(start, dir, planet_position, planet_radius); // check if the ray hits the planet

    if (sphereI.x > 0.) {
      if (sphereI.x < scene_depth) {
        scene_color += vec3(0.149, 0.141, 0.912);
      }
    }

    // the color that will be returned
    return scene_color;  
}
