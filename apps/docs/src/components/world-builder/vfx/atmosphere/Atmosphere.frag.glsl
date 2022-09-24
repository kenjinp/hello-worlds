void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
  float z = texture2D(tDepth, vUv).x;
  vec3 posWS = _ScreenToWorld(vec3(vUv, z));
  float dist = length(posWS - cameraPosition);
  float height = max(0.0, length(cameraPosition) - planetRadius);
  vec3 cameraDirection = normalize(posWS - cameraPosition);
  vec3 diffuse = texture2D(tDiffuse, vUv).xyz;
  vec3 lightDir = normalize(vec3(1, 1, -1));
  outputColor = inputColor;
}