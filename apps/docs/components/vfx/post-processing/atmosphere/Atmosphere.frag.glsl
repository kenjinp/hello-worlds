uniform mat4 uProjectionMatrixInverse; // camera.projectionMatrixInverse
uniform mat4 uViewMatrixInverse; // camera.matrixWorld
uniform vec3 uCameraPosition;
uniform vec3 uCameraWorldDirection;

uniform int uPrimarySteps;
uniform int uLightSteps;

#define PLANETS_LENGTH <planetsLength>
#define SUNS_LENGTH <sunsLength>
#define saturate(a) clamp( a, 0.0, 1.0 )

struct Planet {
  vec3 origin;
  float radius;
  float atmosphereRadius;
};

struct AtmosphereSun {
  vec3 origin;
  vec3 color;
  float intensity;
};

// techinque from 
// https://stackoverflow.com/questions/33299796/webgl-variables-array-sizes-over-vertex-shader-calls
uniform Planet uPlanets[<planetsLength>];
uniform AtmosphereSun uSuns[<sunsLength>];

@import ./Math;
@import ./Scatter;

// float logDepthBufFC () {
//   float logDepthBufFC = 2.0 / ( log( cameraFar + 1.0 ) / log(2.0) );
//   return logDepthBufFC;
// }

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

float A_logDepthBufFC () {
  float logDepthBufFC = 2.0 / ( log( cameraFar + 1.0 ) / log(2.0) );
  return logDepthBufFC;
}


void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
    float depthValue = getViewZ(depth);
    float d = readDepth(texture2D(depthBuffer, uv).x);
    float v_depth = pow(2.0, d / (A_logDepthBufFC() * 0.5));
    float z_view = v_depth - 1.0;
    
    // straight depth
    float z = texture2D(depthBuffer, uv).x;
    float depthZ = (exp2(z / (A_logDepthBufFC() * 0.5)) - 1.0);
    // float sceneDepth = depthZ - 1.0;


    vec3 posWS = _ScreenToWorld(vec3(uv, z));
    vec3 rayOrigin = uCameraPosition;
    vec3 rayDirection = normalize(posWS - uCameraPosition);
    float sceneDepth = length(posWS.xyz - uCameraPosition);
    vec3 addColor = inputColor.xyz;

  for (int i = 0; i < PLANETS_LENGTH; i++) {
    Planet currentPlanet = uPlanets[i];

    for (int s = 0; s < SUNS_LENGTH; s++) {
      AtmosphereSun sun = uSuns[s];

      vec3 lightDirection = normalize(sun.origin - rayOrigin);

      addColor = hello_calculate_scattering(
        rayOrigin,
        rayDirection,
        sceneDepth,
        addColor,
        lightDirection,
        sun.intensity,
        sun.color,
        currentPlanet.origin,
        currentPlanet.radius,
        currentPlanet.atmosphereRadius,
        uPrimarySteps,
        uLightSteps
      );
    }
  }

  outputColor = vec4(addColor, 1.0);
}