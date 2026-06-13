import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Quilt',
  tagline: 'Polyglot metaprogramming language',
  favicon: 'img/quilt.svg',

  future: { v4: true },

  url: 'https://quiltlang.github.io',
  baseUrl: '/',

  organizationName: 'QuiltLang',
  projectName: 'quiltlang.github.io',

  onBrokenLinks: 'warn',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: { defaultLocale: 'en', locales: ['en'] },

  presets: [
    [
      'classic',
      {
        docs: {
          // Read docs directly from the quilt repo wiki
          path: '../../quilt/docs/wiki',
          routeBasePath: '/docs',
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/QuiltLang/quilt/tree/main/docs/wiki/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Quilt',
      logo: {
        alt: 'Quilt logo',
        src: 'img/quilt.svg',
        href: '/',
        target: '_self',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'wikiSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          // Static demo under static/demo/ (served at /demo/), not a
          // Docusaurus route. The `pathname://` prefix links straight to the
          // file, bypassing the SPA router and broken-link checker.
          href: 'pathname:///demo/',
          target: '_self',
          label: 'Demo',
          position: 'left',
        },
        {
          href: 'https://github.com/QuiltLang/quilt',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            { label: 'Concepts', to: '/docs/concepts' },
            { label: 'QTerm IR', to: '/docs/qterm' },
            { label: 'CLI & Scripts', to: '/docs/cli' },
          ],
        },
        {
          title: 'More',
          items: [
            { label: 'GitHub',   href: 'https://github.com/QuiltLang/quilt' },
            { label: 'Examples', href: 'https://github.com/QuiltLang/quilt/tree/main/examples' },
            { label: 'Issues',   href: 'https://github.com/QuiltLang/quilt/issues' },
          ],
        },
      ],
      copyright: `Quilt &mdash; polyglot metaprogramming language`,
    },
    prism: {
      theme: prismThemes.oneDark,
      darkTheme: prismThemes.oneDark,
      additionalLanguages: ['rust', 'python', 'bash', 'toml'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
