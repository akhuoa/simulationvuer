import { defineConfig } from 'vitepress'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// Version number
const versionNumber = process.env.npm_package_version

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "SimulationVuer Docs",
  description: "API documentation for SimulationVuer",
  base: '/simulationvuer/',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      {
        text: 'SimulationVuer',
        items: [
          { text: 'Live Demo', link: '/demo' },
          { text: 'API References', link: '/components/SimulationVuer' },
        ]
      }
    ],

    sidebar: [
      {
        text: 'Live Demos',
        items: [
          { text: 'SimulationVuer Demo', link: '/demo' }
        ]
      },
      {
        text: 'API References',
        items: [
          { text: 'SimulationVuer', link: '/components/SimulationVuer' },
        ]
      },
      {
        text: 'Version',
        items: [
          {
            text: `${versionNumber}`
          }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ABI-Software/simulationvuer' }
    ]
  },
  markdown: { attrs: { disable: true } },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use '../src/assets/styles' as *;`
        },
      },
    },
    plugins: [
      Components({
        // allow auto load markdown components under `./src/components/`
        extensions: ['vue'],
        // allow auto import and register components used in markdown
        include: [/\.vue$/, /\.vue\?vue/],
        resolvers: [
          ElementPlusResolver({
            importStyle: 'css',
          }),
        ],
      }),

      // https://github.com/antfu/unocss
      // see unocss.config.ts for config
    ]
  }
})