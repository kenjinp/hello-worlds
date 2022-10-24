
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
      vec3 rayStart, vec3 rayDir, vec3 sphereCenter, float sphereRadius, out float t0, out float t1) {
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
  vec3 _SampleLightRay(
      vec3 origin, vec3 sunDir, float planetScale, float planetRadius, float totalRadius,
      float rayleighScale, float mieScale, float absorptionHeightMax, float absorptionFalloff) {
    float t0, t1;
    _RayIntersectsSphere(origin, sunDir, planetPosition, totalRadius, t0, t1);
    float actualLightStepSize = (t1 - t0) / float(LIGHT_STEP_COUNT);
    float virtualLightStepSize = actualLightStepSize * planetScale;
    float lightStepPosition = 0.0;
    vec3 opticalDepthLight = vec3(0.0);
    for (int j = 0; j < LIGHT_STEP_COUNT; j++) {
      vec3 currentLightSamplePosition = origin + sunDir * (lightStepPosition + actualLightStepSize * 0.5);
      // Calculate the optical depths and accumulate
      float currentHeight = length(currentLightSamplePosition) - planetRadius;
      float currentOpticalDepthRayleigh = exp(-currentHeight / rayleighScale) * virtualLightStepSize;
      float currentOpticalDepthMie = exp(-currentHeight / mieScale) * virtualLightStepSize;
      float currentOpticalDepthOzone = (1.0 / cosh((absorptionHeightMax - currentHeight) / absorptionFalloff));
      currentOpticalDepthOzone *= currentOpticalDepthRayleigh * virtualLightStepSize;
      opticalDepthLight += vec3(
          currentOpticalDepthRayleigh,
          currentOpticalDepthMie,
          currentOpticalDepthOzone);
      lightStepPosition += actualLightStepSize;
    }
    return opticalDepthLight;
  }
  void _ComputeScattering(
    vec3 worldSpacePos, 
    vec3 rayDirection, 
    vec3 rayOrigin, 
    vec3 sunDir,
    float planetRadius,
    float atmosphereRadius,
    out vec3 scatteringColour, 
    out vec3 scatteringOpacity) {
      // So it begins
    vec3 betaRayleigh = vec3(5.5e-6, 13.0e-6, 22.4e-6);
    float betaMie = 21e-6;
    vec3 betaAbsorption = vec3(2.04e-5, 4.97e-5, 1.95e-6);
    float g = 0.76;
    float sunIntensity = 40.0;
    float atmosphereRadius = atmosphereRadius - planetRadius;
    float totalRadius = planetRadius + atmosphereRadius;
    float referencePlanetRadius = 6371000.0;
    float referenceAtmosphereRadius = 100000.0;
    float referenceTotalRadius = referencePlanetRadius + referenceAtmosphereRadius;
    float referenceRatio = referencePlanetRadius / referenceAtmosphereRadius;
    float scaleRatio = planetRadius / atmosphereRadius;
    float planetScale = referencePlanetRadius / planetRadius;
    float atmosphereScale = scaleRatio / referenceRatio;
    float maxDist = distance(worldSpacePos, rayOrigin);
    float rayleighScale = 8500.0 / (planetScale * atmosphereScale);
    float mieScale = 1200.0 / (planetScale * atmosphereScale);
    float absorptionHeightMax = 32000.0 * (planetScale * atmosphereScale);
    float absorptionFalloff = 3000.0 / (planetScale * atmosphereScale);;
    float mu = dot(rayDirection, sunDir);
    float mumu = mu * mu;
    float gg = g * g;
    float phaseRayleigh = 3.0 / (16.0 * PI) * (1.0 + mumu);
    float phaseMie = 3.0 / (8.0 * PI) * ((1.0 - gg) * (mumu + 1.0)) / (pow(1.0 + gg - 2.0 * mu * g, 1.5) * (2.0 + gg));
    // Early out if ray doesn't intersect atmosphere.
    float t0, t1;
    if (!_RayIntersectsSphere(rayOrigin, rayDirection, planetPosition, totalRadius, t0, t1)) {
      scatteringOpacity = vec3(1.0);
      return;
    }
    // Clip the ray between the camera and potentially the planet surface.
    t0 = max(0.0, t0);
    t1 = min(maxDist, t1);
    float actualPrimaryStepSize = (t1 - t0) / float(PRIMARY_STEP_COUNT);
    float virtualPrimaryStepSize = actualPrimaryStepSize * planetScale;
    float primaryStepPosition = 0.0;
    vec3 accumulatedRayleigh = vec3(0.0);
    vec3 accumulatedMie = vec3(0.0);
    vec3 opticalDepth = vec3(0.0);
    // Take N steps along primary ray
    for (int i = 0; i < PRIMARY_STEP_COUNT; i++) {
      vec3 currentPrimarySamplePosition = rayOrigin + rayDirection * (
          primaryStepPosition + actualPrimaryStepSize * 0.5);
      float currentHeight = max(0.0, length(currentPrimarySamplePosition) - planetRadius);
      float currentOpticalDepthRayleigh = exp(-currentHeight / rayleighScale) * virtualPrimaryStepSize;
      float currentOpticalDepthMie = exp(-currentHeight / mieScale) * virtualPrimaryStepSize;
      // Taken from https://www.shadertoy.com/view/wlBXWK
      float currentOpticalDepthOzone = (1.0 / cosh((absorptionHeightMax - currentHeight) / absorptionFalloff));
      currentOpticalDepthOzone *= currentOpticalDepthRayleigh * virtualPrimaryStepSize;
      opticalDepth += vec3(currentOpticalDepthRayleigh, currentOpticalDepthMie, currentOpticalDepthOzone);
      // Sample light ray and accumulate optical depth.
      vec3 opticalDepthLight = _SampleLightRay(
          currentPrimarySamplePosition, sunDir,
          planetScale, planetRadius, totalRadius,
          rayleighScale, mieScale, absorptionHeightMax, absorptionFalloff);
      vec3 r = (
          betaRayleigh * (opticalDepth.x + opticalDepthLight.x) +
          betaMie * (opticalDepth.y + opticalDepthLight.y) + 
          betaAbsorption * (opticalDepth.z + opticalDepthLight.z));
      vec3 attn = exp(-r);
      accumulatedRayleigh += currentOpticalDepthRayleigh * attn;
      accumulatedMie += currentOpticalDepthMie * attn;
      primaryStepPosition += actualPrimaryStepSize;
    }
    scatteringColour = sunIntensity * (phaseRayleigh * betaRayleigh * accumulatedRayleigh + phaseMie * betaMie * accumulatedMie);
    scatteringOpacity = exp(
        -(betaMie * opticalDepth.y + betaRayleigh * opticalDepth.x + betaAbsorption * opticalDepth.z));
  }