<template>
  <div>
    <div class="container" id="canvas-container"></div>
  </div>
  <div style="position: absolute;right: 20px;bottom: 20px">
    <div @click="zoomIn" v-if="controlPanelConfig.zoomIn" class="custom-button iconfontFamily"
         style="margin-top: 7px">
      &#xe6b0;
    </div>
    <div @click="zoomOut" v-if="controlPanelConfig.zoomOut" class="custom-button iconfontFamily"
         style="margin-top: 7px">
      &#xe6b2;
    </div>
    <div @click="resetCamera" v-if="controlPanelConfig.reset" class="custom-button iconfontFamily"
         style="margin-top: 7px">
      &#xe6b3;
    </div>
  </div>
</template>

<script setup>
import {onMounted, ref} from "vue";
import * as THREE from "three";
import {
  OrbitControls
} from "three/examples/jsm/controls/OrbitControls.js";
import * as GeoTIFF from 'geotiff';
import {
  GUI
} from 'three/addons/libs/lil-gui.module.min.js';
const props = defineProps({
  controlPanelConfig: {
    default: {
      zoomIn: true,
      zoomOut: true,
      reset: true
    }
  },
  tifUrl: {
    type: String,
    required: true,
  },
  topUrl: {
    type: String,
    required: true,
  },
  parameter: {
    type: Object,
    required: true,
    default: () => {
      return {
        // 高度偏移
        heightOffset: 50,
        // 缩放因子
        scaleFactor: 1,
        // 相机位置
        cameraPosition: 800,
        // 摄像头最远距离
        maxDistance: 2500,
        // 摄像头最近距离
        minDistance: 500,
      }
    }
  },
})

// let sideUrl = ref('./LandDisplayTexture/side/side-texture3.jpg')
// let sideUrl = ref('http://market.obs.cn-north-4.myhuaweicloud.com:443/202504021041000172145.jpg')
let sideUrl = ref('')
// let bottomUrl = ref('./LandDisplayTexture/side/side-texture3.jpg')
// let bottomUrl = ref('http://market.obs.cn-north-4.myhuaweicloud.com:443/202504021041000172145.jpg')
let bottomUrl = ref('')
const skyUrl = [
  // './LandDisplayTexture/skybox/skybox4/posx.jpg',
  // 'https://market.obs.cn-north-4.myhuaweicloud.com:443/202504021033000481351.jpg',
  '',
  // './LandDisplayTexture/skybox/skybox4/negx.jpg',
  // 'https://market.obs.cn-north-4.myhuaweicloud.com:443/202504021034000181175.jpg',
  '',
  // './LandDisplayTexture/skybox/skybox4/posy.jpg',
  // 'https://market.obs.cn-north-4.myhuaweicloud.com:443/202504021034000414787.jpg',
  '',
  // './LandDisplayTexture/skybox/skybox4/negy.jpg',
  // 'https://market.obs.cn-north-4.myhuaweicloud.com:443/202504021035000082954.jpg',
  '',
  // './LandDisplayTexture/skybox/skybox4/posz.jpg',
  // 'https://market.obs.cn-north-4.myhuaweicloud.com:443/202504021035000274461.jpg',
  '',
  // './LandDisplayTexture/skybox/skybox4/negz.jpg',
  // 'https://market.obs.cn-north-4.myhuaweicloud.com:443/202504021035000521268.jpg',
  '',
]

let directionalLight = ref()
// 获取直射光源
function getDirectionalLight() {
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(500, 1000, 250);

  return light;
}

let ambientLight = ref()
// 获取环境光源
function getAmbientLight() {
  return new THREE.AmbientLight(0xffffff, 1);
}

function setDirectionalLightIntensity(intensity) {
  directionalLight.value.intensity = intensity
}

function setAmbientLightIntensity(intensity) {
  ambientLight.value.intensity = intensity
}

function getDirectionalLightIntensity() {
  return directionalLight.value.intensity
}

function getAmbientLightIntensity() {
  return ambientLight.value.intensity
}


defineExpose({
  getDirectionalLightIntensity,
  setDirectionalLightIntensity,
  getAmbientLightIntensity,
  setAmbientLightIntensity,
  setRotate,
  getRotate,
  addGridAndAxesHelper,
  removeGridAndAxesHelper,
  setSkybox,
  setSideTextureMaterial,
  setBottomTextureMaterial,
  getRenderer,
  getCamera,
  setLandmassPosition,
})
let currentSkyTexture = null
function setSkybox(urls) {
  // 释放旧资源
  if (currentSkyTexture) {
    scene.background = null;
    currentSkyTexture.dispose();
  }

  // 加载新天空盒
  const loader = new THREE.CubeTextureLoader()
  currentSkyTexture = loader.load(urls, () => {
    scene.background = currentSkyTexture;
    console.log('天空盒切换成功');
  });
}

