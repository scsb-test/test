const { defineConfig } = require('@vue/cli-service')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require('path')
const cesiumSource = './node_modules/cesium/Source'

module.exports = defineConfig({
  transpileDependencies: true,

  // 将 examples 目录添加为新的页面
  pages: {
    index: {
      // page 的入口
      entry: 'examples/main.js',
      // 模板来源
      template: 'public/index.html',
      // 输出文件名
      filename: 'index.html'
    }
  },

  // 基本路径
  publicPath: "/",
  assetsDir: './static',
  // 输出文件目录
  outputDir: "dist",
  // eslint-loader 是否在保存的时候检查
  lintOnSave: false,
  productionSourceMap: false,   //不打包源码映射文件
  //css跟随js文件，测试项目不需要单独引入css
  css: {
    extract: false
  },

  //暴力配置，解决打包得到多个哈希js问题
  chainWebpack: config => {
    // 拦截所有 chunk 生成
    config.plugin('limit-chunk').use(require('webpack/lib/optimize/LimitChunkCountPlugin'), [{
      maxChunks: 1 // 强制只生成一个 chunk
    }]);
  },

  // 配置cesium----开始
  configureWebpack: {
    devtool: 'source-map',
    output: {
      libraryTarget: 'umd',
      // libraryExport: 'default',
    },

    amd: {
      toUrlUndefined: true
    },
    resolve: {
      alias: {
        // 'vue$': 'vue/dist/vue.esm.js',
        '@': path.resolve('examples'),
        'cesium': path.resolve(__dirname, cesiumSource)
      }
    },
    plugins: process.env.NODE_ENV === 'production'
        ?
        process.env.npm_package_config_buildDir === 'test_cesium_globe' || process.env.npm_package_config_buildDir === 'test_cg_libs' || process.env.npm_package_config_buildDir === 'cg_earth_globe'
            ?
            [
                //打包时将静态资源打包到static统一目录下
              new CopyWebpackPlugin([{ from: path.join(cesiumSource, 'Workers'), to: 'static/Workers' }]),
              new CopyWebpackPlugin([{ from: path.join(cesiumSource, 'Assets'), to: 'static/Assets' }]),
              new CopyWebpackPlugin([{ from: path.join(cesiumSource, 'Widgets'), to: 'static/Widgets' }]),
              new CopyWebpackPlugin([{ from: path.join(cesiumSource, 'ThirdParty'), to: 'static/ThirdParty' }]),
            ]
            :
            []
        :
        []
    ,
    //旧版plugin配置，待参考
    // plugins: process.env.NODE_ENV === 'production'
    //     ?
    //     process.env.npm_package_config_buildDir === 'test_cesium_globe'
    //         ?
    //         [
    //           //在线使用
    //           new CopyWebpackPlugin([{ from: path.join(cesiumSource, 'Workers'), to: 'static/Workers' }]),
    //           new CopyWebpackPlugin([{ from: path.join(cesiumSource, 'Assets'), to: 'static/Assets' }]),
    //           new CopyWebpackPlugin([{ from: path.join(cesiumSource, 'Widgets'), to: 'static/Widgets' }]),
    //           new CopyWebpackPlugin([{ from: path.join(cesiumSource, 'ThirdParty'), to: 'static/ThirdParty' }]),
    //           new webpack.DefinePlugin({
    //             //打包发布后，其他项目使用本地静态资源  注意使用的项目中需要在public/static下放置4个资源文件夹
    //             CESIUM_BASE_URL: JSON.stringify('static')
    //             //打包发布后，其他项目使用线上服务资源，静态资源目录需要设置为服务器
    //             // CESIUM_BASE_URL:JSON.stringify('http://121.36.68.139:8080/earthPackageCesium/')
    //
    //             //打包发布后，如果有网络就调用服务器静上的cesium态资源，无网络就使用本地静态资源（需要在使用的项目中public/static下放置4个资源文件夹）
    //             // CESIUM_BASE_URL: navigator.onLine ? JSON.stringify('http://121.36.68.139:8080/earthPackageCesium/') : JSON.stringify('static')
    //
    //           })
    //         ]
    //         :
    //         []
    //     :
    //     [
    //       new CopyWebpackPlugin([{ from: path.join(cesiumSource, 'Workers'), to: 'Workers' }]),
    //       new CopyWebpackPlugin([{ from: path.join(cesiumSource, 'Assets'), to: 'Assets' }]),
    //       new CopyWebpackPlugin([{ from: path.join(cesiumSource, 'Widgets'), to: 'Widgets' }]),
    //       new CopyWebpackPlugin([{ from: path.join(cesiumSource, 'ThirdParty'), to: 'ThirdParty' }]),
    //       new webpack.DefinePlugin({
    //         CESIUM_BASE_URL: JSON.stringify('./')
    //       })
    //     ]
    // ,
    module: {
      unknownContextCritical: false
    },

  },
  // 配置cesium----结束


})
