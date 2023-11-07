export const vert = /* glsl */ `
precision highp float;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform float uTime;

attribute vec3 position;
attribute vec3 offset;
attribute vec4 color;
attribute vec3 up;
attribute float maxHeight;

varying vec4 vColor;

mat3 rotation3dY(float angle) {
  float s = sin(angle);
  float c = cos(angle);

  return mat3(
    c, 0.0, -s,
    0.0, 1.0, 0.0,
    s, 0.0, c
  );
}

mat3 rotation3dX(float angle) {
  float s = sin(angle);
  float c = cos(angle);

  return mat3(
    1.0, 0.0, 0.0,
    0.0, c, s,
    0.0, -s, c
  );
}

vec3 rotateX(vec3 v, float angle) {
  return rotation3dX(angle) * v;
}

vec3 rotateY(vec3 v, float angle) {
  return rotation3dY(angle) * v;
}

float hash(float n) { return fract(sin(n) * 1e4); }
float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }

void main() { 
  vColor = color;

  float perBladeHash = hash(offset.xy);

  // TODO towards up vector
  float heightPercentTowardsUpVector = position.y / maxHeight;
  float curveAmount = heightPercentTowardsUpVector * perBladeHash;
  mat3 grassMat = rotation3dX(curveAmount);
  vec3 grassVertexPosition = grassMat * vec3(position.xy, 0.0);
  
  float randomAngle = perBladeHash * 2.0 * 3.14159 * uTime;
  vec3 newPostion = grassVertexPosition;

  vec3 rotatedPosition = rotateY(newPostion, randomAngle);

  gl_Position = projectionMatrix * modelViewMatrix * vec4( rotatedPosition + offset, 1.0 );
}
`

export const frag = /* glsl */ `
precision highp float;
varying vec4 vColor;

void main() {
  gl_FragColor = vColor;
}
`
