import { defineConfig } from 'vitepress';

// GitHub Pages project site: https://<user>.github.io/wp-next-public/
const base = process.env.VP_BASE || '/wp-next-public/';

const socialLinks = [
  { icon: 'github', link: 'https://github.com/biancaplus/wp-next-public' },
];

const shared = {
  logo: '🥧',
  socialLinks,
};

export default defineConfig({
  base,

  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
      title: 'wp-next',
      description: 'Modernize your WordPress site with Next.js',
      themeConfig: {
        ...shared,
        nav: [
          { text: 'Guide', link: '/guide/' },
          { text: 'CLI', link: '/cli/' },
          { text: 'Config', link: '/config/' },
          { text: 'React', link: '/react/' },
          { text: 'Deploy', link: '/deploy/' },
          {
            text: '简体中文',
            link: '/zh/',
          },
        ],
        sidebar: {
          '/guide/': [
            {
              text: 'Guide',
              items: [
                { text: 'Getting Started', link: '/guide/' },
                { text: 'Migration Guide', link: '/guide/migration' },
              ],
            },
          ],
          '/cli/': [
            {
              text: 'CLI Reference',
              items: [
                { text: 'Overview', link: '/cli/' },
                { text: 'init', link: '/cli/init' },
                { text: 'pull', link: '/cli/pull' },
                { text: 'sync', link: '/cli/sync' },
              ],
            },
          ],
          '/config/': [
            {
              text: 'Configuration',
              items: [
                { text: 'Overview', link: '/config/' },
                { text: 'wp-next.config.ts', link: '/config/wp-next-config' },
                { text: 'Caching', link: '/config/caching' },
              ],
            },
          ],
          '/react/': [
            {
              text: 'React Components',
              items: [
                { text: 'Overview', link: '/react/' },
                { text: 'ContentRenderer', link: '/react/content-renderer' },
                { text: 'Processors', link: '/react/processors' },
                { text: 'SEO', link: '/react/seo' },
              ],
            },
          ],
          '/deploy/': [
            {
              text: 'Deployment',
              items: [
                { text: 'Overview', link: '/deploy/' },
                { text: 'Vercel', link: '/deploy/vercel' },
                { text: 'Self-Hosted', link: '/deploy/self-hosted' },
                { text: 'WordPress Webhooks', link: '/deploy/webhooks' },
              ],
            },
          ],
        },
        footer: {
          message: 'Released under the MIT License.',
          copyright: 'Copyright © 2026 wp-next',
        },
      },
    },

    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      link: '/zh/',
      title: 'wp-next',
      description: '用 Next.js 现代化你的 WordPress 站点',
      themeConfig: {
        ...shared,
        nav: [
          { text: '指南', link: '/zh/guide/' },
          { text: 'CLI', link: '/zh/cli/' },
          { text: '配置', link: '/zh/config/' },
          { text: 'React', link: '/zh/react/' },
          { text: '部署', link: '/zh/deploy/' },
          {
            text: 'English',
            link: '/',
          },
        ],
        sidebar: {
          '/zh/guide/': [
            {
              text: '指南',
              items: [
                { text: '快速开始', link: '/zh/guide/' },
                { text: '迁移指南', link: '/zh/guide/migration' },
              ],
            },
          ],
          '/zh/cli/': [
            {
              text: 'CLI 参考',
              items: [
                { text: '概览', link: '/zh/cli/' },
                { text: 'init', link: '/zh/cli/init' },
                { text: 'pull', link: '/zh/cli/pull' },
                { text: 'sync', link: '/zh/cli/sync' },
              ],
            },
          ],
          '/zh/config/': [
            {
              text: '配置',
              items: [
                { text: '概览', link: '/zh/config/' },
                { text: 'wp-next.config.ts', link: '/zh/config/wp-next-config' },
                { text: '缓存', link: '/zh/config/caching' },
              ],
            },
          ],
          '/zh/react/': [
            {
              text: 'React 组件',
              items: [
                { text: '概览', link: '/zh/react/' },
                { text: 'ContentRenderer', link: '/zh/react/content-renderer' },
                { text: 'Processors', link: '/zh/react/processors' },
                { text: 'SEO', link: '/zh/react/seo' },
              ],
            },
          ],
          '/zh/deploy/': [
            {
              text: '部署',
              items: [
                { text: '概览', link: '/zh/deploy/' },
                { text: 'Vercel', link: '/zh/deploy/vercel' },
                { text: '自托管', link: '/zh/deploy/self-hosted' },
                { text: 'WordPress Webhook', link: '/zh/deploy/webhooks' },
              ],
            },
          ],
        },
        footer: {
          message: '基于 MIT 协议发布。',
          copyright: 'Copyright © 2026 wp-next',
        },
      },
    },
  },
});
