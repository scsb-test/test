<template>
  <div>
    <CGEarthLandmass ref="cgLandmassObject"
                     :parameter="parameter"
                     :topUrl="topUrl"
                     :tifUrl="tifUrl"
    ></CGEarthLandmass>
    <!--    <btn-test></btn-test>-->
    <!--    <cesium-globe></cesium-globe>-->
    <!--    <cesium-fly-to></cesium-fly-to>-->
  </div>
</template>

<script setup>

import {onMounted, ref} from "vue";
import imagePropData from "./imagePropData.json";
import CGEarthLandmass from "../../../packages/cg_earth_landmass/CGEarthLandmass.vue";
// import 'cg-earth-landmass-test-lib/CGEarthLandmass.common.234.js'
// import CGEarthLandmass from "cg-earth-landmass-test-lib/CGEarthLandmass.common.js";
// npm unlink cg-earth-landmass-test-lib
const data = imagePropData['bengchinandang'];

let parameter = ref({
  // 高度偏移
  heightOffset: data.heightOffset,
  // 缩放因子
  scaleFactor: data.scaleFactor,
  // 相机位置
  cameraPosition: data.cameraPosition,
  // 摄像头最远距离
  maxDistance: data.maxDistance,
  // 摄像头最近距离
  minDistance: data.minDistance,
})
let tifUrl = ref(`LandDisplayTexture/${data.imageName}/${data.imageName}.tif`)
let topUrl = ref(`LandDisplayTexture/${data.imageName}/${data.imageName}.jpg`)

let cgLandmassObject = ref()
onMounted(() => {
  setInterval(() => {
        console.log(cgLandmassObject.value.getRenderer())
        cgLandmassObject.value.setAmbientLightIntensity(1)
        cgLandmassObject.value.setDirectionalLightIntensity(1)
        if (cgLandmassObject.value.getRotate()) {
          cgLandmassObject.value.addGridAndAxesHelper()
        } else {
          // cgLandmassObject.value.removeGridAndAxesHelper()
        }
        cgLandmassObject.value.setRotate(!cgLandmassObject.value.getRotate())
        if (cgLandmassObject.value.getRotate()) {
          cgLandmassObject.value.setSkybox([
            'LandDisplayTexture/skybox/skybox4/posx.jpg',
            'LandDisplayTexture/skybox/skybox4/negx.jpg',
            'LandDisplayTexture/skybox/skybox4/posy.jpg',
            'LandDisplayTexture/skybox/skybox4/negy.jpg',
            'LandDisplayTexture/skybox/skybox4/posz.jpg',
            'LandDisplayTexture/skybox/skybox4/negz.jpg',
          ])
          cgLandmassObject.value.setSideTextureMaterial('LandDisplayTexture/skybox/skybox4/negz.jpg')
          cgLandmassObject.value.setBottomTextureMaterial('LandDisplayTexture/skybox/skybox4/negz.jpg')
          cgLandmassObject.value.setLandmassPosition(0,0,0)
        } else {
          cgLandmassObject.value.setSkybox([
            'LandDisplayTexture/skybox/skybox4/negx.jpg',
            'LandDisplayTexture/skybox/skybox4/posx.jpg',
            'LandDisplayTexture/skybox/skybox4/negy.jpg',
            'LandDisplayTexture/skybox/skybox4/posy.jpg',
            'LandDisplayTexture/skybox/skybox4/negz.jpg',
            'LandDisplayTexture/skybox/skybox4/posz.jpg',
          ])
          cgLandmassObject.value.setSideTextureMaterial('LandDisplayTexture/side/side-texture3.jpg')
          cgLandmassObject.value.setBottomTextureMaterial('LandDisplayTexture/side/side-texture3.jpg')
          cgLandmassObject.value.setLandmassPosition(100,100,100)
        }

      },
      2000)
})
</script>