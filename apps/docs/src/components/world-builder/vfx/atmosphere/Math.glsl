float MAX_FLOAT = 3.402823466e+38;

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

bool sphereIntersect(
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
  // Also skip single point of contact
  if (d <= 0.0) {
    return false;
  }
  float r0 = (-b - sqrt(d)) / (2.0 * a);
  float r1 = (-b + sqrt(d)) / (2.0 * a);
  float t0 = min(r0, r1);
  float t1 = max(r0, r1);
  return (t1 >= 0.0);
}

float invLerp(float from, float to, float value){
  return (value - from) / (to - from);
}

float lerp(float from, float to, float rel){
  return ((1.0 - rel) * from) + (rel * to);
}

float remap(float origFrom, float origTo, float targetFrom, float targetTo, float value){
  float rel = invLerp(origFrom, origTo, value);
  return lerp(targetFrom, targetTo, rel);
}