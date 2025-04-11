<template>
  <div class="matchParent">
    <div id="map" class="matchParent" style="position: relative">
      <!--底栏-->
      <div class="bottomBarStyle">
        <div  style="margin-left: 9px;float: left">长光卫星技术股份有限公司</div>
        <div v-if="toolList.positionDisplay"  style="margin-right: 9px;float: right">层级 {{zoom}}</div>
        <div v-if="toolList.positionDisplay" style="margin-left: 3px;float: right">{{centerLat}}&nbsp;&nbsp;&nbsp;&nbsp;</div>
        <div v-if="toolList.positionDisplay" style="margin-left: 9px;float: right"> {{centerLng}},</div>
      </div>
    </div>

    <!--工具栏-->
    <div class="toolBar">
      <div v-if="toolList.zoomButton" @click="zoomUp" class="toolButton" style="margin-bottom: 7px">
        <p class="toolButtonIcon iconfontFamily">&#xe6b0;</p>
      </div>
      <div v-if="toolList.zoomButton" @click="zoomDown" class="toolButton" style="margin-bottom: 7px">
        <p class="toolButtonIcon iconfontFamily">&#xe6b2;</p>
      </div>
      <div v-if="toolList.restoreVisionButton" @click="initialVision" class="toolButton">
        <p class="toolButtonIcon iconfontFamily">&#xe6b3;</p>
      </div>
    </div>
    <!--指南针-->
    <div v-if="toolList.compassDisplay" @click="backNorth()" style="width:15px;height: 40px;position: absolute;top: 40px;right: 28px;cursor: pointer" :style="{transform: 'rotateZ('+compassAngel+'deg)'}">
      <svg width="16" height="40">
        <path d="M0 0 C0.66 0 1.32 0 2 0 C3.18 2.7 4.34 5.41 5.5 8.12 C5.83 8.89 6.17 9.65 6.51 10.43 C9.13 16.63 9.93 20.88 7.47 27.3 C6.82 28.83 6.17 30.36 5.5 31.88 C5.17 32.66 4.83 33.44 4.49 34.25 C3.67 36.17 2.84 38.09 2 40 C1.34 40 0.68 40 0 40 C-1.18 37.3 -2.34 34.59 -3.5 31.88 C-3.83 31.11 -4.17 30.35 -4.51 29.57 C-7.13 23.37 -7.93 19.12 -5.47 12.7 C-4.82 11.17 -4.17 9.64 -3.5 8.12 C-3.17 7.34 -2.83 6.56 -2.49 5.75 C-1.67 3.83 -0.84 1.91 0 0 Z " fill="#FFFFFF" transform="translate(7,0)"/>
        <path d="M0 0 C0.66 0 1.32 0 2 0 C3.17 2.77 4.34 5.54 5.5 8.31 C5.83 9.1 6.17 9.88 6.51 10.69 C6.99 11.83 6.99 11.83 7.47 12.99 C7.76 13.68 8.06 14.38 8.36 15.1 C9 17 9 17 9 20 C3.72 20 -1.56 20 -7 20 C-6.34 16.68 -5.82 14.24 -4.59 11.23 C-4.32 10.57 -4.05 9.91 -3.78 9.23 C-3.5 8.55 -3.22 7.88 -2.94 7.19 C-2.52 6.15 -2.52 6.15 -2.08 5.09 C-1.39 3.39 -0.7 1.69 0 0 Z " fill="#F10303" transform="translate(7,0)"/>
        <path d="M0 0 C2.64 0 5.28 0 8 0 C8 6.6 8 13.2 8 20 C5.29 17.29 4.26 14.07 2.88 10.56 C2.6 9.88 2.32 9.2 2.04 8.5 C0.85 5.52 0 3.23 0 0 Z " fill="#ECECEC" transform="translate(0,20)"/>
        <path d="M0 0 C0.33 0 0.66 0 1 0 C1 6.6 1 13.2 1 20 C-1.64 20 -4.28 20 -7 20 C-6.3 15.43 -4.69 11.43 -2.94 7.19 C-2.52 6.15 -2.52 6.15 -2.08 5.09 C-1.39 3.39 -0.7 1.69 0 0 Z " fill="#FF2D2D" transform="translate(7,0)"/>
      </svg>
    </div>
  </div>
</template>

<script setup>
import {onMounted, ref,defineExpose,defineProps,defineEmits} from 'vue'
const emit = defineEmits(['ready'])
// eslint-disable-next-line no-undef
const Cesium = require("cesium/Cesium")
import widgets from "cesium/Widgets/widgets.css"
import CesiumNavigation from './libs/cesium-navigation-es6'
import { getCesiumBaseUrl } from './cesiumConfig'
import * as GeoTIFF from 'geotiff';
import proj4 from "proj4";

defineExpose({
  initCgEarthGlobe,setSkyAtmosphere,setGroundAtmosphere,setFog,setZoom,setHeading,setPitch,setMinZoom,setMaxZoom,jumpTo,backNorth,screenPositionToLngLat,lngLatToScreenPosition,getCenter,getZoom,getHeading,getPitch,enableZoom,disableZoom,enableDrag,disableDrag,enableRotate,disableRotate,setSkybox,setSkyboxData,setCenter,setTerrain,removeTerrain,
  addSource,getSourceById,removeSourceById,addLayer,getLayerById,setLayoutProperty,hasLayerById,removeLayerById,addTifLayer,removeTifLayer,
})

