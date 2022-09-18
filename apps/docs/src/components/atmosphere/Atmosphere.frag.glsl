@import ./Math;
@import ./Scatter;

#ifdef FRAMEBUFFER_PRECISION_HIGH
  uniform mediump sampler2D map;
#else
  uniform lowp sampler2D map;
#endif

// #define PLANET_POS vec3(0.0) /* the position of the planet */
// #define PLANET_RADIUS 6371e3 /* radius of the planet */
// #define ATMOS_RADIUS 6471e3 /* radius of the atmosphere */
// scattering coeffs
#define RAY_BETA vec3(5.5e-6, 13.0e-6, 22.4e-6) /* rayleigh, affects the color of the sky */
#define MIE_BETA vec3(21e-6) /* mie, affects the color of the blob around the sun */
#define AMBIENT_BETA vec3(0.000002) /* ambient, affects the scattering color when there is no lighting from the sun */
#define ABSORPTION_BETA vec3(2.04e-5, 4.97e-5, 1.95e-6) /* what color gets absorbed by the atmosphere (Due to things like ozone) */
#define G -10.0/* mie scattering direction, or how big the blob around the sun is */
// and the heights (how far to go up before the scattering has no effect)
#define HEIGHT_RAY 8e3 /* rayleigh height */
#define HEIGHT_MIE 1.2e3 /* and mie */
#define HEIGHT_ABSORPTION 8e3 /* at what height the absorption is at it's maximum */
#define ABSORPTION_FALLOFF 4e3 /* how much the absorption decreases the further away it gets from the maximum height */

#define PRIMARY_STEPS 12 /* primary steps, affects quality the most */
#define LIGHT_STEPS 8 /* light steps, how much steps in the light direction are taken */

uniform vec3 uViewVector;
uniform vec3 uWorldspaceCameraPosition;
// blah 
uniform vec2 uResolution;
uniform float uFov;
// planet info
uniform float uAtmosphereRadius;
uniform vec3 uPlanetOrigin;
uniform float uPlanetRadius;
uniform vec3 uSunPosition;


void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
  vec2 screenPos    = squareFrame( uResolution );
  vec3 rayDirection = getRay( uWorldspaceCameraPosition, uViewVector, screenPos, 2.0 );

  float sceneDepth = getViewZ(depth);

  float atmosphereRadius = uAtmosphereRadius;
  vec3 rayOrigin = uWorldspaceCameraPosition;
  vec3 dirToSun = normalize(uSunPosition - rayOrigin);

  vec3 addColor = calculate_scattering(
    	uWorldspaceCameraPosition,				// the position of the camera
      rayDirection, 					// the camera vector (ray direction of this pixel)
      sceneDepth, 						// max dist, essentially the scene depth
      inputColor.xyz,						// scene color, the color of the current pixel being rendered
      dirToSun,						// light direction
      vec3(40.0),						// light intensity, 40 looks nice
      uPlanetOrigin,						// position of the planet
      uPlanetRadius,                  // radius of the planet in meters
      uAtmosphereRadius,                   // radius of the atmosphere in meters
      RAY_BETA,						// Rayleigh scattering coefficient
      MIE_BETA,                       // Mie scattering coefficient
      ABSORPTION_BETA,                // Absorbtion coefficient
      AMBIENT_BETA,					// ambient scattering, turned off for now. This causes the air to glow a bit when no light reaches it
      G,                          	// Mie preferred scattering direction
      HEIGHT_RAY,                     // Rayleigh scale height
      HEIGHT_MIE,                     // Mie scale height
      HEIGHT_ABSORPTION,				// the height at which the most absorption happens
      ABSORPTION_FALLOFF,				// how fast the absorption falls off from the absorption height 
      PRIMARY_STEPS, 					// steps in the ray direction 
      LIGHT_STEPS 					// steps in the light direction
  );
  
  outputColor = vec4(inputColor.xyz + addColor, 1.0);
}