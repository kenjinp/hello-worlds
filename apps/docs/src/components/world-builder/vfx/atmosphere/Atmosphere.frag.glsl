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

// vec3 screenToWorldLogarithmicDepthBuffer(vec3 posS) {
//   float logDepthBufFC = 2.0 / ( log( cameraFar + 1.0 ) / log(2.0) );
//   float depthValue = posS.z;
//   float v_depth = pow(2.0, depthValue / (logDepthBufFC * 0.5));
//   float z_view = v_depth - 1.0;
//   vec4 posCLIP = vec4(posS.xy * 2.0 - 1.0, 0.0, 1.0);
//   vec4 posVS = uProjectionMatrixInverse * posCLIP;
//   posVS = vec4(posVS.xyz / posVS.w, 1.0);
//   posVS.xyz = normalize(posVS.xyz) * z_view;
//   vec4 posWS = uViewMatrixInverse * posVS;
//   return posWS.xyz;
// }

void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
     // lets try to unpack logarithmic depth buffer
    float z = texture2D(depthBuffer, uv).x;
    vec3 posS = vec3(uv, z);
    float logDepthBufFC = 2.0 / ( log( cameraFar + 1.0 ) / log(2.0) );
    float depthValue = posS.z;
    float v_depth = pow(2.0, depthValue / (logDepthBufFC * 0.5));
    float z_view = v_depth - 1.0;
    vec4 posCLIP = vec4(posS.xy * 2.0 - 1.0, 0.0, 1.0);
    // position View Space
    vec4 posVS = uProjectionMatrixInverse * posCLIP;
    posVS = vec4(posVS.xyz / posVS.w, 1.0);
    posVS.xyz = normalize(posVS.xyz) * z_view;
    // Position World Space (at depth)
    vec4 posWS = uViewMatrixInverse * posVS;

    // Solution from Cody to get pixel point in view-space
    // vec4 point = uProjectionMatrixInverse * vec4(vec3(uv * 2.0 - 1.0, -1.0), 1.0); // uv => NDS => view-space

    vec3 rayOrigin = uCameraPosition;
    vec3 rayDirection = normalize(posWS.xyz - uCameraPosition);

    // vec3 rayDirection = (uViewMatrixInverse * vec4(point.xyz, 0)).xyz; // view-space => world

    vec3 addColor = inputColor.xyz;

    // we need to get the sceneDepth to test for objects occluding the atmoshpere
    // float sceneDepth = getViewZ(depth);
    float sceneDepth = length(posWS.xyz - uCameraPosition);


  // depth isssue?
  // https://jsfiddle.net/o7fbcqgh/

  for (int i = 0; i < PLANETS_LENGTH; i ++) {
    Planet currentPlanet = uPlanets[i];
    float sphereIntersect = iSphere(rayOrigin, rayDirection, currentPlanet.origin, currentPlanet.radius * 2.);
    // // simpler sphere intersect that returns the closest distance
    // float sphereI = iSphere(
    //   rayOrigin, // start point at this pixel
    //   rayDirection, // direction this pixel is looking at 
    //   uPlanetOrigin, // center 
    //   uAtmosphereRadius
    // );
    
    for (int s = 0; s < SUNS_LENGTH; s ++) {
      Sun sun = uSuns[s];
      vec3 lightDirection = normalize(sun.origin - rayOrigin);

      if (sceneDepth < sphereIntersect) {
        break;
      }
      if (
        sphereIntersect > 0.
      ) {
          // float intersectDist = sphereIntersect.x;
          // intersectDist = min(intersectDist, sceneDepth);
          // vec3 intersectionPoint = rayOrigin + intersectDist * rayDirection;
          // float intensity = softClamp(remap(0., currentPlanet.atmosphereRadius, 0., 1.0, intersectDist), 0., 0.5);
          addColor += sun.color; //* intensity;
        }
      
      // float height = max(0.0, length(uCameraPosition) - currentPlanet.radius);
      // addColor = _ApplyGroundFog(
      //   addColor, 
      //   sceneDepth, 
      //   height, 
      //   rayOrigin, 
      //   rayDirection, 
      //   lightDirection
      // );

    }
  }



  outputColor = vec4(addColor, 1.0);
}