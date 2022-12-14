uniform mat4 uProjectionMatrixInverse; // camera.projectionMatrixInverse
uniform mat4 uViewMatrixInverse; // camera.matrixWorld
uniform vec3 uCameraPosition;
uniform vec3 uCameraWorldDirection;

#define PLANETS_WITH_OCEAN_LENGTH <planetsWithOceansLength>
#define SUNS_LENGTH <sunsLength>
#define saturate(a) clamp( a, 0.0, 1.0 )

struct PlanetWithOcean {
  vec3 origin;
  float radius;
  float seaLevel;
};

// techinque from 
// https://stackoverflow.com/questions/33299796/webgl-variables-array-sizes-over-vertex-shader-calls
uniform PlanetWithOcean uPlanetsWithOceans[<planetsWithOceansLength>];
uniform Sun uSuns[<sunsLength>];

vec2 sphere(
  vec3 rayStart, 
  vec3 rayDir, 
  vec3 sphereCenter, 
  float sphereRadius
) {
    vec3 oc = rayStart - sphereCenter;
    float a = dot(rayDir, rayDir);
    float b = 2.0 * dot(oc, rayDir);
    float c = dot(oc, oc) - sphereRadius * sphereRadius;
    float d =  b * b - 4.0 * a * c;
    float r0 = (-b - sqrt(d)) / (2.0 * a);
    float r1 = (-b + sqrt(d)) / (2.0 * a);
    float t0 = min(r0, r1);
    float t1 = max(r0, r1);
    return vec2(t0,t1);
}

vec3 _ScreenToWorld(vec3 posS) {
  vec2 uv = posS.xy;
  float z = posS.z;
  float nearZ = 0.01;
  float farZ = cameraFar;
  float depth = pow(2.0, z * log2(farZ + 1.0)) - 1.0;
    vec3 direction = (uProjectionMatrixInverse * vec4(vUv * 2.0 - 1.0, 0.0, 1.0)).xyz;
    direction = (uViewMatrixInverse * vec4(direction, 0.0)).xyz;
    direction = normalize(direction);
  direction /= dot(direction, uCameraWorldDirection);
  return uCameraPosition + direction * depth;
}

float readDepth( float z ) {
  return perspectiveDepthToViewZ( z, cameraNear, cameraFar );
}

void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
    float depthValue = getViewZ(depth);
    float d = readDepth(texture2D(depthBuffer, uv).x);
    float v_depth = pow(2.0, d / (logDepthBufFC() * 0.5));
    float z_view = v_depth - 1.0;
    
    // straight depth
    float z = texture2D(depthBuffer, uv).x;
    float depthZ = (exp2(z / (logDepthBufFC() * 0.5)) - 1.0);
    // float sceneDepth = depthZ - 1.0;


    vec3 posWS = _ScreenToWorld(vec3(uv, z));
    vec3 rayOrigin = uCameraPosition;
    vec3 rayDirection = normalize(posWS - uCameraPosition);
    float sceneDepth = length(posWS.xyz - uCameraPosition);
    vec3 addColor = inputColor.xyz;

  for (int i = 0; i < PLANETS_WITH_OCEAN_LENGTH; i++) {
    PlanetWithOcean currentPlanet = uPlanetsWithOceans[i];


      // for some reason currentPlanet.radius doesnt work
      vec2 sphereIntersection = sphere(rayOrigin, rayDirection, currentPlanet.origin, 6357000.0 + currentPlanet.seaLevel);
      float dstToOcean = sphereIntersection.x;
      float distThroughOcean = sphereIntersection.y;
      
      float oceanViewDepth = min(dstToOcean, sceneDepth);
      
      if (dstToOcean > 0.0) {
        addColor = vec3(0.11, 0.33, 0.49);
        // addColor = mix(addColor, vec3(0.11, 0.33, 0.49), 1.0);
      }
      //   addColor =  vec3(0.11, 0.33, 0.49);
      // if (sphereIntersection.x > sphereIntersection.y) {
      //   continue;
      //   // addColor = mix(addColor, vec3(0.11, 0.33, 0.49), 1.0);
      // }
      //   addColor =  vec3(0.11, 0.33, 0.49);

    // for (int s = 0; s < SUNS_LENGTH; s++) {
    //   Sun sun = uSuns[s];

    //   vec3 lightDirection = normalize(sun.origin - rayOrigin);

    //   bool maybeSphereIntersects = sphereIntersect(rayOrigin, rayDirection, currentPlanet.origin, currentPlanet.radius + currentPlanet.seaLevel);

    //   vec2 sphereIntersection = sphere(rayOrigin, rayDirection, currentPlanet.origin, currentPlanet.radius + 50000.0);

    //   if (maybeSphereIntersects) {
    //     // addColor = mix(addColor, vec3(0.11, 0.33, 0.49), 1.0);
    //     addColor = vec3(0.11, 0.33, 0.49);
    //   }
    // }
  }

  outputColor = vec4(addColor, 1.0);
}