import * as THREE from "https://cdn.skypack.dev/three@0.138.0"
import * as MeshBVHLib from "https://unpkg.com/three-mesh-bvh@0.5.10/build/index.module.js"
import { PointerLockControls } from "https://unpkg.com/three@0.138.0/examples/jsm/controls/PointerLockControls.js"
import { MeshSurfaceSampler } from "https://unpkg.com/three@0.138.0/examples/jsm/math/MeshSurfaceSampler.js"
import { EffectComposer } from "https://unpkg.com/three@0.138.0/examples/jsm/postprocessing/EffectComposer.js"
import { ShaderPass } from "https://unpkg.com/three@0.138.0/examples/jsm/postprocessing/ShaderPass.js"
import { SMAAPass } from "https://unpkg.com/three@0.138.0/examples/jsm/postprocessing/SMAAPass.js"
import * as BufferGeometryUtils from "https://unpkg.com/three@0.138.0/examples/jsm/utils/BufferGeometryUtils.js"
import { AssetManager } from "./AssetManager.js"
import { Butterfly } from "./Butterfly.js"
import { CapsuleEntity } from "./CapsuleEntity.js"
import CustomLightShadowFragment from "./CustomLightShadowFragment.js"
import { EffectCompositer } from "./EffectCompositer.js"
import { EffectShader } from "./EffectShader.js"
import { GodRaysShader } from "./GodRays.js"
import { SSAOShader } from "./SSAOShader.js"
import { Stats } from "./stats.js"
async function main() {
  // Setup basic renderer, controls, and profiler
  function nextFrame() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve()
      })
    })
  }
  const loadingElement = document.getElementById("loading")
  const clientWidth = window.innerWidth * 0.99
  const clientHeight = window.innerHeight * 0.98
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(
    75,
    clientWidth / clientHeight,
    0.1,
    1000,
  )
  //camera.position.set(50, 75, 50);
  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(clientWidth, clientHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.VSMShadowMap
  const controls = new PointerLockControls(camera, document.body)
  scene.add(controls.getObject())
  const stats = new Stats()
  stats.showPanel(0)
  // Setup scene
  // Skybox
  const environment = new THREE.CubeTextureLoader().load([
    "skybox/Box_Right.bmp",
    "skybox/Box_Left.bmp",
    "skybox/Box_Top.bmp",
    "skybox/Box_Bottom.bmp",
    "skybox/Box_Front.bmp",
    "skybox/Box_Back.bmp",
  ])
  scene.background = environment
  // Lighting
  const ambientLight = new THREE.AmbientLight(
    new THREE.Color(1.0, 1.0, 1.0),
    0.25,
  )
  scene.add(ambientLight)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.35)
  directionalLight.position.set(300, 200, 100)
  //scene.add(directionalLight);
  // Shadows
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 4096
  directionalLight.shadow.mapSize.height = 4096
  directionalLight.shadow.camera.left = (-256 * 3) / 2
  directionalLight.shadow.camera.right = (256 * 3) / 2
  directionalLight.shadow.camera.top = (256 * 3) / 2
  directionalLight.shadow.camera.bottom = (-256 * 3) / 2
  directionalLight.shadow.camera.near = 0.1
  directionalLight.shadow.camera.far = 1000
  directionalLight.shadow.bias = -0.001
  directionalLight.shadow.blurSamples = 8
  directionalLight.shadow.radius = 4
  scene.add(directionalLight)
  //scene.add(new THREE.CameraHelper(directionalLight.shadow.camera));
  /* const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.15);
     directionalLight2.color.setRGB(1.0, 1.0, 1.0);
     directionalLight2.position.set(-50, 200, -150);
     scene.add(directionalLight2);*/
  // Objects
  /*const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100).applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2)), new THREE.MeshStandardMaterial({ side: THREE.DoubleSide }));
    ground.castShadow = true;
    ground.receiveShadow = true;
    scene.add(ground);
    const box = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, color: new THREE.Color(1.0, 0.0, 0.0) }));
    box.castShadow = true;
    box.receiveShadow = true;
    box.position.y = 5.01;
    scene.add(box);
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(6.25, 32, 32), new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, envMap: environment, metalness: 1.0, roughness: 0.25 }));
    sphere.position.y = 7.5;
    sphere.position.x = 25;
    sphere.position.z = 25;
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    scene.add(sphere);
    const torusKnot = new THREE.Mesh(new THREE.TorusKnotGeometry(5, 1.5, 200, 32), new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, envMap: environment, metalness: 0.5, roughness: 0.5, color: new THREE.Color(0.0, 1.0, 0.0) }));
    torusKnot.position.y = 10;
    torusKnot.position.x = -25;
    torusKnot.position.z = -25;
    torusKnot.castShadow = true;
    torusKnot.receiveShadow = true;
    scene.add(torusKnot);*/
  // Build postprocessing stack
  // Render Targets
  noise.seed(Math.random())
  loadingElement.innerHTML = "Building Terrain..."
  await nextFrame()
  const terrainGeo = new THREE.PlaneGeometry(1024, 1024, 1024, 1024)
  terrainGeo.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2))
  // scene.add(new THREE.Mesh(terrainGeo.clone(), new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, transparent: true, color: new THREE.Color(0.0, 0.5, 1.0), opacity: 0.5 })));
  const heightFalloff = x => (x + 1) * Math.log(x + 1)

  function smax(d1, d2, k) {
    const h = Math.min(Math.max(0.5 - (0.5 * (d2 - d1)) / k, 0.0), 1.0)
    return d2 + (d1 - d2) * h + k * h * (1.0 - h)
  }
  for (let x = 0; x < 1025; x++) {
    for (let z = 0; z < 1025; z++) {
      let amt = 0.0
      let frequency = 0.0025
      let amplitude = 0.5
      for (let i = 0; i < 12; i++) {
        amt +=
          amplitude *
          (0.5 + 0.5 * noise.simplex2(x * frequency + 128, z * frequency + 128))
        amplitude /= 2
        frequency *= 2
      }
      let currHeight =
        amt * 100.0 -
        0.0625 *
          heightFalloff(
            Math.max(Math.hypot(x - 512, z - 512) - (200 + 50 * amt), 0),
          )
      currHeight = smax(currHeight, -25.0 - amt * 15.0, 10.0)
      terrainGeo.attributes.position.setY(1025 * z + x, currHeight)
    }
  }
  terrainGeo.computeVertexNormals()
  const terrainMesh = new THREE.Mesh(
    terrainGeo,
    new THREE.MeshStandardMaterial({ side: THREE.DoubleSide }),
  )
  terrainMesh.castShadow = true
  terrainMesh.receiveShadow = true
  let terrainShader
  const terrainColor = new THREE.TextureLoader().load("terraincolor.png")
  terrainColor.wrapS = THREE.RepeatWrapping
  terrainColor.wrapT = THREE.RepeatWrapping
  terrainMesh.material.onBeforeCompile = shader => {
    shader.uniforms.reflect = { value: false }
    shader.uniforms.cameraPos = { value: camera.position }
    shader.uniforms.diffuseMap = { value: terrainColor }
    shader.uniforms.background = { value: environment }
    terrainShader = shader
    shader.fragmentShader =
      "varying vec3 vWorldPosition;\nuniform samplerCube background;\n" +
      `
        uniform bool reflect;
        uniform vec3 cameraPos;
        uniform sampler2D diffuseMap;
        float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
        vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
        vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}
        
        float noise(vec3 p){
            vec3 a = floor(p);
            vec3 d = p - a;
            d = d * d * (3.0 - 2.0 * d);
        
            vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
            vec4 k1 = perm(b.xyxy);
            vec4 k2 = perm(k1.xyxy + b.zzww);
        
            vec4 c = k2 + a.zzzz;
            vec4 k3 = perm(c);
            vec4 k4 = perm(c + 1.0);
        
            vec4 o1 = fract(k3 * (1.0 / 41.0));
            vec4 o2 = fract(k4 * (1.0 / 41.0));
        
            vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
            vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);
        
            return o4.y * d.y + o4.x * (1.0 - d.y);
        }
    float fbm(vec3 x) {
        float v = 0.0;
        float a = 0.5;
        vec3 shift = vec3(100);
        for (int i = 0; i < 5; ++i) {
            v += a * noise(x);
            x = x * 2.0 + shift;
            a *= 0.5;
        }
        return v;
    }  
        ` +
      shader.fragmentShader
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <normal_fragment_maps>",
        `
        #include <normal_fragment_maps>
        mat4 viewMatrixInv = inverse(viewMatrix);
        if ((reflect && vWorldPosition.y > 0.0)
           ) {
            discard;
        }
        if ((reflect && (viewMatrixInv * vec4(normal, 0.0)).y > 0.0)) {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
            return;
        }
        vec3 position = vWorldPosition;
        if (reflect) {
            position.y *= -1.0;
        }
        float fbmVal = fbm(position * 0.25);
        float verticalness = 1.0 - pow(max(dot((viewMatrixInv * vec4(normal, 0.0)).xyz, vec3(0.0, reflect ? -1.0 : 1.0, 0.0)), 0.0), 3.0 + fbmVal);
        vec3 terrainColor = mix(vec3(126.0 / 255.0, 200.0 / 255.0, 80.0 / 255.0), vec3(155.0 / 255.0, 118.0 / 255.0, 83.0 / 255.0), verticalness);
        diffuseColor = vec4(mix(terrainColor, vec3(246.0 / 255.0, 228.0 / 255.0, 173.0 / 255.0), smoothstep(0.0, 1.0, clamp(-(position.y - 15.0 - 5.0 * fbmVal) * 0.1, 0.0, 1.0))), 1.0);
        diffuseColor.rgb *= (0.65 + 0.35 * fbmVal);
        vec2 yUv = vWorldPosition.xz * 0.01;
        vec2 xUv = vWorldPosition.zy * 0.01;
        vec2 zUv = vWorldPosition.xy * 0.01;
        vec3 yDiff = texture2D(diffuseMap, yUv).xyz;
        vec3 xDiff = texture2D(diffuseMap, xUv).xyz;
        vec3 zDiff = texture2D(diffuseMap, zUv).xyz;
        vec3 blendWeights = abs((viewMatrixInv * vec4(vNormal, 0.0)).xyz);
        blendWeights = blendWeights / (blendWeights.x + blendWeights.y + blendWeights.z);
        diffuseColor *= 0.25 + 0.75 * vec4((xDiff * blendWeights.x + yDiff * blendWeights.y + zDiff * blendWeights.z), 1.0);
        `,
      )
      .replace(
        "#include <dithering_fragment>",
        `
                #include <dithering_fragment>
                vec3 vDir = normalize(vWorldPosition - cameraPos);
                gl_FragColor = mix(gl_FragColor, textureCube(background, vDir), cameraPos.y < 0.0 ? 0.0 : clamp(-0.1 * vWorldPosition.y, 0.0, 1.0));
                `,
      )
    shader.vertexShader = shader.vertexShader
      .replace("#ifdef USE_TRANSMISSION", "")
      .replace("#ifdef USE_TRANSMISSION", "")
    shader.vertexShader = shader.vertexShader
      .replace("#endif", "")
      .replace("#endif", "")
    shader.vertexShader = shader.vertexShader.replace(
      "#include <worldpos_vertex>",
      `
        vec4 worldPosition = vec4( transformed, 1.0 );
        #ifdef USE_INSTANCING
            worldPosition = instanceMatrix * worldPosition;
        #endif
        worldPosition = modelMatrix * worldPosition;    
        `,
    )
  }
  scene.add(terrainMesh)
  const grassSampler = new MeshSurfaceSampler(terrainMesh).build()
  const grassGeo = BufferGeometryUtils.mergeBufferGeometries([
    new THREE.PlaneGeometry(10, 10).applyMatrix4(
      new THREE.Matrix4().makeRotationY(Math.PI / 4),
    ),
    new THREE.PlaneGeometry(10, 10).applyMatrix4(
      new THREE.Matrix4().makeRotationY(-Math.PI / 4),
    ),
    new THREE.PlaneGeometry(10, 10),
  ])
  grassGeo.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 5, 0))
  grassGeo.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2))
  //console.log(grassGeo.attributes.position);
  /*for (let i = 0; i < grassGeo.attributes.normal.count; i++) {
        grassGeo.attributes.normal.setX(i, 0);
        grassGeo.attributes.normal.setY(i, 1);
        grassGeo.attributes.normal.setZ(i, 0);
    }*/
  loadingElement.innerHTML = "Placing Grass & Flora..."
  await nextFrame()
  const instancedMesh = new THREE.InstancedMesh(
    grassGeo,
    new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      color: new THREE.Color(0.4, 0.4, 0.2),
      map: new THREE.TextureLoader().load("grassalbido.jpeg"),
      alphaMap: new THREE.TextureLoader().load("grassalpha.jpg"),
      alphaTest: 0.5,
    }),
    100000,
  )
  let grassShader
  instancedMesh.material.onBeforeCompile = shader => {
    shader.uniforms.time = { value: 0.0 }
    shader.uniforms.shadowTex = { value: null }
    shader.uniforms.lightViewMat = {
      value: directionalLight.shadow.camera.matrixWorldInverse,
    }
    shader.uniforms.lightProjMat = {
      value: directionalLight.shadow.camera.projectionMatrix,
    }
    setTimeout(() => {
      shader.uniforms.shadowTex = { value: directionalLight.shadow.map.texture }
    })
    shader.uniforms.cameraPos = { value: camera.position }
    grassShader = shader
    shader.vertexShader = /*glsl*/ `
        varying vec2 vUv;
        varying vec3 vColor;
        varying vec3 vWorldPosition;
        attribute vec3 grassNormal;
        attribute float offset;
        uniform float time;
        uniform vec3 cameraPos;
        mat3 GetTangentSpace(vec3 normal)
        {
            // Choose a helper vector for the cross product
            vec3 helper = vec3(1.0, 0.0, 0.0);
            if (abs(normal.x) > 0.99)
                helper = vec3(0.0, 0.0, 1.0);
            // Generate vectors
            vec3 tangent = normalize(cross(normal, helper));
            vec3 binormal = normalize(cross(normal, tangent));
            return mat3(tangent, binormal, normal);
        }
        void main() {
            vec3 transformed = position;
            vec3 origin = (instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
            //if (transformed.y > 5.0) {
                //transformed.x += 10.0 * sin(time);
            //}
            bool top = false;
            if (transformed.z < -9.0) {
                top = true;
                transformed.x += 2.0 * sin(time + 0.025 * origin.z + offset);
                transformed.z += 2.0 * cos(time + 0.025 * origin.x + offset);
            }
            vec3 worldPos = (instanceMatrix * vec4(transformed, 1.0)).xyz;
            vec3 contactPos = cameraPos;
            contactPos.y -= 15.0;
            vec3 awayFromCamera = normalize(worldPos - contactPos);
            awayFromCamera.x *= -1.0;
            awayFromCamera.z *= -1.0;
            //if (transformed.z < -9.0) {
            if (top) {
           // worldPos -= awayFromCamera * 0.25 * max(20.0 - distance(worldPos, contactPos), 0.0);
           //worldPos.y -= 0.75 * max(20.0 - distance(worldPos, contactPos), 0.0);
           worldPos -= awayFromCamera * max(20.0 - distance(worldPos.xz, contactPos.xz), 0.0) * max(100.0 - abs(worldPos.y - contactPos.y) * abs(worldPos.y - contactPos.y), 0.0) / 100.0;
           }
            //}
            gl_Position = projectionMatrix * viewMatrix * vec4(worldPos, 1.0);
            vUv = uv;
            vColor = instanceColor;
            vWorldPosition = worldPos;
        }
        `
    shader.fragmentShader = `
        uniform vec3 diffuse;
        uniform float opacity;
        uniform sampler2D shadowTex;
        uniform mat4 lightViewMat;
        uniform mat4 lightProjMat;
        varying vec3 vWorldPosition;
        #ifndef FLAT_SHADED
            varying vec3 vNormal;
        #endif
        #include <common>
        #include <dithering_pars_fragment>
        #include <color_pars_fragment>
        #include <uv_pars_fragment>
        #include <uv2_pars_fragment>
        #include <map_pars_fragment>
        #include <alphamap_pars_fragment>
        #include <alphatest_pars_fragment>
        #include <aomap_pars_fragment>
        #include <lightmap_pars_fragment>
        #include <envmap_common_pars_fragment>
        #include <envmap_pars_fragment>
        #include <cube_uv_reflection_fragment>
        #include <fog_pars_fragment>
        #include <specularmap_pars_fragment>
        #include <logdepthbuf_pars_fragment>
        #include <clipping_planes_pars_fragment>
        vec2 unpackRGBATo2Half( vec4 v ) {
            return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
        }
        vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
            return unpackRGBATo2Half( texture2D( shadow, uv ) );
        }
        float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
            float occlusion = 1.0;
            vec2 distribution = texture2DDistribution( shadow, uv );
            float hard_shadow = step( compare , distribution.x ); // Hard Shadow
            if (hard_shadow != 1.0 ) {
                float distance = compare - distribution.x ;
                float variance = max( 0.00000, distribution.y * distribution.y );
                float softness_probability = variance / (variance + distance * distance ); // Chebeyshevs inequality
                softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 ); // 0.3 reduces light bleed
                occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
            }
            return occlusion;
        }    
        void main() {
            #include <clipping_planes_fragment>
            vec4 diffuseColor = vec4( diffuse, opacity );
            #include <logdepthbuf_fragment>
            #include <map_fragment>
            #include <color_fragment>
            #include <alphamap_fragment>
            #include <alphatest_fragment>
            #include <specularmap_fragment>
            ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
            // accumulation (baked indirect lighting only)
            #ifdef USE_LIGHTMAP
                vec4 lightMapTexel = texture2D( lightMap, vUv2 );
                reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
            #else
                vec4 projCoords = lightProjMat * lightViewMat * vec4(vWorldPosition, 1.0);
                projCoords.xyz /= projCoords.w;
                projCoords.xyz = projCoords.xyz * 0.5 + 0.5;
                float s = 1.0;
                if (projCoords.x > 0.0 && projCoords.x < 1.0 && projCoords.y > 0.0 && projCoords.y < 1.0 && projCoords.z > 0.0 && projCoords.z < 1.0) {
                    s = (0.5 + 0.5 * VSMShadow(shadowTex, projCoords.xy, projCoords.z));
                }
                reflectedLight.indirectDiffuse += vec3( 1.0 ) * s;
            #endif
            // modulation
            #include <aomap_fragment>
            reflectedLight.indirectDiffuse *= diffuseColor.rgb;
            vec3 outgoingLight = reflectedLight.indirectDiffuse;
            #include <envmap_fragment>
            #include <output_fragment>
            #include <tonemapping_fragment>
            #include <encodings_fragment>
            #include <fog_fragment>
            #include <premultiplied_alpha_fragment>
            #include <dithering_fragment>
        }
        `
  }
  let dummy = new THREE.Object3D()
  let normal = new THREE.Vector3()
  const up = new THREE.Vector3(0, -1, 0)
  const normalAttribute = []
  const offsetAttribute = []
  for (let i = 0; i < 100000; i++) {
    grassSampler.sample(dummy.position, normal)
    // console.log(i);
    // console.log(normal.clone().dot(up));
    if (
      Math.random() > Math.pow(normal.clone().dot(up), 10.0) ||
      Math.random() > dummy.position.y * 0.1
    ) {
      i--
      continue
    }
    let target = dummy.position.clone().add(normal)
    const normalArr = [...normal.clone()]
    normalArr[1] *= -1
    normalAttribute.push(...normalArr)
    dummy.lookAt(target.x, target.y, target.z)
    dummy.scale.set(
      0.75 + Math.random() * 0.5,
      0.75 + Math.random() * 0.5,
      0.75 + Math.random() * 0.5,
    )
    dummy.updateMatrix()
    let noiseSamplePos = target.clone().multiplyScalar(0.01)
    const color = new THREE.Vector3(1, 1, 1)
    let mag = 0.25
    for (let i = 0; i < 12; i++) {
      color.add(
        new THREE.Vector3(
          noise.simplex3(noiseSamplePos.x, noiseSamplePos.y, noiseSamplePos.z),
          noise.simplex3(
            noiseSamplePos.x + 256,
            noiseSamplePos.y + 256,
            noiseSamplePos.z + 256,
          ),
          noise.simplex3(
            noiseSamplePos.x + 512,
            noiseSamplePos.y + 512,
            noiseSamplePos.z + 512,
          ),
        ).multiplyScalar(mag),
      )
      noiseSamplePos.multiplyScalar(2)
      mag /= 2
    }
    instancedMesh.setColorAt(i, new THREE.Color(color.x, color.y, color.z))
    instancedMesh.setMatrixAt(i, dummy.matrix.clone())
    offsetAttribute.push(Math.random() * Math.PI * 2)
  }
  instancedMesh.geometry.setAttribute(
    "grassNormal",
    new THREE.InstancedBufferAttribute(new Float32Array(normalAttribute), 3),
  )
  instancedMesh.geometry.setAttribute(
    "offset",
    new THREE.InstancedBufferAttribute(new Float32Array(offsetAttribute), 1),
  )
  scene.add(instancedMesh)
  const stems = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.1, 0.2, 8, 8),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.5, 1, 0.0),
      map: new THREE.TextureLoader().load("terraincolor.png"),
    }),
    1000,
  )
  stems.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 4, 0))
  stems.geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2))
  stems.material.onBeforeCompile = shader => {
    tickers.push(shader)
    shader.uniforms.time = { value: 0.0 }
    shader.vertexShader =
      `     
        uniform float time;   
        attribute float offset;
        mat4 rotationMatrix(vec3 axis, float angle)
        {
            axis = normalize(axis);
            float s = sin(angle);
            float c = cos(angle);
            float oc = 1.0 - c;
            
            return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                        oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                        oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                        0.0,                                0.0,                                0.0,                                1.0);
        }\n` + shader.vertexShader
    shader.vertexShader = shader.vertexShader.replace(
      "#include <project_vertex>",
      /*glsl*/ `
            mat4 sway =  rotationMatrix(vec3(1.0, 0.0, 0.0), 0.1 * sin(time + offset));
            mat4 sway2 =  rotationMatrix(vec3(0.0, 1.0, 0.0), 0.1 * cos(time + offset));
            gl_Position = projectionMatrix * viewMatrix * instanceMatrix * sway * sway2 * vec4(transformed, 1.0);
            vec4 mvPosition = viewMatrix * instanceMatrix * sway * sway2 * vec4(transformed, 1.0);
        `,
    )
  }
  const flowers = new THREE.InstancedMesh(
    new THREE.PlaneGeometry(4, 4),
    new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      map: new THREE.TextureLoader().load("dandelion.png"),
      transparent: true,
      alphaTest: 0.125,
    }),
    1000,
  )
  flowers.renderOrder = 999999
  flowers.geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2))
  flowers.material.onBeforeCompile = shader => {
    tickers.push(shader)
    shader.uniforms.time = { value: 0.0 }
    shader.vertexShader =
      `     
        uniform float time;   
        attribute float offset;
        mat4 rotationMatrix(vec3 axis, float angle)
        {
            axis = normalize(axis);
            float s = sin(angle);
            float c = cos(angle);
            float oc = 1.0 - c;
            
            return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                        oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                        oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                        0.0,                                0.0,                                0.0,                                1.0);
        }\n` + shader.vertexShader
    shader.vertexShader = shader.vertexShader.replace(
      "#include <project_vertex>",
      /*glsl*/ `
        /*vec4 mvPosition = vec4( transformed, 1.0 );
        #ifdef USE_INSTANCING
	        mvPosition = instanceMatrix * mvPosition;
        #endif
        vec3 camera_Up = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
        vec3 camera_Right = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
        mvPosition = vec4(mvPosition.xyz + camera_Up * );
        mvPosition = modelViewMatrix * mvPosition;
        gl_Position = projectionMatrix * mvPosition;*/
        mat4 sway =  rotationMatrix(vec3(1.0, 0.0, 0.0), 0.1 * sin(time + offset));
        mat4 sway2 =  rotationMatrix(vec3(0.0, 1.0, 0.0), 0.1 * cos(time + offset));
        vec3 origin = (instanceMatrix * sway * sway2 * vec4(0.0, 0.0, -9.5, 1.0)).xyz;
        vec3 camera_Up = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
        vec3 camera_Right = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
        vec3 p = vec3(origin + camera_Up * transformed.x * (1.0) + camera_Right * transformed.z * (1.0));
        gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
        `,
    )
  }
  dummy = new THREE.Object3D()
  normal = new THREE.Vector3()
  const flowerOffsets = []
  const flowerBoxes = []
  stems.castShadow = true
  stems.receiveShadow = true
  scene.add(stems)
  scene.add(flowers)
  const bigFlower = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.2, 8, 8),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.5, 1, 0.0),
      map: new THREE.TextureLoader().load("terraincolor.png"),
    }),
  )
  bigFlower.position.z = -7
  bigFlower.position.x = 4
  bigFlower.position.y = -3
  const coreTex = new THREE.TextureLoader().load("dandelionsmall.png")
  coreTex.wrapS = THREE.RepeatWrapping
  coreTex.wrapT = THREE.RepeatWrapping
  coreTex.repeat.set(2, 1)
  const bigFlowerCore = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 16, 16),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(1, 1, 1),
      map: coreTex,
    }),
  )
  bigFlowerCore.position.y = 4
  bigFlowerCore.rotation.y = -Math.PI - Math.PI / 5 + 0.1
  bigFlower.add(bigFlowerCore)
  const spores = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.005, 0.005, 1, 8),
    new THREE.MeshStandardMaterial({ transparent: true, opacity: 0.5 }),
    1000,
  )
  spores.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0.5, 0))
  spores.geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2))
  const sporeFlowers = new THREE.InstancedMesh(
    new THREE.PlaneGeometry(0.25, 0.25),
    new THREE.MeshBasicMaterial({
      side: THREE.FrontSide,
      transparent: true,
      map: new THREE.TextureLoader().load("dandelionspore.png"),
      alphaTest: 0.125,
    }),
    1000,
  )
  const spores2 = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.005, 0.005, 1, 8),
    new THREE.MeshStandardMaterial({ transparent: true, opacity: 0.5 }),
    1000,
  )
  spores2.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0.5, 0))
  spores2.geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2))
  const sporeFlowers2 = new THREE.InstancedMesh(
    new THREE.PlaneGeometry(0.25, 0.25),
    new THREE.MeshBasicMaterial({
      side: THREE.FrontSide,
      transparent: true,
      map: new THREE.TextureLoader().load("dandelionspore.png"),
      alphaTest: 0.125,
    }),
    1000,
  )
  scene.add(spores2)
  scene.add(sporeFlowers2)
  //sporeFlowers.geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2));
  sporeFlowers.geometry.applyMatrix4(
    new THREE.Matrix4().makeTranslation(0, 0.0, 1.0),
  )
  sporeFlowers2.geometry.applyMatrix4(
    new THREE.Matrix4().makeTranslation(0, 0.0, 1.0),
  )
  dummy = new THREE.Object3D()
  for (let i = 0; i < 1000; i++) {
    const direction = new THREE.Vector3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5,
    )
    direction.normalize()
    //dummy.position.copy(direction.clone().multiplyScalar(0.5));
    dummy.lookAt(direction.x, direction.y, direction.z)
    dummy.updateMatrix()
    spores.setMatrixAt(i, dummy.matrix)
    sporeFlowers.setMatrixAt(i, dummy.matrix)
  }
  spores.renderOrder = 10000
  sporeFlowers.renderOrder = 10000
  spores2.renderOrder = 10000
  sporeFlowers2.renderOrder = 10000
  bigFlowerCore.add(spores)
  bigFlowerCore.add(sporeFlowers)
  bigFlowerCore.scale.set(1.5, 1.5, 1.5)
  //bigFlower.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 4, 0));
  //bigFlower.geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
  camera.add(bigFlower)
  bigFlower.visible = true
  const reflectScene = new THREE.Scene()
  const ambientLight2 = new THREE.AmbientLight(
    new THREE.Color(1.0, 1.0, 1.0),
    0.25,
  )
  reflectScene.add(ambientLight2)
  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.35)
  directionalLight2.position.set(150, -100, 50)
  reflectScene.add(directionalLight2)
  const reflectTerrain = new THREE.Mesh(
    terrainMesh.geometry,
    terrainMesh.material,
  )
  reflectTerrain.scale.y = -1
  reflectScene.add(reflectTerrain)
  const defaultTexture = new THREE.WebGLRenderTarget(
    clientWidth,
    clientHeight,
    {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.NearestFilter,
    },
  )
  defaultTexture.depthTexture = new THREE.DepthTexture(
    clientWidth,
    clientHeight,
    THREE.FloatType,
  )
  const reflectTexture = new THREE.WebGLRenderTarget(
    clientWidth,
    clientHeight,
    {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.NearestFilter,
    },
  )
  reflectTexture.depthTexture = new THREE.DepthTexture(
    clientWidth,
    clientHeight,
    THREE.FloatType,
  )
  // Post Effects
  const composer = new EffectComposer(renderer)
  const smaaPass = new SMAAPass(clientWidth, clientHeight)
  const effectPass = new ShaderPass(EffectShader)
  const ssaoPass = new ShaderPass(SSAOShader)
  const effectCompositer = new ShaderPass(EffectCompositer)
  const godRayPass = new ShaderPass(GodRaysShader)
  //composer.addPass(effectPass);
  composer.addPass(ssaoPass)
  composer.addPass(effectCompositer)
  composer.addPass(godRayPass)
  composer.addPass(effectPass)
  composer.addPass(smaaPass)
  const makeTBN = normal => {
    let helper = new THREE.Vector3(1, 0, 0)
    if (Math.abs(normal.x) > 0.99) {
      helper = new THREE.Vector3(0, 0, 1)
    }
    const tangent = normal.clone().cross(helper).normalize()
    const binormal = normal.clone().cross(tangent).normalize()
    const mat = new THREE.Matrix4()
    mat.makeBasis(tangent, binormal, normal)
    return mat
  }
  const waterNormalMap = new THREE.TextureLoader().load("waternormal.jpeg")
  const waterNormalMap2 = new THREE.TextureLoader().load("waternormal2.png")
  waterNormalMap.wrapS = THREE.RepeatWrapping
  waterNormalMap.wrapT = THREE.RepeatWrapping
  waterNormalMap2.wrapS = THREE.RepeatWrapping
  waterNormalMap2.wrapT = THREE.RepeatWrapping
  /*const bottomSize = 10;
    const topSize = 5;
    const direction = new THREE.Vector3(0, 1, 0);
    const height = 75;
    const cylinderGeo = new THREE.CylinderGeometry(topSize, bottomSize, height, 32);
    cylinderGeo.applyMatrix4(new THREE.Matrix4().makeTranslation(0, height / 2, 0));
    cylinderGeo.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2));
    cylinderGeo.applyMatrix4(makeTBN(direction));
    scene.add(new THREE.Mesh(cylinderGeo, new THREE.MeshStandardMaterial({ color: new THREE.Color(1.0, 0.5, 0.25) })));*/
  const makeTree = (
    geometries,
    position,
    bottomSize,
    topSize,
    direction,
    height,
    tier = 0,
  ) => {
    //console.log(position);
    const cylinderGeo = new THREE.CylinderGeometry(
      topSize,
      bottomSize,
      height,
      Math.max(32 / Math.pow(2, tier), 4),
    )
    cylinderGeo.applyMatrix4(
      new THREE.Matrix4().makeTranslation(0, height / 2, 0),
    )
    cylinderGeo.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2))
    cylinderGeo.applyMatrix4(makeTBN(direction))
    cylinderGeo.applyMatrix4(
      new THREE.Matrix4().makeTranslation(position.x, position.y, position.z),
    )
    cylinderGeo.setAttribute(
      "leafiness",
      new THREE.BufferAttribute(
        new Float32Array(
          Array(cylinderGeo.attributes.position.count).fill(
            Math.max(tier - 1, 0),
          ),
        ),
        1,
      ),
    )
    geometries.push(cylinderGeo)
    if (topSize > 0.1) {
      const branchAmount = Math.random() < 0.5 ? 3 : 2
      const directions = []
      for (let i = 0; i < branchAmount; i++) {
        let dir
        for (let i = 0; i < 100; i++) {
          dir = direction
            .clone()
            .add(
              new THREE.Vector3(
                Math.random() - 0.5,
                Math.random() - 0.5,
                Math.random() - 0.5,
              ),
            )
            .normalize()
          let moveAlong = false
          for (let j = 0; j < directions.length; j++) {
            if (directions[j].dot(dir) > 0.75) {
              moveAlong = true
            }
          }
          if (!moveAlong) {
            break
          }
        }
        directions.push(dir)
      }
      const joint = new THREE.SphereGeometry(
        topSize,
        Math.max(32 / Math.pow(2, tier), 4),
        Math.max(32 / Math.pow(2, tier), 4),
      )
      joint.setAttribute(
        "leafiness",
        new THREE.BufferAttribute(
          new Float32Array(Array(joint.attributes.position.count).fill(0)),
          1,
        ),
      )
      const newPosition = position
        .clone()
        .add(direction.clone().multiplyScalar(height))
      joint.applyMatrix4(
        new THREE.Matrix4().makeTranslation(
          newPosition.x,
          newPosition.y,
          newPosition.z,
        ),
      )
      geometries.push(joint)
      for (let i = 0; i < directions.length; i++) {
        makeTree(
          geometries,
          newPosition,
          topSize,
          topSize / (1.875 + Math.random() * 0.25),
          directions[i],
          height * (0.625 + 0.25 * Math.random()),
          tier + 1,
        )
      }
      //makeTree(geometries, position.clone().add(direction.clone().multiplyScalar(height)), topSize, topSize / 2, direction.clone().add(new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(1.0)).normalize(), height * 0.75);
    }
    return geometries
  }
  const leafAlpha = new THREE.TextureLoader().load("leafalpha.png")
  const leafColor = new THREE.TextureLoader().load("leafcolor.jpeg")
  const leafNormal = new THREE.TextureLoader().load("leafnormal2.png")
  const barkMap = new THREE.TextureLoader().load("barkmap.jpeg")
  const barkColor = new THREE.TextureLoader().load("barkcolor.jpeg")
  loadingElement.innerHTML = "Growing Trees..."
  await nextFrame()
  let tickers = []
  let treePositions = []
  let trees = []
  for (let i = 0; i < 100; i++) {
    if (i % 10 === 0) {
      loadingElement.innerHTML = `Growing Trees ${i}/100...`
      await nextFrame()
    }
    const extraHeight = Math.random()
    const width = 10 * (0.75 + 0.5 * Math.random()) + 5 * extraHeight
    const treeParts = makeTree(
      [],
      new THREE.Vector3(0, 0, 0),
      width,
      width / (1.875 + Math.random() * 0.25),
      new THREE.Vector3(0, 1, 0),
      32 * (0.75 + 0.5 * Math.random()) + 32 * extraHeight,
    )
    const treeMesh = new THREE.Mesh(
      BufferGeometryUtils.mergeBufferGeometries(treeParts),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(
          (144 / 255) * (0.75 + 0.5 * Math.random()),
          (92 / 255) * (0.75 + 0.5 * Math.random()),
          (66 / 255) * (0.75 + 0.5 * Math.random()),
        ),
        normalMap: barkMap,
        map: barkColor,
      }),
    )
    treeMesh.material.onBeforeCompile = shader => {
      shader.uniforms.shadowTex = { value: null }
      shader.uniforms.lightViewMat = {
        value: directionalLight.shadow.camera.matrixWorldInverse,
      }
      shader.uniforms.lightProjMat = {
        value: directionalLight.shadow.camera.projectionMatrix,
      }
      setTimeout(() => {
        shader.uniforms.shadowTex = {
          value: directionalLight.shadow.map.texture,
        }
      })
      shader.vertexShader = shader.vertexShader
        .replace("#ifdef USE_TRANSMISSION", "")
        .replace("#ifdef USE_TRANSMISSION", "")
      shader.vertexShader = shader.vertexShader
        .replace("#endif", "")
        .replace("#endif", "")
      shader.vertexShader = shader.vertexShader.replace(
        "#include <worldpos_vertex>",
        `
            vec4 worldPosition = vec4( transformed, 1.0 );
            #ifdef USE_INSTANCING
                worldPosition = instanceMatrix * worldPosition;
            #endif
            worldPosition = modelMatrix * worldPosition;    
            `,
      )
      shader.fragmentShader =
        "varying vec3 vWorldPosition;\nuniform mat4 lightViewMat;\nuniform mat4 lightProjMat;\nuniform sampler2D shadowTex;\n" +
        shader.fragmentShader
          .replace(
            "#include <map_fragment>",
            `
            #include <map_fragment>
            vec4 projCoords = lightProjMat * lightViewMat * vec4(vWorldPosition, 1.0);
            projCoords.xyz /= projCoords.w;
            projCoords.xyz = projCoords.xyz * 0.5 + 0.5;
            float s = 1.0;
            if (projCoords.x > 0.0 && projCoords.x < 1.0 && projCoords.y > 0.0 && projCoords.y < 1.0 && projCoords.z > 0.0 && projCoords.z < 1.0) {
                s = (VSMShadow(shadowTex, projCoords.xy, projCoords.z - 0.001));
            }
            `,
          )
          .replace(
            `#include <lights_fragment_begin>`,
            CustomLightShadowFragment,
          )
    }
    treeMesh.geometry.computeBoundingBox()
    /* treeMesh.position.x = Math.floor(i / 10) * 102.4 - 512;
         treeMesh.position.z = (i % 10) * 102.4 - 512;*/
    treeMesh.scale.set(0.5, 0.5, 0.5)
    let surfaceDir = new THREE.Vector3()
    let targetDir = new THREE.Vector3(0, -1, 0)
    while (
      treeMesh.position.y < 10 ||
      surfaceDir.dot(targetDir) < 0.95 ||
      treePositions.some(
        position =>
          Math.hypot(
            position.x - treeMesh.position.x,
            position.z - treeMesh.position.z,
          ) < 10,
      )
    ) {
      grassSampler.sample(treeMesh.position, surfaceDir)
    }
    // treeMesh.rotateX(Math.PI / 2);
    treeMesh.lookAt(treeMesh.position.clone().sub(surfaceDir))
    treeMesh.rotateX(Math.PI / 2)
    treeMesh.castShadow = true
    treeMesh.receiveShadow = true
    scene.add(treeMesh)
    const leavesMesh = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(10, 30),
      new THREE.MeshStandardMaterial({
        side: THREE.DoubleSide,
        color: new THREE.Color(
          Math.random(),
          2.5 + 1.0 * Math.random(),
          Math.random(),
        ),
        alphaMap: leafAlpha,
        map: leafColor,
        normalMap: leafNormal,
        alphaTest: 0.5,
      }),
      1000 + 1000 * extraHeight,
    )
    let currLeavesShader
    const leafCenter = new THREE.Vector3()
    leavesMesh.material.onBeforeCompile = shader => {
      currLeavesShader = shader
      tickers.push(shader)
      shader.uniforms.time = { value: 0 }
      shader.uniforms.leafCenter = { value: leafCenter }
      shader.uniforms.cameraPos = { value: camera.position }
      shader.vertexShader = /*glsl*/ `
            #define STANDARD
varying vec3 vViewPosition;
	varying vec3 vWorldPosition;
uniform float time;
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
    vec3 origin = (instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    if (transformed.z < -1.0) {
        transformed.x += 2.0 * sin(time + 0.025 * origin.z);
        transformed.y += 2.0 * cos(time + 0.025 * origin.x);
    }
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
	vWorldPosition = worldPosition.xyz;
}
            `
      shader.fragmentShader =
        "uniform vec3 leafCenter;\nvarying vec3 vWorldPosition;\nuniform vec3 cameraPos;\n" +
        shader.fragmentShader.replace(
          "#include <normal_fragment_maps>",
          /*glsl*/ `
            #include <normal_fragment_maps>
            mat4 viewMatrixInv = inverse(viewMatrix);
            //vec3 fromCenter = normalize(vWorldPosition - leafCenter);
            vec3 scatteringHalf = normalize(normalize(vec3(300.0, 200.0, 100.0)) + 0.25 * fromCenter);
            float scatteringDot = pow(clamp(dot(normalize(cameraPos - vWorldPosition), -scatteringHalf), 0.0, 1.0), 8.0);
            //gl_FragColor = vec4(vec3(scatteringDot), 1.0);
            //return;
            totalEmissiveRadiance += scatteringDot * vec3(0.07, 0.76, 0.1);
            //totalEmissiveRadiance += 0.5 * (max(dot(fromCenter, normalize(vec3(300.0, 200.0, 100.0))), 0.0)) * vec3(0.07, 0.76, 0.1);
            `,
        )
      shader.uniforms.shadowTex = { value: null }
      shader.uniforms.lightViewMat = {
        value: directionalLight.shadow.camera.matrixWorldInverse,
      }
      shader.uniforms.lightProjMat = {
        value: directionalLight.shadow.camera.projectionMatrix,
      }
      setTimeout(() => {
        shader.uniforms.shadowTex = {
          value: directionalLight.shadow.map.texture,
        }
      })
      shader.fragmentShader =
        "uniform mat4 lightViewMat;\nuniform mat4 lightProjMat;\nuniform sampler2D shadowTex;\n" +
        shader.fragmentShader
          .replace(
            "#include <map_fragment>",
            `
            #include <map_fragment>
            vec3 fromCenter = normalize(vWorldPosition - leafCenter);
            vec4 projCoords = lightProjMat * lightViewMat * vec4(vWorldPosition, 1.0);
            projCoords.xyz /= projCoords.w;
            projCoords.xyz = projCoords.xyz * 0.5 + 0.5;
            float s = 1.0;
            if (projCoords.x > 0.0 && projCoords.x < 1.0 && projCoords.y > 0.0 && projCoords.y < 1.0 && projCoords.z > 0.0 && projCoords.z < 1.0) {
                s = max(dot(fromCenter, normalize(vec3(300.0, 200.0, 100.0))), 0.0);
            }
            `,
          )
          .replace(
            `#include <lights_fragment_begin>`,
            CustomLightShadowFragment,
          )
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <normal_fragment_begin>",
        `
            float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
            vec3 normal = normalize(vWorldPosition - leafCenter);
            vec3 geometryNormal = normal;
            `,
      )
    }
    leavesMesh.geometry.applyMatrix4(
      new THREE.Matrix4().makeTranslation(0, 15, 0),
    )
    leavesMesh.geometry.applyMatrix4(
      new THREE.Matrix4().makeRotationX(-Math.PI / 2),
    )
    leavesMesh.castShadow = true
    leavesMesh.receiveShadow = true
    //console.log(leavesMesh.geometry.attributes.position);
    const sampler = new MeshSurfaceSampler(treeMesh)
      .setWeightAttribute("leafiness")
      .build()
    const dummy = new THREE.Object3D()
    for (let i = 0; i < leavesMesh.count; i++) {
      sampler.sample(dummy.position, normal)
      leafCenter.add(dummy.position)
      let target = dummy.position.clone().add(normal)
      dummy.lookAt(target.x, target.y, target.z)
      dummy.updateMatrix()
      leavesMesh.setMatrixAt(i, dummy.matrix)
    }
    leafCenter.divideScalar(leavesMesh.count)
    leafCenter.applyMatrix4(treeMesh.matrix)
    treeMesh.add(leavesMesh)
    trees.push(treeMesh)
    treePositions.push(treeMesh.position)
  }
  let rockPositions = []
  const rockTextures = [
    new THREE.TextureLoader().load("rockcolor1.jpeg"),
    new THREE.TextureLoader().load("rockcolor2.jpeg"),
    new THREE.TextureLoader().load("rockcolor3.jpeg"),
    new THREE.TextureLoader().load("rockcolor4.jpeg"),
    new THREE.TextureLoader().load("rockcolor5.jpeg"),
  ]
  rockTextures.forEach(rockT => {
    rockT.wrapS = THREE.RepeatWrapping
    rockT.wrapT = THREE.RepeatWrapping
  })
  const rockNormals = [
    new THREE.TextureLoader().load("rocknormal1.png"),
    new THREE.TextureLoader().load("rocknormal2.png"),
    new THREE.TextureLoader().load("rocknormal3.png"),
    new THREE.TextureLoader().load("rocknormal4.png"),
    new THREE.TextureLoader().load("rocknormal5.png"),
  ]
  rockNormals.forEach(rockN => {
    rockN.wrapS = THREE.RepeatWrapping
    rockN.wrapT = THREE.RepeatWrapping
  })
  loadingElement.innerHTML = "Carving Rocks..."
  await nextFrame()
  const levelGeos = [
    new THREE.IcosahedronGeometry(5, 40),
    new THREE.IcosahedronGeometry(5, 20),
    new THREE.IcosahedronGeometry(5, 10),
    new THREE.IcosahedronGeometry(5, 5),
    new THREE.IcosahedronGeometry(5, 2),
  ]
  let rocks = []
  for (let i = 0; i < 100; i++) {
    if (i % 10 === 0) {
      loadingElement.innerHTML = `Carving Rocks ${i}/100...`
      await nextFrame()
    }
    const lodMesh = new THREE.LOD()
    let surfaceDir = new THREE.Vector3()
    let targetDir = new THREE.Vector3(0, -1, 0)
    while (
      lodMesh.position.y < 10 ||
      surfaceDir.dot(targetDir) < 0.95 ||
      treePositions.some(
        position =>
          Math.hypot(
            position.x - lodMesh.position.x,
            position.z - lodMesh.position.z,
          ) < 10,
      ) ||
      rockPositions.some(
        position =>
          Math.hypot(
            position.x - lodMesh.position.x,
            position.z - lodMesh.position.z,
          ) < 10,
      )
    ) {
      grassSampler.sample(lodMesh.position, surfaceDir)
    }
    surfaceDir.y *= -1
    lodMesh.position.add(surfaceDir.clone().multiplyScalar(5))
    let verticalMajor = Math.random() < 0.2
    lodMesh.scale.set(
      0.5 + 1 * Math.random() + 0.5 * verticalMajor,
      verticalMajor ? 0.5 + 1.25 * Math.random() : 0.5 + 0.5 * Math.random(),
      0.5 + 1 * Math.random() + 0.5 * verticalMajor,
    )
    const rockIndex = Math.floor(Math.random() * rockTextures.length)
    const rockMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(
        0.75 + Math.random() * 0.25,
        0.75 + Math.random() * 0.25,
        0.75 + Math.random() * 0.25,
      ),
      map: rockTextures[rockIndex],
      normalMap: rockNormals[rockIndex],
    })
    rockMat.onBeforeCompile = shader => {
      shader.uniforms.shadowTex = { value: null }
      shader.uniforms.lightViewMat = {
        value: directionalLight.shadow.camera.matrixWorldInverse,
      }
      shader.uniforms.lightProjMat = {
        value: directionalLight.shadow.camera.projectionMatrix,
      }
      setTimeout(() => {
        shader.uniforms.shadowTex = {
          value: directionalLight.shadow.map.texture,
        }
      })
      shader.vertexShader = shader.vertexShader
        .replace("#ifdef USE_TRANSMISSION", "")
        .replace("#ifdef USE_TRANSMISSION", "")
      shader.vertexShader = shader.vertexShader
        .replace("#endif", "")
        .replace("#endif", "")
      shader.vertexShader = shader.vertexShader.replace(
        "#include <worldpos_vertex>",
        `
            vec4 worldPosition = vec4( transformed, 1.0 );
            #ifdef USE_INSTANCING
                worldPosition = instanceMatrix * worldPosition;
            #endif
            worldPosition = modelMatrix * worldPosition;    
            `,
      )
      shader.fragmentShader =
        "varying vec3 vWorldPosition;\nuniform mat4 lightViewMat;\nuniform mat4 lightProjMat;\nuniform sampler2D shadowTex;\n" +
        shader.fragmentShader
          .replace(
            "#include <map_fragment>",
            `
            mat4 viewMatrixInv = inverse(viewMatrix);
            vec2 yUv = vWorldPosition.xz * 0.1;
            vec2 xUv = vWorldPosition.zy * 0.1;
            vec2 zUv = vWorldPosition.xy * 0.1;
            vec3 yDiff = texture2D(map, yUv).xyz;
            vec3 xDiff = texture2D(map, xUv).xyz;
            vec3 zDiff = texture2D(map, zUv).xyz;
            vec3 blendWeights = abs((viewMatrixInv * vec4(vNormal, 0.0)).xyz);
            blendWeights = blendWeights / (blendWeights.x + blendWeights.y + blendWeights.z);
            diffuseColor *= vec4((xDiff * blendWeights.x + yDiff * blendWeights.y + zDiff * blendWeights.z), 1.0);
            vec4 projCoords = lightProjMat * lightViewMat * vec4(vWorldPosition, 1.0);
            projCoords.xyz /= projCoords.w;
            projCoords.xyz = projCoords.xyz * 0.5 + 0.5;
            float s = 1.0;
            if (projCoords.x > 0.0 && projCoords.x < 1.0 && projCoords.y > 0.0 && projCoords.y < 1.0 && projCoords.z > 0.0 && projCoords.z < 1.0) {
                s = (VSMShadow(shadowTex, projCoords.xy, projCoords.z - 0.001));
            }
            `,
          )
          .replace(
            "#include <normal_fragment_maps>",
            `
            vec3 yNormal =  texture2D(normalMap, yUv).xyz;
            vec3 xNormal =  texture2D(normalMap, xUv).xyz;
            vec3 zNormal =  texture2D(normalMap, zUv).xyz;

	        vec3 mapN = (xNormal * blendWeights.x + yNormal * blendWeights.y + zNormal * blendWeights.z) * 2.0 - 1.0;
	        mapN.xy *= normalScale;
	        #ifdef USE_TANGENT
		        normal = normalize( vTBN * mapN );
	        #else
		        normal = perturbNormal2Arb( - vViewPosition, normal, mapN, faceDirection );
	        #endif
            `,
          )
          .replace(
            `#include <lights_fragment_begin>`,
            CustomLightShadowFragment,
          )
    }
    //new THREE.IcosahedronGeometry(5, Math.round(80 / (2 ** level)))
    for (let level = 0; level < levelGeos.length; level++) {
      const rockMesh = new THREE.Mesh(levelGeos[level].clone(), rockMat)
      const posAttr = rockMesh.geometry.attributes.position
      for (let j = 0; j < posAttr.count; j++) {
        const position = new THREE.Vector3(
          posAttr.getX(j),
          posAttr.getY(j),
          posAttr.getZ(j),
        )
        let amt = 1.0
        let mag = 0.25
        let freq = 0.1
        let shift = 0.0
        for (let k = 0; k < 12 - 2 * level; k++) {
          amt +=
            mag *
            noise.simplex3(
              freq * position.x + i * 100 + 512 + shift,
              freq * position.y + i * 200 + 1024 + shift,
              freq * position.z + i * 300 + 2048 + shift,
            )
          mag /= 2
          freq *= 2
          shift += 128.0
        }
        const magnitude = amt
        position.multiplyScalar(magnitude)
        posAttr.setXYZ(j, position.x, position.y, position.z)
      }
      rockMesh.geometry.computeVertexNormals()
      rockMesh.geometry.computeBoundingBox()
      rockMesh.castShadow = true
      rockMesh.receiveShadow = true
      lodMesh.addLevel(rockMesh, 20 + level * 40)
    }
    lodMesh.lookAt(
      lodMesh.position.clone().add(surfaceDir.clone().multiplyScalar(5)),
    )
    lodMesh.rotateX(Math.PI / 2)
    lodMesh.castShadow = true
    lodMesh.receiveShadow = true
    rockPositions.push(lodMesh.position)
    lodMesh.autoUpdate = false
    lodMesh._currentLevel = 0
    scene.add(lodMesh)
    rocks.push(lodMesh)
  }
  for (let i = 0; i < 1000; i++) {
    grassSampler.sample(dummy.position, normal)
    // console.log(i);
    // console.log(normal.clone().dot(up));
    if (
      Math.random() > Math.pow(normal.clone().dot(up), 10.0) ||
      Math.random() > dummy.position.y * 0.1 ||
      treePositions.some(
        position =>
          Math.hypot(
            position.x - dummy.position.x,
            position.z - dummy.position.z,
          ) < 10,
      ) ||
      rockPositions.some(
        position =>
          Math.hypot(
            position.x - dummy.position.x,
            position.z - dummy.position.z,
          ) < 10,
      )
    ) {
      i--
      continue
    }
    let target = dummy.position.clone().add(normal)
    const normalArr = [...normal.clone()]
    normalArr[1] *= -1
    normalAttribute.push(...normalArr)
    dummy.lookAt(target.x, target.y, target.z)
    // dummy.scale.set(0.75 + Math.random() * 0.5, 0.75 + Math.random() * 0.5, 0.75 + Math.random() * 0.5);
    dummy.updateMatrix()
    stems.setMatrixAt(i, dummy.matrix.clone())
    //dummy.position.copy(dummy.position.clone().add(normal.clone().multiplyScalar(-9.5)));
    //dummy.updateMatrix();
    flowers.setMatrixAt(i, dummy.matrix.clone())
    flowerOffsets.push(Math.random() * 2 * Math.PI)
    flowerBoxes.push(
      new THREE.Box3().setFromCenterAndSize(
        dummy.position.clone().add(normal.clone().multiplyScalar(-5)),
        new THREE.Vector3(5, 10, 5),
      ),
    )
  }
  flowerBoxes.forEach((box, i) => {
    box.index = i
  })
  flowers.geometry.setAttribute(
    "offset",
    new THREE.InstancedBufferAttribute(new Float32Array(flowerOffsets), 1),
  )
  stems.geometry.setAttribute(
    "offset",
    new THREE.InstancedBufferAttribute(new Float32Array(flowerOffsets), 1),
  )
  //scene.add(new THREE.Mesh(BufferGeometryUtils.mergeBufferGeometries(treeParts), new THREE.MeshStandardMaterial({ color: new THREE.Color(1.0, 0.5, 0.25) })));
  loadingElement.innerHTML = "Summoning Butterflies..."
  await nextFrame()
  const butterfly = await AssetManager.loadGLTFAsync("butterfly.glb")
  butterfly.scene.traverse(mesh => {
    if (mesh.material) {
      mesh.material.envMap = environment
      mesh.material.needsUpdate = true
      mesh.castShadow = true
      mesh.receiveShadow = true
    }
  })
  //scene.add(butterfly.scene);
  loadingElement.innerHTML = "Baking Collision Mesh (0 / 3)..."
  await nextFrame()
  let frame = 0
  let geometries = []
  ;[terrainMesh, ...rocks.map(rock => rock.levels[2].object), ...trees].forEach(
    object => {
      const cloned = new THREE.Mesh(object.geometry, object.material)
      object.getWorldPosition(cloned.position)
      if (object.geometry && object.visible) {
        const cloned = object.geometry.clone()
        cloned.applyMatrix4(object.matrixWorld)
        for (const key in cloned.attributes) {
          if (key !== "position") {
            cloned.deleteAttribute(key)
          }
        }
        geometries.push(cloned)
      }
    },
  )
  loadingElement.innerHTML = "Baking Collision Mesh (1 / 3)..."
  await nextFrame()
  const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(
    geometries.map(geom => geom.toNonIndexed()),
    false,
  )
  mergedGeometry.boundsTree = new MeshBVHLib.MeshBVH(mergedGeometry, {
    lazyGeneration: false,
    strategy: MeshBVHLib.SAH,
  })
  const collider = new THREE.Mesh(mergedGeometry)
  collider.material.wireframe = true
  collider.material.opacity = 0.5
  collider.material.transparent = true
  collider.visible = false
  collider.geometry.boundsTree = mergedGeometry.boundsTree
  loadingElement.innerHTML = "Baking Collision Mesh (2 / 3)..."
  await nextFrame()
  terrainMesh.geometry.boundsTree = new MeshBVHLib.MeshBVH(
    terrainMesh.geometry,
    { lazyGeneration: false, strategy: MeshBVHLib.SAH },
  )
  scene.add(collider)

  const visualizer = new MeshBVHLib.MeshBVHVisualizer(collider, 20)
  visualizer.visible = false
  visualizer.update()
  scene.add(visualizer)
  loadingElement.innerHTML = "Placing Butterflies..."
  await nextFrame()
  const playerCapsule = new CapsuleEntity(2.5, 15)
  while (true) {
    /* const position = new THREE.Vector3(-256 + Math.random() * 512, -256 + Math.random() * 512);
         const mesh = butterfly.scene.clone();
         const animations = */
    const xPos = 0 + (Math.random() - 0.5) * Math.random() * 512
    const zPos = 0 + (Math.random() - 0.5) * Math.random() * 512
    if (
      treePositions.some(
        position => Math.hypot(position.x - xPos, position.z - zPos) < 10,
      ) ||
      rockPositions.some(
        position => Math.hypot(position.x - xPos, position.z - zPos) < 10,
      )
    ) {
      continue
    }
    const height = terrainMesh.geometry.boundsTree.raycastFirst(
      new THREE.Ray(
        new THREE.Vector3(xPos, 1000, zPos),
        new THREE.Vector3(0, -1, 0),
      ),
      THREE.DoubleSide,
    )
    const badHeight = collider.geometry.boundsTree.raycastFirst(
      new THREE.Ray(
        new THREE.Vector3(xPos, 1000, zPos),
        new THREE.Vector3(0, -1, 0),
      ),
      THREE.DoubleSide,
    )
    if (badHeight > height + 0.1) {
      continue
    }
    const position = new THREE.Vector3(
      xPos,
      height.point.y + 15 + 10 * Math.random(),
      zPos,
    )
    playerCapsule.position.copy(position)
    break
  }
  const ogPosition = playerCapsule.position.clone()
  const butterflies = []
  for (let i = 0; i < 30; i++) {
    /* const position = new THREE.Vector3(-256 + Math.random() * 512, -256 + Math.random() * 512);
         const mesh = butterfly.scene.clone();
         const animations = */
    const xPos = -256 + Math.random() * 512
    const zPos = -256 + Math.random() * 512
    if (
      treePositions.some(
        position => Math.hypot(position.x - xPos, position.z - zPos) < 10,
      ) ||
      rockPositions.some(
        position => Math.hypot(position.x - xPos, position.z - zPos) < 10,
      )
    ) {
      i--
      continue
    }
    const height = terrainMesh.geometry.boundsTree.raycastFirst(
      new THREE.Ray(
        new THREE.Vector3(xPos, 1000, zPos),
        new THREE.Vector3(0, -1, 0),
      ),
      THREE.DoubleSide,
    ) //new THREE.Raycaster(new THREE.Vector3(xPos, 1000, zPos), new THREE.Vector3(0, -1, 0)).intersectObject(terrainMesh);
    const position = new THREE.Vector3(
      xPos,
      height.point.y + 15 + 10 * Math.random(),
      zPos,
    )
    const b = new Butterfly(butterfly.scene, butterfly.animations, {
      position,
      scene,
    })
    scene.add(b.mesh)
    butterflies.push(b)
  }
  let lastTime = performance.now()
  const keys = {}
  document.onkeydown = e => {
    keys[e.key] = true
  }
  document.onkeyup = e => {
    keys[e.key] = false
  }
  const playerDirection = new THREE.Vector3()
  const getForwardVector = function (camera) {
    camera.getWorldDirection(playerDirection)
    playerDirection.y = 0
    playerDirection.normalize()
    return playerDirection
  }

  const getSideVector = function (camera) {
    camera.getWorldDirection(playerDirection)
    playerDirection.y = 0
    playerDirection.normalize()
    playerDirection.cross(camera.up)
    return playerDirection
  }
  let jumped = 0
  let mouseDown = false
  document.addEventListener("mousedown", e => {
    mouseDown = true
    if (controls.isLocked && !bigFlower.visible) {
      const ray = new THREE.Ray(
        camera.position,
        camera.getWorldDirection(new THREE.Vector3()),
      )
      flowerBoxes.sort((a, b) => {
        return (
          a.getCenter(new THREE.Vector3()).distanceTo(camera.position) -
          b.getCenter(new THREE.Vector3()).distanceTo(camera.position)
        )
      })
      for (let i = 0; i < flowerBoxes.length; i++) {
        const box = flowerBoxes[i]
        const intersectPos = new THREE.Vector3()
        if (ray.intersectBox(box, intersectPos) && !box.disabled) {
          if (camera.position.distanceTo(intersectPos) < 25) {
            bigFlower.visible = true
            bigFlower.position.y = -3
            bigFlower.position.z = -12
            bigFlower.rotation.x = 0
            dummy = new THREE.Object3D()
            for (let j = 0; j < 1000; j++) {
              const direction = new THREE.Vector3(
                Math.random() - 0.5,
                Math.random() - 0.5,
                Math.random() - 0.5,
              )
              direction.normalize()
              //dummy.position.copy(direction.clone().multiplyScalar(0.5));
              dummy.lookAt(direction.x, direction.y, direction.z)
              dummy.updateMatrix()
              spores.setMatrixAt(j, dummy.matrix)
              sporeFlowers.setMatrixAt(j, dummy.matrix)
              // spores2.setMatrixAt(j, new THREE.Matrix4());
              //sporeFlowers2.setMatrixAt(j, new THREE.Matrix4());
              spores.instanceMatrix.needsUpdate = true
              sporeFlowers.instanceMatrix.needsUpdate = true
            }
            box.disabled = true
            stems.setMatrixAt(box.index, new THREE.Matrix4())
            flowers.setMatrixAt(box.index, new THREE.Matrix4())
            stems.instanceMatrix.needsUpdate = true
            flowers.instanceMatrix.needsUpdate = true
            removeIndex = 0
            //removedVelocities = [];
            //removedAccelerations = [];
            break
          }
        }
      }
    }
  })
  document.addEventListener("mouseup", e => {
    mouseDown = false
  })
  let removeIndex = 0
  let removedVelocities = []
  let removedAccelerations = []
  scene.add(controls.getObject())
  document.getElementById("background").style.display = "none"
  document.body.appendChild(stats.dom)
  document.body.appendChild(renderer.domElement)
  document.addEventListener("click", () => {
    controls.lock()
  })
  loadingElement.innerHTML = "Done!"

  function animate() {
    //console.log(mouseDown);
    if (mouseDown && bigFlower.visible) {
      for (let i = 0; i < 10; i++) {
        if (removeIndex > 999) {
          break
        }
        const m = new THREE.Matrix4()
        spores.getMatrixAt(removeIndex, m)
        m.premultiply(spores.matrixWorld)
        spores2.setMatrixAt(removeIndex, m)
        sporeFlowers.getMatrixAt(removeIndex, m)
        m.premultiply(sporeFlowers.matrixWorld)
        sporeFlowers2.setMatrixAt(removeIndex, m)
        spores.setMatrixAt(removeIndex, new THREE.Matrix4())
        sporeFlowers.setMatrixAt(removeIndex, new THREE.Matrix4())
        spores.instanceMatrix.needsUpdate = true
        sporeFlowers.instanceMatrix.needsUpdate = true
        removedVelocities[removeIndex] = camera
          .getWorldDirection(new THREE.Vector3())
          .add(
            new THREE.Vector3(
              Math.random() - 0.5,
              Math.random() - 0.5,
              Math.random() - 0.5,
            ).multiplyScalar(0.25),
          )
          .normalize()
          .add(playerCapsule.horizontalVelocity.clone().multiplyScalar(25))
        removedAccelerations[removeIndex] = new THREE.Vector3(
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() - 0.5,
        ).normalize()
        removeIndex++
      }
    }
    if (removeIndex > 999) {
      bigFlower.position.y *= 1.05
      bigFlower.rotation.x -= 0.05
      bigFlower.rotation.x *= 1.05
      if (bigFlower.position.y < -10) {
        bigFlower.visible = false
      }
    }
    if (bigFlower.position.z < -7) {
      bigFlower.position.z += 0.5
    } else {
      bigFlower.position.z = -7
    }
    for (let i = 0; i < 1000; i++) {
      if (!removedVelocities[i]) {
        continue
      }
      const m = new THREE.Matrix4()
      spores2.getMatrixAt(i, m)
      m.premultiply(
        new THREE.Matrix4().makeTranslation(
          removedVelocities[i].x * 0.25,
          removedVelocities[i].y * 0.25,
          removedVelocities[i].z * 0.25,
        ),
      )
      spores2.setMatrixAt(i, m)
      sporeFlowers2.getMatrixAt(i, m)
      m.premultiply(
        new THREE.Matrix4().makeTranslation(
          removedVelocities[i].x * 0.25,
          removedVelocities[i].y * 0.25,
          removedVelocities[i].z * 0.25,
        ),
      )
      sporeFlowers2.setMatrixAt(i, m)
      if (removedVelocities[i].length() > 0.5) {
        removedVelocities[i].multiplyScalar(0.995)
      }
      removedVelocities[i].add(
        removedAccelerations[i].clone().multiplyScalar(0.01),
      )
      removedAccelerations[i].multiplyScalar(0.99)
    }
    spores2.instanceMatrix.needsUpdate = true
    sporeFlowers2.instanceMatrix.needsUpdate = true
    if (frame < 10) {
      renderer.shadowMap.autoUpdate = true
      rocks.forEach(rock => {
        rock._currentLevel = 0
        rock.autoUpdate = true
      })
    } else {
      renderer.shadowMap.autoUpdate = false
      rocks.forEach(rock => {
        rock.autoUpdate = true
      })
    }
    if (frame > 60) {
      loadingElement.style.display = "none"
    }
    if (frame === 1) {
      bigFlower.visible = false
    }
    if (terrainShader) {
      terrainShader.uniforms.reflect.value = false
    }
    const delta = Math.min((performance.now() - lastTime) / 1000, 0.1)
    const timeScale = delta / (1 / 60)
    for (let i = 0; i < 5; i++) {
      playerCapsule.update(delta / 5, collider)
    }
    camera.position.copy(playerCapsule.position)
    const slowOffset = 1.0 * Math.sin(performance.now() / 1000)
    const fastOffset = 1.0 * Math.sin(performance.now() / 333)
    camera.position.y +=
      slowOffset +
      (fastOffset - slowOffset) *
        Math.min(10 * playerCapsule.horizontalVelocity.length(), 1)
    const speedFactor = 0.33
    if (controls.isLocked) {
      if (keys["w"]) {
        playerCapsule.horizontalVelocity.add(
          getForwardVector(camera).multiplyScalar(speedFactor * delta),
        )
      }

      if (keys["s"]) {
        playerCapsule.horizontalVelocity.add(
          getForwardVector(camera).multiplyScalar(-speedFactor * delta),
        )
      }

      if (keys["a"]) {
        playerCapsule.horizontalVelocity.add(
          getSideVector(camera).multiplyScalar(-speedFactor * delta),
        )
      }

      if (keys["d"]) {
        playerCapsule.horizontalVelocity.add(
          getSideVector(camera).multiplyScalar(speedFactor * delta),
        )
      }
      if (keys[" "]) {
        if (playerCapsule.onGround) {
          playerCapsule.velocity.y = 125.0
        }
      }
    }
    if (playerCapsule.position.y < -250) {
      playerCapsule.position.copy(ogPosition)
    }
    butterflies.forEach(butterfly => {
      butterfly.update(delta, collider, {
        flower: bigFlower.visible,
        flowerPos: bigFlower.children[0].getWorldPosition(new THREE.Vector3()),
        playerPos: playerCapsule.position,
        butterflies,
        timeScale,
      })
    })
    lastTime = performance.now()
    renderer.setRenderTarget(defaultTexture)
    renderer.clear()
    renderer.render(scene, camera)
    if (terrainShader) {
      terrainShader.uniforms.reflect.value = true
    }
    if (grassShader) {
      grassShader.uniforms.time.value = performance.now() / 1000
    }
    tickers.forEach(ticker => {
      try {
        ticker.uniforms.time.value = performance.now() / 1000
      } catch (e) {}
    })

    renderer.setRenderTarget(reflectTexture)
    renderer.clear()
    renderer.render(reflectScene, camera)
    effectPass.uniforms["sceneDiffuse"].value = defaultTexture.texture
    effectPass.uniforms["reflectDiffuse"].value = reflectTexture.texture
    effectPass.uniforms["sceneDepth"].value = defaultTexture.depthTexture
    effectPass.uniforms["projectionMatrixInv"].value =
      camera.projectionMatrixInverse
    effectPass.uniforms["viewMatrixInv"].value = camera.matrixWorld
    effectPass.uniforms["projMat"].value = camera.projectionMatrix
    effectPass.uniforms["viewMat"].value = camera.matrixWorldInverse
    effectPass.uniforms["waterNormal1"].value = waterNormalMap
    effectPass.uniforms["waterNormal2"].value = waterNormalMap2
    effectPass.uniforms["cameraPos"].value = camera.position
    effectPass.uniforms["time"].value = performance.now() / 1000
    effectPass.uniforms["environment"].value = environment
    effectPass.uniforms["lightPos"].value = directionalLight.position
    effectPass.uniforms["resolution"].value = new THREE.Vector2(
      clientWidth,
      clientHeight,
    )
    godRayPass.uniforms["sceneDiffuse"].value = defaultTexture.texture
    godRayPass.uniforms["sceneDepth"].value = defaultTexture.depthTexture
    ssaoPass.uniforms["sceneDiffuse"].value = defaultTexture.texture
    ssaoPass.uniforms["sceneDepth"].value = defaultTexture.depthTexture
    camera.updateMatrixWorld()
    ssaoPass.uniforms["projMat"].value = camera.projectionMatrix
    ssaoPass.uniforms["viewMat"].value = camera.matrixWorldInverse
    ssaoPass.uniforms["projViewMat"].value = camera.projectionMatrix
      .clone()
      .multiply(camera.matrixWorldInverse.clone())
    ssaoPass.uniforms["projectionMatrixInv"].value =
      camera.projectionMatrixInverse
    ssaoPass.uniforms["viewMatrixInv"].value = camera.matrixWorld
    ssaoPass.uniforms["cameraPos"].value = camera.position
    ssaoPass.uniforms["resolution"].value = new THREE.Vector2(
      clientWidth,
      clientHeight,
    )
    ssaoPass.uniforms["time"].value = performance.now() / 1000
    godRayPass.uniforms["projMat"].value = camera.projectionMatrix
    godRayPass.uniforms["viewMat"].value = camera.matrixWorldInverse
    godRayPass.uniforms["projViewMat"].value = camera.projectionMatrix
      .clone()
      .multiply(camera.matrixWorldInverse.clone())
    godRayPass.uniforms["projectionMatrixInv"].value =
      camera.projectionMatrixInverse
    godRayPass.uniforms["viewMatrixInv"].value = camera.matrixWorld
    godRayPass.uniforms["cameraPos"].value = camera.position
    godRayPass.uniforms["resolution"].value = new THREE.Vector2(
      clientWidth,
      clientHeight,
    )
    godRayPass.uniforms["time"].value = performance.now() / 1000
    effectCompositer.uniforms["sceneDiffuse"].value = defaultTexture.texture
    effectCompositer.uniforms["sceneDepth"].value = defaultTexture.depthTexture
    effectCompositer.uniforms["resolution"].value = new THREE.Vector2(
      clientWidth,
      clientHeight,
    )
    composer.render()
    stats.update()
    requestAnimationFrame(animate)
    frame++
  }
  requestAnimationFrame(animate)
}
main()
