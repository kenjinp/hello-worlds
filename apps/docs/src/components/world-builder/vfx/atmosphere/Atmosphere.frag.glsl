uniform mat4 uProjectionMatrixInverse; // camera.projectionMatrixInverse
uniform mat4 uViewMatrixInverse; // camera.matrixWorld
uniform vec3 uCameraPosition;

#define PLANETS_LENGTH <planetsLength>
#define SUNS_LENGTH <sunsLength>

struct Planet {
  vec3 origin;
  float radius;
  float atmosphereRadius;
};

struct Sun {
  vec3 origin;
  vec3 color;
  float intensity;
};

// techinque from 
// https://stackoverflow.com/questions/33299796/webgl-variables-array-sizes-over-vertex-shader-calls
uniform Planet uPlanets[<planetsLength>];
uniform Sun uSuns[<sunsLength>];

@import ./Math;
@import ./Scattering;
@import ./Fog;

void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
  float sceneDepth = getViewZ(depth);
  // Solution from Cody 
  vec4 point = uProjectionMatrixInverse * vec4(vec3(uv * 2.0 - 1.0, -1.0), 1.0); // uv => NDS => view-space

  vec3 rayOrigin = uCameraPosition;
  vec3 rayDirection = normalize((uViewMatrixInverse * vec4(point.xyz, 0)).xyz); // view-space => world

  vec3 addColor = inputColor.xyz;

  for (int i = 0; i < PLANETS_LENGTH; i ++) {
    float t0; // can ignore these guys
    float t1;
    Planet currentPlanet = uPlanets[i];
    // if (_RayIntersectsSphere(
    //   rayOrigin, // start point at this pixel
    //   rayDirection, // direction this pixel is looking at 
    //   currentPlanet.origin, // center 
    //   currentPlanet.atmosphereRadius,
    //   t0, 
    //   t1
    //     )) {
    //     // if this pixel hits the sphere then we paint the screen purpleish
    //     addColor += vec3(0.149, 0.141, 0.912);
    //   }
      // vec2 sphereIntersect = sphere(rayOrigin, rayDirection, currentPlanet.origin, currentPlanet.atmosphereRadius);
      for (int s = 0; s < SUNS_LENGTH; s ++) {

          // TODO add support for more than one sun
          Sun sun = uSuns[s];
          vec3 lightDireciton = normalize(sun.origin - rayOrigin);

          // addColor += in_scatter(
          //   rayOrigin,
          //   currentPlanet.origin,
          //   currentPlanet.radius,
          //   currentPlanet.atmosphereRadius,
          //   rayDirection, 
          //   sphereIntersect,
          //   lightDireciton
          // );
          addColor += blah_calculate_scattering(
            rayOrigin,				// the position of the camera
            rayDirection, 					// the camera vector (ray direction of this pixel)
            sceneDepth, 						// max dist, essentially the scene depth
            inputColor.xyz,						// scene color, the color of the current pixel being rendered
            lightDireciton,						// light direction
            vec3(sun.intensity),						// light intensity, 40 looks nice
            sun.color,
            currentPlanet.origin,						// position of the planet
            currentPlanet.radius,                // radius of the planet in meters
            currentPlanet.atmosphereRadius,                   // radius of the atmosphere in meters
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
        // applyFog(inputColor.rgb, depth, rayDirection, dirToSun);
      }

    // vec2 s0 = sphere(rayOrigin, rayDirection, currentPlanet.origin, currentPlanet.atmosphereRadius);
    //   // Applyfog
    // float d = getFog(rayOrigin, rayDirection, depth, currentPlanet.atmosphereRadius, currentPlanet.origin);
    // d = 1.0 - exp(-d);
    // d = min(d, 1.0);
    // addColor.rgb = mix(addColor.rgb, vec3(0.5, 0.6, 0.7), d);
    // if (s0.y > s0.x) {
    //   addColor += vec3(0.149, 0.141, 0.912);
    // }
  }

  outputColor = vec4(inputColor.rgb + addColor, 1.0);
  // outputColor = vec4(uColors[2].color.xyz, 1.0);
}