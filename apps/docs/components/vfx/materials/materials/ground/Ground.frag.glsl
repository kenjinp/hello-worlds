uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform vec3 uCameraPosition;

uniform float offset;
uniform float contrast;
uniform float brightness;
uniform float uWidth;

varying vec3 vPosition;
uniform sampler2D noiseMap;
// varying vec3 vNormal;

precision highp sampler2DArray;

uniform sampler2DArray uTextures;

in vec4 vTextureSplatIndices;
in vec4 vTextureSplatStrengths;

const float _TRI_SCALE = 5.0;

vec4 _CalculateLighting(
  vec3 lightDirection, vec3 lightColour, vec3 worldSpaceNormal, vec3 viewDirection
) {
  float diffuse = saturate(dot(worldSpaceNormal, lightDirection));
  vec3 H = normalize(lightDirection + viewDirection);
  float NdotH = dot(worldSpaceNormal, H);
  float specular = saturate(pow(NdotH, 8.0));
  return vec4(lightColour * (diffuse + diffuse * specular), 0);
}
vec4 _ComputeLighting(vec3 worldSpaceNormal, vec3 sunDir, vec3 viewDirection) {
  // Hardcoded, whee!
  vec4 lighting;
  
  lighting += _CalculateLighting(
      sunDir, vec3(1.0, 1.0, 1.0), worldSpaceNormal, viewDirection);
  // lighting += _CalculateLighting(
  //     -sunDir, vec3(0.1, 0.1, 0.15), worldSpaceNormal, viewDirection);
  lighting += _CalculateLighting(
      vec3(0, 1, 0), vec3(0.25, 0.25, 0.25), worldSpaceNormal, viewDirection);
  lighting += vec4(0.15, 0.15, 0.15, 0.0);
  
  return lighting;
}

vec4 _triplanar(vec3 pos, vec3 normal, sampler2D tex) {
  vec4 dx = texture2D(tex, vec2(pos.zy / _TRI_SCALE));
  vec4 dy = texture2D(tex, vec2(pos.xz / _TRI_SCALE));
  vec4 dz = texture2D(tex, vec2(pos.xy / _TRI_SCALE));
  vec3 weights = abs(normal.xyz);
  weights = weights / (weights.x + weights.y + weights.z);
  float maxWeight = max(weights.x, max(weights.y, weights.z));

  if (weights.x == maxWeight) {
    weights = vec3(1.0, 0.0, 0.0);
  } else if (weights.y == maxWeight) {
    weights = vec3(0.0, 1.0, 0.0);
  } else {
    weights = vec3(0.0, 0.0, 1.0);
  }
  return dx * weights.x + dy * weights.y + dz * weights.z;
}

float sum( vec3 v ) { return v.x+v.y+v.z; }

// void main() {
//   vec3 worldPosition = (modelMatrix * vec4(vPosition, 1)).xyz;
//   vec3 eyeDirection = normalize(worldPosition - cameraPosition);
//   vec3 sunDir = normalize(vec3(1, 1, -1));
//   float weightIndices[4] = float[4](vWeights1.x, vWeights1.y, vWeights1.z, vWeights1.w);
//   float weightValues[4] = float[4](vWeights2.x, vWeights2.y, vWeights2.z, vWeights2.w);
//   // TRIPLANAR SPLATTING w/ NORMALS & UVS
//   vec3 worldSpaceNormal = (modelMatrix * vec4(vNormal, 0.0)).xyz;
//   vec4 diffuseSamples[4];
//   vec4 normalSamples[4];
//   for (int i = 0; i < 4; ++i) {
    // vec4 d = vec4(0.0);
    // vec4 n = vec4(0.0);
//     if (weightValues[i] > 0.0) {
      // d = _Triplanar_UV(
      //     worldPosition, worldSpaceNormal, weightIndices[i], diffuseMap);
      // n = _TriplanarN_UV(
      //     worldPosition, worldSpaceNormal, weightIndices[i], normalMap);
      // d.w *= weightValues[i];
      // n.w = d.w;
//     }
//     diffuseSamples[i] = d;
//     normalSamples[i] = n;
//   }

// Lifted from https://www.shadertoy.com/view/Xtl3zf
vec4 texture_UV(in sampler2DArray srcTexture, in vec3 x) {
  float k = texture(noiseMap, 0.0025*x.xy).x; // cheap (cache friendly) lookup
  float l = k*8.0;
  float f = fract(l);
  
  float ia = floor(l+0.5); // suslik's method (see comments)
  float ib = floor(l);
  f = min(f, 1.0-f)*2.0;
  vec2 offa = sin(vec2(3.0,7.0)*ia); // can replace with any other hash
  vec2 offb = sin(vec2(3.0,7.0)*ib); // can replace with any other hash
  vec4 cola = texture(srcTexture, vec3(x.xy + offa, x.z));
  vec4 colb = texture(srcTexture, vec3(x.xy + offb, x.z));
  return mix(cola, colb, smoothstep(0.2,0.8,f-0.1*sum(cola.xyz-colb.xyz)));
}