let gridHelper = ''
let axesHelper = ''

function addGridAndAxesHelper() {
  // 如果已存在则不再创建
  if (gridHelper || axesHelper) return;

  // 创建非响应式对象
  gridHelper = new THREE.GridHelper(2000, 40);
  axesHelper = new THREE.AxesHelper(50000);


  scene.add(gridHelper);
  scene.add(axesHelper);
}

function removeGridAndAxesHelper() {
  // 释放 GridHelper
  if (gridHelper) {
    scene.remove(gridHelper);
    gridHelper.geometry.dispose();  // 释放几何体
    gridHelper.material.dispose(); // 释放材质
    gridHelper = null; // 清除引用
  }

  // 释放 AxesHelper
  if (axesHelper) {
    scene.remove(axesHelper);
    axesHelper.children.forEach(line => {
      line.geometry.dispose();  // 每个轴的几何体
      line.material.dispose(); // 每个轴的材质
    });
    axesHelper = null;
  }

}

// 获取摄像机
function getCamera() {
  if (camera) {
    return camera
  }
  const fov = 75;
  const aspect = window.innerWidth / window.innerHeight;
  const near = 0.1;
  const far = 10000;
  return new THREE.PerspectiveCamera(fov, aspect, near, far);
}
let renderer = ref(null)
// 获取渲染器
function getRenderer() {
  if (renderer.value) {
    return renderer.value
  }
  setRenderer()
  return renderer.value
}

function setRenderer() {
  renderer.value = new THREE.WebGLRenderer({antialias: true});
  renderer.value.setPixelRatio(window.devicePixelRatio || 1);
  renderer.value.setSize(window.innerWidth, window.innerHeight);
  renderer.value.shadowMap.enabled = true;
  renderer.value.shadowMap.type = THREE.PCFSoftShadowMap;
}

// 获取轨道控制器
function getControls(camera, domElement, parameter) {
  const controls = new OrbitControls(camera, domElement);
  controls.enabled = true;
  controls.maxDistance = parameter.maxDistance ? parameter.maxDistance : 2500;
  controls.minDistance = parameter.minDistance ? parameter.minDistance : 500;
  controls.autoRotate = true;

  return controls;
}
const sideGeometries = [];
let bottomGeometry = null
let topGeometry = null
// 生成地块模型
async function getGeometry(tifUrl, parameter) {
  const rawTiff = await GeoTIFF.fromUrl(tifUrl);

  const tifImage = await rawTiff.getImage();
  const image = {
    width: tifImage.getWidth(),
    height: tifImage.getHeight(),
  };

  topGeometry = new THREE.PlaneGeometry(
      image.width,
      image.height,
      image.width - 1,
      image.height - 1
  );

  const demData = await tifImage.readRasters({interleave: true});

  const arr1 = new Array(topGeometry.attributes.position.count);
  const arr = arr1.fill(1);

  arr.forEach((a, index) => {
    topGeometry.attributes.position.setZ(index, (demData[index] / parameter.scaleFactor) * -1);
  });


  const padding = 2;
  const width = image.width;
  const height = image.height;

  // 前面
  const frontGeometry = new THREE.PlaneGeometry(width, padding, width - 1, padding - 1);
  for (let x = 0; x < width; x++) {
    const index = x;
    frontGeometry.attributes.position.setY(index, (demData[index] / parameter.scaleFactor - parameter.heightOffset));
  }
  frontGeometry.translate(0, parameter.heightOffset, image.height / 2);
  frontGeometry.computeVertexNormals();
  sideGeometries.push(frontGeometry);

  // 后面
  const backGeometry = new THREE.PlaneGeometry(width, padding, width - 1, padding - 1);
  for (let x = 0; x < width; x++) {
    const index = (height - 1) * width + x;
    backGeometry.attributes.position.setY(x, (demData[index] / parameter.scaleFactor) - parameter.heightOffset);
  }
  backGeometry.translate(0, parameter.heightOffset, -image.height / 2);
  backGeometry.computeVertexNormals();

  sideGeometries.push(backGeometry);

  // 左面
  const leftGeometry = new THREE.PlaneGeometry(height, padding, height - 1, padding - 1);
  for (let y = 0; y < height; y++) {
    const index = y * width;
    leftGeometry.attributes.position.setY(y, (demData[index] / parameter.scaleFactor - parameter.heightOffset));
  }
  leftGeometry.rotateY(Math.PI / 2);
  leftGeometry.translate(-image.width / 2, parameter.heightOffset, 0);
  leftGeometry.computeVertexNormals();
  sideGeometries.push(leftGeometry);

  // 右面
  const rightGeometry = new THREE.PlaneGeometry(height, padding, height - 1, padding - 1);
  for (let y = 0; y < height; y++) {
    const index = y * width + (width - 1);
    rightGeometry.attributes.position.setY(y, (demData[index] / parameter.scaleFactor - parameter.heightOffset));
  }
  rightGeometry.rotateY(Math.PI / 2);
  rightGeometry.translate(image.width / 2, parameter.heightOffset, 0);
  rightGeometry.computeVertexNormals();
  sideGeometries.push(rightGeometry); // 记录四周面的geo信息

  // 底面
  bottomGeometry = new THREE.PlaneGeometry(width, height, width - 1, height - 1)
  bottomGeometry.computeVertexNormals();

  return {
    topGeometry,
    sideGeometries: [frontGeometry, backGeometry, leftGeometry, rightGeometry],
    bottomGeometry
  };

}

