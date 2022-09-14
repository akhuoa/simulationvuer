const nodeExternals = require('webpack-node-externals');

module.exports = {
  configureWebpack: config => {
      if (process.env.NODE_ENV === 'production') {
        config.externals =  [ nodeExternals({allowlist: [/^element-ui/, "@abi-software/plotvuer", "vue2-perfect-scrollbar"]}) ];
      }
  },
  chainWebpack: config => {
    const fontsRule = config.module.rule('fonts')
    fontsRule.uses.clear()
    config.module
      .rule('fonts')
      .test(/\.(ttf|otf|eot|woff|woff2)$/)
      .use('base64-inline-loader')
      .loader('base64-inline-loader')
      .tap(options => {
        // modify the options...    
        return options
      })
      .end()
  },
  css: {
    //Import variables into all stylesheets.
    loaderOptions: {
      sass: {
        prependData: `@import '@/assets/styles';`
      }
    }
  }
}
