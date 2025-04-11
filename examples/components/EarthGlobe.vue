<template>
  <div class="globePage">
    <cg-earth-globe
        ref="cgGlobe"
        @ready="onGlobeReady"
        :zoom="2"
        :min-zoom="2"
        :max-zoom="18"
        :center="{
          longitude:105.0,
          latitude:33.0
        }"
        :heading="0"
        :pitch="-90"
        :dem="false"
        :skybox="true"
        :sky-atmosphere="true"
        :ground-atmosphere="true"
        :fog="true"
        :tool-list="{
          zoomButton:true,
          restoreVisionButton:true,
          compassDisplay:true,
          scaleDisplay:true,
          positionDisplay:true
        }"
    ></cg-earth-globe>
  </div>
</template>

<script setup>

import CgEarthGlobe from "../../packages/cg_earth_globe/CgEarthGlobe";
import {ref} from 'vue'
const cgGlobe = ref(null);

function onGlobeReady(){
  setTimeout(()=>{
    // cgGlobe.value.setZoom(12)
    cgGlobe.value.setSkyboxData(
      {
        negativeX: "https://earth.jl1.cn/earthPackageCesium/skyBox/default/negativeX.jpg",
        negativeY: "https://earth.jl1.cn/earthPackageCesium/skyBox/default/negativeY.jpg",
        negativeZ: "https://earth.jl1.cn/earthPackageCesium/skyBox/default/negativeZ.jpg",
        positiveX: "https://earth.jl1.cn/earthPackageCesium/skyBox/default/positiveX.jpg",
        positiveY: "https://earth.jl1.cn/earthPackageCesium/skyBox/default/positiveY.jpg",
        positiveZ: "https://earth.jl1.cn/earthPackageCesium/skyBox/default/positiveZ.jpg",
      }
    )
  },5000)

}

</script>
<style scoped>
.globePage {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #88aacc
}

</style>