vec4 triplanarNormals(vec3 pos, vec3 normal, sampler2D tex) {
  vec2 uvx = pos.zy;
  vec2 uvy = pos.xz;
  vec2 uvz = pos.xy;
  vec3 tx = texture2D(tex, vec2(uvx / _TRI_SCALE)).xyz * vec3(2,2,2) - vec3(1,1,1);
  vec3 ty = texture2D(tex, vec2(uvy / _TRI_SCALE)).xyz * vec3(2,2,2) - vec3(1,1,1);
  vec3 tz = texture2D(tex, vec2(uvz / _TRI_SCALE)).xyz * vec3(2,2,2) - vec3(1,1,1);
  vec3 weights = abs(normal.xyz);
  weights *= weights;
  weights = weights / (weights.x + weights.y + weights.z);
  vec3 axis = sign(normal);
  vec3 tangentX = normalize(cross(normal, vec3(0.0, axis.x, 0.0)));
  vec3 bitangentX = normalize(cross(tangentX, normal)) * axis.x;
  mat3 tbnX = mat3(tangentX, bitangentX, normal);
  vec3 tangentY = normalize(cross(normal, vec3(0.0, 0.0, axis.y)));
  vec3 bitangentY = normalize(cross(tangentY, normal)) * axis.y;
  mat3 tbnY = mat3(tangentY, bitangentY, normal);
  vec3 tangentZ = normalize(cross(normal, vec3(0.0, -axis.z, 0.0)));
  vec3 bitangentZ = normalize(-cross(tangentZ, normal)) * axis.z;
  mat3 tbnZ = mat3(tangentZ, bitangentZ, normal);
  vec3 worldNormal = normalize(
      clamp(tbnX * tx, -1.0, 1.0) * weights.x +
      clamp(tbnY * ty, -1.0, 1.0) * weights.y +
      clamp(tbnZ * tz, -1.0, 1.0) * weights.z);
  return vec4(worldNormal, 0.0);
}


vec4 _Triplanar_UV(vec3 pos, vec3 normal, float texSlice, sampler2DArray tex) {
  vec4 dx = texture_UV(tex, vec3(pos.zy / _TRI_SCALE, texSlice));
  vec4 dy = texture_UV(tex, vec3(pos.xz / _TRI_SCALE, texSlice));
  vec4 dz = texture_UV(tex, vec3(pos.xy / _TRI_SCALE, texSlice));
  vec3 weights = abs(normal.xyz);
  weights = weights / (weights.x + weights.y + weights.z);
  return dx * weights.x + dy * weights.y + dz * weights.z;
}

vec4 _TerrainBlend_4(vec4 samples[4]) {
  float depth = 0.2;
  float ma = max(
      samples[0].w,
      max(
          samples[1].w,
          max(samples[2].w, samples[3].w))) - depth;
  float b1 = max(samples[0].w - ma, 0.0);
  float b2 = max(samples[1].w - ma, 0.0);
  float b3 = max(samples[2].w - ma, 0.0);
  float b4 = max(samples[3].w - ma, 0.0);
  vec4 numer = (
      samples[0] * b1 + samples[1] * b2 +
      samples[2] * b3 + samples[3] * b4);
  float denom = (b1 + b2 + b3 + b4);
  return numer / denom;
}

void main() {
  vec3 worldPosition = (modelMatrix * vec4(vPosition, 1)).xyz;
  vec3 worldSpaceNormal = (modelMatrix * vec4(vNormal, 0.0)).xyz;
  vec3 eyeDirection = normalize(worldPosition - uCameraPosition);
  vec3 sunDir = normalize(vec3(1, 1, -1));
  // vUv is object UV

  float weightIndices[4] = float[4](vTextureSplatIndices.x, vTextureSplatIndices.y, vTextureSplatIndices.z, vTextureSplatIndices.w);
  float weightValues[4] = float[4](vTextureSplatStrengths.x, vTextureSplatStrengths.y, vTextureSplatStrengths.z, vTextureSplatStrengths.w);
  // TRIPLANAR SPLATTING w/ NORMALS & UVS
  // vec3 worldSpaceNormal = (modelMatrix * vec4(vNormal, 0.0)).xyz;
  vec4 diffuseSamples[4];
  vec4 normalSamples[4];


  // vec4 xsampledDiffuseColor = texture2D( map, vUv); // multiplying by > 1 makes it smaller
  // vec4 xsampledDiffuseColor = texture2D( uTextures[0] , vUv); // multiplying by > 1 makes it smaller
  // vec4 d = vec4(0.0);
  // vec4 n = vec4(0.0);
  //  d = _triplanar(
  //   worldPosition, 
  //   worldSpaceNormal,
  //   uTextures[0]
  // );

  for (int i = 0; i < 4; ++i) {
    vec4 d = vec4(0.0);
    // vec4 n = vec4(0.0);
    if (weightValues[i] > 0.0) {
      d = _Triplanar_UV(
          worldPosition, worldSpaceNormal, weightIndices[i], uTextures);
      d.w *= weightValues[i];
    }
    diffuseSamples[i] = d;
  }

  vec4 diffuseBlended = _TerrainBlend_4(diffuseSamples);
  // n = triplanarNormals(
  //   worldPosition, 
  //   worldSpaceNormal,
  //   normalMap
  // );
  // n.w = d.w;
  
  vec3 diffuse = diffuseBlended.xyz;
  // vec3 diffuse = d.xyz;
  // worldSpaceNormal = normalize(n.xyz);

  
  // Bit of a hack to remove lighting on dark side of planet
  // vec3 planetNormal = normalize(worldPosition);
  // float planetLighting = saturate(dot(planetNormal, sunDir));
  // vec4 lighting = _ComputeLighting(worldSpaceNormal, sunDir, -eyeDirection);
  vec3 finalColour = mix(vec3(1.0, 1.0, 1.0), diffuse.xyz, 0.25) * diffuse;
  // vec3 finalColour = mix(vec3(1.0, 1.0, 1.0), vColor.xyz, 0.25);
  // finalColour *= lighting.xyz * planetLighting;
  
  csm_DiffuseColor = vec4(finalColour, 1.0);
}