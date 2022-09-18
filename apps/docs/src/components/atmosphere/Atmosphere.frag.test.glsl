// This file attemps the sebastian lague example
// https://www.youtube.com/watch?v=DxfEbulyFcY
// https://www.shadertoy.com/view/fltXD2

@include ./Math;
@include ./Scatter;

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
#define AMBIENT_BETA vec3(0.0) /* ambient, affects the scattering color when there is no lighting from the sun */
#define ABSORPTION_BETA vec3(2.04e-5, 4.97e-5, 1.95e-6) /* what color gets absorbed by the atmosphere (Due to things like ozone) */
#define G 0.7 /* mie scattering direction, or how big the blob around the sun is */
// and the heights (how far to go up before the scattering has no effect)
#define HEIGHT_RAY 8e3 /* rayleigh height */
#define HEIGHT_MIE 1.2e3 /* and mie */
#define HEIGHT_ABSORPTION 30e3 /* at what height the absorption is at it's maximum */
#define ABSORPTION_FALLOFF 4e3 /* how much the absorption decreases the further away it gets from the maximum height */

#define PRIMARY_STEPS 32 /* primary steps, affects quality the most */
#define LIGHT_STEPS 8 /* light steps, how much steps in the light direction are taken */
#define epsilon 1e-4

#define scatteringStrength 20.0
#define scatteringCoeff pow(400.0 / vec3(700, 530, 440), vec3(4)) * scatteringStrength

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

// atmosphere info
float densityFalloff = 3.;
int numOpticalDepthPoints = 10;
int numInScatterPoints = 100;

float densityAtPoint(vec3 densitySamplePoint) {
  float planetRadius = uPlanetRadius;
  float heightAboveSurface = length(densitySamplePoint - uPlanetOrigin) - planetRadius;
  float height01 = heightAboveSurface / (uAtmosphereRadius - planetRadius);
  float localDensity = exp(-height01 * densityFalloff) * (1. - height01);
  return localDensity;
}

float opticalDepth(vec3 rayOrigin, vec3 rayDir, float rayLength) {
  vec3 densitySamplePoint = rayOrigin;
  float stepSize = rayLength / float(numOpticalDepthPoints - 1);
  float opticalDepth = 0.;

  for (int i = 0; i < numOpticalDepthPoints; i ++) {
    float localDensity = densityAtPoint(densitySamplePoint);
    opticalDepth += localDensity * stepSize;
    densitySamplePoint += rayDir * stepSize;
  }
  return opticalDepth;
}


// Returns vector (dstToSphere, dstThroughSphere)
// If ray origin is inside sphere, dstToSphere = 0
// If ray misses sphere, dstToSphere = maxValue; dstThroughSphere = 0
vec2 raySphere(vec3 sphereCentre, float sphereRadius, vec3 rayOrigin, vec3 rayDir) {
	vec3 offset = rayOrigin - sphereCentre;
	float a = 1.; // Set to dot(rayDir, rayDir) if rayDir might not be normalized
	float b = 2. * dot(offset, rayDir);
	float c = dot (offset, offset) - sphereRadius * sphereRadius;
	float d = b * b - 4. * a * c; // Discriminant from quadratic formula

	// Number of intersections: 0 when d < 0; 1 when d = 0; 2 when d > 0
	if (d > 0.) {
		float s = sqrt(d);
		float dstToSphereNear = max(0., (-b - s) / (2. * a));
		float dstToSphereFar = (-b + s) / (2. * a);

		// Ignore intersections that occur behind the ray
		if (dstToSphereFar >= 0.) {
			return vec2(dstToSphereNear, dstToSphereFar - dstToSphereNear);
		}
	}
	// Ray did not intersect sphere
	return vec2(MAX_FLOAT, 0.);
}

vec3 calculateLight (vec3 rayOrigin, vec3 rayDir, float rayLength, vec3 originalCol) {
  vec3 dirToSun = normalize(uSunPosition - rayOrigin);
  vec3 inScatteringPoint = rayOrigin;
  float stepSize = rayLength / float(numInScatterPoints - 1);
  vec3 inScatteredLight = vec3(0.);
  float viewRayOpticalDepth = 0.0;
  for (int i = 0; i < numInScatterPoints; i++) {
    float sunRayLength = sphere(inScatteringPoint, dirToSun, uPlanetOrigin, uAtmosphereRadius).y;
    float sunRayOpticalDepth = opticalDepth(inScatteringPoint, dirToSun, sunRayLength);
    
    viewRayOpticalDepth = opticalDepth(inScatteringPoint, -rayDir, float(stepSize) * float(i));
    
    vec3 transmittance = exp(-(sunRayOpticalDepth + viewRayOpticalDepth) * scatteringCoeff);//exp(-sunRayOpticalDepth) * exp(-viewRayOpticalDepth);
    float localDensity = densityAtPoint(inScatteringPoint);

    inScatteredLight += localDensity * transmittance * scatteringCoeff * stepSize;
    inScatteringPoint += rayDir * stepSize;
  }
  float originalColTransmittance = exp(-viewRayOpticalDepth);
  return originalCol * originalColTransmittance + inScatteredLight;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
  outputColor = inputColor;
  
  vec2 screenPos    = squareFrame( uResolution );
  vec3 rayDirection = getRay( uWorldspaceCameraPosition, uViewVector, screenPos, 2.0 );

  float sceneDepth = getViewZ(depth);

  float atmosphereRadius = uAtmosphereRadius;
  vec3 rayOrigin = uWorldspaceCameraPosition;

  vec2 hitInfo = sphere(rayOrigin, rayDirection, uPlanetOrigin, atmosphereRadius);

  // vec2 hitInfo = raySphere(uPlanetOrigin, atmosphereRadius, rayOrigin, rayDir);
  // float distTroughAtmosphere = min(a.y - a.x, tmin-a.x);
  float distanceToAtmosphere = hitInfo.x;
  float distanceThroughAtmosphere = min(hitInfo.y- distanceToAtmosphere, sceneDepth - distanceToAtmosphere); // min(hitInfo.y, depth - distanceToAtmosphere);
  // if we're touching atmosphere
  if (distanceThroughAtmosphere > 0. && sceneDepth > distanceToAtmosphere) {
    // float epsilon = 0.0001;
    vec3 pointInAtmosphere = rayOrigin + rayDirection * (distanceToAtmosphere - epsilon);
    outputColor = vec4(calculateLight(pointInAtmosphere, rayDirection, distanceThroughAtmosphere+epsilon*2.0, inputColor.xyz), 1.0);
    // outputColor = inputColor * (1. - light) + light;
    // outputColor = distanceThroughAtmosphere / (atmosphereRadius * 2.0) * vec4(rayDir.rgb * 0.5 + 0.5, 0.); //inputColor * (1.0 - light) + light;
  }
  // float whatever = sceneDepth; // / (atmosphereRadius * 2.0);
  // vec4 testColor = vec4(vec3(sceneDepth), 1.0); //* vec4(rayDir.rgb * 0.5 + 0.5, 1.);
  // outputColor = testColor;
}