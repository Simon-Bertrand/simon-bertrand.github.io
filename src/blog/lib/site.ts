import { profile, socialMedias } from '../../data/params';

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
  author: profile.name,
  language: 'en',
  url: process.env.SITE_URL ?? 'https://simon-bertrand.github.io',
  github: socialMedias.find((item) => item.name === 'GitHub')!.href,
  email: 'contact@simb.dev',
  avatar: profile.avatar,
  notebookRepository: process.env.NOTEBOOK_REPOSITORY ?? 'SiMB-dev/persoblog',
  notebookBranch: process.env.NOTEBOOK_BRANCH ?? 'main',
};

export const navItems = [
  { href: withBase('/'), label: 'Blog' },
  { href: withBase('/posts/'), label: 'Posts' },
  { href: withBase('/tags/'), label: 'Tags' },
  { href: withBase('/archives/'), label: 'Archives' },
  { href: withBase('/search/'), label: 'Search' },
];
