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
@import ./Scatter;

vec3 screenToWorldLogarithmicDepthBuffer(vec3 posS) {
  float depthValue = posS.z;
  float logDepthBufFC = 2.0 / ( log( cameraFar + 1.0 ) / log(2.0) );
  float v_depth = pow(2.0, depthValue / (logDepthBufFC * 0.5));
  float z_view = v_depth - 1.0;
  vec4 posCLIP = vec4(posS.xy * 2.0 - 1.0, 0.0, 1.0);
  vec4 posVS = uProjectionMatrixInverse * posCLIP;
  posVS = vec4(posVS.xyz / posVS.w, 1.0);
  posVS.xyz = normalize(posVS.xyz) * z_view;
  vec4 posWS = uViewMatrixInverse * posVS;
  return posWS.xyz;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
  float z = texture2D(depthBuffer, uv).x;
  vec3 posWS = screenToWorldLogarithmicDepthBuffer(vec3(uv, z));
  vec3 rayOrigin = uCameraPosition;
  vec3 rayDirection = normalize(posWS - uCameraPosition);
  vec3 addColor = inputColor.xyz;
  float sceneDepth = length(posWS.xyz - uCameraPosition);

  for (int i = 0; i < PLANETS_LENGTH; i ++) {
    Planet currentPlanet = uPlanets[i];

    for (int s = 0; s < SUNS_LENGTH; s ++) {
      Sun sun = uSuns[s];

      vec3 lightDirection = normalize(sun.origin - rayOrigin);

      addColor += hello_calculate_scattering(
        rayOrigin,
        rayDirection,
        sceneDepth,
        inputColor.xyz,
        lightDirection,
        sun.intensity,
        sun.color,
        currentPlanet.origin,
        currentPlanet.radius,
        currentPlanet.atmosphereRadius
      );
    }
  }

  outputColor = vec4(addColor, 1.0);
}