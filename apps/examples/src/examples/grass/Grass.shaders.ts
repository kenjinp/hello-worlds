export const vert = /* glsl */ `
precision highp float;

uniform float uTime;
uniform float uGrassWidth;
uniform sampler2D uHeightmap;
uniform float uMinHeight;
uniform float uMaxHeight;

attribute vec3 offset;
attribute vec4 color;
attribute vec3 up;
attribute float maxHeight;
attribute vec2 grassUvs;

varying vec2 vUv;
varying vec4 vColor;
varying vec4 vWhatever;

varying vec3 rotatedNormal1;
varying vec3 rotatedNormal2;

varying vec3 crazyNormal;

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

vec3 orthogonal(vec3 v) {
  return normalize(abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0)
  : vec3(0.0, -v.z, v.y));
}

vec3 recalcNormals(vec3 newPos) {
  float offset = 0.01;
  vec3 tangent = orthogonal(normal);
  vec3 bitangent = normalize(cross(normal, tangent));
  vec3 neighbour1 = position + tangent * offset;
  vec3 neighbour2 = position + bitangent * offset;

  vec3 displacedTangent = neighbour1 - newPos;
  vec3 displacedBitangent = neighbour2 - newPos;

  return normalize(cross(displacedTangent, displacedBitangent));
}

vec3 getWorldPosition(vec3 pos) {
  vec4 localPosition = vec4( position, 1.);
  vec4 worldPosition = modelMatrix * localPosition;
  vec4 viewPosition = viewMatrix * worldPosition;
  return viewPosition.xyz;
}

float remap(float value, float originMin, float originMax, float targetMin, float targetMax) {
  return ((value - originMin) * (targetMax - targetMin)) / (originMax - originMin) + targetMin;
}

void main() { 
  vColor = color;

  float yOffsetFromTexture = texture2D( uHeightmap, grassUvs ).r;
  float yOffset = remap(yOffsetFromTexture, 0.0, 1.0, uMinHeight, uMaxHeight);
  float perBladeHash = hash(offset.xy);
  vColor = vec4(vec3(yOffsetFromTexture), 1.0);

  // TODO towards up vector
  float heightPercentTowardsUpVector = position.y / maxHeight;
  float widthPercentage = 1.0 - (abs(position.x) / uGrassWidth);
  float curveAmount = heightPercentTowardsUpVector * perBladeHash;
  mat3 grassMat = rotation3dX(curveAmount);
  vec3 grassVertexPosition = grassMat * vec3(position.xy, 0.0);
  
  float randomAngle = perBladeHash * 2.0 * 3.14159 * uTime * 0.1;
  vec3 newPostion = grassVertexPosition;

  vec3 rotatedPosition = rotateY(newPostion, randomAngle);
  csm_Position = rotatedPosition + offset;
  csm_Position.y += yOffset;
  csm_Normal = recalcNormals(csm_Position);


  // rotatedNormal1 = rotation3dX(PI * 0.3) * csm_Normal;
  // rotatedNormal2 = rotation3dX(PI * -0.3) * csm_Normal;
  // csm_Normal = normalize(
  //   mix(
  //     rotatedNormal1,
  //     rotatedNormal2,
  //     widthPercentage
  //   )
  // );

  
  // projection handled by the material patched further down the line
  //  = projectionMatrix * modelViewMatrix * vec4( rotatedPosition + offset, 1.0 );
}
`

export const frag = /* glsl */ `
precision highp float;
varying vec4 vColor;
varying vec4 vWhatever;

void main() {
  // vNormal
  // normal = normalize(-normal)
  // if (gl_FrontFace) {

  // } 
  csm_DiffuseColor =  vColor * csm_DiffuseColor;
}
`