//组件初始化参数
const props = defineProps({
  zoom: {
    type: Number,
    default: 0
  },
  minZoom: {
    type: Number,
    default: 0
  },
  maxZoom: {
    type: Number,
    default: 18
  },
  center:{
    longitude:{
      type: Number,
      default: 92.0
    },
    latitude:{
      type: Number,
      default: 36.0
    }
  },
  heading: {
    type: Number,
    default: 0 // 0度正北方向
  },
  pitch: {
    type: Number,
    default: -90 // 0度俯角（垂直向下）
  },
  dem: {
    type: Boolean,
    default: false
  },
  skybox: {
    type: Boolean,
    default: true
  },
  skyAtmosphere: {
    type: Boolean,
    default: false
  },
  groundAtmosphere: {
    type: Boolean,
    default: false
  },
  fog: {
    type: Boolean,
    default: false
  },
  toolList:{
    zoomButton:{
      type: Boolean,
      default: true
    },
    restoreVisionButton:{
      type: Boolean,
      default: true
    },
    compassDisplay:{
      type: Boolean,
      default: true
    },
    scaleDisplay:{
      type: Boolean,
      default: true
    },
    positionDisplay:{
      type: Boolean,
      default: true
    }
  }
})
let center = ref({
  longitude:92.0,
  latitude:36.0
})
let initState = ref({})
let zoom = ref(3.0)
let minZoom = ref(2.0)
let maxZoom = ref(18.0)
let heading = ref(0)
let pitch = ref(-90)
let dem = ref(false)
let skybox = ref(true)
let skyAtmosphere = ref(false)
let groundAtmosphere = ref(false)
let fog = ref(false)
let compassAngel = ref(0.0)
let eventHandler = ref("")
let centerLat = ref(0)
let centerLng = ref(0)
let defaultSkyBox = ref(undefined)
let toolList = ref({zoomButton:true,
    restoreVisionButton:true,
    compassDisplay:true,
    scaleDisplay:true,
    positionDisplay:true})

let viewer = ref("")
let layerUrl = ref("http://121.36.68.139:8080/tile/tile/tms/worldSkin/{z}/{x}/{y} ".replace("{y}", '{reverseY}'))

/*----------地球初始化------------------------------------------------*/
function initCgEarthGlobe(globeOptions){
  initState.value = globeOptions
  if(globeOptions !== undefined){
    if(globeOptions.zoom){
      zoom.value = globeOptions.zoom
    }
    if(globeOptions.minZoom  !== undefined){
      minZoom.value = globeOptions.minZoom
    }
    if(globeOptions.maxZoom  !== undefined){
      maxZoom.value = globeOptions.maxZoom
    }
    if(globeOptions.center !== undefined){
      center.value = globeOptions.center
    }
    if(globeOptions.heading !== undefined){
      heading.value = globeOptions.heading
    }
    if(globeOptions.pitch !== undefined){
      pitch.value = globeOptions.pitch
    }
    if(globeOptions.dem !== undefined){
      dem.value = globeOptions.dem
    }
    if(globeOptions.skybox !== undefined){
      skybox.value = globeOptions.skybox
    }
    if(globeOptions.skyAtmosphere !== undefined){
      skyAtmosphere.value = globeOptions.skyAtmosphere
    }
    if(globeOptions.groundAtmosphere !== undefined){
      groundAtmosphere.value = globeOptions.groundAtmosphere
    }
    if(globeOptions.fog !== undefined){
      fog.value = globeOptions.fog
    }
    if(globeOptions.toolList !== undefined){
      toolList.value = globeOptions.toolList
    }
  }
  initGlobe()
}
async function initGlobe() {
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
    zoom: zoom.value,
    imageryProvider: navigator.onLine ? new Cesium.UrlTemplateImageryProvider({
      url: layerUrl.value,
      maximumLevel: 8,
      // EPSG4326坐标系下的地图服务，需要添加
      // tilingScheme: new Cesium.GeographicTilingScheme(),
      style: "default",
      format: "image/jpeg"
    }) : null
  })
  //隐藏cesium logo
  viewer.value._cesiumWidget._creditContainer.style.display = "none"
  viewer.value.scene.requestRenderMode = true
  //参数设置
  viewer.value.scene.fxaa = false//抗锯齿
  viewer.value.scene.globe.maximumScreenSpaceError = 1.33//值越高会获得更流畅体验，但是会降低显示质量
  //设置相机初始位置
  initialVision()
  //设置最大最小zoom
  setMinZoom(minZoom.value)//设置相机最大高度
  setMaxZoom(maxZoom.value)//设置相机最大高度
  // setDem(dem.value)
  if (dem.value) {
    setTerrain()
  }
  //地表大气层，加载时小球有雾蒙蒙的效果
  setGroundAtmosphere(groundAtmosphere.value)
  //天空大气层，加载时小球周围有光圈，放大后有地球向外渐变大气层
  setSkyAtmosphere(skyAtmosphere.value)
  //雾气，倾角时地面有白茫茫效果
  setFog(fog.value)
  setSkybox(skybox.value)
  if(toolList.value.scaleDisplay){
    addCesiumScale(300,-30)
  }
  addMouseEventListener()
  addPositionInfoListener()
  // 保存初始天空盒实例
  defaultSkyBox.value = viewer.value.scene.skyBox

  emit('ready') // 发送事件，携带viewer对象

  // test_addGeoJsonSource()
  // test_addBaseLayer('111', 'https://tile.charmingglobe.com/tile/world2021/tms/{z}/{x}/{y}?v=v1&token=Bearer 8bdba212ae5398db7063ebe72366bca1'.replace("{y}", '{reverseY}'))
  // await addTifLayer('./03.tif')
  // setTimeout(async () => {
  //   removeTifLayer()
  // }, 10000)
  // setTimeout(() => {
  //   test_addBaseLayer('222', 'https://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}')
  // }, 2000)
  // setTimeout(() => {
  //   test_addBaseLayer('333', 'https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', '222Layer')
  // }, 4000)
  // setTimeout(() => {
  //   removeLayerById('222Layer')
  // }, 6000)
  // setTimeout(() => {
  //   removeLayerById('333Layer')
  //   removeSourceById('111Source')
  //   removeSourceById('11')
  //   removeSourceById('222Source')
  // setLayoutProperty('111Layer', 'none')
  // }, 4000)
}
onMounted(()=>{
  let globeOptions = {
    zoom:props.zoom,
    minZoom:props.minZoom,
    maxZoom:props.maxZoom,
    center:props.center,
    heading:props.heading,
    pitch:props.pitch,
    dem:props.dem,
    skybox:props.skybox,
    skyAtmosphere:props.skyAtmosphere,
    groundAtmosphere:props.groundAtmosphere,
    fog:props.fog,
    toolList:props.toolList
  }
  initCgEarthGlobe(globeOptions)
})


