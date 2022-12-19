uniform mat4 uProjectionMatrixInverse; // camera.projectionMatrixInverse
uniform mat4 uViewMatrixInverse; // camera.matrixWorld
uniform vec3 uCameraPosition;
uniform vec3 uCameraWorldDirection;

// ocean stuff
uniform float uPlanetScale;
uniform float uAlphaMultiplier;
uniform float uSmoothness;
uniform float uDepthMultiplier;
uniform vec4 uColorA;
uniform vec4 uColorB;

#define PLANETS_WITH_OCEAN_LENGTH <planetsWithOceansLength>
#define SUNS_LENGTH <sunsLength>
#define saturate(a) clamp( a, 0.0, 1.0 )

struct PlanetWithOcean {
  vec3 origin;
  float radius;
  float seaLevel;
};

struct OceanSun {
  vec3 origin;
  vec3 color;
  float intensity;
};

float O_logDepthBufFC () {
  float logDepthBufFC = 2.0 / ( log( cameraFar + 1.0 ) / log(2.0) );
  return logDepthBufFC;
}

// techinque from 
// https://stackoverflow.com/questions/33299796/webgl-variables-array-sizes-over-vertex-shader-calls
uniform PlanetWithOcean uPlanetsWithOceans[<planetsWithOceansLength>];
uniform OceanSun uSuns[<sunsLength>];

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

vec3 lerp(vec3 colorone, vec3 colortwo, float value)
{
	return (colorone + value*(colortwo-colorone));
}


vec4 lerp(vec4 colorone, vec4 colortwo, float value)
{
	return (colorone + value*(colortwo-colorone));
}

void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
    float depthValue = getViewZ(depth);
    float d = readDepth(texture2D(depthBuffer, uv).x);
    float v_depth = pow(2.0, d / (O_logDepthBufFC() * 0.5));
    float z_view = v_depth - 1.0;
    
    // straight depth
    float z = texture2D(depthBuffer, uv).x;
    float depthZ = (exp2(z / (O_logDepthBufFC() * 0.5)) - 1.0);
    // float sceneDepth = depthZ - 1.0;


    vec3 posWS = _ScreenToWorld(vec3(uv, z));
    vec3 rayOrigin = uCameraPosition;
    vec3 rayDirection = normalize(posWS - uCameraPosition);
    float sceneDepth = length(posWS.xyz - uCameraPosition);
    vec4 addColor = inputColor;

    float planetScale = uPlanetScale;
    float alphaMultiplier = uAlphaMultiplier;
    float smoothness = uSmoothness;
    float depthMultiplier = uDepthMultiplier;
    // vec4 colA = uColorA;
    // vec4 colB = uColorB;
    vec4 colA = vec4(0.11, 0.97, 1., 1.);
    vec4 colB = vec4(0.01, 0.05, 0.08, 1.);


  for (int i = 0; i < PLANETS_WITH_OCEAN_LENGTH; i++) {
    PlanetWithOcean currentPlanet = uPlanetsWithOceans[i];
      OceanSun sun = uSuns[0];

      // for some reason currentPlanet.radius doesnt work
      vec2 sphereIntersection = sphere(rayOrigin, rayDirection, currentPlanet.origin,  currentPlanet.radius + currentPlanet.seaLevel);
      float dstToOcean = sphereIntersection.x;
      float distThroughOcean = sphereIntersection.y;

      vec3 lightDirection = normalize(sun.origin - rayOrigin);
      
      float oceanViewDepth = min(distThroughOcean, sceneDepth - dstToOcean);
      
      if (oceanViewDepth > 0.) {
        float opticalDepth01 = 1. - exp(-oceanViewDepth * depthMultiplier / planetScale);
        float alpha = 1. - exp(-oceanViewDepth * alphaMultiplier / planetScale);
        vec3 oceanNormal = normalize(rayOrigin + rayDirection * dstToOcean);
        float specularAngle = acos(dot(lightDirection, oceanNormal));
        float specularExponent = specularAngle / (1. - smoothness);
        float specularHighlight = exp(-specularExponent * specularExponent);
        float diffuseLighting = saturate(dot(oceanNormal, lightDirection));
        vec4 oceanCol = lerp(colA, colB, opticalDepth01) * diffuseLighting + specularHighlight;
        addColor = lerp(addColor, oceanCol * diffuseLighting, alpha);
        // addColor = vec3(0.11, 0.33, 0.49);
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

  outputColor = addColor;
}