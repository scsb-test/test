//集中导出多个组件的入口
import TestCesiumGlobe from '../test_cesium_globe'
import TestCesiumFly from '../test_cesium_fly'
import TestBtn from '../test_btn'

const components = [TestCesiumGlobe, TestCesiumFly, TestBtn]
const install = (Vue) => {
  components.forEach(comp => Vue.component(comp.name,comp))
}
if(typeof window !== 'undefined' && window.Vue){
  install(window.Vue)
}

//需要导出组件中独立的js方法
import { setCesiumBaseUrl, getCesiumBaseUrl } from '../test_cesium_globe';


// 命名导出组件（支持按需引入）
export {
  TestCesiumGlobe, TestCesiumFly, TestBtn,
  setCesiumBaseUrl, getCesiumBaseUrl
}