//鼠标点击事件、移动事件
function addMouseEventListener(){
  eventHandler.value = new Cesium.ScreenSpaceEventHandler(viewer.value.scene.canvas);
  // 鼠标左键点击事件
  eventHandler.value.setInputAction(function(event) {
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  // 鼠标右键点击事件
  eventHandler.value.setInputAction(function(event) {
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

  eventHandler.value.setInputAction((event)=> {
  }, Cesium.ScreenSpaceEventType.LEFT_UP);

  eventHandler.value.setInputAction((event)=> {
  }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
  // 鼠标移动事件
  eventHandler.value.setInputAction((event)=> {
    //指南针
    compassAngel.value = -viewer.value.camera.heading*180/Math.PI%360
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  //地图缩放
  eventHandler.value.setInputAction((event)=> {

  }, Cesium.ScreenSpaceEventType.WHEEL);
}
//地球视角监听
function addPositionInfoListener(){
  const updateCameraPosition = () => {
    try {
      getCamera()
      //指南针
      compassAngel.value = -viewer.value.camera.heading*180/Math.PI%360
    } catch (error) {
      console.error('坐标更新失败:', error);
    }
  }

  const throttledUpdate = throttle(updateCameraPosition, 80);
  viewer.value.scene.postRender.addEventListener(throttledUpdate)
}
function throttle(func, delay) {
  let lastTime = 0 // 上次执行时间戳
  return function (...args) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      func.apply(this, args)
      lastTime = now
    }
  }
}
//比例尺
function addCesiumScale(right, bottom){
  let options = {}
  // 用于在使用重置导航重置地图视图时设置默认视图控制。接受的值是Cesium.Cartographic 和 Cesium.Rectangle.
  // options.defaultResetView = Rectangle.fromDegrees(80, 22, 130, 50)
  // 用于启用或禁用罗盘。true是启用罗盘，false是禁用罗盘。默认值为true。如果将选项设置为false，则罗盘将不会添加到地图中。
  options.enableCompass= true
  // 用于启用或禁用缩放控件。true是启用，false是禁用。默认值为true。如果将选项设置为false，则缩放控件将不会添加到地图中。
  options.enableZoomControls= true
  // 用于启用或禁用距离图例。true是启用，false是禁用。默认值为true。如果将选项设置为false，距离图例将不会添加到地图中。
  options.enableDistanceLegend= true
  // 用于启用或禁用指南针外环。true是启用，false是禁用。默认值为true。如果将选项设置为false，则该环将可见但无效。
  options.enableCompassOuterRing= true
  new CesiumNavigation(viewer.value, options)
  document.getElementsByClassName('cesium-widget-cesiumNavigationContainer')[0].style.position = 'absolute'
  document.getElementsByClassName('cesium-widget-cesiumNavigationContainer')[0].style.bottom = bottom + 'px'
  document.getElementsByClassName('cesium-widget-cesiumNavigationContainer')[0].style.right = right + 'px'
  document.getElementsByClassName('cesium-widget-cesiumNavigationContainer')[0].style.zIndex = '2'
  document.getElementsByClassName('distance-legend-label')[0].style.fontSize = '12px'
  document.getElementsByClassName('distance-legend-label')[0].style.fontWeight = '400'
}




/*----------地球视觉效果控制（地形、天空盒、大气、雾气等）------------------------------------------------*/
//加载地形
function setTerrain(exaggeration){
  viewer.value.terrainProvider = new Cesium.CesiumTerrainProvider({
    url:"https://earth.jl1.cn/tileVisit/terrain?imei=f973393b62a140d3877511811d50e3e9",
    requestWaterMask:true,//请求水体效果所需要的海岸线数据
    requestVertexNormals:true,//请求地形照明数据
  })
  viewer.value.terrainExaggeration = exaggeration
}
//清除地形
function removeTerrain(){
  viewer.value.terrainProvider = new Cesium.EllipsoidTerrainProvider();
}

//设置天空盒显隐
function setSkybox(value){
  //天空盒开启与关闭
  viewer.value.scene.skyBox.show = value
  requestRender()
}
//设置天空盒数据
function setSkyboxData(data){
  data = undefined
  if(data !== undefined && data.negativeX !== undefined && data.negativeY !== undefined && data.negativeZ !== undefined && data.positiveX !== undefined && data.positiveY !== undefined && data.positiveZ !== undefined){
    console.log("1111111111")
    viewer.value.scene.skyBox = new Cesium.SkyBox({
      sources:  {
        negativeX: data.negativeX,
        negativeY: data.negativeY,
        negativeZ: data.negativeZ,
        positiveX: data.positiveX,
        positiveY: data.positiveY,
        positiveZ: data.positiveZ,
      },
    });
    requestRender()
  }
  else{
    viewer.value.scene.skyBox = defaultSkyBox.value
  }
}

//地表大气层显隐
function setGroundAtmosphere(state){
  viewer.value.scene.globe.showGroundAtmosphere = state
  requestRender()
}
//天空大气层显隐
function setSkyAtmosphere(state){
  viewer.value.scene.skyAtmosphere.show = state
  requestRender()
}
//雾气显隐
function setFog(state){
  viewer.value.scene.fog.enabled = state
  requestRender()
}


/*----------地球操作限制（拖拽、缩放、旋转等操作控制）------------------------------------------------*/
//设置缩放最大最小层级
function setMinZoom(minZoom){
  viewer.value.scene.screenSpaceCameraController.maximumZoomDistance = zoomToHeight(minZoom)
}
function setMaxZoom(maxZoom){
  viewer.value.scene.screenSpaceCameraController.minimumZoomDistance = zoomToHeight(maxZoom)
}
//允许水平拖拽
function enableDrag(){
  viewer.value.scene.screenSpaceCameraController.enableRotate = true
}
//禁止水平拖拽
function disableDrag(){
  viewer.value.scene.screenSpaceCameraController.enableRotate = false
}
//允许缩放
function enableZoom(){
  viewer.value.scene.screenSpaceCameraController.enableZoom = true;
}
//禁止缩放
function disableZoom(){
  viewer.value.scene.screenSpaceCameraController.enableZoom = false;
}
//允许旋转、俯仰（heading、Pitch）
function enableRotate(){
  viewer.value.scene.screenSpaceCameraController.enableTilt = true
}
//禁止旋转、俯仰（heading、Pitch）
function disableRotate(){
  viewer.value.scene.screenSpaceCameraController.enableTilt = false
}


/*----------地球视角相关------------------------------------------------*/
//更新地球视角数据
function getCamera(){
  // let pitch = Cesium.Math.toDegrees(viewer.value.camera.pitch) + 90   //cesium里pitch 值是-90(无倾角)到0(推平)，加90后得到的
  centerLng.value = Cesium.Math.toDegrees(Cesium.Cartographic.fromCartesian(viewer.value.camera.position).longitude).toFixed(4)
  centerLat.value = Cesium.Math.toDegrees(Cesium.Cartographic.fromCartesian(viewer.value.camera.position).latitude).toFixed(4)
  zoom.value = Math.ceil(heightToZoom(Cesium.Cartographic.fromCartesian(viewer.value.camera.position).height))
}
//指北
function backNorth(){
  setHeading(0)
  compassAngel.value = 0
}
//恢复地球初始视角
function initialVision(){
  //设置相机初始位置
  if(initState.value){
    if(initState.value.zoom){
      zoom.value = initState.value.zoom
    }
    if(initState.value.center){
      center.value = initState.value.center
    }
    if(initState.value.heading){
      heading.value = initState.value.heading
    }
    if(initState.value.pitch){
      pitch.value = initState.value.pitch
    }
  }
  viewer.value.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(center.value.longitude, center.value.latitude, zoomToHeight(zoom.value)),
    orientation: {
      heading: Cesium.Math.toRadians(heading.value), // 方位角转弧度
      pitch: Cesium.Math.toRadians(pitch.value),     // 俯仰角转弧度
      roll: 0.0                                      // 无滚转
    }
  });
}


//获取中心点经纬度
function getCenter(){
  return {
    longitude:centerLng.value,
    latitude:centerLat.value
  }
}
//获取层级
function getZoom(){
  return zoom.value
}
//获取旋转角
function getHeading(){
  return heading.value
}
//获取俯仰角
function getPitch(){
  return pitch.value
}

//设置中心点
function setCenter(center){
  const newPosition = Cesium.Cartesian3.fromDegrees(
      center.longitude,
      center.latitude,
      Cesium.Cartographic.fromCartesian(viewer.value.camera.position).height
  )
  viewer.value.camera.flyTo({
    destination: newPosition,
    orientation: {
      heading: viewer.value.camera.heading,
      pitch: viewer.value.camera.pitch,
      roll: viewer.value.camera.roll
    },
    duration: 0, // 过渡时间（秒）
  })
}
//设置zoom
function setZoom(zoom){
  // 获取当前相机位置的经纬度（弧度）
  const cartographic = Cesium.Cartographic.fromCartesian(viewer.value.camera.position);
  // 转换为笛卡尔坐标（新高度）
  const newPosition = Cesium.Cartesian3.fromRadians(
      cartographic.longitude,
      cartographic.latitude,
      zoomToHeight(zoom)
  )
  // 平滑过渡到新高度
  viewer.value.camera.flyTo({
    destination: newPosition,
    orientation: {
      heading: viewer.value.camera.heading,
      pitch: viewer.value.camera.pitch,
      roll: viewer.value.camera.roll
    },
    duration: 0, // 过渡时间（秒）
    complete: () => {
      // 动画完成后更新相机状态
      getCamera()
    }
  })
}
//zoom加1
function zoomUp(){
  if(zoom.value + 1 > maxZoom.value){
    return
  }
  setZoom(zoom.value + 1)
}
//zoom减1
function zoomDown(){
  if(zoom.value - 1 < minZoom.value){
    return
  }
  setZoom(zoom.value - 1)
}
//设置旋转角
function setHeading(_heading){
  heading.value = _heading
  viewer.value.camera.flyTo({
    destination: viewer.value.camera.position,
    orientation: {
      heading: Cesium.Math.toRadians(heading.value),
      pitch: viewer.value.camera.pitch,
      roll: viewer.value.camera.roll
    },
    duration: 0, // 过渡时间（秒）
  })
}
//设置俯仰角
function setPitch(_pitch){
  pitch.value = _pitch
  viewer.value.camera.flyTo({
    destination: viewer.value.camera.position,
    orientation: {
      heading: viewer.value.camera.heading,
      pitch: Cesium.Math.toRadians(pitch.value),
      roll: viewer.value.camera.roll
    },
    duration: 0, // 过渡时间（秒）
  })
}


//视角跳转
function jumpTo(lng,lat,zoom,options) {
  const newPosition = Cesium.Cartesian3.fromDegrees(
      lng,
      lat,
      zoomToHeight(zoom)
  )
  viewer.value.camera.flyTo({
    destination:newPosition,
    duration:0,
    orientation: {
      heading: options && options.heading ? Cesium.Math.toRadians(options.heading) : heading.value,
      pitch: options && options.pitch ? Cesium.Math.toRadians(options.pitch) : Cesium.Math.toRadians(pitch.value),
      roll: viewer.value.camera.roll
    },
    complete: () => {
      // 动画完成后更新相机状态
      getCamera()
    }
  })
}



/*----------关于图层source------------------------------------------------*/
const SOURCE_TYPE = {
  RASTER: 'raster',
  ROAD: 'road',
  GEO_JSON: 'geoJson',
  IMAGE: 'image'
}
// source由下面4个部分组成
let geoJsonSourceInfo = ref(new Map())  // 管理geojson源相关信息，存的是geojson
let worldLayerInfo = ref(new Map())  // 底图图层源相关信息 id -> {tileUrl, scheme, tileSize}
let roadLayerInfo = ref(new Map())  // 路网图层相关信息
let imageLayerInfo = ref(new Map()) // 图片图层相关信息
//添加source
function addSource({sourceId, type, tileUrl, tileSize, imageUrl, rectangle, scheme, data}) {
  // 其中tileUrl被路网+底图使用，data被矢量瓦片使用
  // 图片图层，imageUrl是图片url，rectangle是代表西南东北的数组，如[124, 43, 127, 45]
  // addSource用于记录source的相关信息
  if (geoJsonSourceInfo.value.has(sourceId) || worldLayerInfo.value.has(sourceId)) {
    console.log(`已经存在id为${sourceId}的source`)
    return
  }
  switch (type) {
    case SOURCE_TYPE.RASTER: {
      // 使用参数id tileUrl scheme tileSize
      // 此处使用worldLayerInfo记录这几个参数即可，因为cesium中都是直接通过imageryLayer.addImageryProvider直接添加的
      // 在addLayer中再展示
      worldLayerInfo.value.set(sourceId, {
        url: tileUrl,
        tileSize: tileSize,
        scheme: scheme
      })
      break
    }
    case SOURCE_TYPE.ROAD: {
      roadLayerInfo.value.set(sourceId, {
        url: tileUrl,
      })
      break
    }
    case SOURCE_TYPE.IMAGE: {
      imageLayerInfo.value.set(sourceId, {
        url: imageUrl,
        rectangle: rectangle
      })
      break
    }
    case SOURCE_TYPE.GEO_JSON: {
      // 因此，需要一个中间变量记录id -> geojson数据的映射
      geoJsonSourceInfo.value.set(sourceId, {
        data: data
      })
      break
    }
  }
}
//获取source
function getSourceById(sourceId) {
  const sourceInfoSets = [geoJsonSourceInfo.value, worldLayerInfo.value, roadLayerInfo.value, imageLayerInfo.value]
  for (const set of sourceInfoSets) {
    if (set.has(sourceId)) { // 可选链防止undefined报错
      return set.get(sourceId) // 立即返回结果
    }
  }
  return null
}
//移除source
function removeSourceById(sourceId) {
  // 根据id来移除source，移除前需要判断sourceId是否对应已经存在的layerId
  // 判断是否有关联当前sourceId的layer
  for(let v of layerInfo.value.values()) {
    if (sourceId === v.sourceId) {
      console.log('当前sourceId关联一个layer，需要先移除sourceId对应的图层')
      return
    }
  }
  const sourceInfoSets = [geoJsonSourceInfo.value, worldLayerInfo.value, roadLayerInfo.value, imageLayerInfo.value]
  for (const set of sourceInfoSets) {
    if (set.has(sourceId)) { // 可选链防止undefined报错
      set.delete(sourceId) // 立即返回结果
      console.log(`成功移除sourceId为${sourceId}的数据源`)
      return;
    }
  }
  console.log(`不存在id为${sourceId}的数据源`)
}



/*----------关于图层layer------------------------------------------------*/
let layerInfo = ref(new Map()) // layerInfo统一管理所有的图层数据
const LAYER_TYPE = {
  BASE_LAYER: 'baseLayer',
  ROAD_LAYER: 'roadLayer',
  IMAGE_LAYER: 'imageLayer',
  GEO_JSON_LAYER: 'geoJsonLayer'
}
//添加layer
function addLayer({layerId, sourceId, type, subType, beforeLayerId}) {
  // layer分为三类：底图、geoJson矢量图层、路网图层
  // 对于底图和路网图层（栅格图层），存储layerId -> imageryLayers中的index
  // 对于标注图层（矢量图层），存储layerId -> ds
  if (layerInfo.value.get(layerId)) {
    console.log(`${layerId}对应图层已存在`)
    return
  }
  const sourceInfo = getSourceById(sourceId) // 获取sourceInfo
  if (!sourceInfo) {
    console.warn(`${sourceId}对应的源不存在`)
    return
  }
  let currLayerProvider
  switch (type) {
    case LAYER_TYPE.BASE_LAYER: {
      const url = sourceInfo.url
      currLayerProvider = new Cesium.UrlTemplateImageryProvider({
        url: url,
        style: "default",
        format: "image/jpeg"
      })
      addImageryLayerHandler(beforeLayerId, sourceId, currLayerProvider, layerId)
      break
    }
    case LAYER_TYPE.ROAD_LAYER: {
      const url = sourceInfo.url
      currLayerProvider = new Cesium.UrlTemplateImageryProvider({
        url: url,
      })
      addImageryLayerHandler(beforeLayerId, sourceId, currLayerProvider, layerId)
      break
    }
    case LAYER_TYPE.IMAGE_LAYER: {
      const url = sourceInfo.url
      const rectangle = sourceInfo.rectangle
      currLayerProvider = new Cesium.SingleTileImageryProvider({
        url :  url,  // 换成你的图片url
        rectangle : Cesium.Rectangle.fromDegrees(rectangle[0], rectangle[1], rectangle[2], rectangle[3]) // 图片的四点
      })
      addImageryLayerHandler(beforeLayerId, sourceId, currLayerProvider, layerId)
      break
    }
    case LAYER_TYPE.GEO_JSON_LAYER: {
      const sourceData = sourceInfo.data
      Cesium.GeoJsonDataSource.load(sourceData).then((ds) => { // ds则为添加的数据源，需要被记录
        ds.name = layerId
        let entities = ds.entities.values;
        entities.forEach((entity) => {
          // 这里是配置修改为自定义的样式
          switch (subType) {
            case 'line': {
              entity.polyline = new Cesium.PolylineGraphics({  // 设定线样式
                // todo: mapbox中的paint在这里写
                positions: entity.polyline.positions,
                width: 2, // 设定线宽度
                material: Cesium.Color.fromBytes(100,255,0),
                depthFailMaterial: new Cesium.ColorMaterialProperty(Cesium.Color.fromBytes(255,255,0, 0.1))
              })
              break
            }
            case 'fill': {
              entity.polygon = new Cesium.PolygonGraphics({
                // positions: entity.polygon.positions(entity.polygon.hierarchy),
                hierarchy : entity.polygon.hierarchy,
                material : Cesium.Color.BLUE.withAlpha(1),
              });
              break
            }
            case 'circle': {
              entity.billboard = null // 去除默认标记
              entity.ellipse = new Cesium.EllipseGraphics({
                outline: true,
                semiMinorAxis: 3500000.0,
                semiMajorAxis: 3500000.0,
                material: Cesium.Color.BLUE.withAlpha(1),
                outlineColor: Cesium.Color.RED,
                outlineWidth: 100,
                // material: Cesium.Color.fromCssColorString("#FF0000"), // get color from CSS color string
                // height: 0,
              })
              break
            }
            case 'symbol': {
              entity.billboard = null // 去除默认标记
              entity.label = new Cesium.LabelGraphics({
                text: entity.properties.name.getValue(),  // assuming "name" is a property of your entity
                // font : '16px Alibaba PuHuiTi Regular',
                font: '16px 700',
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                outlineWidth : 1,
                outlineColor: Cesium.Color.BLACK,
                fillColor: Cesium.Color.WHITE,
                pixelOffset: new Cesium.Cartesian2(0.0, -16), // slight offset to position the label above the entity
                showBackground: false,
                backgroundColor: Cesium.Color.TRANSPARENT,
                backgroundPadding: new Cesium.Cartesian2(7, 5), // extra padding for the background
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND // Optional, for labels to be shown over the terrain
              })
              entity.show = entity.properties.visibility.getValue() === 'visible'
              entity.description = '图标'
              break
            }
          }
        })
        layerInfo.value.set(layerId, {
          type: 'vector',
          source: sourceId,
          data: ds
        })
        if (beforeLayerId) {
          if (!hasLayerById(beforeLayerId)) {
            console.warn(`不存在id为${beforeLayerId}的beforeLayer`)
            return
          }
          // todo: 判断是否为栅格图层，问题：矢量数据如何调整层级
          viewer.value.dataSources.add(layerInfo.value.get(layerId).data).then(() => {
            // if (layerId === 'circle-test') {
            //   viewer.value.dataSources.raiseToTop(ds)
            // }
          })
        } else {
          viewer.value.dataSources.add(layerInfo.value.get(layerId).data)
        }
        requestRender()
      })
      break
    }
  }
}
//用于处理有beforeId的情况 和 没有beforeId的情况的addLayer操作
function addImageryLayerHandler(beforeLayerId, sourceId, currLayerProvider, layerId) {
  let currLayer
  if (beforeLayerId) {
    // 处理添加到某个图层前的情况
    const beforeLayer = getLayerById(beforeLayerId)
    if (!beforeLayer) {
      // 不存在图层，直接添加
      console.warn(`不存在id为${beforeLayerId}的图层`)
      currLayer = viewer.value.imageryLayers.addImageryProvider(currLayerProvider)
      // 由于对栅格图层和矢量数据的处理方法不同，需要包一层type，用于标识数据类型
      layerInfo.value.set(layerId, {
        type: 'raster',
        sourceId: sourceId,
        data: currLayer
      })
      return
    }
    // 存在图层，在该图层后添加
    const targetIndex = viewer.value.imageryLayers.indexOf(beforeLayer.data)
    currLayer = viewer.value.imageryLayers.addImageryProvider(currLayerProvider, targetIndex)
    layerInfo.value.set(layerId, {
      type: 'raster',
      sourceId: sourceId,
      data: currLayer
    })
  } else {
    // 不存在beforeLayerId的情况
    currLayer = viewer.value.imageryLayers.addImageryProvider(currLayerProvider)
    layerInfo.value.set(layerId, {
      type: 'raster',
      sourceId: sourceId,
      data: currLayer
    })
  }
}
//获取layer
function getLayerById(layerId) {
  if (!hasLayerById(layerId)) {
    console.warn(`不存在id为${layerId}的图层`)
    return null
  }
  return layerInfo.value.get(layerId)  // 对于栅格图层，返回的是图层addImageryProvider后返回对象；对于矢量数据，返回的是加载后的数据源ds
}
//设置layer是否可见
function setLayoutProperty(layerId, value) {
  // value为visible/none，设置图层可见性
  const temp = getLayerById(layerId)
  if (!temp) {
    console.warn(`id为${layerId}的图层不存在`)
    return
  }
  if (temp.type === 'raster') {
    temp.data.show = (value === 'visible')
  } else if (temp.type === 'vector') {
    temp.data.show = (value === 'visible')
  }
}
//判断layer是否存在
function hasLayerById(layerId) {
  return layerInfo.value.has(layerId)
}
//移除layer
function removeLayerById(layerId) {
  // 根据id来移除图层，但是不移除source
  const temp = getLayerById(layerId)
  if (!temp) {
    console.warn(`id为${layerId}的图层不存在`)
    return
  }
  if (temp.type === 'raster') {
    viewer.value.imageryLayers.remove(temp.data)
  } else if (temp.type === 'vector') {
    viewer.value.dataSources.remove(temp.data)
  }
  layerInfo.value.delete(layerId)
}



/*----------加载其他特殊数据------------------------------------------------*/

let tifLayer = ref('')
let tifCanvas = ref('')
//加载tif
async function addTifLayer(url) {
  removeTifLayer()
  // const tiff = await GeoTIFF.fromUrl('./result1.tif')
  const tiff = await GeoTIFF.fromUrl(url)
  // const tiff = await GeoTIFF.fromUrl('./zzx.tif')
  const image = await tiff.getImage()
  // 读取像素信息
  const [red = [], green = [], blue = []] = await image.readRasters();
  // 将像素信息写入canvas
  tifCanvas.value = document.createElement("canvas");
  let width = image.getWidth();
  let height = image.getHeight();
  console.log(`width: ${width}, height: ${height}`)
  tifCanvas.value.width = width;
  tifCanvas.value.height = height;
  let ctx = tifCanvas.value.getContext("2d");
  let imageData = ctx.createImageData(width, height);
  for (var i = 0; i < imageData.data.length / 4; i += 1) {
    imageData.data[i * 4 + 0] = red[i];
    imageData.data[i * 4 + 1] = green[i] || 0;
    imageData.data[i * 4 + 2] = blue[i] || 0;
    imageData.data[i * 4 + 3] = red[i] === 0 ? 0 : 255;
  }
  ctx.putImageData(imageData, 0, 0);
  // 2. 解析坐标系代码
  const projectionCode = image.geoKeys.ProjectedCSTypeGeoKey ||
      image.geoKeys.GeographicTypeGeoKey;
  console.log('EPSG Code:', projectionCode); //
  // 原始边界框 [minX, minY, maxX, maxY]
  const [minX, minY, maxX, maxY] = image.getBoundingBox();
  console.log(`${minX} ${minY} ${maxX} ${maxY} `)
  // 定义坐标系（UTM Zone 50N）
  proj4.defs(
      "EPSG:32651",
      "+proj=utm +zone=51 +datum=WGS84 +units=m +no_defs"
  );
  // 定义坐标系（UTM Zone 50N）
  proj4.defs(
      "EPSG:3857",
      "+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs"
  );
  // 转换四个角点坐标
  const sw = proj4(`EPSG:${projectionCode}`, "EPSG:4326", [minX, minY]);
  const ne = proj4(`EPSG:${projectionCode}`, "EPSG:4326", [maxX, maxY]);
  console.log(sw)
  console.log(ne)
  let rectangle = Cesium.Rectangle.fromDegrees(sw[0], sw[1], ne[0], ne[1]);
  // let rectangle = Cesium.Rectangle.fromDegrees(minX, minY, maxX, maxY);
  let du = tifCanvas.value.toDataURL();
  tifLayer.value = viewer.value.imageryLayers.addImageryProvider(
      new Cesium.SingleTileImageryProvider({
        url: du,
        rectangle,
      })
  );
  viewer.value.camera.setView({
    destination: rectangle,
  });
}
//移除tif
function removeTifLayer() {
  if (tifLayer.value) {
    viewer.value.imageryLayers.remove(tifLayer.value)
    tifLayer.value = ''
  }
  if (tifCanvas.value) {
    const ctx = tifCanvas.value.getContext('2d');

    // 高级清理技术：内存回收
    ctx.clearRect(0, 0, tifCanvas.value.width, tifCanvas.value.height);
    tifCanvas.value.width = 1;
    tifCanvas.value.height = 1;
    tifCanvas.value = null;
  }
}

// function test_addImageLayer(beforeId) {
//   addSource({
//     sourceId: 'imageSource',
//     type: SOURCE_TYPE.IMAGE,
//     imageUrl: zoom0Tile,
//     rectangle: [124,43,127,45]
//   })
//   addLayer({
//     layerId: '333Layer',
//     sourceId: 'imageSource',
//     type: LAYER_TYPE.IMAGE_LAYER,
//     beforeLayerId: beforeId
//   })
// }

// function test_addGeoJsonSource() {
//   addSource({
//     sourceId: 'testGeoJsonSource',
//     type: SOURCE_TYPE.GEO_JSON,
//     data: {
//       type: 'FeatureCollection',
//       features: [
//         {
//           type: 'Feature',
//           properties: {},
//           geometry: {
//             type: 'LineString',
//             coordinates: [
//               [80, 40],
//               [120, 50],
//               [100, 40],
//             ]
//           }
//         },
//         {
//           type: 'Feature',
//           properties: {},
//           geometry: {
//             type: 'LineString',
//             coordinates: [
//               [116, 40],
//               [116, 45],
//               [120, 30],
//             ]
//           }
//         },
//         {
//           type: 'Feature',
//           properties: {},
//           geometry: {
//             type: 'LineString',
//             coordinates: [
//               [0, 20],
//               [30, 60],
//               [60, 90],
//             ]
//           }
//         }
//       ]
//     }
//   })
//   addLayer({
//     layerId: 'testGeoJsonLayer',
//     sourceId: 'testGeoJsonSource',
//     type: LAYER_TYPE.GEO_JSON_LAYER,
//     subType: 'line'
//   })
// }
//
// function test_addBaseLayer(id, url, beforeId='') {
//   addSource({
//     sourceId: `${id}Source`,
//     type: SOURCE_TYPE.RASTER,
//     tileUrl: url
//   })
//   if (beforeId) {
//     addLayer({
//       layerId: `${id}Layer`,
//       sourceId: `${id}Source`,
//       type: LAYER_TYPE.BASE_LAYER,
//       beforeLayerId: beforeId
//     })
//   } else {
//     addLayer({
//       layerId: `${id}Layer`,
//       sourceId: `${id}Source`,
//       type: LAYER_TYPE.BASE_LAYER
//     })
//   }
// }






/*----------通用工具方法------------------------------------------------*/
//屏幕坐标转为经纬度
function screenPositionToLngLat(x,y){
  // 屏幕坐标转换为二维笛卡尔坐标
  let cartesian2 = new Cesium.Cartesian2(x, y);

  // 二维笛卡尔坐标转笛卡尔空间坐标
  let cartesian3 = viewer.value.scene.camera.pickEllipsoid(cartesian2)

  if(cartesian3 === undefined){
    console.log("屏幕上该点没有地球")
    return null
  }
  else{
    // 笛卡尔空间坐标转弧度
    let cartographic = Cesium.Cartographic.fromCartesian(cartesian3);

    // 弧度转换成经纬度
    let lon = Cesium.Math.toDegrees(cartographic.longitude);
    let lat = Cesium.Math.toDegrees(cartographic.latitude);
    console.log({
      lng:lon,
      lat:lat
    })

    return {
      longitude:lon,
      latitude:lat
    }
  }

}
//经纬度转为屏幕坐标
function lngLatToScreenPosition(lng,lat){
  //经纬度转笛卡尔空间坐标
  let cartesian3 = Cesium.Cartesian3.fromDegrees(lng,lat,0);

  //笛卡尔空间坐标转二维笛卡尔坐标
  let cartesian2 = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.value.scene, cartesian3);

  console.log({
    x:cartesian2.x,
    y:cartesian2.y
  })

  return {
    x:cartesian2.x,
    y:cartesian2.y
  }
}

// 常量定义
const C = 40075016.686 // 地球赤道周长（米）
const FOV = 60         // Cesium 垂直视场角（度）
// 计算转换常数 K
function calculateK(screenHeight) {
  const thetaRad = (FOV / 2) * (Math.PI / 180) // 转为弧度
  return (C * screenHeight) / (512 * Math.tan(thetaRad))
}
// Height → Zoom
function heightToZoom(height, screenHeight = 1080) {
  const K = calculateK(screenHeight)
  return Math.log2(K / height)
}
// Zoom → Height
function zoomToHeight(zoom, screenHeight = 1080) {
  const K = calculateK(screenHeight)
  return K / Math.pow(2, zoom) + 1
}

//地球渲染
function requestRender(){
  viewer.value.scene.requestRender()
}



</script>

<style>
  @font-face {
    font-family: "iconfont";
    src: url('./fonts/iconfont.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
  .iconfontFamily{
    font-family: "iconfont" !important;
    font-style: normal;
  }

  .matchParent{
    width: 100%;height: 100%;
  }

  .toolBar{
    position: absolute;
    right: 18px;bottom: 32px;
  }

  .toolButton{
    width: 48px;height: 48px;
    background: rgba(145, 145, 145, 0.7);
    border-radius: 5px;
    cursor: pointer;
    position: relative;
  }

  .toolButtonIcon{
    font-size:20px;
    color: white;
    width: 20px;
    margin: 0 auto;
    line-height: 48px;
  }

  .bottomBarStyle{
    z-index: 1;
    font-size: 12px;
    color: white;
    line-height: 24px;
    width: 100%;height: 22px;
    position: absolute;bottom: 0;
    background: rgba(84, 84, 84, 0.6);
  }
</style>