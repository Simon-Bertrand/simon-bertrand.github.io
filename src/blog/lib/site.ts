export function withBase(path: string) {
  if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith('mailto:') || path.startsWith('#')) {
    return path;
  }

  const base = '/blog';
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${base}${normalizedPath}` || '/';
}

export const site = {
  title: 'SiMB Technical Blog',
  description: 'Engineering, numerics, AI news from Simon Bertrand',
  author: 'Simon Bertrand',
  language: 'en',
  url: process.env.SITE_URL ?? 'https://example.com',
  github: 'https://github.com/SiMB-dev',
  email: 'contact@simb.dev',
  avatar: withBase('/simon_bertrand.jpg'),
  notebookRepository: process.env.NOTEBOOK_REPOSITORY ?? 'SiMB-dev/persoblog',
  notebookBranch: process.env.NOTEBOOK_BRANCH ?? 'main',
};

export const navItems = [
  { href: '/', label: 'About' },
  { href: withBase('/posts/'), label: 'Posts' },
  { href: withBase('/tags/'), label: 'Tags' },
  { href: withBase('/search/'), label: 'Search' },
];
