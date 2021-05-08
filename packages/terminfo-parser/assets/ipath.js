/**
 * Terminfo
 */
export const IPATHS = [
  process.env.TERMINFO || '',
  (process.env.TERMINFO_DIRS || '').split(':'),
  (process.env.HOME || '') + '/.terminfo',
  '/usr/share/terminfo',
  '/usr/share/lib/terminfo',
  '/usr/lib/terminfo',
  '/usr/local/share/terminfo',
  '/usr/local/share/lib/terminfo',
  '/usr/local/lib/terminfo',
  '/usr/local/ncurses/lib/terminfo',
  '/lib/terminfo'
]