#define tmax 1e1
float MAX_FLOAT = 3.402823466e+38;

vec3 get_camera_vector(vec3 resolution, vec2 coord) {
	vec2 uv    = coord.xy / resolution.xy - vec2(0.5);
         uv.x *= resolution.x / resolution.y;

    return normalize(vec3(uv.x, uv.y, -1.0));
}

vec2 ray_sphere_intersect(
    vec3 start, // starting position of the ray
    vec3 dir, // the direction of the ray
    float radius // and the sphere radius
) {
    // ray-sphere intersection that assumes
    // the sphere is centered at the origin.
    // No intersection when result.x > result.y
    float a = dot(dir, dir);
    float b = 2.0 * dot(dir, start);
    float c = dot(start, start) - (radius * radius);
    float d = (b*b) - 4.0*a*c;
    if (d < 0.0) return vec2(1e5,-1e5);
    return vec2(
        (-b - sqrt(d))/(2.0*a),
        (-b + sqrt(d))/(2.0*a)
    );
}

// Ray March te terrain
// Using over-relaxxed raymarching
// ro rayOrigin
// rd rayDirection
// I hate when people use bullshit variable names
// float raymarch(vec3 ro, vec3 rd) {
//     float t = 0.0;
//     float relax = 0.5;
//     float last_d = 0.0;
//     float last_dt = 0.0;
//     for(int i = 0; i < steps; i++) {
//         if(t > tmax) break;
//         float d = map(ro + rd * t);
//         if(relax != 1.0 && last_dt > abs(last_d) + abs(d)) {
//             t += (1.0 - relax) * last_dt;
//             relax = 1.0;
//             continue;
//         }
//         if(d < epsilon) break;
//         t += relax * d;
//         last_dt = relax * d;
//         last_d = d;
//     }
//     return tmax > t ? t : tmax;
// }

vec2 sphere(vec3 rayOrigin, vec3 rayDirection, vec3 origin, float radius) {
    vec3 o = rayOrigin - origin;
    float b = dot(o, rayDirection);
    float c = dot(o, o) - radius * radius;
    float d = b * b - c;
    if(d < 0.0) return vec2(tmax);
    d = sqrt(d);
    vec2 t = -b + vec2(-d, d);
    return t;
}

//https://github.com/stackgl/glsl-look-at/blob/gh-pages/index.glsl

mat3 calcLookAtMatrix(vec3 origin, vec3 target, float roll) {
  vec3 rr = vec3(sin(roll), cos(roll), 0.0);
  vec3 ww = normalize(target - origin);
  vec3 uu = normalize(cross(ww, rr));
  vec3 vv = normalize(cross(uu, ww));
  return mat3(uu, vv, ww);
}

//https://github.com/stackgl/glsl-camera-ray

vec3 getRay(mat3 camMat, vec2 screenPos, float lensLength) {
  return normalize(camMat * vec3(screenPos, lensLength));
}
vec3 getRay(vec3 origin, vec3 target, vec2 screenPos, float lensLength) {
  mat3 camMat = calcLookAtMatrix(origin, target, 0.0);
  return getRay(camMat, screenPos, lensLength);
}

vec2 squareFrame(vec2 screenSize) {
  vec2 position = 2.0 * (gl_FragCoord.xy / screenSize.xy) - 1.0;
  position.x *= screenSize.x / screenSize.y;
  return position;
}
vec2 squareFrame(vec2 screenSize, vec2 coord) {
  vec2 position = 2.0 * (coord.xy / screenSize.xy) - 1.0;
  position.x *= screenSize.x / screenSize.y;
  return position;
}