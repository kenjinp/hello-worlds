uniform mat4 uProjectionMatrixInverse; // camera.projectionMatrixInverse
uniform mat4 uViewMatrixInverse; // camera.matrixWorld
uniform vec3 uCameraPosition;

#define PLANETS_LENGTH <planetsLength>
#define SUNS_LENGTH <sunsLength>
#define saturate(a) clamp( a, 0.0, 1.0 )

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

  vec3 addColor = inputColor.rgb;

  // vec4 fragCoord = texture2D( depthBuffer, uv );
  // float logDepthBufFC = 2.0 / ( log( cameraFar + 1.0 ) / log(2.0) );
  // float viewZ = -1.0 * (exp2(fragCoord.x / (logDepthBufFC * 0.5)) - 1.0);

  // depth isssue?
  // https://jsfiddle.net/o7fbcqgh/

  for (int i = 0; i < PLANETS_LENGTH; i ++) {
    Planet currentPlanet = uPlanets[i];
    vec2 sphereIntersect = sphere(rayOrigin, rayDirection, currentPlanet.origin, currentPlanet.atmosphereRadius);
    vec2 planetSphereIntersect = sphere(rayOrigin, rayDirection, currentPlanet.origin, currentPlanet.radius);
    for (int s = 0; s < SUNS_LENGTH; s ++) {
    Sun sun = uSuns[s];
    vec3 lightDirection = normalize(sun.origin - rayOrigin);
    if (
      sphereIntersect.y >= 0.
    ) {
        float intersectDist = sphereIntersect.y;
        intersectDist = min(intersectDist, 2.0 * currentPlanet.atmosphereRadius);
        // if (planetSphereIntersect.x >= 0.) {
        //   intersectDist = min(intersectDist, planetSphereIntersect.x );
        // }
        // intersectDist = min(intersectDist, sceneDepth * 100000.);
        vec3 intersectionPoint = rayOrigin + sphereIntersect.y * rayDirection;
        float intensity = remap(0., 2.0 * currentPlanet.atmosphereRadius, 0., 1.0, intersectDist);
        addColor += sun.color * intensity;
      }
    }
  }

  outputColor = vec4(addColor, 1.0);
}