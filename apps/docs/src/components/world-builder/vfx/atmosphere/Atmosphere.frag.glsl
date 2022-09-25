@import ./Math;
@import ./Scatter;
// uniform vec2 resolution;
// uniform vec2 texelSize;
// uniform float cameraNear;
// uniform float cameraFar;
// uniform float aspect;
// uniform float time;
// varying vec2 vUv;
uniform mat4 uInverseProjection;
uniform mat4 uInverseView;
uniform mat4 uCamMatrix;

uniform vec3 uVV;
uniform vec3 uWorldspaceCameraPosition;
// blah 
// uniform vec2 uResolution;
// uniform float uFov;
// // planet info
uniform float uAtmosphereRadius;
uniform vec3 uPlanetOrigin;
uniform float uPlanetRadius;
uniform vec3 uSunPosition;
uniform vec2 uResolution;

#define tmax 1e1
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


  float _SoftLight(float a, float b) {
    return (b < 0.5 ?
        (2.0 * a * b + a * a * (1.0 - 2.0 * b)) :
        (2.0 * a * (1.0 - b) + sqrt(a) * (2.0 * b - 1.0))
    );
  }
  vec3 _SoftLight(vec3 a, vec3 b) {
    return vec3(
        _SoftLight(a.x, b.x),
        _SoftLight(a.y, b.y),
        _SoftLight(a.z, b.z)
    );
  }
  
  bool _RayIntersectsSphere(
      vec3 rayStart,
      vec3 rayDir, 
      vec3 sphereCenter, 
      float sphereRadius, 
      out float t0, 
      out float t1
    ) {
    vec3 oc = rayStart - sphereCenter;
    float a = dot(rayDir, rayDir);
    float b = 2.0 * dot(oc, rayDir);
    float c = dot(oc, oc) - sphereRadius * sphereRadius;
    float d =  b * b - 4.0 * a * c;
    // Also skip single point of contact
    if (d <= 0.0) {
      return false;
    }
    float r0 = (-b - sqrt(d)) / (2.0 * a);
    float r1 = (-b + sqrt(d)) / (2.0 * a);
    t0 = min(r0, r1);
    t1 = max(r0, r1);
    return (t1 >= 0.0);
  }


vec3 _ScreenToWorld(vec3 pos) {
  vec4 posP = vec4(pos.xyz * 2.0 - 1.0, 1.0);
  vec4 posVS = uInverseProjection * posP;
  vec4 posWS = uInverseView * vec4((posVS.xyz / posVS.w), 1.0);
  return posWS.xyz;
}

// https://github.com/glslify/glsl-look-at
mat3 lookAt(vec3 target, vec3 origin) {
  vec3 cw = normalize(origin - target);
  vec3 cu = normalize(cross(cw, origin));
  vec3 cv = normalize(cross(cu, cw));
  return mat3(cu, cv, cw);
}


void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
  vec2  screenPos    = squareFrame( uResolution );
  // vec3  rayOrigin    = uWorldspaceCameraPosition;
  // vec3  rayTarget    = uVV;
  float z = getViewZ(depth);
  vec3 posWS = _ScreenToWorld(vec3(uv, z));
  vec3  rayOrigin    = uWorldspaceCameraPosition;
  vec3  rayTarget    = uVV;

  vec2 pixel = (gl_FragCoord.xy * 2.0 - uResolution) / min(uResolution.x, uResolution.y);
  // float jitter = uRegress ? hash(pixel.x + pixel.y * 50.0 + uTime) : 0.0;

  mat3 camera = lookAt(uWorldspaceCameraPosition, vec3(0.0, 1.0, 0.0));
  vec3 ray = camera * normalize(vec3(pixel, 2.0));

  vec3 rayDirection = normalize(posWS - rayOrigin);

  // vec3  rayDirection = getRay(rayOrgin, uPlanetOrigin, screenPos, 2.5);
  // // vec2  px           = vec2((uv.x+0.5)/resolution.x, (uv.y+0.5)/resolution.y);
  // // vec3  rayDirection = xcreateRay(px, uInverseProjection, uInverseView);
  // vec3 cameraDirection = normalize(posWS - uWorldspaceCameraPosition);
  vec3 addColor = inputColor.xyz;
  float t0, t1;
  if (_RayIntersectsSphere(
      rayOrigin, // start point at this pixel
      rayDirection, // direction this pixel is looking at 
      uPlanetOrigin, // center 
      uAtmosphereRadius, // radius
      t0, 
      t1
    )) {
    addColor =  vec3(0.149, 0.141, 0.912);
  }

  outputColor = vec4(addColor, 1.0);
}