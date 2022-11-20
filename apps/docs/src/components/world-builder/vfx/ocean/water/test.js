import * as THREE from "three";
import { Water } from "three/examples/jsm/objects/Water";

export default class GerstnerWater {
  water;
  waves;
  texture;

  constructor(gui) {
    const waterGeometry = new THREE.PlaneGeometry(4096, 4096, 256, 256);
    this.texture = new THREE.TextureLoader().load(
      "img/waternormals.jpg",
      function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }
    );

    this.waves = [
      { direction: 0, steepness: 0.15, wavelength: 100 },
      { direction: 30, steepness: 0.15, wavelength: 50 },
      { direction: 60, steepness: 0.15, wavelength: 25 },
    ];

    this.water = new Water(waterGeometry, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: this.texture,
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 8,
      fog: undefined,
    });

    this.water.material.wireframe = false;
    this.water.rotation.x = -Math.PI / 2;
    this.water.material.onBeforeCompile = (shader) => {
      shader.uniforms.offsetX = { value: 0 };
      shader.uniforms.offsetZ = { value: 0 };
      shader.uniforms.waveA = {
        value: [
          Math.sin((this.waves[0].direction * Math.PI) / 180),
          Math.cos((this.waves[0].direction * Math.PI) / 180),
          this.waves[0].steepness,
          this.waves[0].wavelength,
        ],
      };
      shader.uniforms.waveB = {
        value: [
          Math.sin((this.waves[1].direction * Math.PI) / 180),
          Math.cos((this.waves[1].direction * Math.PI) / 180),
          this.waves[1].steepness,
          this.waves[1].wavelength,
        ],
      };
      shader.uniforms.waveC = {
        value: [
          Math.sin((this.waves[2].direction * Math.PI) / 180),
          Math.cos((this.waves[2].direction * Math.PI) / 180),
          this.waves[2].steepness,
          this.waves[2].wavelength,
        ],
      };
      shader.vertexShader = `
                uniform mat4 textureMatrix;
                uniform float time;

                varying vec4 mirrorCoord;
                varying vec4 worldPosition;

                #include <common>
                #include <fog_pars_vertex>
                #include <shadowmap_pars_vertex>
                #include <logdepthbuf_pars_vertex>

                uniform vec4 waveA;
                uniform vec4 waveB;
                uniform vec4 waveC;

                uniform float offsetX;
                uniform float offsetZ;

                vec3 GerstnerWave (vec4 wave, vec3 p) {
                    float steepness = wave.z;
                    float wavelength = wave.w;
                    float k = 2.0 * PI / wavelength;
                    float c = sqrt(9.8 / k);
                    vec2 d = normalize(wave.xy);
                    float f = k * (dot(d, vec2(p.x, p.y)) - c * time);
                    float a = steepness / k;

                    return vec3(
                        d.x * (a * cos(f)),
                        d.y * (a * cos(f)),
                        a * sin(f)
                    );
                }

                void main() {

                    mirrorCoord = modelMatrix * vec4( position, 1.0 );
                    worldPosition = mirrorCoord.xyzw;
                    mirrorCoord = textureMatrix * mirrorCoord;

                    vec3 gridPoint = position.xyz;
                    vec3 tangent = vec3(1, 0, 0);
                    vec3 binormal = vec3(0, 0, 1);
                    vec3 p = gridPoint;
                    gridPoint.x += offsetX;//*2.0;
                    gridPoint.y -= offsetZ;//*2.0;
                    p += GerstnerWave(waveA, gridPoint);
                    p += GerstnerWave(waveB, gridPoint);
                    p += GerstnerWave(waveC, gridPoint);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( p.x, p.y, p.z, 1.0);

                    #include <beginnormal_vertex>
                    #include <defaultnormal_vertex>
                    #include <logdepthbuf_vertex>
                    #include <fog_vertex>
                    #include <shadowmap_vertex>
                }`;

      shader.fragmentShader = `
                uniform sampler2D mirrorSampler;
                uniform float alpha;
                uniform float time;
                uniform float size;
                uniform float distortionScale;
                uniform sampler2D normalSampler;
                uniform vec3 sunColor;
                uniform vec3 sunDirection;
                uniform vec3 eye;
                uniform vec3 waterColor;

                varying vec4 mirrorCoord;
                varying vec4 worldPosition;

                uniform float offsetX;
                uniform float offsetZ;

                vec4 getNoise( vec2 uv ) {
                    vec2 uv0 = ( uv / 103.0 ) + vec2(time / 17.0, time / 29.0);
                    vec2 uv1 = uv / 107.0-vec2( time / -19.0, time / 31.0 );
                    vec2 uv2 = uv / vec2( 8907.0, 9803.0 ) + vec2( time / 101.0, time / 97.0 );
                    vec2 uv3 = uv / vec2( 1091.0, 1027.0 ) - vec2( time / 109.0, time / -113.0 );
                    vec4 noise = texture2D( normalSampler, uv0 ) +
                        texture2D( normalSampler, uv1 ) +
                        texture2D( normalSampler, uv2 ) +
                        texture2D( normalSampler, uv3 );
                    return noise * 0.5 - 1.0;
                }

                void sunLight( const vec3 surfaceNormal, const vec3 eyeDirection, float shiny, float spec, float diffuse, inout vec3 diffuseColor, inout vec3 specularColor ) {
                    vec3 reflection = normalize( reflect( -sunDirection, surfaceNormal ) );
                    float direction = max( 0.0, dot( eyeDirection, reflection ) );
                    specularColor += pow( direction, shiny ) * sunColor * spec;
                    diffuseColor += max( dot( sunDirection, surfaceNormal ), 0.0 ) * sunColor * diffuse;
                }

                #include <common>
                #include <packing>
                #include <bsdfs>
                #include <fog_pars_fragment>
                #include <logdepthbuf_pars_fragment>
                #include <lights_pars_begin>
                #include <shadowmap_pars_fragment>
                #include <shadowmask_pars_fragment>

                void main() {

                    #include <logdepthbuf_fragment>

                    vec4 noise = getNoise( (worldPosition.xz) + vec2(offsetX/12.25,offsetZ/12.25) * size );
                    vec3 surfaceNormal = normalize( noise.xzy * vec3( 1.5, 1.0, 1.5 ) );

                    vec3 diffuseLight = vec3(0.0);
                    vec3 specularLight = vec3(0.0);

                    vec3 worldToEye = eye-worldPosition.xyz;
                    vec3 eyeDirection = normalize( worldToEye );
                    sunLight( surfaceNormal, eyeDirection, 100.0, 2.0, 0.5, diffuseLight, specularLight );

                    float distance = length(worldToEye);

                    vec2 distortion = surfaceNormal.xz * ( 0.001 + 1.0 / distance ) * distortionScale;
                    vec3 reflectionSample = vec3( texture2D( mirrorSampler, mirrorCoord.xy / mirrorCoord.w + distortion ) );

                    float theta = max( dot( eyeDirection, surfaceNormal ), 0.0 );
                    float rf0 = 0.3;
                    float reflectance = rf0 + ( 1.0 - rf0 ) * pow( ( 1.0 - theta ), 5.0 );
                    vec3 scatter = max( 0.0, dot( surfaceNormal, eyeDirection ) ) * waterColor;
                    vec3 albedo = mix( ( sunColor * diffuseLight * 0.3 + scatter ) * getShadowMask(), ( vec3( 0.1 ) + reflectionSample * 0.9 + reflectionSample * specularLight ), reflectance);
                    vec3 outgoingLight = albedo;
                    gl_FragColor = vec4( outgoingLight, alpha );

                    #include <tonemapping_fragment>
                    #include <fog_fragment>
                }`;
      shader.uniforms.size.value = 10.0;
    };

    const waterUniforms = this.water.material.uniforms;

    const folderWater = gui.addFolder("Water");
    folderWater
      .add(waterUniforms.distortionScale, "value", 0, 8, 0.1)
      .name("distortionScale");
    folderWater.add(waterUniforms.size, "value", 0.1, 10, 0.1).name("size");
    folderWater.add(this.water.material, "wireframe");
    //folderWater.open()

    const waveAFolder = gui.addFolder("Wave A");
    waveAFolder
      .add(this.waves[0], "direction", 0, 359)
      .name("Direction")
      .onChange((v) => {
        const x = (v * Math.PI) / 180;
        waterUniforms.waveA.value[0] = Math.sin(x);
        waterUniforms.waveA.value[1] = Math.cos(x);
      });
    waveAFolder
      .add(this.waves[0], "steepness", 0, 1, 0.01)
      .name("Steepness")
      .onChange((v) => {
        waterUniforms.waveA.value[2] = v;
      });
    waveAFolder
      .add(this.waves[0], "wavelength", 1, 100)
      .name("Wavelength")
      .onChange((v) => {
        waterUniforms.waveA.value[3] = v;
      });
    //waveAFolder.open()

    const waveBFolder = gui.addFolder("Wave B");
    waveBFolder
      .add(this.waves[1], "direction", 0, 359)
      .name("Direction")
      .onChange((v) => {
        const x = (v * Math.PI) / 180;
        waterUniforms.waveB.value[0] = Math.sin(x);
        waterUniforms.waveB.value[1] = Math.cos(x);
      });
    waveBFolder
      .add(this.waves[1], "steepness", 0, 1, 0.01)
      .name("Steepness")
      .onChange((v) => {
        waterUniforms.waveB.value[2] = v;
      });
    waveBFolder
      .add(this.waves[1], "wavelength", 1, 100)
      .name("Wavelength")
      .onChange((v) => {
        waterUniforms.waveB.value[3] = v;
      });
    //waveBFolder.open()

    const waveCFolder = gui.addFolder("Wave C");
    waveCFolder
      .add(this.waves[2], "direction", 0, 359)
      .name("Direction")
      .onChange((v) => {
        const x = (v * Math.PI) / 180;
        waterUniforms.waveC.value[0] = Math.sin(x);
        waterUniforms.waveC.value[1] = Math.cos(x);
      });
    waveCFolder
      .add(this.waves[2], "steepness", 0, 1, 0.01)
      .name("Steepness")
      .onChange((v) => {
        waterUniforms.waveC.value[2] = v;
      });
    waveCFolder
      .add(this.waves[2], "wavelength", 1, 100)
      .name("Wavelength")
      .onChange((v) => {
        waterUniforms.waveC.value[3] = v;
      });
    //waveCFolder.open()
  }

  getWaveInfo(offsetX, offsetZ, x, z, time) {
    const pos = new THREE.Vector3();
    const tangent = new THREE.Vector3(1, 0, 0);
    const binormal = new THREE.Vector3(0, 0, 1);
    this.waves.forEach((w) => {
      const k = (Math.PI * 2.0) / w.wavelength;
      const c = Math.sqrt(9.8 / k);
      const d = new THREE.Vector2(
        Math.sin((w.direction * Math.PI) / 180),
        -Math.cos((w.direction * Math.PI) / 180)
      );
      const f = k * (d.dot(new THREE.Vector2(x, z)) - c * time);
      const a = w.steepness / k;

      pos.x += d.x * (a * Math.cos(f));
      pos.y += a * Math.sin(f);
      pos.z += d.y * (a * Math.cos(f));

      tangent.x += -d.x * d.x * (w.steepness * Math.sin(f));
      tangent.y += d.x * (w.steepness * Math.cos(f));
      tangent.z += -d.x * d.y * (w.steepness * Math.sin(f));

      binormal.x += -d.x * d.y * (w.steepness * Math.sin(f));
      binormal.y += d.y * (w.steepness * Math.cos(f));
      binormal.z += -d.y * d.y * (w.steepness * Math.sin(f));
    });

    const normal = binormal.cross(tangent).normalize();
    return { position: pos, normal: normal };
  }

  update(delta) {
    this.water.material.uniforms["time"].value += delta;
  }
}
