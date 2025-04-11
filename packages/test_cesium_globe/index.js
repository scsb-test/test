import TestCesiumGlobe from './TestCesiumGlobe'
TestCesiumGlobe.install = (Vue)=>{
  Vue.component(TestCesiumGlobe.name,TestCesiumGlobe)
}
export default TestCesiumGlobe

import { setCesiumBaseUrl, getCesiumBaseUrl } from './cesiumConfig';
export { setCesiumBaseUrl, getCesiumBaseUrl }; // 暴露独立js方法