let sideTexture = null
let sideMaterial = null
let sideMeshes = []
function setSideTextureMaterial(url) {
  const prevRotate = []
  if (sideTexture) {
    sideTexture.dispose()
    sideMaterial = null
    sideTexture = null
    // 移除旧网格
    sideMeshes.forEach(mesh => {
      prevRotate.push(mesh.rotation.y)
      scene.remove(mesh);
      // 释放几何体和材质
      mesh.geometry.dispose();
      mesh.material.dispose();
    });
    sideMeshes = []; // 清空数组
  }
  sideTexture = new THREE.TextureLoader().load(url);
  sideMaterial = new THREE.MeshLambertMaterial({
    wireframe: false,
    side: THREE.DoubleSide,
    map: sideTexture
  })
  // 创建侧面网格
  const frontMesh = new THREE.Mesh(sideGeometries[0], sideMaterial);
  const backGeometry = new THREE.Mesh(sideGeometries[1], sideMaterial);
  const leftGeometry = new THREE.Mesh(sideGeometries[2], sideMaterial);
  const rightGeometry = new THREE.Mesh(sideGeometries[3], sideMaterial);
  sideMeshes = [frontMesh, backGeometry, leftGeometry, rightGeometry]
  if (prevRotate.length !== 0) {
    for (let i = 0; i < sideMeshes.length; i++) {
      sideMeshes[i].rotation.y = prevRotate[i]
    }
  }
  scene.add(...sideMeshes);
}
let bottomTexture = null
let bottomMaterial = null
let bottomMesh = null
function setBottomTextureMaterial(url) {
  let prevRotate = null
  if (bottomMesh) {
    bottomTexture.dispose()
    bottomMaterial = null
    bottomTexture = null
    prevRotate = bottomMesh.rotation.z
    scene.remove(bottomMesh)
    bottomMesh.geometry.dispose()
    bottomMesh.material.dispose()
    bottomMesh = null
  }
  bottomTexture = new THREE.TextureLoader().load(url);
  bottomMaterial = new THREE.MeshLambertMaterial({
    wireframe: false,
    side: THREE.DoubleSide,
    map: bottomTexture,
  });
  // 创建地面网格
  bottomMesh = new THREE.Mesh(bottomGeometry, bottomMaterial);
  bottomMesh.rotation.x = Math.PI / 2;
  // bottomMesh.position.y = props.parameter.heightOffset;
  bottomMesh.position.y = props.parameter.heightOffset;
  if (prevRotate) {
    bottomMesh.rotation.z = prevRotate
  }
  scene.add(bottomMesh)
}

