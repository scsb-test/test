//处理cesium的静态资源目录
//默认从服务器取值，服务器上放置static目录，里面是四个cesium静态资源
//离线情况下用户可通过setCesiumBaseUrl方法配置为从本地public取值，此时需要用户创建public/static目录，里面放置四个cesium静态资源
let _cesiumBaseUrl = 'https://earth.jl1.cn/earthPackageCesium/static/'; // 默认值

export const setCesiumBaseUrl = (url) => {
  console.log("配置cesium静态资源目录"+url)
  _cesiumBaseUrl = url;
};

export const getCesiumBaseUrl = () => _cesiumBaseUrl;