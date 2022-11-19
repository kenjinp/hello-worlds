uniform float uWidth;
uniform float uTime;
varying vec3 vPosition;
in vec4 textureSplatIndices;
in vec4 textureSplatStrengths;
out vec4 vTextureSplatIndices;
out vec4 vTextureSplatStrengths;
// varying vec3 vNormal;

void main() {
  vPosition = position;
  // vNormal = normal;
  vTextureSplatIndices = textureSplatIndices;
  vTextureSplatStrengths = textureSplatStrengths;
  csm_Position = position;
}
