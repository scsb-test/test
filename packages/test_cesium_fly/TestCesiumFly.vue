<template>

<!--  <button @click="flyToFun">点击跳转</button>-->


</template>

<script setup>
import { defineExpose } from 'vue';

const Cesium = require("cesium/Cesium");
import widgets from "cesium/Widgets/widgets.css";

function flyToFun(viewer,lng,lat,zoom){
  console.log("调用cesiumFly组件中的flyToFun方法")
  console.log(viewer)

  viewer.value.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(lng, lat, zoomToAltitude(zoom)),
  });
}


// 明确声明要暴露的方法
defineExpose({
  flyToFun
});



//工具方法
function zoomToAltitude(zoom){
  const A = 40487.57;
  const B = 0.00007096758;
  const C = 91610.74;
  const D = -40467.74;
  let result = Math.round(C * Math.pow((A - D) / (zoom - D) - 1, 1 / B))
  // console.log("相机高度："+result)
  return result;
}




</script>

<style scoped>

</style>