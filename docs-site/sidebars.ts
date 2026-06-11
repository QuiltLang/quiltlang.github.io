import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  wikiSidebar: [
    {
      type: 'doc',
      id: 'index',
      label: 'Overview',
    },
    {
      type: 'category',
      label: 'Language',
      collapsed: false,
      items: [
        { type: 'doc', id: 'concepts',           label: 'Concepts' },
        { type: 'doc', id: 'qterm',              label: 'QTerm IR' },
        { type: 'doc', id: 'pipeline',           label: 'Parse → Expand Pipeline' },
        { type: 'doc', id: 'language-traits',    label: 'Language Traits' },
        { type: 'doc', id: 'concrete-languages', label: 'Concrete Languages' },
        { type: 'doc', id: 'multi-omni',         label: 'Multi and Omni' },
      ],
    },
    {
      type: 'category',
      label: 'Tooling',
      collapsed: false,
      items: [
        { type: 'doc', id: 'cli',             label: 'CLI & Scripts' },
        { type: 'doc', id: 'python-bindings', label: 'Python Bindings' },
        { type: 'doc', id: 'lsp',             label: 'Quilt LSP' },
        { type: 'doc', id: 'editor-setup',    label: 'Editor Setup' },
      ],
    },
    {
      type: 'category',
      label: 'Internals',
      collapsed: true,
      items: [
        { type: 'doc', id: 'bootstrap',         label: 'Bootstrap' },
        { type: 'doc', id: 'adding-a-language', label: 'Adding a Language' },
        { type: 'doc', id: 'nanobots',          label: 'Nanobots' },
      ],
    },
  ],
};

export default sidebars;
