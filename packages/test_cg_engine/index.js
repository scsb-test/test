import TestCgEngine from './TestCgEngine'
TestCgEngine.install = (Vue)=>{
  Vue.component(TestCgEngine.name,TestCgEngine)
}
export default TestCgEngine

import { setCesiumBaseUrl, getCesiumBaseUrl } from './cesiumConfig';
export { setCesiumBaseUrl, getCesiumBaseUrl }; // 暴露独立js方法