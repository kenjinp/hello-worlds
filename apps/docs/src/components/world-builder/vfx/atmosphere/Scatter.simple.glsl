   
   float logDepthBufFC = 0.018867924528301886;

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
   
   vec3 _ScreenToWorld(vec3 posS) {
    float depthValue = posS.z;
    float v_depth = pow(2.0, depthValue / (logDepthBufFC * 0.5));
    float z_view = v_depth - 1.0;
    vec4 posCLIP = vec4(posS.xy * 2.0 - 1.0, 0.0, 1.0);
    vec4 posVS = uProjectionMatrixInverse * posCLIP;
    posVS = vec4(posVS.xyz / posVS.w, 1.0);
    posVS.xyz = normalize(posVS.xyz) * z_view;
    vec4 posWS = uViewMatrixInverse * posVS;
    return posWS.xyz;
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

 vec3 _ApplyGroundFog(
      in vec3 rgb,
      float distToPoint,
      float height,
      in vec3 worldSpacePos,
      in vec3 rayOrigin,
      in vec3 rayDir,
      in vec3 sunDir,
      in float planetRadius,
      in vec3 planetPosition,
      in float atmosphereRadius
    )
  {
    vec3 up = normalize(rayOrigin);
    float skyAmt = dot(up, rayDir) * 0.25 + 0.75;
    skyAmt = saturate(skyAmt);
    skyAmt *= skyAmt;
    vec3 DARK_BLUE = vec3(0.1, 0.2, 0.3);
    vec3 LIGHT_BLUE = vec3(0.5, 0.6, 0.7);
    vec3 DARK_ORANGE = vec3(0.7, 0.4, 0.05);
    vec3 BLUE = vec3(0.5, 0.6, 0.7);
    vec3 YELLOW = vec3(1.0, 0.9, 0.7);
    vec3 fogCol = mix(DARK_BLUE, LIGHT_BLUE, skyAmt);
    float sunAmt = max(dot(rayDir, sunDir), 0.0);
    fogCol = mix(fogCol, YELLOW, pow(sunAmt, 16.0));
    float be = 0.0025;
    float fogAmt = (1.0 - exp(-distToPoint * be));
    // Sun
    sunAmt = 0.5 * saturate(pow(sunAmt, 256.0));
    return mix(rgb, fogCol, fogAmt) + sunAmt * YELLOW;
  }

  vec3 _ApplySpaceFog(
      in vec3 rgb,
      in float distToPoint,
      in float height,
      in vec3 worldSpacePos,
      in vec3 rayOrigin,
      in vec3 rayDir,
      in vec3 sunDir,
      in float planetRadius,
      in vec3 planetPosition,
      in float atmosphereRadius
  )
  {
    float atmosphereThickness = (atmosphereRadius - planetRadius);
    float t0 = -1.0;
    float t1 = -1.0;
    // This is a hack since the world mesh has seams that we haven't fixed yet.
    if (_RayIntersectsSphere(
        rayOrigin, rayDir, planetPosition, planetRadius, t0, t1)) {
      if (distToPoint > t0) {
        distToPoint = t0;
        worldSpacePos = rayOrigin + t0 * rayDir;
      }
    }
    if (!_RayIntersectsSphere(
        rayOrigin, rayDir, planetPosition, planetRadius + atmosphereThickness * 5.0, t0, t1)) {
      return rgb * 0.5;
    }
    // Figure out a better way to do this
    float silhouette = saturate((distToPoint - 10000.0) / 10000.0);
    // Glow around planet
    float scaledDistanceToSurface = 0.0;
    // Calculate the closest point between ray direction and planet. Use a point in front of the
    // camera to force differences as you get closer to planet.
    vec3 fakeOrigin = rayOrigin + rayDir * atmosphereThickness;
    float t = max(0.0, dot(rayDir, planetPosition - fakeOrigin) / dot(rayDir, rayDir));
    vec3 pb = fakeOrigin + t * rayDir;
    scaledDistanceToSurface = saturate((distance(pb, planetPosition) - planetRadius) / atmosphereThickness);
    scaledDistanceToSurface = smoothstep(0.0, 1.0, 1.0 - scaledDistanceToSurface);
    //scaledDistanceToSurface = smoothstep(0.0, 1.0, scaledDistanceToSurface);
    float scatteringFactor = scaledDistanceToSurface * silhouette;
    // Fog on surface
    t0 = max(0.0, t0);
    t1 = min(distToPoint, t1);
    vec3 intersectionPoint = rayOrigin + t1 * rayDir;
    vec3 normalAtIntersection = normalize(intersectionPoint);
    float distFactor = exp(-distToPoint * 0.0005 / (atmosphereThickness));
    float fresnel = 1.0 - saturate(dot(-rayDir, normalAtIntersection));
    fresnel = smoothstep(0.0, 1.0, fresnel);
    float extinctionFactor = saturate(fresnel * distFactor) * (1.0 - silhouette);
    // Front/Back Lighting
    vec3 BLUE = vec3(0.5, 0.6, 0.75);
    vec3 YELLOW = vec3(1.0, 0.9, 0.7);
    vec3 RED = vec3(0.035, 0.0, 0.0);
    float NdotL = dot(normalAtIntersection, sunDir);
    float wrap = 0.5;
    float NdotL_wrap = max(0.0, (NdotL + wrap) / (1.0 + wrap));
    float RdotS = max(0.0, dot(rayDir, sunDir));
    float sunAmount = RdotS;
    vec3 backLightingColour = YELLOW * 0.1;
    vec3 frontLightingColour = mix(BLUE, YELLOW, pow(sunAmount, 32.0));
    vec3 fogColour = mix(backLightingColour, frontLightingColour, NdotL_wrap);
    extinctionFactor *= NdotL_wrap;
    // Sun
    float specular = pow((RdotS + 0.5) / (1.0 + 0.5), 64.0);
    fresnel = 1.0 - saturate(dot(-rayDir, normalAtIntersection));
    fresnel *= fresnel;
    float sunFactor = (length(pb) - planetRadius) / (atmosphereThickness * 5.0);
    sunFactor = (1.0 - saturate(sunFactor));
    sunFactor *= sunFactor;
    sunFactor *= sunFactor;
    sunFactor *= specular * fresnel;
    vec3 baseColour = mix(rgb, fogColour, extinctionFactor);
    vec3 litColour = baseColour + _SoftLight(fogColour * scatteringFactor + YELLOW * sunFactor, baseColour);
    vec3 blendedColour = mix(baseColour, fogColour, scatteringFactor);
    blendedColour += blendedColour + _SoftLight(YELLOW * sunFactor, blendedColour);
    return mix(litColour, blendedColour, scaledDistanceToSurface * 0.25);
  }

  vec3 _ApplyFog(
    in vec3 rgb,
    in float distToPoint,
    in float height,
    in vec3 worldSpacePos,
    in vec3 rayOrigin,
    in vec3 rayDir,
    in vec3 sunDir,
    in float planetRadius,
    in vec3 planetPosition,
    in float atmosphereRadius)
  {
    float distToPlanet = max(0.0, length(rayOrigin) - planetRadius);
    float atmosphereThickness = (atmosphereRadius - planetRadius);
    vec3 groundCol = _ApplyGroundFog(
      rgb, 
      distToPoint,
      height, 
      worldSpacePos, 
      rayOrigin, 
      rayDir,
      sunDir,
      planetRadius,
      planetPosition,
      atmosphereRadius
    );
    vec3 spaceCol = _ApplySpaceFog(
      rgb, 
      distToPoint, 
      height, 
      worldSpacePos, 
      rayOrigin, 
      rayDir, 
      sunDir,
      planetRadius,
      planetPosition,
      atmosphereRadius
    );

    float blendFactor = saturate(distToPlanet / (atmosphereThickness * 0.5));
    blendFactor = smoothstep(0.0, 1.0, blendFactor);
    // blendFactor = smoothstep(0.0, 1.0, blendFactor);
    return mix(groundCol, spaceCol, blendFactor);
  }
