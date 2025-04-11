import CgEarthGlobe from './CgEarthGlobe'
CgEarthGlobe.install = (Vue)=>{
  Vue.component(CgEarthGlobe.name,CgEarthGlobe)
}
export default CgEarthGlobe

import { setCesiumBaseUrl, getCesiumBaseUrl } from './cesiumConfig';
export { setCesiumBaseUrl, getCesiumBaseUrl }; // 暴露独立js方法