<template>
  <div id="map" style="width:700px;height:500px;"></div>
</template>

<script setup>
import {onMounted, ref} from 'vue';
import utils from "@/utils/utils";
const emit = defineEmits(['viewerReady'])

const Cesium = require("cesium/Cesium");
import widgets from "cesium/Widgets/widgets.css";

import { getCesiumBaseUrl } from './cesiumConfig';

let viewer = ref("");
function initCesium(){
  //设置cesium的静态资源地址
  window["CESIUM_BASE_URL"] = getCesiumBaseUrl()
  Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmZDYwMDgzNy1kZmRlLTQ3NDEtYjVlZS01YTM1NGQ4NzcwM2UiLCJpZCI6MTMzNzA5LCJpYXQiOjE2ODE0NTkzNTN9.c-bQKuAx16QHPA6S66XtGuqr_M1R1Z7elreAkuqJbPA"
  viewer.value = new Cesium.Viewer('map', {
    baseLayerPicker: false,
    infoBox: false,
    timeline: false,
    geocoder: false,
    animation: false,
    homeButton: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    fullscreenButton: false,
    skyBox: false,
    imageryProvider: navigator.onLine ? new Cesium.UrlTemplateImageryProvider({
      url: utils.worldSkin.replace("{y}", '{reverseY}'),
      // EPSG4326坐标系下的地图服务，需要添加
      // tilingScheme: new Cesium.GeographicTilingScheme(),
      style: "default",
      format: "image/jpeg"
    }) : null
  });
  //隐藏cesium logo
  viewer.value._cesiumWidget._creditContainer.style.display = "none";
  viewer.value.scene.requestRenderMode = true
  //参数设置
  viewer.value.scene.fxaa = false;//抗锯齿
  viewer.value.scene.globe.maximumScreenSpaceError = 1.33;//值越高会获得更流畅体验，但是会降低显示质量
  //去除地球表面灰蒙蒙的效果（地表大气层）
  viewer.value.scene.globe.showGroundAtmosphere = false;

  //3d地形 加载自建地形数据服务
  // this.viewer.terrainProvider = new Cesium.CesiumTerrainProvider({
  //   url:"https://earth.jl1.cn/tileVisit/throughCite?token=f973393b62a140d3877511811d50e3e9",
  //   requestWaterMask:true,//请求水体效果所需要的海岸线数据
  //   requestVertexNormals:true,//请求地形照明数据
  // })
  // this.viewer.terrainExaggeration = 1.0

  emit('viewerReady', viewer); // 发送事件，携带viewer对象

}

onMounted(()=>{
  initCesium();
})


</script>

<style scoped>

</style>