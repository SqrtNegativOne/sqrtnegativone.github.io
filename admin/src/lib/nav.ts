export interface NavItem {
  href: string;
  label: string;
  description: string;
  path: string;
  bgGradient: string;
  iconBg: string;
  iconColor: string;
  borderHover: string;
  navActiveBg: string;
  navActiveText: string;
  navActiveBorder: string;
}

export const navItems: NavItem[] = [
  {
    href: '/media',
    label: 'Media',
    description: 'Manage books, movies, shows, and games.',
    path: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path>',
    bgGradient: 'from-blue-500/5',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
    borderHover: 'hover:border-blue-500/50',
    navActiveBg: 'bg-blue-500/10',
    navActiveText: 'text-blue-400',
    navActiveBorder: 'border-blue-500/20'
  },
  {
    href: '/projects',
    label: 'Projects',
    description: 'Update your portfolio projects and details.',
    path: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>',
    bgGradient: 'from-emerald-500/5',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    borderHover: 'hover:border-emerald-500/50',
    navActiveBg: 'bg-emerald-500/10',
    navActiveText: 'text-emerald-400',
    navActiveBorder: 'border-emerald-500/20'
  },
  {
    href: '/skills',
    label: 'Skills',
    description: 'Manage your tech stack and skill icons.',
    path: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>',
    bgGradient: 'from-purple-500/5',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-400',
    borderHover: 'hover:border-purple-500/50',
    navActiveBg: 'bg-purple-500/10',
    navActiveText: 'text-purple-400',
    navActiveBorder: 'border-purple-500/20'
  },
  {
    href: '/quotes',
    label: 'Quotes',
    description: 'Manage your collection of quotes.',
    path: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>',
    bgGradient: 'from-amber-500/5',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    borderHover: 'hover:border-amber-500/50',
    navActiveBg: 'bg-amber-500/10',
    navActiveText: 'text-amber-400',
    navActiveBorder: 'border-amber-500/20'
  },
  {
    href: '/socials',
    label: 'Socials',
    description: 'Manage your social media links and icons.',
    path: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>',
    bgGradient: 'from-pink-500/5',
    iconBg: 'bg-pink-500/10',
    iconColor: 'text-pink-400',
    borderHover: 'hover:border-pink-500/50',
    navActiveBg: 'bg-pink-500/10',
    navActiveText: 'text-pink-400',
    navActiveBorder: 'border-pink-500/20'
  },
  {
    href: '/blogs',
    label: 'Blogs',
    description: 'Manage your blog posts and markdown files.',
    path: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H14"></path>',
    bgGradient: 'from-orange-500/5',
    iconBg: 'bg-orange-500/10',
    iconColor: 'text-orange-400',
    borderHover: 'hover:border-orange-500/50',
    navActiveBg: 'bg-orange-500/10',
    navActiveText: 'text-orange-400',
    navActiveBorder: 'border-orange-500/20'
  }
];