let topMesh = null
let topTexture = null
let topMaterial = null
function setTopTextureMaterial(url) {
  let prevRotate = null
  if (topMesh) {
    topTexture.dispose()
    topMaterial = null
    topTexture = null
    prevRotate = topMesh.rotation.z
    scene.remove(topMesh)
    topMesh.geometry.dispose()
    topMesh.material.dispose()
    topMesh = null
  }
  topTexture = new THREE.TextureLoader().load(url);
  topMaterial = new THREE.MeshLambertMaterial({
    wireframe: false,
    side: THREE.DoubleSide,
    map: topTexture,
  });
  // 创建顶层网格
  topMesh = new THREE.Mesh(topGeometry, topMaterial);
  topMesh.position.y = 0;
  topMesh.rotation.x = Math.PI / 2;
  if (prevRotate) {
    topMesh.rotation.z = prevRotate
  }
  scene.add(topMesh);
}

function setLandmassPosition(x, y, z) {
  const meshes = [...sideMeshes, topMesh]
  meshes.forEach((m) => {
    m.position.x = x
    m.position.y = y
    m.position.z = z
  })
  bottomMesh.position.x = x
  bottomMesh.position.y = x + props.parameter.heightOffset
  bottomMesh.position.z = z
}

let isRotate = ref(true)
function setRotate(val) {
  isRotate.value = val
}
function getRotate() {
  return isRotate.value
}

const zoomStep = 100
// 放大（靠近目标）
function zoomIn() {
  const direction = new THREE.Vector3()
      .subVectors(camera.position, new THREE.Vector3(0, 0, 0))
      .normalize();

  const newPosition = camera.position.clone()
      .addScaledVector(direction, -zoomStep);

  const distance = newPosition.distanceTo(new THREE.Vector3(0, 0, 0));
  if (distance >= props.parameter.minDistance) {
    camera.position.copy(newPosition);
  }
}

// 缩小（远离目标）
function zoomOut() {
  const direction = new THREE.Vector3()
      .subVectors(camera.position, new THREE.Vector3(0, 0, 0))
      .normalize();

  const newPosition = camera.position.clone()
      .addScaledVector(direction, zoomStep);

  const distance = newPosition.distanceTo(new THREE.Vector3(0, 0, 0));
  if (distance <= props.parameter.maxDistance) {
    camera.position.copy(newPosition);
  }
}

function resetCamera() {
  camera.position.set(
      props.parameter.cameraPosition,
      props.parameter.cameraPosition * 2 / 3,
      props.parameter.cameraPosition
  );
  camera.lookAt(scene.position);
}

const scene = new THREE.Scene();
let camera = null
onMounted(async () => {
  camera = getCamera()
  // 天空模块
  setSkybox(skyUrl)

  const geometry = await getGeometry(props.tifUrl, props.parameter);

  // 创建顶层网格
  setTopTextureMaterial(props.topUrl)

  // 创建侧面网格
  setSideTextureMaterial(sideUrl.value)

  // 创建地面网格
  setBottomTextureMaterial(bottomUrl.value)


  // 摄像机模块

  camera.position.set(
      props.parameter.cameraPosition,
      props.parameter.cameraPosition * 2 / 3,
      props.parameter.cameraPosition
  );
  camera.lookAt(scene.position);

  // 灯光模块
  directionalLight.value = getDirectionalLight();
  ambientLight.value = getAmbientLight();
  scene.add(directionalLight.value);
  scene.add(ambientLight.value);

  // 渲染器模块
  renderer.value = getRenderer();
  document.getElementById("canvas-container").appendChild(renderer.value.domElement);

  // 渲染循环
  function animate() {
    requestAnimationFrame(animate);

    const rotate = 0.003;
    if (isRotate.value) {
      topMesh.rotation.z += rotate;
      bottomMesh.rotation.z += rotate;
      sideMeshes[0].rotation.y += -rotate;
      sideMeshes[1].rotation.y += -rotate;
      sideMeshes[2].rotation.y += -rotate;
      sideMeshes[3].rotation.y += -rotate;
    }

    renderer.value.render(scene, camera);
  }

  animate();

  window.onresize = function () {
    renderer.value.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  };

  // addGridAndAxesHelper()

  // 轨道控制器模块
  const controls = getControls(camera, renderer.value.domElement, props.parameter);

  // 监听变化，重新渲染
  controls.addEventListener('change', () => {
    renderer.value.render(scene, camera);
  });

})
</script>

<style scoped>
.custom-button {
  width: 48px;
  height: 48px;
  background: rgba(145, 145, 145, 0.4);
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
}
/*引入图标iconfont*/
@font-face {
  font-family: "iconfont";
  src: url('./fonts/iconfont.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}
.iconfontFamily{
  font-family: "iconfont" !important;
  font-style: normal;
  user-select:none;
}
</style>