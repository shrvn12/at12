const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/api': {
        target: 'https://music.youtube.com',
        changeOrigin: true,
        pathRewrite: { '^/api': '' },
      },
    },
  },
});
