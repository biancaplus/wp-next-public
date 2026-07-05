import { defineConfig } from 'vitepress';

// GitHub Pages project site: https://<user>.github.io/wp-next-public/
const base = process.env.VP_BASE || '/wp-next-public/';

export default defineConfig({
  title: 'wp-next',
  description: 'Modernize your WordPress site with Next.js',
  lang: 'en-US',
  base,

  themeConfig: {
    logo: '🥧',

    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'CLI', link: '/cli/' },
      { text: 'Config', link: '/config/' },
      { text: 'React', link: '/react/' },
      { text: 'Deploy', link: '/deploy/' },
    ],

    sidebar: {
      '/guide/': [
        { text: 'Guide', items: [
          { text: 'Getting Started', link: '/guide/' },
          { text: 'Migration Guide', link: '/guide/migration' },
        ]},
      ],
      '/cli/': [
        { text: 'CLI Reference', items: [
          { text: 'Overview', link: '/cli/' },
          { text: 'init', link: '/cli/init' },
          { text: 'pull', link: '/cli/pull' },
          { text: 'sync', link: '/cli/sync' },
        ]},
      ],
      '/config/': [
        { text: 'Configuration', items: [
          { text: 'Overview', link: '/config/' },
          { text: 'wp-next.config.ts', link: '/config/wp-next-config' },
          { text: 'Caching', link: '/config/caching' },
        ]},
      ],
      '/react/': [
        { text: 'React Components', items: [
          { text: 'Overview', link: '/react/' },
          { text: 'ContentRenderer', link: '/react/content-renderer' },
          { text: 'Processors', link: '/react/processors' },
          { text: 'SEO', link: '/react/seo' },
        ]},
      ],
      '/deploy/': [
        { text: 'Deployment', items: [
          { text: 'Overview', link: '/deploy/' },
          { text: 'Vercel', link: '/deploy/vercel' },
          { text: 'Self-Hosted', link: '/deploy/self-hosted' },
          { text: 'WordPress Webhooks', link: '/deploy/webhooks' },
        ]},
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/biancaplus/wp-next-public' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 wp-next',
    },
  },
});
